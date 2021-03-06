import React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';
import Provider from '@/store/Provider';
import Layout from './Layout';
import RuleList from './containers/RuleList';
import RuleManage from './containers/RuleManage';

const pathMap = {
  namespace: {
    title: '空间列表',
    path: '/',
  },
  group: {
    title: '规则管理',
    path: '/rule/add',
  },
  groupEdit: {
    title: '规则管理',
    path: '/rule/edit/:nsId/:groupId?',
  },
};

export default () => (
  <Provider>
    <HashRouter>
      <Switch>
        <Route
          exact
          path={pathMap.namespace.path}
          render={() => (
            <Layout title={pathMap.namespace.title}>
              <RuleList />
            </Layout>
          )}
        />
        <Route
          path={pathMap.group.path}
          render={() => (
            <Layout title={pathMap.group.title}>
              <RuleManage />
            </Layout>
          )}
        />
        <Route
          path={pathMap.groupEdit.path}
          render={() => (
            <Layout title={pathMap.groupEdit.title}>
              <RuleManage />
            </Layout>
          )}
        />
        <Redirect from="*" to="/" />
      </Switch>
    </HashRouter>
  </Provider>
);
