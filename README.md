# Svengular

A minimalist disappearing JavaScript framework inspired by Angular and Svelte.

Svengular gives you small, independent ESM modules for:

- components and DOM helpers;
- TypeScript-friendly public types;
- signals and effects;
- a Redux-style store;
- Angular-style route configuration;
- raw HTML template binding helpers;
- SCSS-ready Vite usage;
- lazy loading with dynamic `import()`;
- Vite/Rollup chunk output.

It is called a disappearing framework because you import only what your app needs. The package is marked with `"sideEffects": false`, and every feature is exposed as a separate module so modern bundlers can tree-shake unused code.

## Install

For local development after cloning this repo:

```bash
npm install
```

For another app, install from a local path while developing:

```bash
npm install ../svengular
```

Then import submodules:

```ts
import { component, mount, el } from 'svengular/core';
import { signal } from 'svengular/signal';
import { createStore } from 'svengular/store';
import { createRouter } from 'svengular/router';
import { template } from 'svengular/html';
```

## Run the demo

```bash
npm install
npm run demo:dev
```

Build the demo into JS chunks:

```bash
npm run demo:build
```

The demo is TypeScript and SCSS by default. Lazy pages are folder components with colocated `.ts`, `.html`, and `.scss` files, and they are emitted as separate files under `dist/demo/assets/chunks`.

## Run tests

```bash
npm test
```

## Component example

```ts
import { component, el, mount } from 'svengular/core';
import { signal } from 'svengular/signal';

const Counter = component(() => {
  const count = signal(0);

  return el('button', {
    onclick() {
      count.update(value => value + 1);
    }
  }, `Count: ${count()}`);
});

mount(Counter, document.querySelector('#app'));
```

## Folder component example

Svengular does not require a compiler. With Vite, import the colocated HTML file as raw text and the SCSS file as a side effect:

```ts
import { component } from 'svengular/core';
import { template } from 'svengular/html';
import { signal } from 'svengular/signal';
import markup from './counter.html?raw';
import './counter.scss';

export default component(() => {
  const count = signal(0);

  return template(markup, {
    count,
    increment() {
      count.update(value => value + 1);
    }
  });
});
```

```html
<main class="counter-page">
  <h1>Count: {{ count }}</h1>
  <button type="button" data-on-click="increment">Increment</button>
</main>
```

Template bindings support `{{ value }}` interpolation, `data-on-click="handler"` event listeners, `data-bind-class="className"` style property/attribute binding, and `data-sv-text`, `data-sv-html`, or `data-sv-node` content slots.

## Store example

```ts
import { createStore, combineReducers } from 'svengular/store';

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

const store = createStore(combineReducers({ counter: counterReducer }));
const count = store.select(state => state.counter.count);

store.dispatch({ type: 'counter/incremented' });
console.log(count());
```

## Router example

```ts
import { component, el, mount } from 'svengular/core';
import { createRouter } from 'svengular/router';

const router = createRouter([
  {
    path: '/',
    loadComponent: () => import('./pages/home/home')
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

const App = component((props, context) => {
  return el('div', {}, [
    router.link('/', 'Home'),
    router.outlet(context)
  ]);
});

mount(App, document.querySelector('#app'));
```

## Package design

The package exposes both a root barrel and feature-level subpaths:

```json
{
  "types": "./src/index.d.ts",
  "exports": {
    ".": { "types": "./src/index.d.ts", "default": "./src/index.js" },
    "./core": { "types": "./src/core.d.ts", "default": "./src/core.js" },
    "./signal": { "types": "./src/signal.d.ts", "default": "./src/signal.js" },
    "./store": { "types": "./src/store.d.ts", "default": "./src/store.js" },
    "./router": { "types": "./src/router.d.ts", "default": "./src/router.js" },
    "./html": { "types": "./src/html.d.ts", "default": "./src/html.js" }
  },
  "sideEffects": false
}
```

Recommended style for application code:

```js
import { mount } from 'svengular/core';
```

instead of:

```js
import { mount } from 'svengular';
```

The subpath import style gives bundlers the clearest possible tree-shaking boundary.

## Current maturity

This is a working experimental prototype. It is intentionally small and does not yet include a compiler, hydration, keyed reconciliation, nested route outlets, route guards, forms, or devtools.

## Git workflow

After unzipping:

```bash
cd svengular
git init
git add .
git commit -m "Initial Svengular framework"
```
