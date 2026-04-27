import type { Signal } from './signal.js';
import type { SvengularComponent, SvengularContext } from './core.js';

export type Route = {
  path: string;
  component?: SvengularComponent<any>;
  loadComponent?: () => Promise<Record<string, any>>;
  exportName?: string;
  redirectTo?: string;
  data?: unknown;
};

export type RouteInfo = {
  path: string;
  params: Record<string, string>;
  data: unknown;
  route?: Route;
  component: SvengularComponent<any>;
};

export type Router = {
  currentRoute: Signal<RouteInfo | null>;
  navigate(path: string, options?: { replace?: boolean }): Promise<void>;
  resolve(path?: string): Promise<RouteInfo>;
  outlet(context?: SvengularContext | null): HTMLElement;
  link(path: string, children: unknown, props?: Record<string, unknown>): HTMLElement;
};

export declare function createRouter(
  routes: Route[],
  options?: { mode?: 'history' | 'hash'; base?: string }
): Router;

export declare function matchRoute(routes: Route[], path: string): { route: Route; params: Record<string, string> } | null;
