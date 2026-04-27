import { describe, expect, it } from 'vitest';
import { combineReducers, createStore } from '../src/store.js';

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'inc':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

describe('store', () => {
  it('dispatches actions and selects state', () => {
    const store = createStore(combineReducers({ counter: counterReducer }));
    const count = store.select(state => state.counter.count);

    expect(count()).toBe(0);
    store.dispatch({ type: 'inc' });
    expect(count()).toBe(1);
  });

  it('notifies subscribers', () => {
    const store = createStore(counterReducer);
    let calls = 0;
    const unsubscribe = store.subscribe(() => calls++);

    store.dispatch({ type: 'inc' });
    unsubscribe();
    store.dispatch({ type: 'inc' });

    expect(calls).toBe(1);
  });
});
