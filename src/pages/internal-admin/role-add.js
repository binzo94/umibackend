import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { Http } from '../../services'
import { Button, Input, Select, Form, Radio, Tree,Message } from 'element-react'
import { parse } from 'query-string'
import { isEmptyObject } from '../../utils'
import _ from 'lodash'
import 'element-theme-default'
import './role-add.css'
function findPathByLeafPath(id, nodes, path) {
  if (path === undefined) {
    path = [];
  }
  for (var i = 0; i < nodes.length; i++) {
    var tmpPath = path.concat();
    tmpPath.push(nodes[i].id);
    if (id == nodes[i].id) {
      console.log(id)
      return tmpPath;
    }
    if (nodes[i].resourceList) {
      var findResult = findPathByLeafPath(id, nodes[i].resourceList, tmpPath);
      if (findResult) {
        return findResult;
      }
    }
  }
}

class RoleAdd extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: '',
      options: {
        children: 'resourceList',
        label: 'perName'
      },
      resourceIdList: [],
      isShow: false,
      form: {
        roleSign: '',
        roleName: '',
        roleDesc: '',
        status: '1',
        resourceIdList: []
      },
      rules: {
        roleSign: [
          { required: true, message: '请输入角色标识', trigger: 'blur' }
        ],
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ],
        // power: [
        //   { required: true, message: '请选择角色权限', trigger: 'change' }
        // ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  }
  showTree = () => {
    const { data, id } = this.state
    Http.get('/system/resource/tree')
      .then(res => {
        if (res.data.content) {
          this.setState({
            // ...this.state,
            data: res.data.content,
            // id: this.state.id,
            isShow: true
          })
          this.tree.setCheckedKeys(this.state.resourceIdList)
        }
      })
  }

  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }

  handleClick = (data, checked) => {

  }

  getSure = () => {

    let checkedkey = this.tree.getCheckedKeys()
    var data = _.clone(this.state.data)
    var checkedkeyAllPath = []
    for(var key in checkedkey){
      var findres = findPathByLeafPath(checkedkey[key],data)
      if(findres){
        checkedkeyAllPath = [...checkedkeyAllPath,...findres]
      }

    }
    checkedkeyAllPath=_.uniq(checkedkeyAllPath)
    Http.post('/system/role/add', { ...this.state.form,resourceIdList:checkedkeyAllPath })
      .then(res => {
        this.setState({
          ...this.state
        })
        console.log('getSsdsdure')
        if (res.data.code == '0') {
          this.props.history.push('/internal-admin/role-list')
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
    let checkedkey = this.tree.getCheckedKeys()
    var data = _.clone(this.state.data)
    var checkedkeyAllPath = []
    for(var key in checkedkey){
      var findres = findPathByLeafPath(checkedkey[key],data)
      if(findres){
        checkedkeyAllPath = [...checkedkeyAllPath,...findres]
      }

    }
    checkedkeyAllPath=_.uniq(checkedkeyAllPath)

    Http.post(`/system/role/update/${parse(location.search).id}`, { ...this.state.form, resourceIdList:checkedkeyAllPath })
      .then(res => {
        this.setState({
          ...this.state
        })
        if (res.data.code == '0') {
          this.props.history.push('/internal-admin/role-list')
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
        Message({
          type:"info",
          message:'请检查信息填写规则！'
        })
        return false
      }
    })
  }

  cancle = () => {
    this.props.history.push('/internal-admin/role-list')
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    Http.get(`/system/role/select/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          console.log(content.resourceIdList)
          let { form, id } = this.state
          this.setState({
            form: content,
            resourceIdList:content.resourceIdList
          })
          this.showTree()
        }
      })
  }

  componentDidMount () {
    if (this.props.isModifyPage) {
      this.fetchPermissionsInfoById()
    } else {
      this.showTree()
    }
  }

  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">角色{this.props.isModifyPage ? '修改' : '新增'}</h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          <Form.Item label="角色标识：" prop="roleSign">
            <Input value={this.state.form.roleSign} placeholder="请填写角色标识" style={{ width: '300px' }} onChange={this.onChange('roleSign')}></Input>
          </Form.Item>
          <Form.Item label="角色名称：" prop="roleName">
            <Input value={this.state.form.roleName} placeholder="请填写角色名称" style={{ width: '300px' }} onChange={this.onChange('roleName')}></Input>
          </Form.Item>
          <Form.Item label="角色描述：" prop="roleDesc">
            <Input className="text-style" autosize={{ minRows: 4, maxRows: 6 }} type="textarea" value={this.state.form.roleDesc} onChange={this.onChange('roleDesc')} ></Input>
          </Form.Item>
          <Form.Item label="角色权限：">
            {/* <Layout.Col span="11">
            <Form.Item prop="power" labelWidth="0px" >
              <Select value={this.state.form.power} placeholder="请选择角色权限" onVisibleChange={this.showTree} style={{ width: '300px' }} onChange={this.onChange('power')}>
                {
                  this.state.powers.map(el => {
                    return <Select.Option key={el.id} label={el.deptName} value={el.id} />
                  })
                }
              </Select>
            </Form.Item>
          </Layout.Col>
          <Layout.Col span="11"> */}
            {/* <Form.Item prop="date2" labelWidth="20px"> */}
            <Tree
              className="filter-tree"
              ref={e => this.tree = e}
              checkedKeyStrictly={false}
              data={this.state.data}
              options={this.state.options}
              nodeKey="id"
              defaultExpandAll={true}
              isShowCheckbox={true}
              onCheckChange={this.handleClick}
              defaultCheckedKeys={this.state.resourceIdList}
            />
          </Form.Item>
          <Form.Item label="状态：" prop="status">
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

export default withRouter(RoleAdd)
