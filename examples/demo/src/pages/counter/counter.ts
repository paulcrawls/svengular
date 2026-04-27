import { component } from 'svengular/core';
import { template } from 'svengular/html';
import type { AppStore } from '../../main';
import { STORE } from '../../tokens';
import markup from './counter.html?raw';
import './counter.scss';

export default component((_, context) => {
  const store = context.inject<AppStore>(STORE);
  const count = store.select(state => state.counter.count);

  return template(markup, {
    count,
    decrement() {
      store.dispatch({ type: 'counter/decremented' });
    },
    increment() {
      store.dispatch({ type: 'counter/incremented' });
    }
  });
});
