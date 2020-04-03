import React from 'react'
import {withContext} from './withContext'
import {NavLink, withRouter} from 'react-router-dom'
import {findPathName} from '../utils'

class SideBar extends React.Component {
  state = {
    data: this.props.data,
    indexActive: true
  }
  resetMenu = (data) => {
    return data.map((item) => {
      return {
        ...item,
        isOpen: false
      }
    })
  }
  toggleMenu = (data, id) => {
    return data.map((item) => {
      if(item.id !== id) {
        if(item.children) {
          return {
            ...item,
            isOpen: false,
            children: this.toggleMenu(item.children, id)
          }
        }
        return item
      }
      return {
        ...item,
        isOpen: true
      }
    })
  }
  currentMenuState = (path) => {
    let currentPathName = findPathName(this.state.data).filter(item => path === item.path)
    if(currentPathName.length) {
      this.setState(state => {
        let newData = this.toggleMenu(state.data, currentPathName[0].parentId)
        return {
          indexActive: false,
          data: newData
        }
      })
    }
    else {
      this.setState(state => {
        return {
          indexActive: true,
          data: this.resetMenu(state.data)
        }
      })
    }
  }
  componentDidUpdate(prevProps) {
    let {location: {pathname}} = this.props
    if(prevProps.location.pathname != pathname) {
      this.currentMenuState(pathname)
    }
  }

  componentDidMount() {
    let {location: {pathname}} = this.props
    this.currentMenuState(pathname)
    window.addEventListener('hashchange', this.hashchange = () => {
      if(pathname === this.props.location.pathname)
        this.currentMenuState(pathname)
    }, false)
  }
  componentWillUnmount() {
    window.removeEventListener('hashchange', this.hashchange, false)
  }

  setDataMenu = (id) => {
    this.setState(state => {
      let newData = this.toggleMenu(state.data, id)
      return {
        indexActive: false,
        data: newData
      }
    })
  }
  linkindexActive = () => {
    this.setState(state => {
      return {
        indexActive: true,
        data: this.resetMenu(state.data)
      }
    })
    this.props.history.push(this.props.baseUrl)
  }

  render() {
    let {data} = this.state
    let {system, user} = this.props
    let title = ''
    if(system){
      switch(system.id) {
        case '10877a34-cde9-4dee-9301-efb3bd962f66':
          title = '数据管理后台'
          break
        case '9bd284fb-ac12-4516-881e-f176df65020a':
          title = '内部管理后台'
          break
        case '831b3b00-0393-491b-a2e1-196ca2f9e0f8':
          title = '用户管理后台'
          break
        case '8157144e-bb46-477b-8798-bd3cb075005a':
          title = '运营管理后台'
          break
        case '03db0da7-e1bf-46da-81c4-dbe46c7a3b45':
          title = '筑找找数据后台'
        break
        default:
          title = ''
      }
    }

    return (
      <div className="side-menu">
        <div className="hd-title">{title}</div>
        <ul>
          <li className="menu-item">
            <p
              onClick={this.linkindexActive}
              className={this.state.indexActive && this.props.location.pathname ? 'active' : ''}>
              首页
            </p>
          </li>
          {
            data && data.map(item => {
              return <Menu {...item} key={item.id} handleClick={this.setDataMenu} />
            })
          }
        </ul>
      </div>
    )

  }
}

class Menu extends React.Component {
  toggleOpen = () => {
    let {id, handleClick, isOpen} = this.props
    handleClick(id, isOpen)
  }

  render() {
    let {children, name, id, handleClick, isOpen, path} = this.props
    return (
      <li className="menu-item">
        {
          children.length ?
            <p
              className={isOpen ? 'active' : ''}
              onClick={children && this.toggleOpen}>
              {name}
              {isOpen ? <i className="el-icon-arrow-up side-toggle-icon"></i> : <i className="el-icon-arrow-down side-toggle-icon"></i>}
            </p> :
            <NavLink to={`${path}`} activeClassName="active-nav" >
              {name}
            </NavLink>
        }
        <ul className="children" style={{height:isOpen ? '' : '0px'}}>
          {
            children && children.map(child => {
              return <Menu {...child} handleClick={handleClick} key={child.id} />
            })
          }
        </ul>
      </li>
    )
  }
}

export default withRouter(withContext(SideBar))

