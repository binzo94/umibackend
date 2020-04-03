import React from 'react'
import { Http } from '../../services.js'
import { withContext } from '../withContext'
import Header from '../Header'
import SideBar from '../SideBar'
import {Message} from 'element-react'
import { setStateWrap } from '../../utils'
import MyBreadCumb from '../MyBreadCumb'


class Layout extends React.Component {
  _isMounted = false
  state = {
    data: null
  }

  componentDidMount () {
    this._isMounted = true
    if (this.props.token) {
      this.getSystem()
    }
    document.title = '数据管理后台'
  }
  componentWillUnmount () {
    this._isMounted = false
  }
  getSystem = () => {
    if (this.props.token)
      Http.get('/system/resource/open/system')
        .then(res => {
          if (res.data.code=='0') {
            var defaultSystem = res.data.content.filter(item => item.id === '10877a34-cde9-4dee-9301-efb3bd962f66')
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

          } else{

            this.props.setToken(undefined)
            this.props.history.push({
              pathname:'/login'
            })
          }
        }).catch(err => {

      })
  }

  getSystemMenu = () => {
    Http.get(`/system/resource/open/menu/${this.props.system.id}`)
      .then(res => {
        if (res.data.content) {
          setStateWrap.call(this, {
            ...this.state,
            data: res.data.content
          }, this._isMounted)
        }
      }).catch(err => {

    })
  }
  render () {
    let { system } = this.props
    let { data } = this.state

    return (
      <React.Fragment>
        <div className={'container-left'}>
          {data && <SideBar data={data} baseUrl="/data-admin" />}
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
