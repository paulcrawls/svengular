import './styles.scss';
import { component, el, mount } from 'svengular/core';
import { createRouter } from 'svengular/router';
import { store } from './store';
import { STORE } from './tokens';

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
