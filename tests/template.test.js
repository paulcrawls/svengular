import { describe, expect, it } from 'vitest';
import { component, mount } from '../src/core.js';
import { signal } from '../src/signal.js';
import { template } from '../src/html.js';

describe('template', () => {
  it('interpolates bindings and wires events', () => {
    let clicks = 0;
    const node = template(
      '<button type="button" title="Count {{ count }}" data-on-click="increment">{{ label }} {{ count }}</button>',
      {
        label: 'Count',
        count: () => 2,
        increment() {
          clicks++;
        }
      }
    );

    const button = node.querySelector('button');

    expect(button.textContent).toBe('Count 2');
    expect(button.getAttribute('title')).toBe('Count 2');

    button.click();

    expect(clicks).toBe(1);
  });

  it('updates mounted document fragments without appending stale nodes', () => {
    const count = signal(0);
    const Counter = component(() => template('<span>{{ count }}</span>', { count }));
    const target = document.createElement('div');

    mount(Counter, target);

    expect(target.textContent).toBe('0');

    count.set(1);

    expect(target.textContent).toBe('1');
    expect(target.querySelectorAll('span')).toHaveLength(1);
  });
});
