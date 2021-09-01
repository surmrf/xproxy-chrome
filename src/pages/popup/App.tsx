import React, { useMemo } from 'react';
import { Switch, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { Group } from '@/store';
import Provider, { useGlobalStore } from '@/store/Provider';
import Logo from '@/common/Logo';

type NewGroup = Group & { nsId: string; nsType: 'local' | 'remote' };

const useStyles = makeStyles({
  popupContainer: {
    minWidth: '360px',
    padding: '15px 15px 0',
  },
  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  ruleConflict: {
    paddingBottom: '15px',
  },
  groupRows: {
    padding: '10px 0',
    maxHeight: '300px',
    overflowY: 'auto',

    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  groupRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  groupTag: {
    color: '#0b52cb',
    fontSize: '10px',
    border: '1px solid #0b52cb',
    borderRadius: '100%',
    marginRight: '5px',
    width: '12px',
    textAlign: 'center',
    height: '12px',
  },
  groupName: {
    color: '#0b52cb',
    cursor: 'pointer',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '&:hover': {
      color: '#083c94',
    },
  },
  groupSwitch: {},
  noData: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#999',
    fontSize: '12px',
  },
});

const App: React.FC = () => {
  const [store, dispatch] = useGlobalStore();
  const { state } = store;
  const classes = useStyles();

  const groups = useMemo(() => {
    if (!state.namespaces) return [];
    return state.namespaces
      .reduce<NewGroup[]>((a, b) => {
        const groups = b.groups.map(group => ({
          ...group,
          nsId: b.id,
          nsType: b.type,
        }));
        return [...a.concat(...groups)];
      }, [])
      .filter(group => group.star);
  }, [state]);

  const openMultiGroup = groups.filter(group => group.status).length > 1;

  const onChange =
    ({ nsId, groupId, checked }) =>
    () => {
      dispatch({
        type: 'groupSwitch',
        payload: {
          nsId,
          groupId,
          checked,
        },
      });
    };

  const onGroupEdit =
    ({ nsId, groupId }) =>
    () => {
      chrome.tabs.create({
        url: `pages/home/index.html#/rule/edit/${nsId}/${groupId}`,
      });
    };

  const onOpenHome = () => {
    chrome.tabs.create({
      url: 'pages/home/index.html',
    });
  };

  return (
    <div className={classes.popupContainer}>
      <div className={classes.popupHeader}>
        <Logo size={20} />
        <Button
          variant="outlined"
          size="small"
          color="primary"
          onClick={onOpenHome}
        >
          主页
        </Button>
      </div>
      <div className={classes.groupRows}>
        {groups.length ? (
          groups.map(group => {
            return (
              <div className={classes.groupRow} key={group.id}>
                <div className={classes.groupLeft}>
                  <span className={classes.groupTag}>
                    {group.nsType === 'remote' ? 'R' : 'L'}
                  </span>
                  <span
                    className={classes.groupName}
                    onClick={onGroupEdit({
                      nsId: group.nsId,
                      groupId: group.id,
                    })}
                  >
                    {group.name}
                  </span>
                </div>
                <div className={classes.groupSwitch}>
                  <Switch
                    disableRipple
                    color="primary"
                    checked={group.status}
                    onChange={onChange({
                      nsId: group.nsId,
                      groupId: group.id,
                      checked: !group.status,
                    })}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className={classes.noData}>没有收藏的规则组哦</div>
        )}
      </div>
      {openMultiGroup ? (
        <div className={classes.ruleConflict}>
          <Alert severity="warning">开启多个规则组时，请注意规则互斥</Alert>
        </div>
      ) : null}
    </div>
  );
};

const ProviderApp = () => (
  <Provider>
    <App />
  </Provider>
);

export default ProviderApp;
