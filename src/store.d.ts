import type { Signal } from './signal.js';

export type Action<TType extends string = string> = { type: TType; [key: string]: unknown };
export type ActionClass<TAction = unknown> = { new (...args: any[]): TAction; type: string };
export type ActionInput = unknown;
export type Reducer<TState, TAction extends Action = Action> = (state: TState | undefined, action: TAction) => TState;
export type Selector<TState, TResult> = (state: TState) => TResult;
export type Unsubscribe = () => void;

export type DispatchSnapshot<TAction = unknown> = {
  action: TAction;
  type: string;
  results: unknown[];
};

export type DispatchSubscription = {
  unsubscribe(): void;
};

export type DispatchResult<TValue = DispatchSnapshot> = PromiseLike<TValue> & {
  subscribe(
    observerOrNext?:
      | ((value: TValue) => void)
      | {
          next?: (value: TValue) => void;
          error?: (reason: unknown) => void;
          complete?: () => void;
        },
    error?: (reason: unknown) => void,
    complete?: () => void
  ): DispatchSubscription;
};

export type ModelContext<TModelState, TRootState = Record<string, unknown>> = {
  getState(): TModelState;
  setState(nextState: TModelState): TRootState;
  patchState(patch: Partial<TModelState>): TRootState;
  dispatch<TAction extends ActionInput>(action: TAction | TAction[]): DispatchResult;
  select<TResult>(selector: Selector<TRootState, TResult>): Signal<TResult>;
};

export type ModelSelectors<TModelState, TRootState = Record<string, unknown>> = Record<
  string,
  (state: TModelState, rootState: TRootState) => unknown
>;

export type ModelConfig<
  TModelState,
  TRootState = Record<string, unknown>,
  TSelectors extends ModelSelectors<TModelState, TRootState> = ModelSelectors<TModelState, TRootState>
> = {
  name: string;
  defaults: TModelState | (() => TModelState);
  selectors?: TSelectors;
  actions?: Record<string, (context: ModelContext<TModelState, TRootState>, action: any) => unknown | Promise<unknown>>;
};

export type StoreModel<TModelState = unknown, TRootState = Record<string, unknown>> = {
  name: string;
  defaults: TModelState | (() => TModelState);
  actions: Record<string, (context: ModelContext<TModelState, TRootState>, action: any) => unknown | Promise<unknown>>;
  selectors: Record<string, Selector<TRootState, unknown>>;
};

export type Store<TState, TAction extends ActionInput = ActionInput> = {
  getState(): TState;
  dispatch(action: TAction | TAction[]): DispatchResult;
  subscribe(listener: (state: TState) => void): Unsubscribe;
  select<TResult>(selector: Selector<TState, TResult>): Signal<TResult>;
  setState?(nextState: TState): TState;
  patchState?(patch: Partial<TState>): TState;
  replaceReducer?(reducer: Reducer<TState, Action>): void;
};

export declare function createModel<
  TModelState,
  TRootState = Record<string, unknown>,
  TSelectors extends ModelSelectors<TModelState, TRootState> = ModelSelectors<TModelState, TRootState>
>(
  config: ModelConfig<TModelState, TRootState, TSelectors>
): StoreModel<TModelState, TRootState> & {
  selectors: {
    [K in keyof TSelectors]: Selector<TRootState, ReturnType<TSelectors[K]>>;
  };
};

export declare function createSelector<TState, TResult>(
  selector: Selector<TState, TResult>
): Selector<TState, TResult>;

export declare function createSelector<TState, TOne, TResult>(
  selectors: [Selector<TState, TOne>],
  projector: (one: TOne, rootState: TState) => TResult
): Selector<TState, TResult>;

export declare function createSelector<TState, TOne, TTwo, TResult>(
  selectors: [Selector<TState, TOne>, Selector<TState, TTwo>],
  projector: (one: TOne, two: TTwo, rootState: TState) => TResult
): Selector<TState, TResult>;

export declare function createSelector<TState, TResult>(
  selectors: Array<Selector<TState, unknown>>,
  projector: (...values: unknown[]) => TResult
): Selector<TState, TResult>;

export declare function createStore<TState>(
  models: StoreModel<any, TState>[],
  preloadedState?: Partial<TState>
): Store<TState>;

export declare function createStore<TState>(
  options: { models: StoreModel<any, TState>[] },
  preloadedState?: Partial<TState>
): Store<TState>;

export declare function createStore<TState, TAction extends Action = Action>(
  reducer: Reducer<TState, TAction>,
  preloadedState?: TState,
  enhancer?: Function
): Store<TState, TAction>;

export declare function combineReducers<TState extends Record<string, unknown>>(
  reducers: { [K in keyof TState]: Reducer<TState[K], Action> }
): Reducer<TState, Action>;

export declare function applyMiddleware(...middlewares: Function[]): Function;
export declare function createAction<TType extends string>(
  type: TType,
  prepare?: (...args: any[]) => Record<string, unknown>
): ((...args: any[]) => Action<TType>) & { type: TType };
