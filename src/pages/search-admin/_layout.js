import React from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'
import MyBreadCumb from '../MyBreadCumb'
import { withContext } from '../withContext'
import { Http } from '../../services'
import Header from '../Header'
import SideBar from '../SideBar'
import {Message} from 'element-react'
import { accessblePage, dynamicRouteMap, findPathName } from '../../utils'
import NoMatch from '../NoMatch'
import Userlist from './worker-list'
class Layout extends React.Component {
  state = {
    data: null
  }

  componentDidMount () {
    if (this.props.token) {
      this.getSystem()
    }
    document.title = '筑找找数据管理后台'
  }


  getSystem = () => {
    Http.get('/system/resource/open/system')
      .then(res => {
        if (res.data.code==0) {

          var defaultSystem = res.data.content.filter(item => item.id === '03db0da7-e1bf-46da-81c4-dbe46c7a3b45')

          if(res.data.content.length==0||defaultSystem.length==0){
            Message({
              type:"error",
              message:'用户没有该系统权限'
            })
            localStorage.clear()
            this.props.history.push({
              pathname:'/login'
            })
          }else{
            this.props.setSystem({
              id: defaultSystem[0].id,
              list: res.data.content
            })
            localStorage.setItem('system', JSON.stringify({
              id: defaultSystem[0].id,
              list: res.data.content
            }))
            this.props.system && this.getSystemMenu()
          }
        }else{
          //重新登录
          this.props.setToken(undefined)
          this.props.history.push({
            pathname:'/login'
          })
        }
      })
      .catch(err => { })
  }

  getSystemMenu = () => {
    Http.get(`/system/resource/open/menu/${this.props.system.id}`)
      .then(res => {
        if (res.data.content) {
          this.setState({
            ...this.state,
            data: res.data.content
          })
        }
      })
      .catch(err => { })
  }

  render () {
    let { system } = this.props
    let { data } = this.state
    let pathName = []
    let routes = []

    return (
      <React.Fragment>
        <div className={'container-left'}>
          {data && <SideBar data={data} baseUrl="/search-admin" />}
        </div>
        <div className={'container-right'}>
          <div className={'container-right-top'}>
            {system && data && <Header />}
          </div>
          <div className={'container-right-bottom'}>
            {
              data ?
                <div className="main-content">
                  <div className="main-content-container">
                    <MyBreadCumb data={data}></MyBreadCumb>
                    <div className="main-other">
                      {this.props.children}
                    </div>
                  </div>
                </div> : null
            }

          </div>
        </div>


      </React.Fragment>
    )
  }
}


export default withContext(Layout)
