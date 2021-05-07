import { find } from 'lodash-es';
import { Dispatch, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import { createNamespace } from '@/utils/rule/factory';
import type { Namespace, Group, Rule } from '@/utils/rule/type';
import { setData } from './data';

export type { Namespace, Group, Rule };

export type DispatchType =
  | 'initState'
  | 'addNS'
  | 'deleteNS'
  | 'changeNSName'
  | 'addGroup'
  | 'starGroup'
  | 'deleteGroup'
  | 'nsSwitch'
  | 'groupSwitch';

export type State = { namespaces: Namespace[] };

export type Store = {
  state: State;
  // getter: Record<string, any>;
};

export type DispatchAction = {
  type: DispatchType;
  payload: any;
};

export const defaultNSId = '__default__';
export const defaultNSName = 'Untitled Group';

const reducer = (draft: State, action: DispatchAction) => {
  const initState = data => {
    let initData: State = data;
    if (!initData || !initData.namespaces.length) {
      initData = {
        namespaces: [
          createNamespace({
            id: defaultNSId,
            name: defaultNSName,
          }),
        ],
      };
    }
    draft = initData;
  };

  const addNS = ({ name, ns }: { name?: string; ns?: Namespace }) => {
    if (!draft.namespaces) {
      draft.namespaces = [];
    }
    if (ns && !name) {
      draft.namespaces.push(ns);
    } else {
      draft.namespaces.push(
        createNamespace({
          name,
        }),
      );
    }
  };

  const deleteNS = ({ nsId }: { nsId: string }) => {
    draft.namespaces = draft.namespaces.filter(ns => ns.id !== nsId);
  };

  const changeNSName = ({ nsId, name }) => {
    draft.namespaces.forEach(ns => {
      if (ns.id === nsId) {
        ns.name = name;
      }
    });
  };

  const addGroup = ({
    nsId,
    groupId,
    group,
  }: {
    nsId: string;
    groupId: string;
    group: Group;
  }) => {
    let namespace = find(draft.namespaces, ns => ns.id === nsId);

    if (!namespace) {
      if (nsId === defaultNSId) {
        namespace = createNamespace({
          id: defaultNSId,
          name: defaultNSName,
        });
        draft.namespaces.push(namespace);
      } else {
        console.error(`namespace ${nsId} not found`);
        return;
      }
    }

    const oldGroup = find(namespace.groups, g => g.id === groupId);
    if (!oldGroup) {
      if (!namespace.groups || !namespace.groups.length) {
        namespace.groups = [];
      }
      namespace.groups.push(group);
    } else {
      namespace.groups.forEach((g, i) => {
        if (g.id === groupId) {
          namespace.groups[i] = group;
        }
      });
    }
  };

  const starGroup = ({ nsId, groupId, star }) => {
    draft.namespaces.forEach(ns => {
      if (ns.id === nsId) {
        ns.groups.forEach(group => {
          if (group.id === groupId) {
            group.star = star;
          }
        });
      }
    });
  };

  const deleteGroup = ({ nsId, groupId }) => {
    const namespace = find(draft.namespaces, ns => ns.id === nsId);
    if (namespace) {
      namespace.groups = namespace.groups.filter(group => group.id !== groupId);
    }
  };

  const nsSwitch = ({ nsId, checked }) => {
    draft.namespaces.forEach(ns => {
      if (ns.id === nsId) {
        ns.status = checked;
      }
    });
  };

  const groupSwitch = ({ nsId, groupId, checked }) => {
    draft.namespaces.forEach(ns => {
      if (ns.id === nsId) {
        ns.groups.forEach(group => {
          if (group.id === groupId) {
            group.status = checked;
          }
        });
      }
    });
  };

  const ops: {
    [key in DispatchType]: (args: any) => void;
  } = {
    initState,
    addNS,
    deleteNS,
    changeNSName,
    addGroup,
    starGroup,
    deleteGroup,
    nsSwitch,
    groupSwitch,
  };

  const { type, payload } = action;
  if (ops[type]) {
    ops[type](payload);
  }

  return draft;
};

// const getter = state => ({});

const useStore = (initState: any = {}): [Store, Dispatch<DispatchAction>] => {
  const [newState, dispatch] = useImmerReducer<any, DispatchAction>(reducer, {
    ...initState,
    __INIT__: true,
  });

  // persistence data
  useMemo(() => {
    if (!newState.__INIT__) {
      setData(newState);
    }
  }, [newState]);

  // hybrid computed
  const hybridState = {
    state: newState,
    // getter: getter(newState),
  };

  return [hybridState, dispatch];
};

export default useStore;
