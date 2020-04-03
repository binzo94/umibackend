import React from 'react'
import {AuthContext} from './Context'

export const withContext = (Component) => (props) => {
  return (
    <AuthContext.Consumer>
      {
        (ctx) => {
          return <Component {...ctx} {...props} /> 
        }
      }
    </AuthContext.Consumer>
  )   
}

