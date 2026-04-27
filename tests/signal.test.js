import { describe, expect, it } from 'vitest';
import { computed, effect, signal } from '../src/signal.js';

describe('signal', () => {
  it('stores and updates values', () => {
    const count = signal(0);
    expect(count()).toBe(0);
    count.set(2);
    expect(count()).toBe(2);
    count.update(value => value + 1);
    expect(count()).toBe(3);
  });

  it('runs effects when dependencies change', () => {
    const count = signal(0);
    let observed = 0;

    effect(() => {
      observed = count();
    });

    count.set(5);
    expect(observed).toBe(5);
  });

  it('supports computed values', () => {
    const count = signal(2);
    const doubled = computed(() => count() * 2);

    expect(doubled()).toBe(4);
    count.set(4);
    expect(doubled()).toBe(8);
  });
});
