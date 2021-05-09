import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from '@material-ui/core';
import {
  Dashboard as DashboardIcon,
  BugReport as BugReportIcon,
  Description as DescriptionIcon,
} from '@material-ui/icons';

const Menu: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <List>
      <ListItem button selected={pathname === '/rules'}>
        <ListItemIcon>
          <DashboardIcon color="primary" />
        </ListItemIcon>
        <ListItemText primary="规则" />
      </ListItem>
      <Link
        color="inherit"
        underline="none"
        target="_blank"
        href="https://www.yuque.com/ryl2nr/ngd5zk"
      >
        <ListItem button selected={pathname === '/doc'}>
          <ListItemIcon>
            <DescriptionIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="文档" />
        </ListItem>
      </Link>
      <Link
        color="inherit"
        underline="none"
        target="_blank"
        href="https://www.yuque.com/ryl2nr/topics"
      >
        <ListItem button selected={pathname === '/issue'}>
          <ListItemIcon>
            <BugReportIcon color="action" />
          </ListItemIcon>
          <ListItemText primary="问题" />
        </ListItem>
      </Link>
    </List>
  );
};

export default Menu;
