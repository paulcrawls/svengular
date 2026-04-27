import './styles.scss';
import { component, el, mount } from 'svengular/core';
import { createRouter } from 'svengular/router';
import { combineReducers, createStore, type Action } from 'svengular/store';
import { STORE } from './tokens';

type CounterState = {
  count: number;
};

type AppState = {
  counter: CounterState;
};

function counterReducer(state: CounterState = { count: 0 }, action: Action): CounterState {
  switch (action.type) {
    case 'counter/incremented':
      return { ...state, count: state.count + 1 };
    case 'counter/decremented':
      return { ...state, count: state.count - 1 };
    default:
      return state;
  }
}

const store = createStore<AppState>(
  combineReducers<AppState>({
    counter: counterReducer
  })
);

export type AppStore = typeof store;

const router = createRouter([
  {
    path: '/',
    loadComponent: () => import('./pages/home/home')
  },
  {
    path: '/counter',
    loadComponent: () => import('./pages/counter/counter')
  },
  {
    path: '/users/:id',
    loadComponent: () => import('./pages/user/user')
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found')
  }
]);

const App = component((_, context) => {
  context.provide(STORE, store);

  return el('div', { class: 'app' }, [
    el('section', { class: 'shell' }, [
      el('header', { class: 'topbar' }, [
        el('div', { class: 'brand' }, 'Svengular'),
        el('nav', {}, [
          router.link('/', 'Home'),
          router.link('/counter', 'Counter'),
          router.link('/users/42', 'User route')
        ])
      ]),
      router.outlet(context)
    ])
  ]);
});

const root = document.querySelector('#app');

if (!root) {
  throw new Error('Svengular demo root element was not found.');
}

mount(App, root);
