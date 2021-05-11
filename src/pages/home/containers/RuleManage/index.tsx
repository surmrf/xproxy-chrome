import { find, isEmpty } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  TextField,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import {
  Save as SaveIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@material-ui/icons';
import { useHistory, useParams } from 'react-router-dom';
import { produce } from 'immer';
import { createGroup, createRule } from '@/utils/rule/factory';
import type { Group, Namespace, Rule } from '@/utils/rule/type';
import { defaultNSId } from '@/store';
import { useGlobalStore } from '@/store/Provider';
import Header from '../../components/Header';
import toast from '../../components/toast';

const useRulePairStyles = makeStyles({
  rulePairContainer: {
    display: 'flex',
    marginBottom: '20px',

    '& .MuiOutlinedInput-input': {
      padding: '5px',
    },
  },
  type: {
    display: 'flex',
    justifyContent: 'center',
    width: '150px',
    border: '1px solid #e6ecf1',
    borderRight: 0,
  },
  typeSelect: {
    alignSelf: 'center',
  },
  rulePair: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    padding: '10px 20px 10px 10px',
    border: '1px solid #e6ecf1',
    backgroundColor: '#f5f7f9',
    marginRight: '20px',
    height: '150px',
  },
  rulePairInner: {
    width: '100%',
  },
  label: {
    minWidth: '120px',
    textAlign: 'right',
    marginRight: '15px',
    color: 'rgba(0, 0, 0, 0.42)',
  },
  input: {
    flex: '1',
  },
  match: {
    display: 'flex',
    alignItems: 'center',
  },
  handle: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '15px',
  },
  condition: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
  },
  delete: {
    alignSelf: 'center',
  },
});

const RulePair: React.FC<{
  rule: Rule;
  onRuleChange: (rule: Rule) => void;
  onRuleDelete: (rule: Rule) => void;
}> = props => {
  const { rule } = props;
  const classes = useRulePairStyles();

  const onRuleChange = (key: keyof Rule) => evt => {
    props.onRuleChange(
      produce(rule, draft => {
        draft[key] = evt.target.value as never;
      }),
    );
  };

  const onRuleDelete = () => {
    props.onRuleDelete(rule);
  };

  const redirect = (
    <div className={classes.rulePair}>
      <div className={classes.rulePairInner}>
        <div className={classes.match}>
          <span className={classes.label}>WHEN</span>
          <TextField
            className={classes.input}
            placeholder="regular expression"
            value={rule.pattern}
            onChange={onRuleChange('pattern')}
          />
        </div>
        <div className={classes.handle}>
          <span className={classes.label}>TO</span>
          <TextField
            className={classes.input}
            placeholder="replacement"
            value={rule.destination}
            onChange={onRuleChange('destination')}
          />
        </div>
      </div>
    </div>
  );

  const replace = (
    <div className={classes.rulePair}>
      <div className={classes.rulePairInner}>
        <div className={classes.match}>
          <span className={classes.label}>REPLACE</span>
          <TextField
            className={classes.input}
            placeholder="regular expression"
            value={rule.pattern}
            onChange={onRuleChange('pattern')}
          />
        </div>
        <div className={classes.handle}>
          <span className={classes.label}>WITH</span>
          <TextField
            className={classes.input}
            placeholder="replacement"
            value={rule.destination}
            onChange={onRuleChange('destination')}
          />
        </div>
        <div className={classes.condition}>
          <span className={classes.label}>WHEN</span>
          <TextField
            className={classes.input}
            placeholder="regular expression [empty]"
            value={rule.condition}
            onChange={onRuleChange('condition')}
          />
        </div>
      </div>
    </div>
  );

  const cancel = (
    <div className={classes.rulePair}>
      <div className={classes.rulePairInner}>
        <div className={classes.match}>
          <span className={classes.label}>WHEN</span>
          <TextField
            className={classes.input}
            placeholder="regular expression"
            value={rule.pattern}
            onChange={onRuleChange('pattern')}
          />
        </div>
      </div>
    </div>
  );

  const ruleType: Rule['type'][] = ['replace', 'redirect', 'cancel'];
  const ruleMap: { [key in Rule['type']]: React.ReactNode } = {
    redirect,
    replace,
    cancel,
  };

  return (
    <div className={classes.rulePairContainer}>
      <div className={classes.type}>
        <Select
          className={classes.typeSelect}
          labelId="namespace"
          value={rule.type}
          onChange={onRuleChange('type')}
        >
          {ruleType.map((t, i) => {
            return (
              <MenuItem key={i} value={t}>
                {t.toUpperCase()}
              </MenuItem>
            );
          })}
        </Select>
      </div>
      {ruleMap[rule.type]}
      <Tooltip title="删除规则">
        <IconButton className={classes.delete} onClick={onRuleDelete}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const useRuleStyles = makeStyles(theme => ({
  formControl: {
    minWidth: 150,
  },
  formSpace: {
    marginLeft: theme.spacing(2),
  },
  ruleManage: {
    padding: '20px',
  },
  ruleOwner: {},
  ruleAdd: {
    display: 'flex',
    marginTop: '20px',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ruleAddIcon: {
    cursor: 'pointer',
  },
  rulePairContainer: {
    marginTop: '20px',
  },
  ruleEmpty: {
    padding: '20px',
    textAlign: 'center',
  },
}));

export default () => {
  const history = useHistory();
  const params = useParams<{ nsId?: string; groupId?: string }>();
  const { nsId, groupId } = params || {};
  const classes = useRuleStyles();
  const [{ state }, dispatch] = useGlobalStore();
  const [namespace, setNamespace] = useState('');
  const [nsType, setNSType] = useState<Namespace['type']>('local');
  const [group, setGroup] = useState<Partial<Group>>({ name: '' });
  const [rules, setRules] = useState<Rule[]>([]);
  const isEdit = !!(nsId && groupId);
  const namespaces = state?.namespaces || [];

  useEffect(() => {
    if (isEdit) {
      const ns = find(namespaces, ns => ns.id === nsId);
      const group = find(ns?.groups || [], g => g.id === groupId);

      if (isEmpty(namespaces)) {
        return;
      }

      if (!ns) {
        console.error(`namespace ${nsId} not found`);
        return;
      }

      if (!group) {
        console.error(`group ${groupId} not found`);
        return;
      }

      setNamespace(nsId);
      setNSType(ns.type);
      setGroup(group);
      setRules(group?.rules);
    } else {
      if (nsId) {
        setNamespace(nsId);
      } else {
        setNamespace(defaultNSId);
      }
      setGroup(
        createGroup({
          name: '',
        }),
      );
    }
  }, [nsId, groupId, namespaces]);

  const onNsChange = evt => {
    setNamespace(evt.target.value);
  };

  const onGroupChange = evt => {
    setGroup(
      produce(group, draft => {
        draft.name = evt.target.value;
        draft.lastModifiedTime = new Date().toString();
      }),
    );
  };

  const onAddRule = () => {
    setRules(
      produce(rules, draft => {
        draft.push(
          createRule({
            type: 'replace',
            conditionType: 'regexp',
            condition: '',
            pattern: '',
            destination: '',
          }),
        );
      }),
    );
  };

  const onRuleChange = (index: number) => (rule: Rule) => {
    setRules(
      produce(rules, draft => {
        draft[index] = rule;
      }),
    );
  };

  const onRuleDelete = (rule: Rule) => {
    setRules(rules.filter(r => r.id !== rule.id));
  };

  const onSave = () => {
    const newGroup = produce(group, draft => {
      draft.rules = rules;
    });

    if (!group.name) {
      toast.error('规则组名不能为空');
      return;
    }

    const gId = isEdit ? groupId : group.id;

    dispatch({
      type: 'addGroup',
      payload: {
        nsId: namespace,
        groupId: gId,
        group: newGroup,
      },
    });

    toast.success('保存成功');

    history.replace(`/rule/edit/${namespace}/${gId}`);
  };

  const onClose = () => {
    history.replace('/');
  };

  return (
    <div>
      {nsType === 'remote' ? (
        <Alert severity="info">
          远程规则不支持修复。如需修改，可先导出后本地导入修复
        </Alert>
      ) : null}
      <Header title="新增规则">
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={onSave}
          disabled={nsType === 'remote'}
        >
          保存
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          关闭
        </Button>
      </Header>
      <div className={classes.ruleManage}>
        <div className={classes.ruleOwner}>
          <FormControl className={classes.formControl}>
            <InputLabel id="namespace">所属空间</InputLabel>
            <Select
              labelId="namespace"
              value={namespace}
              onChange={onNsChange}
              disabled={isEdit}
            >
              {namespaces?.map(ns => {
                return (
                  <MenuItem key={ns.id} value={ns.id}>
                    {ns.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            className={classes.formSpace}
            label="规则组名"
            value={group.name}
            onChange={onGroupChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
        <div className={classes.ruleAdd}>
          <Tooltip title="新增规则">
            <IconButton onClick={onAddRule}>
              <AddCircleIcon className={classes.ruleAddIcon} />
            </IconButton>
          </Tooltip>
        </div>
        <div className={classes.rulePairContainer}>
          {rules.length ? (
            rules.map((rule, index) => (
              <RulePair
                key={index}
                rule={rule}
                onRuleChange={onRuleChange(index)}
                onRuleDelete={onRuleDelete}
              />
            ))
          ) : (
            <div className={classes.ruleEmpty}>规则为空</div>
          )}
        </div>
      </div>
    </div>
  );
};
