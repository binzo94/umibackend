import React from 'react'
import {withContext} from './withContext'
import {withRouter} from 'react-router-dom'
import {
  MessageBox,
  Message
} from 'element-react'
class Header extends React.Component {
  state = {
    open: false
  }
  exit = (e) => {
    MessageBox.confirm('是否退出本系统？', '提示', {
      type: 'warning'
    }).then(() => {
      this.props.setToken(null)
      this.props.setSystem(null)
      this.props.setUser(null)
      Object.keys(localStorage).forEach(key => {
        localStorage.removeItem(key)
      })
      this.props.history.push({
        pathname:'/login'
      })
      Message({
        type: 'success',
        message: '退出成功!'
      });
    }).catch(() => {

    });
  }
  toggleMenu = (e) => {
    e.stopPropagation()
    this.setState(state => ({
      open: !state.open
    }))
  }

  handleClick = (id) => {
    let {history, setSystem} = this.props
    if(id === this.props.system.id) return
    let system = Object.assign(this.props.system, {id})
    setSystem(system)
    localStorage.setItem('system', JSON.stringify(system))
    if(id === '9bd284fb-ac12-4516-881e-f176df65020a')
      history.push('/internal-admin')
    if(id === '10877a34-cde9-4dee-9301-efb3bd962f66')
      history.push('/data-admin')
    if(id === '831b3b00-0393-491b-a2e1-196ca2f9e0f8')
      history.push('/user-admin')
    if(id === '8157144e-bb46-477b-8798-bd3cb075005a')
      history.push('/operation-admin')
    if(id === '03db0da7-e1bf-46da-81c4-dbe46c7a3b45')
      history.push('/search-admin')
  }

  componentDidMount() {
    document.body.addEventListener('click', this.listen = (e) => {
      if(!this.menu.contains(e.target))
        this.setState(state => ({
          open: false
        }))
    }, false)
  }
  componentWillUnmount() {
    document.body.removeEventListener('click', this.listen, false)
  }

  render() {
    let {system, user} = this.props
    let {open} = this.state
    return (
      <div className="hd-wrap">
        <div className="header">
          <div className="fn">
            <span>您好！</span>
            <span className='people-icon'><i></i></span>
            <span style={{marginLeft:'4px'}}>{user}</span>
            {
              system ?
                <div
                  className="menu"
                  onClick={this.toggleMenu}
                  ref={el => this.menu = el}
                >
                切换系统
                  {
                    open ?
                      <DropMenu
                        id={system.id}
                        handleClick={this.handleClick}
                        list={system.list}
                      /> : null
                  }
                </div> : null
            }
            <span onClick={this.exit} className='header-exist'>退出系统</span>
          </div>
        </div>
      </div>
    )
  }
}

function DropMenu(props) {
  return (
    <div className="sys-menu">
      {
        props.list.map(el =>
          <p
            className={el.id === props.id ? 'current' : ''}
            key={el.id}
            onClick={() => {props.handleClick(el.id)}}
          >
            {el.sys_name}
          </p>
        )
      }
    </div>
  )
}


export default withRouter(withContext(Header))
