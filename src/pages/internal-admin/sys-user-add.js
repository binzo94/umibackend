import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input,Message,MessageBox } from 'element-react'
import 'element-theme-default'
import './role-add.css'
import { isEmptyObject} from '../../utils'
import { parse } from 'query-string'
import { withRouter } from 'react-router-dom'
function deptDatatoList(nodes, path,level = 0) {
  if (path === undefined) {
    path = []
  }
  for (var i = 0; i < nodes.length; i++) {
    path.push({
      id:nodes[i].id,
      padding:level*20,
      deptName:nodes[i].deptName
    })
    if (nodes[i].children&&level<2) {
      deptDatatoList(nodes[i].children, path,level+1)
    }
  }
  return path
}
class UserAdd extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        pwd: '',
        userName: '',
        userAccount: '',
        mobile: '',
        status: '1',
        mail: '',
        deptId: '',
        rolesId: ''
      },
      options: [
        {
          id: '1',
          name: '启用'
        },
        {
          id: '0',
          name: '禁用'
        }
      ],
      role: [],
      superior: [],
      rules: {
        userAccount: [
          { required: true, message: '请填写用户账号', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              var accountReg = /^[a-zA-Z]{2,20}$/
              Promise.all([
                this.validFieldValueRepeat()
              ]).then(() => {
                if (!this.props.isModifyPage) {
                  if (value === this.state.userAccount) {
                    callback(new Error('用户账号存在,请重新输入'))
                  }
                }
                if (!accountReg.test(value)) {
                  callback(new Error('2-20个英文字符，不区分大小写'))
                } else {
                  callback()
                }
              })
            },
            trigger: 'submit'
          }
        ],
        userName: [
          { required: true, message: '请填写用户姓名', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!/^[\u4e00-\u9fa5]{2,10}$/.test(value)) {
                callback(new Error('2-10个中文'))
              }
              else {
                callback()
              }
            },
            trigger: 'submit'
          }
        ],
        pwd: [
          { required: true, message: '请选择用户密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (!/^[0-9A-Za-z]{6,16}$/.test(value)) {
                callback(new Error('6-16个字符'))
              }
              else {
                callback()
              }
            },
            trigger: 'submit'
          }
        ],
        mobile: [
          { required: true, message: '请填写用户手机', trigger: ['blur'] },
          {
            validator: (rule, value, callback) => {
              var phoneReg = /(^0\d{2,3}-\d{7,8}$)|(^1[3456789]\d{9}$)/
              if (!value.length) {
                callback()
              }
              else if (!phoneReg.test(value)) {
                callback(new Error('电话或手机号码格式有误'))
              } else {
                callback()
              }
            },
            trigger: 'submit'
          }
        ],
        mail: [
          { required: true, message: '请填写用户邮箱', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              var mailreg = new RegExp(/^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/)
              if (!mailreg.test(value)) {
                callback(new Error('请输入正确邮箱格式'))
              }
              else {
                callback()
              }
            },
            trigger: 'submit'
          }
        ],
        deptId: [
          { required: true, message: '请选择所在部门', trigger: 'blur' }
        ],
        rolesId: [
          { required: true, message: '请选择用户角色', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择账号状态', trigger: 'blur' }
        ]
      }
    }
  }

  validFieldValueRepeat = () => {
    let { form } = this.state
    return Http.get(`/system/user/find/user/account/${form.userAccount}`).then(res => {
      if (res.data.code == 2) {
        console.log(138)
        this.setState({
          ...this.state,
          userAccount: this.state.form.userAccount
        })
      }
    })
  }

  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }

  querySuperior = () => {
    Http.get('/system/dept/select')
      .then(res => {
        if (res.data.content) {
          console.log(deptDatatoList(res.data.content))
          this.setState({
            superior:deptDatatoList(res.data.content)
          })
        }
      })
  }

  queryRole = () => {
    Http.get('/system/user/find/role')
      .then(res => {
        if (res.data.content) {
          this.setState({
            role: res.data.content
          })
        }
      })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if (this.props.isModifyPage) {
          this.getModify()
        } else {
          this.getSure()
        }
      } else {
        return false
      }
    })
  }

  getSure = () => {
    console.log('getSure')
    Http.post('/system/user/add', { ...this.state.form })
      .then(res => {
        this.setState({
          ...this.state
        })
        console.log('getSsdsdure')
        if (res.data.code == '0') {
          this.props.history.push('/internal-admin/sys-user-list')
          Message({
            type:'success',
            message:'新增成功!'
          })
        }else{
          Message({
            type:'error',
            message:'新增失败!'+res.data.message
          })
        }
      })
  }

  getModify = () => {
    console.log('getModify')
    let { location } = this.props
    Http.post(`/system/user/update/${parse(location.search).id}`, { ...this.state.form })
      .then(res => {
        this.setState({
          ...this.state
        })
        console.log(234)
        if (res.data.code == '0') {
          this.props.history.push('/internal-admin/sys-user-list')
          Message({
            type:'success',
            message:'修改成功!'
          })
        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }
      })
  }

  cancle = () => {
    this.props.history.push('/internal-admin/sys-user-list')
  }

  handleReset = () => {
    let { location } = this.props
    let { pwd } = this.state.form
    Http.get(`/system/user/update/pwd/${parse(location.search).id}`)
      .then(res => {
        if(res.data.code==0){
          this.setState({
            form: Object.assign({}, this.state.form, { pwd: '666666' })
          })
          console.log(this.state.form)
          MessageBox.alert(res.data.message, '修改成功')
        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }


      })
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    console.log('fetchPermissionsInfoById')
    Http.get(`/system/user/select/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let { form } = this.state
          this.setState({
            form: content
          })
        }
      })
  }

  componentDidMount () {
    if (this.props.isModifyPage) {
      this.fetchPermissionsInfoById()
    }
    this.querySuperior()
    this.queryRole()
  }

  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">用户{this.props.isModifyPage ? '修改' : '新增'}</h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          {this.props.isModifyPage ?
            <Form.Item label="用户账号">
              <Input value={this.state.form.userAccount} placeholder="请填写用户账号" style={{ width: '300px' }} onChange={this.onChange('userAccount')} disabled></Input>
            </Form.Item> :
            <Form.Item label="用户账号" prop="userAccount">
              <Input value={this.state.form.userAccount} placeholder="请填写用户账号" style={{ width: '300px' }} onChange={this.onChange('userAccount')}></Input>
            </Form.Item>
          }
          {this.props.isModifyPage ?
            <Form.Item label="用户姓名">
              <Input value={this.state.form.userName} placeholder="请填写用户姓名" style={{ width: '300px' }} onChange={this.onChange('userName')} disabled></Input>
            </Form.Item> :
            <Form.Item label="用户姓名" prop="userName">
              <Input value={this.state.form.userName} placeholder="请填写用户姓名" style={{ width: '300px' }} onChange={this.onChange('userName')}></Input>
            </Form.Item>
          }
          {this.props.isModifyPage ?
            <Form.Item label="用户密码">
              <Button type="primary" style={{ marginRight: '180px' }} onClick={this.handleReset}>重置密码</Button>
            </Form.Item> :
            <Form.Item label="用户密码" prop="pwd">
              <Input value={this.state.form.pwd} placeholder="请填写用户密码" style={{ width: '300px' }} onChange={this.onChange('pwd')}></Input>
            </Form.Item>
          }
          <Form.Item label="用户手机" prop="mobile">
            <Input value={this.state.form.mobile} placeholder="请填写用户手机" style={{ width: '300px' }} onChange={this.onChange('mobile')}></Input>
          </Form.Item>
          <Form.Item label="用户邮箱" prop="mail">
            <Input Value={this.state.form.mail} placeholder="请填写用户邮箱" style={{ width: '300px' }} onChange={this.onChange('mail')}></Input>
          </Form.Item>
          <Form.Item label="所在部门" prop="deptId">
            <Select value={this.state.form.deptId} placeholder="请选择所在部门" style={{ width: '300px' }} onChange={this.onChange('deptId')}>
              {
                this.state.superior.map(el => {
                  return <Select.Option key={el.id} label={el.deptName} value={el.id} >
                    <span style={{paddingLeft:el.padding+'px'}}>{el.deptName}</span>
                  </Select.Option>
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="用户角色" prop="rolesId">
            <Select value={this.state.form.rolesId} placeholder="请选择用户角色" style={{ width: '300px' }} onChange={this.onChange('rolesId')}>
              {
                this.state.role.map(el => {
                  return <Select.Option key={el.id} label={el.role_name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="账号状态" prop="status" >
            <Select value={this.state.form.status} placeholder="请选择用户角色" style={{ width: '300px' }} onChange={this.onChange('status')}>
              {
                this.state.options.map(el => {
                  return <Select.Option key={el.id} label={el.name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ marginRight: '180px' }} onClick={this.handleSubmit}>
              {this.props.isModifyPage ? '确认修改' : '确认新增'}
            </Button>
            <Button onClick={this.cancle}>取消</Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(UserAdd)
