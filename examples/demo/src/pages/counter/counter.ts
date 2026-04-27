import { component } from 'svengular/core';
import { template } from 'svengular/html';
import { CounterSelectors, DecrementCounter, IncrementCounter, type AppStore } from '../../store';
import { STORE } from '../../tokens';
import markup from './counter.html?raw';
import './counter.scss';

export default component((_, context) => {
  const store = context.inject<AppStore>(STORE);
  const count = store.select(CounterSelectors.count);

  return template(markup, {
    count,
    decrement() {
      store.dispatch(new DecrementCounter()).subscribe();
    },
    increment() {
      store.dispatch(new IncrementCounter()).subscribe();
    }
  });
});
