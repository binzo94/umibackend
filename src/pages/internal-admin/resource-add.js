import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input, Radio,Message} from 'element-react'
import 'element-theme-default'
import './role-add.css'
import { isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import { withRouter } from 'react-router-dom'

class Resourceform extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        parentId: '',
        perName: '',
        sysId: '',
        url: '',
        desc: '',
        status: '1',
        sort: 0,
        component: '',
        path: ''
      },
      system: [],
      superior: [],
      superiorAll:[],
      rules: {
        sysId: [
          { required: true, message: '请选择所属系统', trigger: 'change' }
        ],
        perName: [
          { required: true, message: '请填写权限节点名称', trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '请选择上级名称', trigger: 'change' }
        ],
        url: [
          { required: true, message: '请填写url', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请填写排序', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (!/^\d+(\.\d+)?$/.test(value)) {
                callback(new Error('排序必须为纯数字格式'))
              }
              else {
                callback()
              }
            }
          }
        ],
        desc: [
          { required: true, message: '请填写系统描述', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  }

  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
    if(key == 'sysId'){
      let newsuperior=this.state.superiorAll.filter((item)=>{
        return  item.sys_id == value
      })
      this.setState({
        superior:newsuperior,
        form:{
          ...this.state.form,
          parentId:''
        }
      })
    }
  }

  querySuperior = () => {
    Http.get('/system/resource/parent/list')
      .then(res => {
        if (res.data.content) {
          this.setState({
            superior: res.data.content,
            superiorAll:res.data.content
          })
          if(this.state.form.sysId){
            //
            if(res.data.content.length>0){
               console.log(this.state.form.sysId)
              let newsuperior=res.data.content.filter((item)=>{
                return  item.sys_id == this.state.form.sysId
              })
              this.setState({
                superior:newsuperior
              })
            }
          }
        }
      })
  }

  querySystem = () => {
    Http.get('/system/resource/system/list')
      .then(res => {
        if (res.data.content) {
          this.setState({
            system: res.data.content
          })
          if(!this.props.isModifyPage){
            this.setState({
              form:{
                ...this.state.form,
                sysId:res.data.content[0]['id']
              }

            })
          }
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
    Http.post('/system/resource/add', { ...this.state.form })
      .then(res => {
        this.setState({
          ...this.state
        })
        if (res.data.code == '0') {
          this.props.history.push('/internal-admin/resource-list')
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
    let { location } = this.props
    Http.post(`/system/resource/update/${parse(location.search).id}`, { ...this.state.form })
      .then(res => {
        this.setState({
          ...this.state
        })
        if (res.data.code == '0') {
          Message({
            type:'success',
            message:'修改成功!'
          })
          this.props.history.push('/internal-admin/resource-list')
        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }

      })
  }

  cancle = () => {
    this.props.history.push('/internal-admin/resource-list')
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    Http.get(`/system/resource/select/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let { form } = this.state
          this.setState({
            form: {
              ...content,
              sort:content.sort.toString()
            }
          })
          if(this.state.superiorAll&&this.state.superiorAll.length>0){
            let newsuperior=this.state.superiorAll.filter((item)=>{
              return  item.sys_id == res.data.content.sysId
            })
            this.setState({
              superior:newsuperior
            })
          }

        }
      })
  }

  componentDidMount () {
    if (this.props.isModifyPage) {
      this.fetchPermissionsInfoById()
    }

    this.querySystem()
    this.querySuperior()
  }

  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">权限节点{this.props.isModifyPage ? '修改' : '新增'}</h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          <Form.Item label="所属系统：" prop="sysId">
            <Select value={this.state.form.sysId} placeholder="请选择所属系统" style={{ width: '300px' }} onChange={this.onChange('sysId')}>
              {
                this.state.system.map(el => {
                  return <Select.Option key={el.id} label={el.sys_name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="权限节点名称：" prop="perName">
            <Input value={this.state.form.perName} placeholder="请填写权限节点名称" style={{ width: '300px' }} onChange={this.onChange('perName')}></Input>
          </Form.Item>
          <Form.Item label="上级名称：" prop="parentId">
            <Select value={this.state.form.parentId} placeholder="请选择上级名称" style={{ width: '300px' }} onChange={this.onChange('parentId')}>
              {
                this.state.superior.map(el => {
                  return <Select.Option key={el.id} label={el.per_name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="url：" prop="url">
            <Input value={this.state.form.url} placeholder="请填写url" style={{ width: '300px' }} onChange={this.onChange('url')}></Input>
          </Form.Item>
          <Form.Item label="排序：" prop="sort">
            <Input Value={this.state.form.sort} placeholder="请填写排序" style={{ width: '300px' }} onChange={this.onChange('sort')}></Input>
          </Form.Item>
          <Form.Item label="组件：" >
            <Input value={this.state.form.component} placeholder="0=系统菜单，1=列表菜单，2=二级菜单" style={{ width: '300px' }} onChange={this.onChange('component')}></Input>
          </Form.Item>
          <Form.Item label="路由：" >
            <Input value={this.state.form.path} placeholder="请填写路由" style={{ width: '300px' }} onChange={this.onChange('path')}></Input>
          </Form.Item>
          <Form.Item label="系统描述：" prop="desc">
            <Input value={this.state.form.desc} autosize={{ minRows: 4, maxRows: 6 }} type="textarea" placeholder="请填写系统描述" style={{ width: '300px' }} onChange={this.onChange('desc')}></Input>
          </Form.Item>
          <Form.Item label="状态：" prop="status" >
            <Radio.Group value={this.state.form.status} onChange={this.onChange('status')}>
              <Radio value="1">可用</Radio>
              <Radio value="0">冻结</Radio>
            </Radio.Group>
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

export default withRouter(Resourceform)
