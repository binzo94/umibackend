import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Layout, Dialog,
  Message, MessageBox,InputNumber
} from 'element-react'
import { Http } from '../../services'
import { formatDate, isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import Autocomplete from 'react-autocomplete'

import './project-form.less'
import _ from 'lodash'
import moment from 'moment'
class ProjectForm extends React.Component {
  myRef = React.createRef();
  state = {
    form:{
      name:'',
      sgUnitName:'',
      workPostId: '',
      workPostName:'',
      joinDate:null,
      salary:'',
      jsName:'',
      workerCategory:'',
      hasCard:'',
      leaveDate:null,
      evaluate:'',
      endTime: new Date(),
      projectId:''
    },
    suggestList:[],
    personMap:[
      {
        dictCode:'M',
        dictName:'管理人员'
      }
    ],
    jobMap:[],
    cardMap:[],
    gradeMap: [{label:'普通账号', value:'NEED_AUTH_USER'}, {label: 'VIP账号', value:'NEED_AUTH_VIP'}],
    rules: {
      name: [
        {required: true, message: '请输入项目名称', trigger: 'change'}
      ],
      workPostId: [
        {required: true, message: '请输入岗位', trigger: 'change'}
      ],
      workerCategory: [
        {required: true, message: '请输入人员类别', trigger: 'change'}
      ],
      hasCard: [
        {required: true, message: '请输入挂证信息', trigger: 'change'}
      ],
    }
  }
  handleSubmit=() => {
    console.log('提交数据')
    // 普通账号移除时间校验
    const resetrule = this.state.rules
    // let data
    let {endTime, ...rules} = this.state.rules
    let tempJoinDate = null
    let tempLeaveDate = null
    
    console.log(77777777,this.state.form.joinDate,this.state.form.leaveDate)
    if(this.state.form.joinDate !== null && this.state.form.joinDate !== '' ){
      tempJoinDate = formatDate(this.state.form.joinDate,false)
      console.log(676553,tempJoinDate)
    }
    if(this.state.form.leaveDate !== null && this.state.form.leaveDate !== ''){
      tempLeaveDate = formatDate(this.state.form.leaveDate,false)
      console.log(6767777773,tempLeaveDate)
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

            Http.post('/chrRecruit/worker/addOrUpdateProject', {
              id:this.props.currentData.id,
              projectId:this.props.currentData.projectId,
              workerId:this.props.currentData.workerId,
              workerCategory:this.state.form.workerCategory,
              // workPostId:this.state.form.workPostId,
              workPostName:this.state.form.workPostId,
              hasCard:this.state.form.hasCard,
              joinDate:tempJoinDate,
              leaveDate:tempLeaveDate,
              salary:this.state.form.salary,
              evaluate:this.state.form.evaluate,
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '修改成功!'
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()
                this.setState({
                    form:{
                      name:'',
                      sgUnitName:'',
                      workPostId: '',
                      joinDate:null,
                      salary:'',
                      jsName:'',
                      workerCategory:'',
                      hasCard:'',
                      leaveDate:null,
                      evaluate:'',
                      endTime: new Date(),
                      projectId:''
                    },
                    suggestList:[]
                })
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
            var storage=window.localStorage;
            if(storage.getItem("name") != null){
              Http.post('/chrRecruit/worker/add', {
                name:storage.getItem("name"),
                gender:storage.getItem("gender"),
                idNo:storage.getItem("idNo"),
                birthAt:storage.getItem("birthAt"),
                degree:storage.getItem("degree"),
                maritalStatus:storage.getItem("maritalStatus"),
                cellPhone:storage.getItem("cellPhone"),
                projectId:this.state.form.projectId,
                workerCategory:this.state.form.workerCategory,
                // workPostId:this.state.form.workPostId,
                workPostName:this.state.form.workPostId,
                hasCard:this.state.form.hasCard,
                joinDate:tempJoinDate,
                leaveDate:tempLeaveDate,
                salary:this.state.form.salary,
                evaluate:this.state.form.evaluate,
              }).then(res => {
                if(res.data.code == 0) {
                  Message({
                    type:'success',
                    message: '新增成功!'
                  })
                  storage.removeItem("name")
                  storage.removeItem("gender")
                  storage.removeItem("idNo")
                  storage.removeItem("birthAt")
                  storage.removeItem("degree")
                  storage.removeItem("maritalStatus")
                  storage.removeItem("cellPhone")
                  this.props.resetSearch()
                  // 清理表单，重置验证
                  this.myRef.current.resetFields()
                  this.setState({
                      form:{
                          name:'',
                          projectId:''
                      },
                      suggestList:[]
                  })

                  this.props.onCancel && this.props.onCancel()
                  window.location.reload()
                }else{
                  Message({
                    type:'error',
                    message: `新增失败!${res.data.message}`
                  })
                }
              })
            }else{
              console.log(261,this.props.currentData)
              Http.post('/chrRecruit/worker/addOrUpdateProject', {
                projectId:this.state.form.projectId,
                workerId:this.props.currentData.id,
                workerCategory:this.state.form.workerCategory,
                // workPostId:this.state.form.workPostId,
                workPostName:this.state.form.workPostId,
                hasCard:this.state.form.hasCard,
                joinDate:tempJoinDate,
                leaveDate:tempLeaveDate,
                salary:this.state.form.salary,
                evaluate:this.state.form.evaluate,
              }).then(res => {
                if(res.data.code == 0) {
                  Message({
                    type:'success',
                    message: '新增成功!'
                  })
                  this.props.resetSearch()
                  // 清理表单，重置验证
                  this.myRef.current.resetFields()
                  this.setState({
                      form:{
                          name:'',
                          projectId:'',
                          joinDate:null,
                          leaveDate:null
                      },
                      suggestList:[]
                  })
                  // 关闭弹框
                  this.props.onCancel && this.props.onCancel()
                }else{
                  Message({
                    type:'error',
                    message: '修改失败!'+res.data.message
                  })
                }
              })
            }
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
    Http.get(`/chrRecruit/worker/selectProjectById/${id}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            form:{
              name:res.data.content.name,
              sgUnitName:res.data.content.sgUnitName,
              workPostId:res.data.content.workPostName,
              joinDate:!!res.data.content.joinDate ? moment(res.data.content.joinDate, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
              salary:res.data.content.salary,
              jsName:res.data.content.jsName,
              workerCategory:res.data.content.workerCategory,
              hasCard:res.data.content.hasCard,
              leaveDate:!!res.data.content.leaveDate ? moment(res.data.content.leaveDate, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
              evaluate:res.data.content.evaluate,
            }
          },()=>{
            console.log(266,this.state.form)
            this.fetchJobType()
          })
        }
      }
    })
  }
  fetchProjectType=()=>{
    Http.post(`/dict/select`,{
      dictType:'worker_category',
      isNeed:false,
    }).then((res)=>{
      if(res.data.code == '0'){
        console.log(res.data.code)
        // if(res.data.content){
        //   this.setState({
        //     personMap:res.data.content
        //   })
        // }
      }
    })
  }
  fetchJobType=()=>{
    Http.post(`/dict/select`,{
      dictType:this.state.form.workerCategory,
      isNeed:false,
    }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            jobMap:res.data.content,
            // form:{
            //   hasCard:''
            // }
          },()=>{
            if(this.state.form.workPostId == '项目经理'){
              this.fetchCardType('has_cad_M')
            }else{
              this.fetchCardType('has_cad_O')
            }
          })
        }
      }
    })
  }
  fetchCardType=(CardType)=>{
    Http.post(`/dict/select`,{
      dictType:CardType,
      isNeed:false,
    }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            cardMap:res.data.content
          })
        }
      }
    })
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      form:{
        ...this.state.form,
        name: e.target.value
      }
    }, () => {
      if(this.state.form.name)
        this.timer = setTimeout(() => {
          Http.post(`/chrRecruit/project/select?projectName=${this.state.form.name}`)
            .then(res => {
                if(res.data.code == '0'){
                  this.setState({
                      suggestList: res.data.content
                  },()=>{
                      console.log('suggestList',this.state.suggestList)
                  })
                }
            //   setStateWrap.call(this, {
            //     ...this.state,
            //     suggestList: res.data.content
            //   }, this._isMounted, () => {
            //   })
            })
        }, 300)
      else
        this.setState({
          ...this.state,
          suggestList: [],
          form:{
            ...this.state.form,
            name:''
          }
        })

    })
  }
  componentDidMount () {
    this.fetchProjectType()
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.isupdate) {
      const {currentData:data} = nextProps
      let {...rest} = this.state.rules
      this.setState({
        rules: rest
      })
      this.fetchTypeDict(data.id)
    }else{
      // this.fetchTypeDict('cicRoleNA',true )
      this.myRef.current.resetFields()
      let rules = this.state.rules
      this.setState({
        rules: {...rules} })
    }

  }
  componentWillUpdate (prevProps, prevState) {

  }
  onChange(key, value) {
    if(key == 'workerCategory'){
      this.setState({
        form: Object.assign({}, this.state.form, { [key]: value })
      },()=>{
        this.fetchJobType()
      })
    }else if(key == 'workPostId'){
      if(value == '项目经理'){
        this.setState({
          form: Object.assign({}, this.state.form, { [key]: value })
        },()=>{
          this.fetchCardType('has_cad_M')
        })
      }else{
        this.setState({
          form: Object.assign({}, this.state.form, { [key]: value })
        },()=>{
          this.fetchCardType('has_cad_O')
        })
      }
    }
    else{
      this.setState({
        form: Object.assign({}, this.state.form, { [key]: value })
      })
    }
  }
  fetchCancle = () => {
    this.setState({
      form:{
        name:'',
        sgUnitName:'',
        workPostId: '',
        joinDate:null,
        salary:'',
        jsName:'',
        workerCategory:'',
        hasCard:'',
        leaveDate:null,
        evaluate:'',
        endTime: new Date(),
        projectId:''
      }
    })
    var storage=window.localStorage;
    storage.removeItem("name")
    storage.removeItem("gender")
    storage.removeItem("idNo")
    storage.removeItem("birthAt")
    storage.removeItem("degree")
    storage.removeItem("maritalStatus")
    storage.removeItem("cellPhone")
    this.props.onCancel()
    this.myRef.current.resetFields()
  }
  render () {
    let { form, rules } = this.state
    return (
      <React.Fragment>
        <Dialog
          title={this.props.isupdate ? '项目履历修改' : '项目履历新增'}
          size="small"
          className={'user-list-dialog'}
          visible={this.props.dialogVisible }
          onCancel={ this.fetchCancle }
          lockScroll={ false }
        >
          <Dialog.Body style={{paddingTop:'10px', height:'480px'}}>
            <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
              <Form ref={this.myRef} model={form} rules={rules} labelWidth={84} labelPosition={'right'} className={'form-user-auth'}>
                <Layout.Col span={11} offset={1}>
                <Form.Item prop="name" label="项目名称:">
                  <Autocomplete
                    items={this.state.suggestList}
                    getItemValue={item => item.name}
                    value={form.name}
                    onChange={this.handleQueryChange}
                    renderItem={(item, isHighlighted) =>
                        <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                        {item.name}
                        </p>
                    }
                    onSelect={(value, data) => {
                        this.setState({
                        ...this.state,
                        form:{
                          ...this.state.form,
                          name: value,
                          projectId: data.id,
                          sgUnitName:data.sgUnitName,
                          jsName:data.jsName,
                        }
                        })}}
                    menuStyle={{  borderRadius: '3px',
                      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '2px 0',
                      fontSize: '90%',
                      position: 'absolute',
                      top:"36px",
                      left:'0',
                      width:'500px',
                      overflow: 'auto',
                      maxHeight: '400px' }}
                    wrapperStyle={{position:'relative', width:'260px', zIndex:'5000'}}/>
                </Form.Item>
                  {/* <Form.Item label="项目名称:" prop="name">
                    <Input value={form.name} size="small" onChange={this.onChange.bind(this, 'name')} />
                  </Form.Item> */}
                  <Form.Item label="施工单位:" prop="sgUnitName">
                    <Input value={form.sgUnitName} size="small" disabled onChange={this.onChange.bind(this, 'sgUnitName')}/>
                  </Form.Item>
                  <Form.Item label="岗位:" prop="workPostId">
                    <Select value={form.workPostId} placeholder="请选择岗位" onChange={this.onChange.bind(this, 'workPostId')}>
                      {
                        this.state.jobMap.map(el => {
                          return <Select.Option key={el.dictCode} label={el.dictName} value={el.dictCode} />
                        })
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item label="入场时间:" prop="joinDate">
                    <DatePicker
                      value={form.joinDate}
                      isShowTime={true}
                      onChange={this.onChange.bind(this, 'joinDate')}
                      placeholder="选择入场时间"
                    />
                  </Form.Item>
                  <Form.Item label="薪资待遇:(元/月)" prop="salary">
                    <InputNumber value={form.salary} size="small" min={0} onChange={this.onChange.bind(this, 'salary')}/>
                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="建设单位:" prop="jsName">
                    <Input value={form.jsName} size="small" disabled onChange={this.onChange.bind(this, 'jsName')}/>
                  </Form.Item>
                  <Form.Item label="人员类别:" prop="workerCategory">
                    <Select value={form.workerCategory} placeholder="请选择人员类别" onChange={this.onChange.bind(this, 'workerCategory')}>
                      {
                        this.state.personMap.map(el => {
                          return <Select.Option key={el.dictCode} label={el.dictName} value={el.dictCode} />
                        })
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item label="是否挂证:" prop="hasCard">
                    <Select value={form.hasCard} placeholder="请选择是否挂证" onChange={this.onChange.bind(this, 'hasCard')}>
                      {
                        this.state.cardMap.map(el => {
                          return <Select.Option key={el.dictCode} label={el.dictName} value={el.dictCode} />
                        })
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item label="退场时间:" prop="leaveDate">
                    <DatePicker
                      value={form.leaveDate}
                      isShowTime={true}
                      onChange={this.onChange.bind(this, 'leaveDate')}
                      placeholder="选择退场时间"
                    />
                  </Form.Item>

                </Layout.Col>

                <Layout.Col span={20} offset={1}>
                <Form.Item label="人员评价:" prop="evaluate">
                    <Input value={form.evaluate}  type="textarea" size="small" onChange={this.onChange.bind(this, 'evaluate')}/>
                  </Form.Item>
                </Layout.Col>
              </Form>
            </div>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer" style={{textAlign:'center'}}>
            <Button onClick={this.fetchCancle }>取消</Button>
            <Button type="primary" onClick={ this.handleSubmit } style={{marginLeft:'30px'}}>确定</Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default withRouter(ProjectForm)
