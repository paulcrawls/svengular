import type { Signal } from './signal.js';

export type Action<TType extends string = string> = { type: TType; [key: string]: unknown };
export type Reducer<TState, TAction extends Action = Action> = (state: TState | undefined, action: TAction) => TState;
export type Selector<TState, TResult> = (state: TState) => TResult;
export type Unsubscribe = () => void;

export type Store<TState, TAction extends Action = Action> = {
  getState(): TState;
  dispatch(action: TAction): TAction;
  subscribe(listener: () => void): Unsubscribe;
  select<TResult>(selector: Selector<TState, TResult>): Signal<TResult>;
  replaceReducer(reducer: Reducer<TState, TAction>): void;
};

export declare function createStore<TState, TAction extends Action = Action>(
  reducer: Reducer<TState, TAction>,
  preloadedState?: TState,
  enhancer?: Function
): Store<TState, TAction>;

export declare function combineReducers<TState extends Record<string, unknown>>(
  reducers: { [K in keyof TState]: Reducer<TState[K], Action> }
): Reducer<TState, Action>;

export declare function applyMiddleware(...middlewares: Function[]): Function;
export declare function createAction<TType extends string>(type: TType, prepare?: Function): Function & { type: TType };
