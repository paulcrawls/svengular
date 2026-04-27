import { mount } from 'svengular/core';
import NotFound from './not-found';

describe('NotFound component', () => {
  it('renders the 404 page', () => {
    const host = document.createElement('div');

    mount(NotFound, host);

    expect(host.textContent).toContain('404');
    expect(host.textContent).toContain('This route does not exist.');
  });
});
