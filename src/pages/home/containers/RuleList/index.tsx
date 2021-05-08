import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  ButtonGroup,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Link,
  Tooltip,
} from '@material-ui/core';
import {
  Add as AddIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  DesktopWindows as DesktopWindowsIcon,
  CloudDownload as CloudDownloadIcon,
  Toc as TocIcon,
  FileCopy as FileCopyIcon,
} from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { produce } from 'immer';
import cx from 'classnames';
import { defaultNSId } from '@/store';
import { useGlobalStore } from '@/store/Provider';
import { resetNSData } from '@/utils/rule/helper';
import { Namespace, Group } from '@/utils/rule/type';
import Header from '../../components/Header';
import toast from '../../components/toast';
import { loadJSONFile, exportJSONFile, loadRemoteJSON } from './util';

type DeleteType = 'group' | 'namespace';

const useRowStyles = makeStyles({
  tableCell: {
    fontWeight: 600,
  },
  tableOptCell: {
    width: '300px',
  },
  tableRow: {
    backgroundColor: '#fff',
  },
  iconSpace: {
    marginRight: '10px',
  },
  noData: {
    padding: '20px 0',
    textAlign: 'center',
  },
  pager: {
    minWidth: '400px',
  },
});

const Row: React.FC<{
  rowData: Namespace;
  onChange?: (args: { type: 'changeNSName'; payload: any }) => void;
  onUpdateRemoteNS?: (args: Namespace) => void;
}> = props => {
  const { rowData } = props;
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const classes = useRowStyles();
  const nsId = rowData.id;
  const groups = rowData?.groups || [];
  const history = useHistory();
  const [, dispatch] = useGlobalStore();
  const deleteStagedInfo = useRef<{
    type: DeleteType;
    data?: Group | Namespace;
  }>();
  const { type: deletedType, data: deletedData } =
    deleteStagedInfo.current || {};

  const onNSChange = (nsId: string) => evt => {
    dispatch({
      type: 'nsSwitch',
      payload: {
        nsId,
        checked: evt.target.checked,
      },
    });
  };

  const onGroupChange = (nsId: string, groupId: string) => evt => {
    dispatch({
      type: 'groupSwitch',
      payload: {
        nsId,
        groupId,
        checked: evt.target.checked,
      },
    });
  };

  const onEditGroup = (groupId: string) => () => {
    history.push(`/rule/edit/${nsId}/${groupId}`);
  };

  const onStarGroup = (groupId: string, star: boolean) => () => {
    dispatch({
      type: 'starGroup',
      payload: {
        nsId,
        groupId,
        star: !star,
      },
    });
  };

  const onDelete = () => {
    if (!deletedType || !deletedData) return;

    if (deletedType === 'group') {
      dispatch({
        type: 'deleteGroup',
        payload: {
          nsId,
          groupId: deletedData.id,
        },
      });
    } else {
      dispatch({
        type: 'deleteNS',
        payload: {
          nsId,
        },
      });
    }

    setOpenDialog(false);
  };

  const onAddRuleGroup = () => {
    history.push(`/rule/edit/${nsId}`);
  };

  const onChangeNSName = () => {
    props.onChange({
      type: 'changeNSName',
      payload: {
        nsId,
        nsName: rowData.name,
      },
    });
  };

  const onExportNSData = () => {
    const filename = `${rowData.name}-${dayjs().format('YYYY-MM-DD')}`;

    exportJSONFile(
      produce(rowData, draft => {
        draft.name = filename;
      }),
      filename,
    );
  };

  const onUpdateNSData = () => {
    props.onUpdateRemoteNS(rowData);
  };

  return (
    <React.Fragment>
      <TableRow>
        <TableCell className={classes.tableCell}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell
          className={classes.tableCell}
          width="40%"
          component="th"
          colSpan={2}
        >
          {rowData.name}
        </TableCell>
        <TableCell className={classes.tableCell} align="center">
          <Switch
            color="primary"
            checked={rowData.status}
            onChange={onNSChange(rowData.id)}
          />
        </TableCell>
        <TableCell
          className={cx(classes.tableCell, classes.tableOptCell)}
          align="right"
        >
          <Tooltip title="更多操作">
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={evt => {
                setAnchorEl(evt.currentTarget);
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            id="long-menu"
            keepMounted
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => {
              setAnchorEl(null);
            }}
          >
            <MenuItem onClick={onAddRuleGroup}>新建规则组</MenuItem>
            <MenuItem onClick={onChangeNSName}>更改空间名</MenuItem>
            <MenuItem onClick={onExportNSData}>导出空间</MenuItem>
            {rowData?.remoteUrl ? (
              <MenuItem onClick={onUpdateNSData}>更新空间</MenuItem>
            ) : null}
            {nsId !== defaultNSId ? (
              <MenuItem
                onClick={() => {
                  deleteStagedInfo.current = {
                    type: 'namespace',
                    data: rowData,
                  };
                  setOpenDialog(true);
                }}
              >
                删除空间
              </MenuItem>
            ) : null}
          </Menu>
        </TableCell>
      </TableRow>
      {open &&
        (groups?.length ? (
          groups.map(group => {
            return (
              <TableRow key={group.id} className={classes.tableRow}>
                <TableCell className={classes.tableCell} />
                <TableCell>
                  <Link onClick={onEditGroup(group.id)}>{group.name}</Link>
                </TableCell>
                <TableCell>
                  <div>{group.type}</div>
                </TableCell>
                <TableCell align="center">
                  <Switch
                    color="primary"
                    checked={group.status}
                    onChange={onGroupChange(rowData.id, group.id)}
                  />
                </TableCell>
                <TableCell className={classes.tableOptCell} align="right">
                  <Tooltip title={group.star ? '取消收藏' : '收藏'}>
                    <IconButton
                      className={classes.iconSpace}
                      onClick={onStarGroup(group.id, group.star)}
                    >
                      {group.star ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="编辑规则组">
                    <IconButton
                      className={classes.iconSpace}
                      onClick={onEditGroup(group.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="删除规则组">
                    <IconButton
                      onClick={() => {
                        deleteStagedInfo.current = {
                          type: 'group',
                          data: group,
                        };
                        setOpenDialog(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="复制规则组">
                    <IconButton className={classes.iconSpace}>
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow className={classes.tableRow}>
            <TableCell colSpan={5}>
              <div className={classes.noData}>暂无规则组</div>
            </TableCell>
          </TableRow>
        ))}
      <Dialog fullWidth open={openDialog}>
        <DialogTitle id="alert-dialog-title">
          确定要删除{deletedType === 'group' ? '规则组' : '空间'}「
          {deletedData?.name || ''}」（删除后不可恢复）？
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            取消
          </Button>
          <Button onClick={onDelete} color="primary" autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

const useRuleListStyles = makeStyles({
  ruleList: {},
  tableContainer: {
    backgroundColor: '#f7f7f7',
  },
  table: {
    tableLayout: 'fixed',
  },
  tableCell: {
    fontWeight: 100,
    fontSize: '12px',
  },
  tableOptCell: {
    width: '300px',
  },
  noData: {
    padding: '20px 0',
    textAlign: 'center',
  },
  nsName: {
    width: '100%',
  },
});

const RuleList: React.FC = () => {
  const classes = useRuleListStyles();
  const [store, dispatch] = useGlobalStore();
  const history = useHistory();
  const [open, setOpen] = useState<'new' | 'edit' | null>();
  const [nsName, setNSName] = useState('');
  const [temp, setTemp] = useState(null);
  const [importUrl, setImportUrl] = useState('');
  const [importUrlOpen, setImportUrlOpen] = useState(false);

  const { state } = store;
  const namespaces =
    state?.namespaces?.filter(ns => {
      if (ns.id === defaultNSId) {
        if (ns.groups && ns.groups.length) {
          return true;
        }
        return false;
      }
      return true;
    }) || [];

  const onClose = () => {
    setOpen(null);
    setNSName('');
  };

  const onSave = () => {
    if (!nsName) {
      toast.error('请填写空间名');
      return;
    }

    if (open === 'edit') {
      dispatch({
        type: 'changeNSName',
        payload: {
          nsId: temp.nsId,
          name: nsName,
        },
      });
      toast.success('修改成功');
    } else {
      dispatch({
        type: 'addNS',
        payload: {
          name: nsName,
        },
      });
      toast.success('创建成功');
    }

    setOpen(null);
    setTemp(null);
  };

  const onCreateGroup = () => {
    history.push('/rule/add');
  };

  const onRowChange = ({ type, payload }) => {
    if (type === 'changeNSName') {
      setOpen('edit');
      setTemp(payload);
      setNSName(payload.nsName);
    }
  };

  const okHandle = (
    type: 'local' | 'remote',
    opt: 'new' | 'update' = 'new',
    extra?: { nsId?: string; remoteUrl?: string },
  ) => json => {
    const ns = resetNSData(json, {
      onNSChange: ns => {
        if (type === 'remote') {
          ns.remoteUrl = extra.remoteUrl;

          if (opt === 'update') {
            //
          }
        }
      },
      onGroupChange: group => {
        group.type = type;
      },
    });

    if (!ns) {
      toast.error('配置数据格式错误');
      return;
    }

    dispatch({
      type: 'addNS',
      payload: {
        ns,
      },
    });
  };

  const errHandle = msg => {
    toast.error(msg);
  };

  const onImportLocalNS = () => {
    loadJSONFile().then(okHandle('local', 'new'), errHandle);
  };

  const onImportRemoteNS = () => {
    loadRemoteJSON(importUrl)
      .then(okHandle('remote', 'new', { remoteUrl: importUrl }), errHandle)
      .then(() => {
        setImportUrlOpen(false);
      });
  };

  const onUpdateRemoteNS = ({ id, remoteUrl }: Namespace) => {
    loadRemoteJSON(remoteUrl).then(
      okHandle('remote', 'update', { nsId: id, remoteUrl }),
      errHandle,
    );
  };

  return (
    <div className={classes.ruleList}>
      <Header title="规则管理">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpen('new')}
        >
          新建空间
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<TocIcon />}
          onClick={onCreateGroup}
        >
          新增规则组
        </Button>
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Tooltip title="本地导入">
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={onImportLocalNS}
            >
              <DesktopWindowsIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="远程导入">
            <Button
              size="large"
              variant="contained"
              color="primary"
              onClick={() => setImportUrlOpen(true)}
            >
              <CloudDownloadIcon fontSize="small" />
            </Button>
          </Tooltip>
        </ButtonGroup>
        {/* <MoreVertIcon /> */}
      </Header>
      <div className={classes.tableContainer}>
        <Table className={classes.table} aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>展开空间</TableCell>
              <TableCell className={classes.tableCell}>空间/规则组</TableCell>
              <TableCell className={classes.tableCell}>类型</TableCell>
              <TableCell className={classes.tableCell} align="center">
                开启状态
              </TableCell>
              <TableCell
                className={cx(classes.tableCell, classes.tableOptCell)}
                align="right"
              >
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {namespaces.length ? (
              namespaces.map(ns => (
                <Row
                  key={ns.id}
                  rowData={ns}
                  onChange={onRowChange}
                  onUpdateRemoteNS={onUpdateRemoteNS}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className={classes.noData}>暂无数据</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!open}
        fullWidth
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {open === 'new' ? '添加空间' : '修改空间名'}
        </DialogTitle>
        <DialogContent>
          <TextField
            className={classes.nsName}
            size="small"
            label="空间名"
            variant="outlined"
            value={nsName}
            onChange={evt => {
              setNSName(evt.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            取消
          </Button>
          <Button onClick={onSave} color="primary" autoFocus>
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={importUrlOpen}
        fullWidth
        onClose={() => setImportUrlOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">远程导入空间</DialogTitle>
        <DialogContent>
          <TextField
            className={classes.nsName}
            size="small"
            label="远程地址"
            variant="outlined"
            value={importUrl}
            onChange={evt => {
              setImportUrl(evt.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportUrlOpen(false)} color="primary">
            取消
          </Button>
          <Button onClick={onImportRemoteNS} color="primary" autoFocus>
            导入
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RuleList;
