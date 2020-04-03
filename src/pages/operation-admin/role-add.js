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
        label: 'name'
      },
      resourceIdList: [],
      isShow: false,
      form: {
        sign: '',
        name: '',
        remark: '',
        resourceIdList: [],
        requestLimit:'',
        childUserLimit:'',
        terminalLimit:'',
        warningLimit:'',
        additionalLimit:''
      },
      rules: {
        sign: [
          { required: true, message: '请输入角色标识', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入角色描述', trigger: 'submit' }
        ],requestLimit: [
          { required: true, message: '请输入请求上限', trigger: 'submit',type:'string' },
          {trigger: 'change',
            validator: (rule, value, callback) => {

              if (!/^[0-9]+$/.test(value)) {
                console.log('1111')
                callback(new Error('请求上限只能是数字'))
              }
              else {
                callback()
              }
            }
          }
        ],childUserLimit: [
          { required: true, message: '请输入子账号上限', trigger: 'submit',type:'string' },
          {trigger: 'change',
            validator: (rule, value, callback) => {
              if (!/^[0-9]+$/.test(value)) {
                callback(new Error('子账号上限只能是数字'))
              }
              else {
                callback()
              }
            }
          }
        ], terminalLimit: [
          { required: true, message: '请输入终端上限', trigger: 'submit',type:'string' },
          {trigger: 'change',
            validator: (rule, value, callback) => {
              if (!/^[0-9]+$/.test(value)) {
                callback(new Error('终端上限只能是数字'))
              }
              else {
                callback()
              }
            }
          }
        ],warningLimit:[
          { required: true, message: '请输入预警次数', trigger: 'submit',type:'string' },
          {trigger: 'change',
            validator: (rule, value, callback) => {
              if (!/^[0-9]+$/.test(value)) {
                callback(new Error('预警次数只能是数字'))
              }
              else {
                callback()
              }
            }
          }
        ],additionalLimit:[
          { required: true, message: '请输入额外次数', trigger: 'submit',type:'string' },
          {trigger: 'change',
            validator: (rule, value, callback) => {
              if (!/^[0-9]+$/.test(value)) {
                callback(new Error('额外次数只能是数字'))
              }
              else {
                callback()
              }
            }
          }
        ]
      }
    }
  }
  showTree = () => {
    const { data, id } = this.state
    Http.get('/cic/resource/tree')
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
      if(findres&&findres.length>1){
        //只需要子级
        checkedkeyAllPath.push(findres[findres.length-1])

      }

    }
    checkedkeyAllPath=_.uniq(checkedkeyAllPath)
    Http.post('/cic/role/add', { ...this.state.form,resourceIdList:checkedkeyAllPath })
      .then(res => {
        this.setState({
          ...this.state
        })
        console.log('getSsdsdure')
        if (res.data.code == '0') {
          this.props.history.push('/operation-admin/role-list')
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
      if(findres&&findres.length>1){
        //只需要子级
        checkedkeyAllPath.push(findres[findres.length-1])

      }

    }
    checkedkeyAllPath=_.uniq(checkedkeyAllPath)

    Http.post(`/cic/role/update`, { ...this.state.form, resourceIdList:checkedkeyAllPath })
      .then(res => {
        this.setState({
          ...this.state
        })
        if (res.data.code == '0') {
          this.props.history.push('/operation-admin/role-list')
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
    this.props.history.push('/operation-admin/role-list')
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    Http.get(`/cic/role/get/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let { form, id } = this.state
          this.setState({
            form: {
              ...content,
              requestLimit:_.get(content,'requestLimit','').toString(),
              childUserLimit:_.get(content,'childUserLimit','').toString(),
              terminalLimit:_.get(content,'terminalLimit','').toString(),
              warningLimit:_.get(content,'warningLimit','').toString(),
              additionalLimit:_.get(content,'additionalLimit','').toString()
            },
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
        <h3 className="page-title">角色{this.props.isModifyPage ? '修改' : '新增'}
          <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>
        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          <Form.Item label="角色标识：" prop="sign">
            <Input value={this.state.form.sign} placeholder="请填写角色标识" style={{ width: '300px' }} onChange={this.onChange('sign')}></Input>
          </Form.Item>
          <Form.Item label="角色名称：" prop="name">
            <Input value={this.state.form.name} placeholder="请填写角色名称" style={{ width: '300px' }} onChange={this.onChange('name')}></Input>
          </Form.Item>
          <Form.Item label="请求上限：" prop="requestLimit">
            <Input value={this.state.form.requestLimit} placeholder="请填写请求上限" style={{ width: '150px' }} onChange={this.onChange('requestLimit')}></Input>
          </Form.Item>
          <Form.Item label="子账号上限：" prop="childUserLimit">
            <Input value={this.state.form.childUserLimit} placeholder="请填写子账号上限" style={{ width: '150px' }} onChange={this.onChange('childUserLimit')}></Input>
          </Form.Item>
          <Form.Item label="终端上限：" prop="terminalLimit">
            <Input value={this.state.form.terminalLimit} placeholder="请填写终端上限" style={{ width: '150px' }} onChange={this.onChange('terminalLimit')}></Input>
          </Form.Item>
          <Form.Item label="预警次数：" prop="warningLimit">
            <Input value={this.state.form.warningLimit} placeholder="请填写预警次数" style={{ width: '150px' }} onChange={this.onChange('warningLimit')}></Input>
          </Form.Item>
          <Form.Item label="额外次数：" prop="additionalLimit">
            <Input value={this.state.form.additionalLimit} placeholder="请填写额外次数" style={{ width: '150px' }} onChange={this.onChange('additionalLimit')}></Input>
          </Form.Item>
          <Form.Item label="角色描述：" prop="remark">
            <Input className="text-style" autosize={{ minRows: 4, maxRows: 6 }} style={{ width: '300px' }}  type="textarea" value={this.state.form.remark} onChange={this.onChange('remark')} ></Input>
          </Form.Item>
          <Form.Item label="角色权限：" className={'auth-require'}>
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
