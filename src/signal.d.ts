export type Signal<T> = {
  (): T;
  set(nextValue: T): T;
  update(updater: (value: T) => T): T;
  peek(): T;
};

export declare function signal<T>(initialValue: T): Signal<T>;
export declare function effect(fn: () => void): () => void;
export declare function computed<T>(fn: () => T): Signal<T>;
export declare function batch<T>(fn: () => T): T;
