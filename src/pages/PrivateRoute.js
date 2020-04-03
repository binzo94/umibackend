  
import React from 'react'
import {Route, Redirect} from 'react-router-dom'
import {withContext} from './withContext'

export const PrivateRoute = withContext(props => {
  if (props.token) 
    return <Route {...props} />
  return <Redirect to="/" />
})

