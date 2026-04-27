import { Window } from 'happy-dom';

const window = new Window({
  url: 'http://localhost/'
});

globalThis.window = window;
globalThis.document = window.document;
globalThis.Node = window.Node;
globalThis.Text = window.Text;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.NodeFilter = window.NodeFilter;
globalThis.Event = window.Event;
globalThis.MouseEvent = window.MouseEvent;
globalThis.customElements = window.customElements;
globalThis.location = window.location;
globalThis.history = window.history;
