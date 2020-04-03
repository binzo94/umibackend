import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Layout, Dialog,
  Message, MessageBox
} from 'element-react'
import { Http } from '../../services'
import { formatDate, isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import './user-form.less'
import _ from 'lodash'
import moment from 'moment'
class UserForm extends React.Component {
  myRef = React.createRef();
  pwd = [
    {required: true, message: '请输入密码', trigger: ['blur','change']},
    { validator: (rule, value, callback) => {
      var reg = /(?!^(\d+|[a-zA-Z]+|[~!@#$%^&*?]+)$)^[\w~!@#$%^&*?]{6,18}$/
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if(reg.test(value)) {
          callback()
        }else{
          callback(new Error('密码必须包含数字字母特殊字符的两种,6-18位'))
        }

      }
    } }
  ]
  state = {
    currentgrade:'',
    form:{
      userName:'',
      grade: '',
      tel:'',
      userAccount:'',
      nickName: '',
      email:'',
      pwd:'',
      endTime: new Date()
    },
    gradeMap: [{label:'普通账号', value:'NEED_AUTH_USER'}, {label: 'VIP账号', value:'NEED_AUTH_VIP'}],
    rules: {
      userName: [
        {required: true, message: '请输入姓名', trigger: 'change'}
      ],
      tel: [
        {required: true, message: '请输入电话号码', trigger: ['blur','change','submit']},
        { validator: (rule, value, callback) => {
          var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
          if (value === '') {
            callback(new Error('请输入电话号码'))
          } else {
            if(reg.test(value)) {
              callback()
            }else{
              callback(new Error('电话号码格式错误') )
            }

          }
        } }
      ],
      userAccount: [
        {required: true, message: '请输入账号', trigger: 'change'},
        { validator: (rule, value, callback) => {
          var reg = /^[a-zA-Z0-9]{1,11}$/
          if (value === '') {
            callback(new Error('请输入账号'))
          } else {
            if(reg.test(value)) {
              callback()
            }else{
              callback(new Error('账号只能数字和大小写字母,最多11位'))
            }

          }
        } }
      ]
      ,
      nickName:[
        {required: true, message: '请输入昵称', trigger: 'change'},
        { validator: (rule, value, callback) => {
            if (value === '') {
              callback(new Error('请输入昵称'))
            } else {
              if(value.length<=10) {
                callback()
              }else{
                callback(new Error('昵称最多10位'))
              }

            }
          } }],
      pwd:this.pwd.concat([]),
      email:[
        {required: false, message: '', trigger: 'blur'},
        { validator: (rule, value, callback) => {
          var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
          if (value.length==0) {
            callback()
          } else {
            if(reg.test(value)) {
              callback()
            }else{
              callback(new Error('邮箱格式不对!'))
            }

          }
        } }
      ],
      grade:[
        {required: true, message: '', trigger: 'change'}],
      endTime:[
        {required: true, message: '请选择到期时间', trigger: 'change', type:'object'}]

    }
  }
  handleSubmit=() => {
    console.log('提交数据')
    // 普通账号移除时间校验
    const {grade, email} = this.state.form
    const resetrule = this.state.rules
    let data
    let {endTime, ...rules} = this.state.rules
    if(grade.indexOf('VIP')== -1) {
      // 过滤VIP到期时间
      let {endTime, ...rest} = this.state.form
      data = rest
    }else {
      let {endTime, ...rest} = this.state.form
      endTime = formatDate(endTime)
      rules = this.state.rules
      data = {
        ...rest,
        endTime
      }
    }
    // 处理邮箱
    if(!_.trim(email)) {
      let {email, ...rest} = data || this.state.form
      data = rest
    }
    let findMap= _.find(this.state.gradeMap,{value:this.state.form.grade})
    if(findMap){
      data['roleId'] = findMap['id']
    }
    if(this.props.isupdate) {
      // 编辑
      // 额外移除密码校验
      let {pwd, otherrules} = rules
      rules = otherrules
      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })


            Http.post('/cic/user/update', {
              ...data,
              userId:this.props.currentData.userId
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '修改成功!'
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()
                // 关闭弹框
                this.props.onCancel && this.props.onCancel()
              }else{
                Message({
                  type:'error',
                  message: '修改失败!'+res.data.message
                })
              }
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      })
    }
    else {
      // 新增

      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })
            if(!_.trim(email)) {
              let {email, ...rest} = data || this.state.form
              data = rest
            }
            Http.post('/cic/user/add', {
              ...data
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '新增成功!'
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()

                this.props.onCancel && this.props.onCancel()
                // 询问是否认证用户
                MessageBox.confirm('是否认证该用户, 是否继续?', '提示', {
                  type: 'warning',
                  confirmButtonText:'去认证'
                }).then(() => {
                  // 认证
                  // 关闭弹框
                  this.props.history.push({
                    pathname: this.props.match.url,
                    search: `page=user-auth&id=${res.data.content}`
                  })
                }).catch(() => {
                  // 关闭弹框
                })}else{
                Message({
                  type:'error',
                  message: `新增失败!${res.data.message}`
                })
              }
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      })
    }

  }
  componentWillMount () {

  }
  fetchTypeDict=(type ='cicRoleNA',isNeedDefault)=>{
    Http.get(`/dict/type/${type}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content&&res.data.content.length){
          let kV = []
          for(let key in res.data.content){
            kV.push({
              label:res.data.content[key]['dictName'],
              value:res.data.content[key]['dictCode'],
              id:res.data.content[key]['id']
            })
          }
          this.setState({
            gradeMap:kV,
            form:{
              ...this.state.form,
              grade:isNeedDefault?kV[0]['value']:this.state.form.grade
            }
          })
        }
      }
    })
  }
  componentDidMount () {
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    console.log(this.props)
    if(nextProps.isupdate) {
      const {currentData:data} = nextProps
      let {pwd, ...rest} = this.state.rules
      this.setState({
        rules: rest
      })
      let gradeMap= []
      if(data.grade.indexOf('NEED')!=-1){
        this.fetchTypeDict('cicRoleNA')
      }else{
        this.fetchTypeDict('cicRole')

      }
      this.setState({
        currentgrade:data.grade,
        form:{
          userName:data.userName,
          grade: data.grade,
          tel:data.tel,
          userAccount:data.userAccount,
          nickName: data.nickName,
          email: data.email,
          pwd:data.pwd,
          endTime: !!data.endTime ? moment(data.endTime, 'YYYY-MM-DD HH:mm:ss').toDate() : ''
        }
      })
    }else{
      this.fetchTypeDict('cicRoleNA',true )
      this.myRef.current.resetFields()
      let rules = this.state.rules
      this.setState({
        currentgrade:'',
        rules: {...rules, pwd:this.pwd} })
    }

  }
  resetPwd=() => {
    // 重置密码
    let {userId:id} = this.props.currentData
    Http.get(`/cic/user/reset/pwd/${id}`, {
    }).then(res => {
      if(res.data.code == 0) {
        Message({
          type:'success',
          message: `重置成功!${res.data.message}`
        })
      }else{
        Message({
          type:'error',
          message: '重置失败!'+res.data.message
        })
      }
    })

  }
  componentWillUpdate (prevProps, prevState) {

  }
  onChange(key, value) {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }
  render () {
    let { form, rules } = this.state
    let str =''
    if(this.props.isupdate&&this.state.gradeMap){
      let res=_.find(this.state.gradeMap,{value:form.grade})
      if(res){
        str=res['label']
      }
    }
    return (
      <React.Fragment>
        <Dialog
          title={this.props.isupdate ? '用户编辑' : '用户新增'}
          size="small"
          className={'user-list-dialog'}
          visible={this.props.dialogVisible }
          onCancel={ () => this.props.onCancel() && this.myRef.current.resetFields() }
          lockScroll={ false }
        >
          <Dialog.Body style={{paddingTop:'10px', height:'280px'}}>
            <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
              <Form ref={this.myRef} model={form} rules={rules} labelWidth={84} labelPosition={'right'} className={'form-user-auth'}>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="姓名:" prop="userName">
                    <Input value={form.userName} size="small" onChange={this.onChange.bind(this, 'userName')} />
                  </Form.Item>
                  <Form.Item label="账号:" prop="userAccount">
                    <Input value={form.userAccount} disabled={this.props.isupdate} size="small" onChange={this.onChange.bind(this, 'userAccount')}/>
                  </Form.Item>
                  <Form.Item label="密码:" prop="pwd" style={{marginBottom:'35px'}}>
                    {!this.props.isupdate ? <Input value={form.pwd} onChange={this.onChange.bind(this, 'pwd')} size="small" type={'password'} /> : <Button type={'primary'} onClick={() => {this.resetPwd()}}>重置密码</Button>}

                  </Form.Item>
                  <Form.Item label="账号等级:" prop="grade">
                    <Select value={form.grade} placeholder="请选择账号等级" onChange={this.onChange.bind(this, 'grade')}>
                      {
                        this.state.gradeMap.map(el => {
                          return <Select.Option key={el.value} label={el.label} value={el.value} />
                        })
                      }
                    </Select>

                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="电话号码:" prop="tel">
                    <Input value={form.tel} size="small" onChange={this.onChange.bind(this, 'tel')}/>
                  </Form.Item>
                  <Form.Item label="昵称:" prop="nickName">
                    <Input value={form.nickName} size="small" onChange={this.onChange.bind(this, 'nickName')}/>
                  </Form.Item>
                  <Form.Item label="邮箱:" prop="email" style={{marginBottom:'35px'}}>
                    <Input value={form.email} size="small" onChange={this.onChange.bind(this, 'email')}/>
                  </Form.Item>
                  {this.state.form.grade.indexOf('VIP')== '-1' ? null : <Form.Item label="到期时间:" prop="endTime">

                    <DatePicker
                      value={form.endTime}
                      isShowTime={true}
                      onChange={this.onChange.bind(this, 'endTime')}
                      placeholder="选择到期时间"
                      disabledDate={time => time.getTime() < Date.now() - 8.64e7}
                    />
                  </Form.Item>}

                </Layout.Col>
              </Form>
            </div>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer" style={{textAlign:'center'}}>
            <Button onClick={this.props.onCancel }>取消</Button>
            <Button type="primary" onClick={ this.handleSubmit } style={{marginLeft:'30px'}}>确定</Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default withRouter(UserForm)
