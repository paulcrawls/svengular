import { component } from 'svengular/core';
import { template } from 'svengular/html';
import type { RouteInfo } from 'svengular/router';
import markup from './user.html?raw';
import './user.scss';

export default component((route: RouteInfo) => {
  return template(markup, {
    userId: route.params.id
  });
});
