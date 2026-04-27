import { component } from 'svengular/core';
import { template } from 'svengular/html';
import markup from './home.html?raw';
import './home.scss';

export default component(() => {
  return template(markup);
});
