import { createContext, mount } from 'svengular/core';
import Counter from './counter';
import { createAppStore } from '../../store';
import { STORE } from '../../tokens';

describe('Counter component', () => {
  it('renders reactive count and dispatches model actions', async () => {
    const host = document.createElement('div');
    const context = createContext();
    context.provide(STORE, createAppStore());

    mount(Counter, host, {}, context);

    expect(host.textContent).toContain('Count: 0');

    const increment = host.querySelectorAll('button')[1] as HTMLButtonElement;
    increment.click();
    await settle();

    expect(host.textContent).toContain('Count: 1');

    const decrement = host.querySelectorAll('button')[0] as HTMLButtonElement;
    decrement.click();
    await settle();

    expect(host.textContent).toContain('Count: 0');
  });
});

function settle() {
  return new Promise(resolve => setTimeout(resolve));
}
