import { mount } from 'svengular/core';
import type { RouteInfo } from 'svengular/router';
import User from './user';

describe('User component', () => {
  it('renders the route parameter', () => {
    const host = document.createElement('div');

    mount(User, host, route({ id: '42' }));

    expect(host.textContent).toContain('User 42');
  });
});

function route(params: Record<string, string>): RouteInfo {
  return {
    path: '/users/42',
    params,
    data: null,
    component: User
  };
}
