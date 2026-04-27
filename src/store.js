import { computed, signal } from './signal.js';

export function createStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  const listeners = new Set();
  const state = signal(preloadedState);

  function getState() {
    return state();
  }

  function dispatch(action) {
    if (!action || typeof action.type === 'undefined') {
      throw new Error('Svengular store actions must be objects with a type field.');
    }

    const nextState = currentReducer(state(), action);
    state.set(nextState);
    listeners.forEach(listener => listener());
    return action;
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function select(selector) {
    return computed(() => selector(state()));
  }

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: '@@svengular/replace-reducer' });
  }

  dispatch({ type: '@@svengular/init' });

  return {
    getState,
    dispatch,
    subscribe,
    select,
    replaceReducer
  };
}

export function combineReducers(reducers) {
  return (state = {}, action) => {
    let changed = false;
    const nextState = {};

    for (const [key, reducer] of Object.entries(reducers)) {
      const previousSlice = state[key];
      const nextSlice = reducer(previousSlice, action);
      nextState[key] = nextSlice;
      changed ||= nextSlice !== previousSlice;
    }

    return changed ? nextState : state;
  };
}

export function applyMiddleware(...middlewares) {
  return createStoreFn => (reducer, preloadedState) => {
    const store = createStoreFn(reducer, preloadedState);
    let dispatch = action => {
      throw new Error('Dispatching while constructing middleware is not allowed.');
    };

    const middlewareApi = {
      getState: store.getState,
      dispatch: action => dispatch(action)
    };

    const chain = middlewares.map(middleware => middleware(middlewareApi));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}

export function createAction(type, prepare = payload => ({ payload })) {
  const actionCreator = (...args) => ({ type, ...prepare(...args) });
  actionCreator.type = type;
  return actionCreator;
}

function compose(...functions) {
  if (functions.length === 0) return value => value;
  if (functions.length === 1) return functions[0];
  return functions.reduce((a, b) => (...args) => a(b(...args)));
}
