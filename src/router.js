import { signal } from './signal.js';
import { el, mount } from './core.js';

export function createRouter(routes, options = {}) {
  const mode = options.mode ?? 'history';
  const base = normalizeBase(options.base ?? '/');
  const currentRoute = signal(null);
  let outletTarget = null;
  let activeView = null;
  let parentContext = null;

  async function navigate(path, navigationOptions = {}) {
    const normalizedPath = normalizePath(path);

    if (mode === 'history') {
      const method = navigationOptions.replace ? 'replaceState' : 'pushState';
      history[method]({}, '', withBase(normalizedPath, base));
    } else {
      const nextHash = `#${normalizedPath}`;
      if (navigationOptions.replace) {
        location.replace(nextHash);
      } else {
        location.hash = normalizedPath;
      }
    }

    await resolve(normalizedPath);
  }

  async function resolve(path = getCurrentPath(mode, base)) {
    const normalizedPath = normalizePath(path);
    const match = matchRoute(routes, normalizedPath);

    if (!match) {
      const routeInfo = { path: normalizedPath, params: {}, data: null, component: NotFound };
      currentRoute.set(routeInfo);
      renderOutlet(NotFound, routeInfo);
      return routeInfo;
    }

    if (match.route.redirectTo) {
      await navigate(match.route.redirectTo, { replace: true });
      return currentRoute();
    }

    const component = await loadComponent(match.route);
    const routeInfo = {
      path: normalizedPath,
      params: match.params,
      data: match.route.data ?? null,
      route: match.route,
      component
    };

    currentRoute.set(routeInfo);
    renderOutlet(component, routeInfo);
    return routeInfo;
  }

  function renderOutlet(Component, routeInfo) {
    if (!outletTarget) return;
    activeView?.destroy();
    outletTarget.replaceChildren();
    activeView = mount(Component, outletTarget, routeInfo, parentContext);
  }

  function outlet(context = null) {
    parentContext = context;
    const host = el('div', { 'data-svengular-router-outlet': '' });
    outletTarget = host;
    queueMicrotask(() => resolve());
    return host;
  }

  function link(path, children, props = {}) {
    const href = mode === 'history' ? withBase(path, base) : `#${normalizePath(path)}`;

    return el(
      'a',
      {
        ...props,
        href,
        onclick(event) {
          props.onclick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          navigate(path);
        }
      },
      children
    );
  }

  const eventName = mode === 'history' ? 'popstate' : 'hashchange';
  window.addEventListener(eventName, () => resolve());

  return {
    currentRoute,
    navigate,
    resolve,
    outlet,
    link
  };
}

export function matchRoute(routes, path) {
  const pathParts = splitPath(path);

  for (const route of routes) {
    const routeParts = splitPath(route.path);
    const params = {};

    if (route.path === '**') return { route, params };
    if (routeParts.length !== pathParts.length) continue;

    let matched = true;

    for (let index = 0; index < routeParts.length; index++) {
      const routePart = routeParts[index];
      const pathPart = pathParts[index];

      if (routePart.startsWith(':')) {
        params[routePart.slice(1)] = decodeURIComponent(pathPart);
      } else if (routePart !== pathPart) {
        matched = false;
        break;
      }
    }

    if (matched) return { route, params };
  }

  return null;
}

async function loadComponent(route) {
  if (route.component) return route.component;

  if (route.loadComponent) {
    const module = await route.loadComponent();
    return route.exportName ? module[route.exportName] : module.default;
  }

  return NotFound;
}

function getCurrentPath(mode, base) {
  if (mode === 'hash') return normalizePath(location.hash.slice(1) || '/');
  const pathname = location.pathname || '/';
  return normalizePath(stripBase(pathname, base));
}

function normalizeBase(base) {
  if (!base || base === '/') return '/';
  return `/${base.replace(/^\/+|\/+$/g, '')}`;
}

function withBase(path, base) {
  const normalizedPath = normalizePath(path);
  if (base === '/') return normalizedPath;
  return `${base}${normalizedPath === '/' ? '' : normalizedPath}`;
}

function stripBase(path, base) {
  if (base === '/' || !path.startsWith(base)) return path;
  return path.slice(base.length) || '/';
}

function normalizePath(path) {
  const normalized = `/${String(path || '/').replace(/^\/+/, '')}`;
  return normalized.length > 1 ? normalized.replace(/\/+$/g, '') : normalized;
}

function splitPath(path) {
  return normalizePath(path).split('/').filter(Boolean);
}

function NotFound() {
  return el('main', { class: 'sv-page sv-page-not-found' }, [
    el('h1', {}, '404'),
    el('p', {}, 'Page not found')
  ]);
}
