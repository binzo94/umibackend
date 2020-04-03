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
import ProjectForm from './project-form'

import './worker-form.less'
import _ from 'lodash'
import moment from 'moment'
class UserForm extends React.Component {
  myRef = React.createRef();
  state = {
    currentgrade:'',
    form:{
      name:'',
      idNo:'',
      eduLevel: '',
      maritalStatus:'',
      gender:'',
      cellPhone:'',
      birthAt: null
    },
    isupdate1: false,
    dialogVisible1: false,
    currentData1:{},
    eduLevelArr:[],    
    genderMap:[
      {
        name:'男',
        value:'男'
      },{
        name:'女',
        value:'女'
      }
    ],
    maritalStatusArr:[],
    rules: {
      name: [
        {required: true, message: '请输入姓名', trigger: 'change'}
      ],
      // eduLevel: [
      //   {required: true, message: '请选择学历', trigger: 'change'}
      // ],
      // maritalStatus:[
      //   {required: true, message: '请选择婚姻状况', trigger: 'change'}
      // ],
      idNo: [
        {required: false, message: '请输入证件号码', trigger: ['submit']},
        { validator: (rule, value, callback) => {
          var reg = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/
          if (value === '') {
            // callback(new Error('请输入证件号码'))
            callback()
          } else {
            if(reg.test(value)) {
              callback()
            }else{
              callback(new Error('证件号码格式错误') )
            }

          }
        } }
      ],
      gender: [
        {required: true, message: '请输入性别', trigger: ['blur','change']},
      ],
      cellPhone: [
        {required: true, message: '请输入联系方式', trigger: ['blur','change']},
        { validator: (rule, value, callback) => {
          var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
          if (value === '') {
            callback(new Error('请输入联系方式'))
          } else {
            if(reg.test(value)) {
              callback()
            }else{
              callback(new Error('联系方式格式错误') )
            }

          }
        } }
      ],
      // birthAt:[
      //   {required: true, message: '请选择出生日期', trigger: 'change', type:'object'}]

    }
  }
  queryEduLevel = () =>{
    Http.post(`/dict/select`,{
      dictType: "degree", 
      isNeed: false
    }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content&&res.data.content.length){
          this.setState({
            eduLevelArr:res.data.content
          })
        }
      }
    })
  }
  queryMarital = () =>{
    Http.post(`/dict/select`,{
      dictType: "material_status", 
      isNeed: false
  }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content&&res.data.content.length){
          this.setState({
            maritalStatusArr:res.data.content
          })
        }
      }
    })
  }
  handleSubmit=() => {
    console.log('提交数据',maritalStatus)
    // 普通账号移除时间校验
    const resetrule = this.state.rules
    // let data
    let tempBirthAt = ''
    if( this.state.form.birthAt !== null && this.state.form.birthAt !== ''){
      tempBirthAt = formatDate(this.state.form.birthAt,false)
    }
    let {birthAt, ...rules} = this.state.rules
    let {gender,maritalStatus} = this.state.form
    let sex = ''
    if(gender === '男'){
      sex = 'MALE'
    }else if(gender === '女'){
      sex = 'FEMALE'
    }
    if(this.props.isupdate) {
      // 编辑
      let { otherrules} = rules
      let marital = ''
      // if(maritalStatus !== undefined){
      //   marital = maritalStatus
      // }
      rules = otherrules
      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })
            if((this.state.form.name).trim() !== '' && (this.state.form.cellPhone).trim() !== '' ) {
              console.log(159,this.state.form)
              Http.post('/chrRecruit/worker/update', {
                id:this.props.currentData.id,
                name:this.state.form.name,
                gender:sex,
                idNo:this.state.form.idNo,
                birthAt:tempBirthAt,
                degree:this.state.form.eduLevel,
                maritalStatus:this.state.form.maritalStatus,
                cellPhone:this.state.form.cellPhone
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

            }else{
              Message({
                type:'error',
                message: '修改失败!姓名，证件号，联系方式不能为空'
              })
            }
          } else {
            console.log('error submit!!')
            return false
          }
        })
      })
    }
    else {
      // 新增
      console.log('新增',this.state.form.idNo)
      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })
            var storage=window.localStorage;
            storage.setItem("name",this.state.form.name);
            storage.setItem("gender",sex);
            storage.setItem("idNo",this.state.form.idNo);
            storage.setItem("birthAt",tempBirthAt);
            storage.setItem("degree",this.state.form.eduLevel);
            storage.setItem("maritalStatus",this.state.form.maritalStatus);
            storage.setItem("cellPhone",this.state.form.cellPhone);
            this.props.resetSearch()
            // 清理表单，重置验证
            this.myRef.current.resetFields()
            // 关闭弹框
            this.props.onCancel && this.props.onCancel()
            this.setState({isupdate1:false, dialogVisible1:true})
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
    Http.get(`/chrRecruit/worker/selectById/${id}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          // let marital = ''
          // if(res.data.content.maritalStatus !== undefined){
          //   marital = res.data.content.maritalStatus
          // }
          this.setState({
            form:{
              ...this.state.form,
              idNo:res.data.content.idNo || '',
              maritalStatus:res.data.content.maritalStatus,
              eduLevel:res.data.content.degree
            }
          })
        }
      }
    })
  }
  componentDidMount () {
    this.queryEduLevel()
    this.queryMarital()
  }
  componentWillReceiveProps(nextProps) {
    console.log(283,nextProps)
    console.log(this.props)
    if(nextProps.isupdate) {
      const {currentData:data} = nextProps
      let {...rest} = this.state.rules
      this.setState({
        rules: rest
      })
      this.fetchTypeDict(data.id)
      let sex = ''
      if(data.gender === 'FEMALE'){
        sex = '女'
      }else if(data.gender === 'MALE'){
        sex = '男'
      }
      this.setState({
        form:{
          name:data.name,
          cellPhone:data.cellPhone,
          gender:sex,
          birthAt: !!data.birthAt ? moment(data.birthAt, 'YYYY-MM-DD HH:mm:ss').toDate() : ''
        }
      })
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
  resetSearch = (data) => {
    console.log('work-form-resetSearch')
  }
  render () {
    let { form, rules } = this.state
    return (
      <React.Fragment>      
        <ProjectForm ref={this.myRef} currentData={this.state.currentData1} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible1: false })} isupdate={this.state.isupdate1} dialogVisible={this.state.dialogVisible1}></ProjectForm>
        <Dialog
          title={this.props.isupdate ? '简历修改' : '简历新增'}
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
                  <Form.Item label="姓名:" prop="name">
                    <Input value={form.name} size="small" onChange={this.onChange.bind(this, 'name')} />
                  </Form.Item>
                  <Form.Item label="证件号:" prop="idNo">
                    <Input value={form.idNo} size="small" onChange={this.onChange.bind(this, 'idNo')}/>
                  </Form.Item>
                  <Form.Item label="学历:" prop="eduLevel">
                    <Select value={form.eduLevel} placeholder="请选择学历" onChange={this.onChange.bind(this, 'eduLevel')}>
                      {
                        this.state.eduLevelArr.map(el => {
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
                  </Form.Item>
                  <Form.Item label="出生日期:" prop="birthAt">
                    <DatePicker
                      value={form.birthAt}
                      // isShowTime={true}
                      onChange={this.onChange.bind(this, 'birthAt')}
                      placeholder="选择出生日期"
                    />
                  </Form.Item>
                  <Form.Item label="婚姻状况:" prop="maritalStatus">
                    <Select value={form.maritalStatus} placeholder="请选择婚姻状况" onChange={this.onChange.bind(this, 'maritalStatus')}>
                      {
                        this.state.maritalStatusArr.map(el => {
                          return <Select.Option key={el.dictCode} label={el.dictName} value={el.dictCode} />
                        })
                      }
                    </Select>

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

export default withRouter(UserForm)
