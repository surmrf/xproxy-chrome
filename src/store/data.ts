import store from '@/utils/store';
import type { State } from '.';

export const setData = newState => {
  store.set('@@rule', newState);
};

export const getData = async () => {
  return store.get('@@rule');
};

export const watchData = (cb: (args: State) => void) => {
  // init cb
  getData().then(cb);

  store.on('change', () => {
    getData().then(cb);
  });
};
