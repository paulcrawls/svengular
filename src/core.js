import { effect } from './signal.js';

export function component(setup) {
  return setup;
}

export function mount(Component, target, props = {}, parentContext = null) {
  let disposeEffect = null;
  const context = createContext(parentContext);
  const start = document.createComment('svengular:start');
  const end = document.createComment('svengular:end');

  target.append(start, end);

  disposeEffect = effect(() => {
    const nextNode = normalizeNode(Component(props, context));
    replaceRange(start, end, nextNode);
  });

  return {
    context,
    destroy() {
      disposeEffect?.();
      removeRange(start, end);
    }
  };
}

export function createContext(parent = null) {
  const values = new Map();

  return {
    parent,
    provide(key, value) {
      values.set(key, value);
      return value;
    },
    inject(key, fallback) {
      if (values.has(key)) return values.get(key);
      if (parent) return parent.inject(key, fallback);
      return fallback;
    }
  };
}

export function text(value) {
  return document.createTextNode(String(value));
}

export function fragment(children = []) {
  const node = document.createDocumentFragment();
  for (const child of [].concat(children)) {
    node.appendChild(normalizeNode(child));
  }
  return node;
}

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props ?? {})) {
    setProp(node, key, value);
  }

  for (const child of [].concat(children)) {
    node.appendChild(normalizeNode(child));
  }

  return node;
}

export function setProp(node, key, value) {
  if (key === 'ref' && typeof value === 'function') {
    value(node);
    return;
  }

  if (key.startsWith('on') && typeof value === 'function') {
    node.addEventListener(key.slice(2).toLowerCase(), value);
    return;
  }

  if (key === 'class' || key === 'className') {
    node.className = value ?? '';
    return;
  }

  if (key === 'style' && value && typeof value === 'object') {
    Object.assign(node.style, value);
    return;
  }

  if (value === false || value == null) {
    node.removeAttribute(key);
    return;
  }

  if (value === true) {
    node.setAttribute(key, '');
    return;
  }

  node.setAttribute(key, String(value));
}

export function normalizeNode(value) {
  if (value instanceof Node) return value;

  if (Array.isArray(value)) {
    return fragment(value);
  }

  return text(value ?? '');
}

function replaceRange(start, end, node) {
  let current = start.nextSibling;

  while (current && current !== end) {
    const next = current.nextSibling;
    current.parentNode.removeChild(current);
    current = next;
  }

  end.parentNode.insertBefore(node, end);
}

function removeRange(start, end) {
  let current = start;

  while (current) {
    const next = current.nextSibling;
    current.parentNode?.removeChild(current);
    if (current === end) break;
    current = next;
  }
}
