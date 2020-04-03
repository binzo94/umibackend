import React from 'react'
import {Route} from 'react-router-dom'

export const DynamicRoute = ({routeList}) => {
  return routeList.map(route => {
     return <Route {...route} path={route.path} component={route.Component} />
  })
}


