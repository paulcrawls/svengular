import { normalizeNode, setProp, text } from './core.js';

export function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((result, part, index) => {
    return result + part + serialize(values[index]);
  }, '');

  return template.content.cloneNode(true);
}

export function template(markup, bindings = {}) {
  const host = document.createElement('template');
  host.innerHTML = String(markup ?? '');
  const content = host.content.cloneNode(true);

  applyBindings(content, bindings);

  return content;
}

function serialize(value) {
  if (value == null || value === false) return '';
  if (Array.isArray(value)) return value.map(serialize).join('');
  return escapeHtml(String(value));
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function applyBindings(root, bindings) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      bindTextNode(node, bindings);
    } else {
      bindElement(node, bindings);
    }
  }
}

function bindTextNode(node, bindings) {
  if (node.textContent?.includes('{{')) {
    node.textContent = interpolate(node.textContent, bindings);
  }
}

function bindElement(node, bindings) {
  for (const attribute of [...node.attributes]) {
    if (attribute.name.startsWith('data-on-')) {
      const eventName = attribute.name.slice('data-on-'.length);
      const handler = readBinding(attribute.value, bindings);

      if (typeof handler === 'function') {
        node.addEventListener(eventName, handler);
      }

      node.removeAttribute(attribute.name);
      continue;
    }

    if (attribute.name.startsWith('data-bind-')) {
      const propName = attribute.name.slice('data-bind-'.length);
      setProp(node, propName, evaluate(attribute.value, bindings));
      node.removeAttribute(attribute.name);
      continue;
    }

    if (attribute.name === 'data-sv-text') {
      node.replaceChildren(text(evaluate(attribute.value, bindings) ?? ''));
      node.removeAttribute(attribute.name);
      continue;
    }

    if (attribute.name === 'data-sv-html') {
      node.innerHTML = evaluate(attribute.value, bindings) ?? '';
      node.removeAttribute(attribute.name);
      continue;
    }

    if (attribute.name === 'data-sv-node') {
      node.replaceChildren(normalizeNode(evaluate(attribute.value, bindings)));
      node.removeAttribute(attribute.name);
      continue;
    }

    if (attribute.value.includes('{{')) {
      node.setAttribute(attribute.name, interpolate(attribute.value, bindings));
    }
  }
}

function interpolate(value, bindings) {
  return value.replace(/\{\{\s*([\w.$-]+)\s*\}\}/g, (_match, expression) => {
    const result = evaluate(expression, bindings);
    return result == null || result === false ? '' : String(result);
  });
}

function evaluate(expression, bindings) {
  const value = readBinding(expression, bindings);
  return typeof value === 'function' ? value() : value;
}

function readBinding(expression, bindings) {
  return String(expression)
    .trim()
    .split('.')
    .filter(Boolean)
    .reduce((value, key) => value?.[key], bindings);
}
