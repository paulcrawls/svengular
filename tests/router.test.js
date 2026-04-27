import { describe, expect, it } from 'vitest';
import { matchRoute } from '../src/router.js';

describe('router', () => {
  it('matches static routes', () => {
    const match = matchRoute([{ path: '/about' }], '/about');
    expect(match.route.path).toBe('/about');
  });

  it('extracts params', () => {
    const match = matchRoute([{ path: '/users/:id' }], '/users/42');
    expect(match.params.id).toBe('42');
  });

  it('supports wildcard routes', () => {
    const match = matchRoute([{ path: '**' }], '/missing');
    expect(match.route.path).toBe('**');
  });
});
