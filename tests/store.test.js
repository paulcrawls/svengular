import { describe, expect, it } from 'vitest';
import { combineReducers, createAction, createModel, createSelector, createStore } from '../src/store.js';

const increment = createAction('inc');

const counterModel = createModel({
  name: 'counter',
  defaults: { count: 0 },
  selectors: {
    count: state => state.count
  },
  actions: {
    [increment.type](context, action) {
      context.patchState({ count: context.getState().count + action.payload });
      return context.getState().count;
    }
  }
});

const doubled = createSelector([counterModel.selectors.count], count => count * 2);

function legacyCounterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'inc':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

describe('store', () => {
  it('dispatches model actions and reacts through selectors', async () => {
    const store = createStore([counterModel]);
    const count = store.select(counterModel.selectors.count);
    const doubleCount = store.select(doubled);

    expect(count()).toBe(0);
    expect(doubleCount()).toBe(0);

    await store.dispatch(increment(2));

    expect(count()).toBe(2);
    expect(doubleCount()).toBe(4);
  });

  it('returns subscribable dispatch results', async () => {
    const store = createStore([counterModel]);
    const snapshots = [];

    await new Promise((resolve, reject) => {
      store.dispatch(increment(3)).subscribe({
        next(snapshot) {
          snapshots.push(snapshot);
        },
        error: reject,
        complete: resolve
      });
    });

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].type).toBe(increment.type);
    expect(snapshots[0].results).toEqual([3]);
  });

  it('supports class-style actions with static types', async () => {
    class ResetCounter {
      static type = 'reset';
    }

    const model = createModel({
      name: 'counter',
      defaults: { count: 5 },
      selectors: {
        count: state => state.count
      },
      actions: {
        [ResetCounter.type](context) {
          context.setState({ count: 0 });
        }
      }
    });
    const store = createStore([model]);

    await store.dispatch(new ResetCounter());

    expect(store.select(model.selectors.count)()).toBe(0);
  });

  it('keeps the reducer store path working', () => {
    const store = createStore(combineReducers({ counter: legacyCounterReducer }));
    const count = store.select(state => state.counter.count);

    expect(count()).toBe(0);
    store.dispatch({ type: 'inc' });
    expect(count()).toBe(1);
  });

  it('notifies reducer-store subscribers', () => {
    const store = createStore(legacyCounterReducer);
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);

    store.dispatch({ type: 'inc' });
    unsubscribe();
    store.dispatch({ type: 'inc' });

    expect(calls).toBe(1);
  });
});
