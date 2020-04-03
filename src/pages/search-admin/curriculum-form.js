import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Layout, Dialog,
  Message
} from 'element-react'
import Autocomplete from 'react-autocomplete'
import { Http } from '../../services'
import { formatDate, isEmptyObject, setStateWrap } from '../../utils'
import { parse } from 'query-string'
import './project-form.less'
import _ from 'lodash'
import moment from 'moment'
class CurrForm extends React.Component {
  myRef = React.createRef();
  state = {
    currentgrade:'',
    form:{
        name:'',
        sgUnitName:'',
        jsName:'',
        joinDate:null,
        leaveDate:null,
        evaluate:'',
        groupId:'',
        projectId:''
    },
    suggestList:[],
    rules: {
      name: [
        {required: true, message: '请输入项目名称', trigger: 'change'}
      ],
      // joinDate:[
      //   {required: true, message: '请选择入场时间', trigger: 'change', type:'object'}],
      // leaveDate:[
      //   {required: true, message: '请选择退场时间', trigger: 'change', type:'object'}]

    }
  }
  handleSubmit=() => {
    console.log('提交数据')
    const resetrule = this.state.rules
    let {...rules} = this.state.rules
    let {groupId, projectId,joinDate,leaveDate,evaluate} = this.state.form
    let { location } = this.props
    let addGroupId = parse(location.search).id
    let tempJoinDate = null
    let tempLeaveDate = null
    console.log(5555555,joinDate,leaveDate)
    if(joinDate !== null && joinDate !== ''){
      tempJoinDate = formatDate(joinDate,false)
    }
    if(leaveDate !== null && leaveDate !== ''){
      tempLeaveDate = formatDate(leaveDate,false)
    }
    if(this.props.isupdate) {
      // 编辑
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


            Http.post('/chr/group/project/addOrUpdate', {    
                id: this.props.currentData.id,
                groupId: groupId,
                projectId: projectId,
                joinDate: tempJoinDate ,
                leaveDate: tempLeaveDate,
                evaluate: evaluate
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '修改成功!'
                })
                this.setState({
                    form:{
                        name:'',
                        projectId:''
                    },
                    suggestList:[]
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()
                this.setState({
                    form:{
                        joinDate:null,
                        leaveDate:null
                    },
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
            Http.post('/chr/group/project/addOrUpdate', {   
                groupId: addGroupId,
                projectId: projectId,
                joinDate: tempJoinDate ,
                leaveDate: tempLeaveDate,
                evaluate: evaluate
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '新增成功!'
                })
                this.setState({
                    form:{
                        name:'',
                        projectId:'',
                        joinDate:null,
                        leaveDate:null
                    },
                    suggestList:[]
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()

                this.props.onCancel && this.props.onCancel()
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
    Http.get(`/chr/group/project/get/${id}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            form:{
                name:res.data.content.name,
                sgUnitName:res.data.content.sgUnitName,
                jsName:res.data.content.jsName,
                joinDate:!!res.data.content.joinDate ? moment(res.data.content.joinDate, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
                leaveDate:!!res.data.content.leaveDate ? moment(res.data.content.leaveDate, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
                evaluate:res.data.content.evaluate,
                projectId:res.data.content.projectId,
                groupId:res.data.content.groupId,
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
  onChange(key, value) {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
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
          onCancel={ () => this.props.onCancel() && this.myRef.current.resetFields() }
          lockScroll={ false }
        >
          <Dialog.Body style={{paddingTop:'10px', height:'320px'}}>
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
                        console.log(66666,value,data)
                        this.setState({
                        ...this.state,
                        form:{
                          ...this.state.form,
                          name: value,
                          projectId: data.id,
                          sgUnitName: data.sgUnitName,
                          jsName: data.jsName
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
                          maxHeight: '250px' }}
                        wrapperStyle={{position:'relative', width:'260px', zIndex:'5000'}}/>
                </Form.Item>
                  {/* <Form.Item label="项目名称:" prop="name">
                    <Input value={form.name} size="small" onChange={this.onChange.bind(this, 'name')} />
                  </Form.Item> */}
                  <Form.Item label="施工单位:" prop="sgUnitName">
                    <Input value={form.sgUnitName} size="small" disabled onChange={this.onChange.bind(this, 'sgUnitName')}/>
                  </Form.Item>
                  <Form.Item label="退场时间:" prop="leaveDate">
                    <DatePicker
                      value={form.leaveDate}
                      // isShowTime={true}
                      onChange={this.onChange.bind(this, 'leaveDate')}
                      placeholder="选择退场时间"
                    />
                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="建设单位:" prop="jsName">
                    <Input value={form.jsName} size="small" disabled onChange={this.onChange.bind(this, 'jsName')}/>
                  </Form.Item>
                  <Form.Item label="入场时间:" prop="joinDate">
                    <DatePicker
                      value={form.joinDate}
                      // isShowTime={true}
                      onChange={this.onChange.bind(this, 'joinDate')}
                      placeholder="选择入场时间"
                    />
                  </Form.Item>

                </Layout.Col>

                <Layout.Col span={20} offset={1}>
                <Form.Item label="人员评价:" prop="evaluate">
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

export default withRouter(CurrForm)
