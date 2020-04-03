import React from 'react'
export const AuthContext = React.createContext()

export class AuthProvider extends React.Component {
  state = {
    token: localStorage.getItem('token') || null,
    user: localStorage.getItem('user') || null,
    system: (localStorage.getItem('system') && JSON.parse(localStorage.getItem('system'))) || null
    
  }

  getContext() {
    return {
      ...this.state,
      setToken: token => {
        this.setState({
          ...this.state,
          token
        })
      },
      setSystem: system => {
        this.setState({
          ...this.state,
          system
        }) 
      },
      setUser: user => {
        this.setState({
          ...this.state,
          user
        })
      }
    }
  }
  componentDidUpdate() {
    //console.log(this.state.token)
  }

  render() {
    return (
      <AuthContext.Provider value={this.getContext()}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

