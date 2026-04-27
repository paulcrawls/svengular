import { createModel, createSelector } from 'svengular/store';
import { DecrementCounter, IncrementCounter } from './counter.actions';

export type CounterStateModel = {
  count: number;
};

export type AppStateModel = {
  counter: CounterStateModel;
};

type CounterSelectorModel = {
  count: (state: CounterStateModel) => number;
};

export const counterModel = createModel<CounterStateModel, AppStateModel, CounterSelectorModel>({
  name: 'counter',
  defaults: {
    count: 0
  },
  selectors: {
    count: state => state.count
  },
  actions: {
    [IncrementCounter.type](context) {
      context.patchState({ count: context.getState().count + 1 });
      return context.getState().count;
    },
    [DecrementCounter.type](context) {
      context.patchState({ count: context.getState().count - 1 });
      return context.getState().count;
    }
  }
});

export const CounterSelectors = {
  ...counterModel.selectors,
  label: createSelector([counterModel.selectors.count], count => `Count: ${count}`)
};
