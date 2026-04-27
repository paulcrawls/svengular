export declare function html(strings: TemplateStringsArray, ...values: unknown[]): DocumentFragment;

export type TemplateBindings = Record<string, unknown>;

export declare function template(markup: string, bindings?: TemplateBindings): DocumentFragment;
