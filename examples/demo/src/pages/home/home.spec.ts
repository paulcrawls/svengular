import { mount } from 'svengular/core';
import Home from './home';

describe('Home component', () => {
  it('renders the welcome content', () => {
    const host = document.createElement('div');

    mount(Home, host);

    expect(host.textContent).toContain('Disappearing by design.');
    expect(host.querySelector('.home-page')).not.toBeNull();
  });
});
