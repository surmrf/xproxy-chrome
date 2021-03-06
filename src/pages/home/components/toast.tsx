import React, { useState } from 'react';
import { render } from 'react-dom';
import { Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';

const Alert: React.FC<AlertProps> = props => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const Toast: React.FC<{ type?: Color; onClose?: () => void }> = props => {
  const [toast, setToast] = useState(true);
  const type = props.type || 'info';

  return (
    <Snackbar
      open={toast}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={2000}
      onClose={() => {
        setToast(false);
        setTimeout(() => props.onClose(), 0);
      }}
    >
      <Alert severity={type}>{props.children}</Alert>
    </Snackbar>
  );
};

interface IToast {
  (args: { type: Color; msg: React.ReactNode }): void;
  info: (child: React.ReactNode) => void;
  error: (child: React.ReactNode) => void;
  warning: (child: React.ReactNode) => void;
  success: (child: React.ReactNode) => void;
}

const toast: IToast = ({ type, msg }) => {
  const mount = document.createElement('div');
  document.body.appendChild(mount);
  const onClose = () => {
    document.body.removeChild(mount);
  };

  render(
    <Toast type={type} onClose={onClose}>
      {msg}
    </Toast>,
    mount,
  );
};

toast.success = (msg: React.ReactNode) => {
  toast({
    type: 'success',
    msg,
  });
};

toast.error = (msg: React.ReactNode) => {
  toast({
    type: 'error',
    msg,
  });
};

toast.warning = (msg: React.ReactNode) => {
  toast({
    type: 'warning',
    msg,
  });
};

toast.info = (msg: React.ReactNode) => {
  toast({
    type: 'info',
    msg,
  });
};

export default toast;
