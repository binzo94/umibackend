import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from 'umi/dynamic';
import renderRoutes from 'umi/lib/renderRoutes';
import history from '@@/history';
import { routerRedux } from 'dva';

const Router = routerRedux.ConnectedRouter;

const routes = [
  {
    path: '/',
    component: require('../../layouts/index.js').default,
    routes: [
      {
        path: '/App',
        exact: true,
        component: require('../App.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/Context',
        exact: true,
        component: require('../Context.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/DynamicRoute',
        exact: true,
        component: require('../DynamicRoute.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/Header',
        exact: true,
        component: require('../Header.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/MyBreadCumb',
        exact: true,
        component: require('../MyBreadCumb.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/NoMatch',
        exact: true,
        component: require('../NoMatch.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/PrivateRoute',
        exact: true,
        component: require('../PrivateRoute.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/SideBar',
        exact: true,
        component: require('../SideBar.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/',
        exact: true,
        component: require('../index.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/login',
        exact: true,
        component: require('../login/index.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/withContext',
        exact: true,
        component: require('../withContext.js').default,
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/data-admin',
        exact: false,
        component: require('../data-admin/_layout.js').default,
        routes: [
          {
            path: '/data-admin/behavior-add',
            exact: true,
            component: require('../data-admin/behavior-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/behavior-form',
            exact: true,
            component: require('../data-admin/behavior-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/behavior-list',
            exact: true,
            component: require('../data-admin/behavior-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/behavior-listforupload',
            exact: true,
            component: require('../data-admin/behavior-listforupload.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/behavior-upload-list',
            exact: true,
            component: require('../data-admin/behavior-upload-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/bid-upload-list',
            exact: true,
            component: require('../data-admin/bid-upload-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/biddinginfo-add',
            exact: true,
            component: require('../data-admin/biddinginfo-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/biddinginfo-list',
            exact: true,
            component: require('../data-admin/biddinginfo-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-add',
            exact: true,
            component: require('../data-admin/company-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-form',
            exact: true,
            component: require('../data-admin/company-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-list',
            exact: true,
            component: require('../data-admin/company-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-qualification-add',
            exact: true,
            component: require('../data-admin/company-qualification-add.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-qualification-form',
            exact: true,
            component: require('../data-admin/company-qualification-form.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/company-qualification-list',
            exact: true,
            component: require('../data-admin/company-qualification-list.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin',
            exact: true,
            component: require('../data-admin/index.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/merge-add',
            exact: true,
            component: require('../data-admin/merge-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/merge-list',
            exact: true,
            component: require('../data-admin/merge-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/mergebid-add',
            exact: true,
            component: require('../data-admin/mergebid-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/mergebid-list',
            exact: true,
            component: require('../data-admin/mergebid-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/mergemanager-add',
            exact: true,
            component: require('../data-admin/mergemanager-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/mergemanager-list',
            exact: true,
            component: require('../data-admin/mergemanager-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/person-add',
            exact: true,
            component: require('../data-admin/person-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/person-form',
            exact: true,
            component: require('../data-admin/person-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/person-list',
            exact: true,
            component: require('../data-admin/person-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/person-qualification-form',
            exact: true,
            component: require('../data-admin/person-qualification-form.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/person-qualification-list',
            exact: true,
            component: require('../data-admin/person-qualification-list.js')
              .default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/projectapproval-add',
            exact: true,
            component: require('../data-admin/projectapproval-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/projectapproval-list',
            exact: true,
            component: require('../data-admin/projectapproval-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/projectmanager-add',
            exact: true,
            component: require('../data-admin/projectmanager-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/projectmanager-list',
            exact: true,
            component: require('../data-admin/projectmanager-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/source-add',
            exact: true,
            component: require('../data-admin/source-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/source-form',
            exact: true,
            component: require('../data-admin/source-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/source-list',
            exact: true,
            component: require('../data-admin/source-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/winningbid-form',
            exact: true,
            component: require('../data-admin/winningbid-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/data-admin/winningbid-list',
            exact: true,
            component: require('../data-admin/winningbid-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
        ],
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/internal-admin',
        exact: false,
        component: require('../internal-admin/_layout.js').default,
        routes: [
          {
            path: '/internal-admin/dept-add',
            exact: true,
            component: require('../internal-admin/dept-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/dept-list',
            exact: true,
            component: require('../internal-admin/dept-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin',
            exact: true,
            component: require('../internal-admin/index.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/list',
            exact: true,
            component: require('../internal-admin/list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/resource-add',
            exact: true,
            component: require('../internal-admin/resource-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/resource-list',
            exact: true,
            component: require('../internal-admin/resource-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/role-add',
            exact: true,
            component: require('../internal-admin/role-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/role-list',
            exact: true,
            component: require('../internal-admin/role-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/sub',
            exact: true,
            component: require('../internal-admin/sub.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/sys-user-add',
            exact: true,
            component: require('../internal-admin/sys-user-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/sys-user-list',
            exact: true,
            component: require('../internal-admin/sys-user-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/internal-admin/system-list',
            exact: true,
            component: require('../internal-admin/system-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
        ],
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/operation-admin',
        exact: false,
        component: require('../operation-admin/_layout.js').default,
        routes: [
          {
            path: '/operation-admin/analyse-detail',
            exact: true,
            component: require('../operation-admin/analyse-detail.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/domain-add',
            exact: true,
            component: require('../operation-admin/domain-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/domain-list',
            exact: true,
            component: require('../operation-admin/domain-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin',
            exact: true,
            component: require('../operation-admin/index.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/ip-list',
            exact: true,
            component: require('../operation-admin/ip-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/resource-add',
            exact: true,
            component: require('../operation-admin/resource-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/resource-list',
            exact: true,
            component: require('../operation-admin/resource-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/role-add',
            exact: true,
            component: require('../operation-admin/role-add.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/role-list',
            exact: true,
            component: require('../operation-admin/role-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/operation-admin/user-analyse',
            exact: true,
            component: require('../operation-admin/user-analyse.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
        ],
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/search-admin',
        exact: false,
        component: require('../search-admin/_layout.js').default,
        routes: [
          {
            path: '/search-admin/cerfication-form',
            exact: true,
            component: require('../search-admin/cerfication-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/company-certlist',
            exact: true,
            component: require('../search-admin/company-certlist.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/curriculum-form',
            exact: true,
            component: require('../search-admin/curriculum-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/group-detail',
            exact: true,
            component: require('../search-admin/group-detail.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/group-form',
            exact: true,
            component: require('../search-admin/group-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/group-list',
            exact: true,
            component: require('../search-admin/group-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin',
            exact: true,
            component: require('../search-admin/index.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/project-form',
            exact: true,
            component: require('../search-admin/project-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/user-auth',
            exact: true,
            component: require('../search-admin/user-auth.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/user-checklist',
            exact: true,
            component: require('../search-admin/user-checklist.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/worker-detail',
            exact: true,
            component: require('../search-admin/worker-detail.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/worker-form',
            exact: true,
            component: require('../search-admin/worker-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/search-admin/worker-list',
            exact: true,
            component: require('../search-admin/worker-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
        ],
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        path: '/user-admin',
        exact: false,
        component: require('../user-admin/_layout.js').default,
        routes: [
          {
            path: '/user-admin/company-certlist',
            exact: true,
            component: require('../user-admin/company-certlist.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin',
            exact: true,
            component: require('../user-admin/index.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin/user-auth',
            exact: true,
            component: require('../user-admin/user-auth.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin/user-checkdetail',
            exact: true,
            component: require('../user-admin/user-checkdetail.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin/user-checklist',
            exact: true,
            component: require('../user-admin/user-checklist.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin/user-form',
            exact: true,
            component: require('../user-admin/user-form.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            path: '/user-admin/user-list',
            exact: true,
            component: require('../user-admin/user-list.js').default,
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
          {
            component: () =>
              React.createElement(
                require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
                  .default,
                { pagesPath: 'src/pages', hasRoutesInConfig: false },
              ),
            _title: 'zhjx-front',
            _title_default: 'zhjx-front',
          },
        ],
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
      {
        component: () =>
          React.createElement(
            require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
              .default,
            { pagesPath: 'src/pages', hasRoutesInConfig: false },
          ),
        _title: 'zhjx-front',
        _title_default: 'zhjx-front',
      },
    ],
    _title: 'zhjx-front',
    _title_default: 'zhjx-front',
  },
  {
    component: () =>
      React.createElement(
        require('/Users/bin/zhjx-front/node_modules/_umi-build-dev@1.16.7@umi-build-dev/lib/plugins/404/NotFound.js')
          .default,
        { pagesPath: 'src/pages', hasRoutesInConfig: false },
      ),
    _title: 'zhjx-front',
    _title_default: 'zhjx-front',
  },
];
window.g_routes = routes;
const plugins = require('umi/_runtimePlugin');
plugins.applyForEach('patchRoutes', { initialValue: routes });

export { routes };

export default class RouterWrapper extends React.Component {
  unListen() {}

  constructor(props) {
    super(props);

    // route change handler
    function routeChangeHandler(location, action) {
      plugins.applyForEach('onRouteChange', {
        initialValue: {
          routes,
          location,
          action,
        },
      });
    }
    this.unListen = history.listen(routeChangeHandler);
    // dva 中 history.listen 会初始执行一次
    // 这里排除掉 dva 的场景，可以避免 onRouteChange 在启用 dva 后的初始加载时被多执行一次
    const isDva =
      history.listen
        .toString()
        .indexOf('callback(history.location, history.action)') > -1;
    if (!isDva) {
      routeChangeHandler(history.location);
    }
  }

  componentWillUnmount() {
    this.unListen();
  }

  render() {
    const props = this.props || {};
    return <Router history={history}>{renderRoutes(routes, props)}</Router>;
  }
}
