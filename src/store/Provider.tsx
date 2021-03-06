import React, { FC, createContext, Dispatch, useContext } from 'react';
import useAsyncEffect from 'use-async-effect';
import useStore, { Store, DispatchAction } from '@/store';
import { getData } from '@/store/data';

export const StoreContext = createContext<{
  store?: Store;
  dispatch?: Dispatch<DispatchAction>;
}>({});

export const useGlobalStore = (): [Store, Dispatch<DispatchAction>] => {
  const { store, dispatch } = useContext(StoreContext);
  return [store, dispatch];
};

const StoreProvider: FC = props => {
  const [store, dispatch] = useStore();

  // init state
  useAsyncEffect(async () => {
    const data = await getData();

    dispatch({
      type: 'initState',
      payload: data,
    });
  }, []);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreProvider;
