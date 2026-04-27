import { createStore } from 'svengular/store';
import { counterModel, type AppStateModel } from './counter.model';

export function createAppStore() {
  return createStore<AppStateModel>([counterModel]);
}

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
