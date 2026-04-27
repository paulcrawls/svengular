import { component } from 'svengular/core';
import { template } from 'svengular/html';
import markup from './not-found.html?raw';
import './not-found.scss';

export default component(() => {
  return template(markup);
});
