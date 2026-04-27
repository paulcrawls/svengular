import { computed, signal } from './signal.js';

export function createModel(config) {
  if (!config?.name) {
    throw new Error('Svengular store models must have a name.');
  }

  const model = {
    name: config.name,
    defaults: config.defaults ?? {},
    actions: config.actions ?? {},
    selectors: {}
  };

  for (const [key, selector] of Object.entries(config.selectors ?? {})) {
    model.selectors[key] = rootState => selector(rootState?.[model.name], rootState);
  }

  return model;
}

export function createSelector(inputs, projector) {
  if (typeof inputs === 'function' && typeof projector !== 'function') {
    return inputs;
  }

  const selectors = Array.isArray(inputs) ? inputs : [inputs];

  return rootState => projector(...selectors.map(selector => selector(rootState)), rootState);
}

export function createStore(source, preloadedState, enhancer) {
  if (typeof source === 'function') {
    return createReducerStore(source, preloadedState, enhancer);
  }

  const models = Array.isArray(source) ? source : source?.models ?? [];
  return createModelStore(models, preloadedState);
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

function createModelStore(models, preloadedState = {}) {
  const registry = models.map(normalizeModel);
  const listeners = new Set();
  const selectorCache = new WeakMap();
  const state = signal({
    ...buildDefaults(registry),
    ...preloadedState
  });

  function getState() {
    return state();
  }

  function setState(nextState) {
    state.set(nextState);
    listeners.forEach(listener => listener(nextState));
    return nextState;
  }

  function patchState(patch) {
    return setState({ ...state(), ...patch });
  }

  function select(selector) {
    if (typeof selector !== 'function') {
      throw new Error('Svengular store selectors must be functions.');
    }

    if (!selectorCache.has(selector)) {
      selectorCache.set(selector, computed(() => selector(state())));
    }

    return selectorCache.get(selector);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function dispatch(actionOrActions) {
    const actions = Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions];

    return new DispatchResult(async () => {
      const results = [];

      for (const action of actions) {
        results.push(await runAction(action));
      }

      return results.length === 1 ? results[0] : results;
    });
  }

  async function runAction(action) {
    const type = getActionType(action);

    if (!type) {
      throw new Error('Svengular store actions must have a type field or static type.');
    }

    const results = [];

    for (const model of registry) {
      const handler = model.actions[type];
      if (typeof handler !== 'function') continue;

      const result = handler(createModelContext(model), action);
      results.push(await result);
    }

    return {
      action,
      type,
      results
    };
  }

  function createModelContext(model) {
    return {
      getState() {
        return state()[model.name];
      },
      setState(nextState) {
        return setModelState(model.name, nextState);
      },
      patchState(patch) {
        return setModelState(model.name, {
          ...state()[model.name],
          ...patch
        });
      },
      dispatch,
      select
    };
  }

  function setModelState(name, nextSlice) {
    const currentState = state();
    if (Object.is(currentState[name], nextSlice)) return currentState;

    return setState({
      ...currentState,
      [name]: nextSlice
    });
  }

  return {
    getState,
    setState,
    patchState,
    dispatch,
    subscribe,
    select
  };
}

function createReducerStore(reducer, preloadedState, enhancer) {
  if (typeof enhancer === 'function') {
    return enhancer(createReducerStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  const listeners = new Set();
  const selectorCache = new WeakMap();
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
    if (!selectorCache.has(selector)) {
      selectorCache.set(selector, computed(() => selector(state())));
    }

    return selectorCache.get(selector);
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

class DispatchResult {
  constructor(work) {
    this.promise = Promise.resolve().then(work);
  }

  subscribe(observerOrNext, error, complete) {
    const observer = normalizeObserver(observerOrNext, error, complete);
    let closed = false;

    this.promise.then(
      value => {
        if (closed) return;
        observer.next?.(value);
        observer.complete?.();
      },
      reason => {
        if (closed) return;
        observer.error?.(reason);
      }
    );

    return {
      unsubscribe() {
        closed = true;
      }
    };
  }

  then(onFulfilled, onRejected) {
    return this.promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.promise.catch(onRejected);
  }

  finally(onFinally) {
    return this.promise.finally(onFinally);
  }
}

function normalizeObserver(observerOrNext, error, complete) {
  if (typeof observerOrNext === 'function') {
    return {
      next: observerOrNext,
      error,
      complete
    };
  }

  return observerOrNext ?? {};
}

function normalizeModel(model) {
  if (model?.name) return model;
  throw new Error('Svengular store models must be created with createModel().');
}

function buildDefaults(models) {
  const defaults = {};

  for (const model of models) {
    defaults[model.name] = cloneDefault(model.defaults);
  }

  return defaults;
}

function cloneDefault(value) {
  if (typeof value === 'function') return value();
  if (Array.isArray(value)) return [...value];
  if (value && typeof value === 'object') return { ...value };
  return value;
}

function getActionType(action) {
  if (typeof action === 'string') return action;
  return action?.type ?? action?.constructor?.type;
}

function compose(...functions) {
  if (functions.length === 0) return value => value;
  if (functions.length === 1) return functions[0];
  return functions.reduce((a, b) => (...args) => a(b(...args)));
}
