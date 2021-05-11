import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@material-ui/core';
import { MoreVert as MoreVertIcon } from '@material-ui/icons';
import { useGlobalStore } from '@/store/Provider';
import toast from '../../../components/toast';

const MoreButton = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openClear, setOpenClear] = useState(false);
  const openMenu = Boolean(anchorEl);
  const [, dispatch] = useGlobalStore();

  const onClear = () => {
    dispatch({
      type: 'clearNS',
      payload: {},
    });
    toast.success('清空成功');
    setOpenClear(false);
  };

  return (
    <React.Fragment>
      <Tooltip title="更多操作">
        <Button
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={evt => {
            setAnchorEl(evt.currentTarget);
          }}
          variant="contained"
          color="primary"
        >
          <MoreVertIcon />
        </Button>
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
        <MenuItem onClick={() => setOpenClear(true)}>清空所有空间</MenuItem>
      </Menu>
      <Dialog
        open={openClear}
        fullWidth
        onClose={() => setOpenClear(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          确定清空所有空间吗（该操作不可撤回）？
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenClear(false)} color="primary">
            取消
          </Button>
          <Button onClick={onClear} color="primary" autoFocus>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default MoreButton;
