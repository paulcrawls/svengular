export type SvengularChild = Node | string | number | boolean | null | undefined;

export type SvengularRenderable = SvengularChild | SvengularChild[];

export type SvengularComponent<Props = Record<string, unknown>> = (
  props: Props,
  context: SvengularContext
) => SvengularRenderable;

export type SvengularContext = {
  parent: SvengularContext | null;
  provide<T>(key: string | symbol, value: T): T;
  inject<T>(key: string | symbol, fallback?: T): T;
};

export declare function component<Props = Record<string, unknown>>(
  setup: SvengularComponent<Props>
): SvengularComponent<Props>;

export declare function mount<Props = Record<string, unknown>>(
  Component: SvengularComponent<Props>,
  target: Element,
  props?: Props,
  parentContext?: SvengularContext | null
): { context: SvengularContext; destroy(): void };

export declare function createContext(parent?: SvengularContext | null): SvengularContext;
export declare function text(value: unknown): Text;
export declare function fragment(children?: unknown[]): DocumentFragment;
export declare function el(tag: string, props?: Record<string, unknown>, children?: unknown): HTMLElement;
export declare function setProp(node: Element, key: string, value: unknown): void;
export declare function normalizeNode(value: unknown): Node;
