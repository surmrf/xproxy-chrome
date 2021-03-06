import React from 'react';
import { Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useHeaderStyles = makeStyles({
  header: {
    padding: '20px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  headerAction: {
    display: 'flex',
    alignItems: 'center',
    gridGap: '10px',
  },
});

const Header: React.FC<{ title: string }> = props => {
  const classes = useHeaderStyles();

  return (
    <React.Fragment>
      <div className={classes.header}>
        <div className={classes.headerTitle}>规则管理</div>
        <div className={classes.headerAction}>{props.children}</div>
      </div>
      <Divider />
    </React.Fragment>
  );
};

export default Header;
