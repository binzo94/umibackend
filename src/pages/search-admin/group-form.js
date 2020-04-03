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
import './worker-form.less'
import _ from 'lodash'
import moment from 'moment'
class GroupForm extends React.Component {
  myRef = React.createRef();
  state = {
    form:{
      name:'',
      groupRole: '',
      cellPhone:'',
      idNo:'',
      gender: '',
      companyName:'',
      evaluate:'',
      birthAt: null
    },
    groupMap:[],
    genderMap:[
      {
        name:'男',
        value:'男'
      },{
        name:'女',
        value:'女'
      }
    ],
    gradeMap: [{label:'普通账号', value:'NEED_AUTH_USER'}, {label: 'VIP账号', value:'NEED_AUTH_VIP'}],
    rules: {
      name: [
        {required: true, message: '请输入姓名', trigger: 'change'}
      ],
      gender: [
        {required: true, message: '请输入性别', trigger: ['blur','change']},
      ],
      idNo: [
        {required: true, message: '请输入证件号码', trigger: 'change'},
      ],
      groupRole: [
        {required: true, message: '请选择班组身份', trigger: 'change'},
      ],
      companyName:[
        {required: true, message: '请输入公司名称', trigger: 'change'},
      ],
      cellPhone: [
        {required: true, message: '请输入联系方式', trigger: ['blur','change']},
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
      // birthAt:[
      //   {required: true, message: '请选择出生日期', trigger: 'change', type:'object'}]

    }
  }
  handleSubmit=() => {
    console.log('提交数据')
    const resetrule = this.state.rules
    let {endTime, ...rules} = this.state.rules
    let {name,groupRole,cellPhone,idNo,gender,companyName,evaluate,birthAt} = this.state.form
    let tempBirthAt = ''
    if( this.state.form.birthAt !== null && this.state.form.birthAt !== ''){
      tempBirthAt = formatDate(this.state.form.birthAt,false)
    }
    if(this.props.isupdate) {
      // 编辑
      // 额外移除密码校验
      let {otherrules} = rules
      rules = otherrules
      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })
            Http.post('/chr/group/addOrUpdate', {
              id:this.props.currentData.id,
              name:name,
              gender:gender,
              idNo:idNo,
              birthAt:tempBirthAt,
              groupRole:groupRole,
              companyName:companyName,
              evaluate:evaluate,
              cellPhone:cellPhone
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
            Http.post('/chr/group/addOrUpdate', {
              name:name,
              gender:gender,
              idNo:idNo,
              birthAt:tempBirthAt,
              groupRole:groupRole,
              companyName:companyName,
              evaluate:evaluate,
              cellPhone:cellPhone
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
              }else{
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
  fetchTypeDict=(id)=>{
    Http.get(`/chr/group/get/${id}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            form:{
              name:res.data.content.name,
              idNo:res.data.content.idNo,
              groupRole:res.data.content.groupRole,
              cellPhone:res.data.content.cellPhone,
              gender:res.data.content.gender,
              companyName:res.data.content.companyName,
              evaluate:res.data.content.evaluate,
              birthAt:!!res.data.content.birthAt ? moment(res.data.content.birthAt, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
            }
          })
        }
      }
    })
  }
  fetchGroup=()=>{
    Http.post(`/dict/select`,{
      dictType:'group_type',
      isNeed:false
    }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            groupMap:res.data.content
          })
        }
      }
    })
  }
  componentDidMount () {
    this.fetchGroup()
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    console.log(this.props)
    if(nextProps.isupdate) {
      const {currentData:data} = nextProps
      let {...rest} = this.state.rules
      this.setState({
        rules: rest
      })
      this.fetchTypeDict(data.id)
    }else{
      this.myRef.current.resetFields()
      let rules = this.state.rules
      this.setState({
        rules: {...rules} })
    }

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
          title={this.props.isupdate ? '班组修改' : '班组新增'}
          size="small"
          className={'user-list-dialog'}
          visible={this.props.dialogVisible }
          onCancel={ () => this.props.onCancel() && this.myRef.current.resetFields() }
          lockScroll={ false }
        >
          <Dialog.Body style={{paddingTop:'10px', height:'350px'}}>
            <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
              <Form ref={this.myRef} model={form} rules={rules} labelWidth={84} labelPosition={'right'} className={'form-user-auth'}>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="姓名:" prop="name">
                    <Input value={form.name} size="small" onChange={this.onChange.bind(this, 'name')} />
                  </Form.Item>
                  <Form.Item label="证件号:" prop="idNo">
                    <Input value={form.idNo} size="small" onChange={this.onChange.bind(this, 'idNo')}/>
                  </Form.Item>
                  <Form.Item label="班组身份:" prop="groupRole">
                    <Select value={form.groupRole} placeholder="请选择班组身份" onChange={this.onChange.bind(this, 'groupRole')}>
                      {
                        this.state.groupMap.map(el => {
                          return <Select.Option key={el.dictCode} label={el.dictName} value={el.dictCode} />
                        })
                      }
                    </Select>

                  </Form.Item>
                  <Form.Item label="联系方式:" prop="cellPhone">
                    <Input value={form.cellPhone} size="small" onChange={this.onChange.bind(this, 'cellPhone')}/>
                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="性别:" prop="gender">
                    <Select value={form.gender} placeholder="请选择性别" onChange={this.onChange.bind(this, 'gender')}>
                      {
                        this.state.genderMap.map(el => {
                          return <Select.Option key={el.value} label={el.name} value={el.value} />
                        })
                      }
                    </Select>
                    {/* <Input value={form.gender} size="small" onChange={this.onChange.bind(this, 'gender')}/> */}
                  </Form.Item>
                  <Form.Item label="出生日期:" prop="birthAt">
                    <DatePicker
                      value={form.birthAt}
                      isShowTime={true}
                      onChange={this.onChange.bind(this, 'birthAt')}
                      placeholder="选择出生时间"
                    />
                  </Form.Item>
                  <Form.Item label="公司名称:" prop="companyName">
                    <Input value={form.companyName} size="small" onChange={this.onChange.bind(this, 'companyName')}/>
                  </Form.Item>

                </Layout.Col>
                <Layout.Col span={20} offset={1}>
                <Form.Item label="班组评价:" prop="evaluate">
                    <Input value={form.evaluate} type="textarea" size="small" onChange={this.onChange.bind(this, 'evaluate')}/>
                  </Form.Item>
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

export default withRouter(GroupForm)
