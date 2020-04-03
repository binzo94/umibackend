import React from 'react'
import {withContext} from '../withContext'
import {Redirect} from 'react-router-dom'
import {Form, Input, Button, MessageBox, Message} from 'element-react'
import {Http} from '../../services'
import {setStateWrap} from '../../utils'

class Login extends React.Component {
  _isMounted = false
  state = {
    labelPosition: 'right',
    loading: false,
    form: {
      userName: '',
      passWord: ''
    },
    rules: {
      userName: [{
        required: true, message: '请输入用户名', trigger:'submit'
      }, {
        validator: (rule, value, callback) => {
          if(!/^[a-zA-Z0-9]+$/.test(value)) {
            callback(new Error('用户名格式错误'))
          }
          else {
            callback()
          }
        },
        trigger: 'submit'
      }],
      passWord: [
        {
          required: true, message: '请输入登录密码', trigger:'submit'
        },
        {
          validator: (rule, value, callback) => {
            if(!/^[^\s\r\n\t\v]{6,16}$/.test(value)) {
              callback(new Error('密码格式错误'))
            }
            else {
              callback()
            }
          },
          trigger: 'submit'
        }]
    }
  }

  login = () => {
    let {form: {userName, passWord}} = this.state
    Http.post('/login', {
      userAccount: userName,
      pwd: passWord
    }).then(loginres => {

      if(loginres.data.code == '0') {
        this.props.setToken(loginres.data.content)
        this.props.setUser(userName)
        localStorage.setItem('token', loginres.data.content)
        localStorage.setItem('user', userName)
        console.log()
        //
        Http.get('/system/resource/open/system')
          .then(res => {
            if (res.data.code=='0') {
              var systemlist = res.data.content
               if(systemlist.length>0){

                 Message({
                   type: 'success',
                   message: '登录成功!'
                 })
                 var defalutSystem = systemlist[0].id
                 this.props.setSystem({
                   id: defalutSystem,
                   list: systemlist
                 })
                 //跳转逻辑在本组件render方法里面
               }else{
                 Message({
                   type:'error',
                   message:'该账号权限受限,请联系管理员!'
                 })
               }
            } else{
              Message({
                type:'error',
                message:'该账号权限受限,请联系管理员!'
              })

            }
          }).catch(err => {

        })
      }
      else {
        Message({
          type:'error',
          message:'登录失败!' + loginres.data.message
        })
        this.refs.form.resetFields()
        this.setState({
          form: {
            userName: '',
            passWord: ''
          }
        })
      }
      this.setState({
        loading: false
      })

    }).catch(err => {
      this.setState({
        loading: false
      })
      Promise.resolve(err)
    })
  }
  onChange = (key) => (value) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: value
      }
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if(valid) {
        this.setState({
          ...this.state,
          loading: true
        })
        this.login()
      }

    })
  }
  componentDidMount() {
    this._isMounted = true
    document.title = "后台管理系统登录"
    document.addEventListener('keydown', this.enter = (e) => {
      if(e.keyCode === 13)
        this.handleSubmit(e)
    }, false)
  }
  componentWillUnmount() {
    this._isMounted = false
    document.removeEventListener('keydown', this.enter, false)
  }
  render() {
    if(this.props.token&&this.props.system) {
      //判断对应的系统
      console.log('跳转')
      var defalutSystem = this.props.system.id
      switch(defalutSystem) {
        case '10877a34-cde9-4dee-9301-efb3bd962f66':
          return <Redirect to="/data-admin" />
          break
        case '9bd284fb-ac12-4516-881e-f176df65020a':
          return <Redirect to="/internal-admin" />
          break
        case '831b3b00-0393-491b-a2e1-196ca2f9e0f8':
          return <Redirect to="/user-admin" />
          break
        case '8157144e-bb46-477b-8798-bd3cb075005a':
          return <Redirect to="/operation-admin" />
          break
        case '03db0da7-e1bf-46da-81c4-dbe46c7a3b45':
          return <Redirect to="/search-admin" />
          break
        default:

    }}
    return (
      <div className="login-page">
        <div className="login-page-panel"></div>
        <div className="form-ct">
          <div className="form">
            <div className="login-page-type">您好！欢迎来到管理后台</div>
            <Form ref="form" labelWidth="85" rules={this.state.rules} model={this.state.form}
              labelPosition={this.state.labelPosition}>
              <Form.Item label="用户名:" prop="userName" >
                <Input type="text" onChange={this.onChange('userName')} value={this.state.form.userName} autoComplete="off" placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item label="密码:" prop="passWord">
                <Input type="password" onChange={this.onChange('passWord')} value={this.state.form.passWord} autoComplete="off" placeholder="请输入密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" className="login-submit" loading={this.state.loading} onClick={this.handleSubmit}>登录</Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

export default withContext(Login)
