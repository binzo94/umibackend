import React, { lazy, Suspense } from 'react'
import {Router, Route, Switch, Redirect} from 'react-router-dom'
import {PrivateRoute} from './PrivateRoute'
import { Loading } from 'element-react'
import {createHashHistory} from 'history'
import {AuthProvider} from './Context'

const history = createHashHistory()


const Login = lazy(() => import('./login'))
const NoMatch = lazy(() => import('./NoMatch'))
const DataAdmin = lazy(() => import('./data-admin'))
const InternalAdmin = lazy(() => import('./internal-admin'))
const UserAdmin = lazy(() => import('./user-admin'))
const OperationAdmin = lazy(() => import('./operation-admin'))
const SearchAdmin = lazy(() => import('./search-admin'))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading fullscreen text="loading..." />}>
      <Router history={history}>
        <Switch>
          <Route path="/login" exact render={props => <Login {...props} title="登录" />} />
          <Redirect exact from="/" to="/login" />
          <PrivateRoute path="/data-admin" render={props => <DataAdmin {...props}  title="数据管理" />} />
          <PrivateRoute path="/internal-admin" render={props => <InternalAdmin {...props} title="内部管理" />} />
          <PrivateRoute path="/user-admin" render={props => <UserAdmin {...props} />} />
          <PrivateRoute path="/operation-admin" render={props => <OperationAdmin {...props} />} />
          <PrivateRoute path="/search-admin" render={props => <SearchAdmin {...props} />} />
          <Route render={props => <NoMatch {...props} />} />
        </Switch>
      </Router>
    </Suspense>
    </AuthProvider>
  )
}

export default App
