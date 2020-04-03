import React from 'react'
import { Http } from '../../services'
import { Button, Tree, Form, Select, Dialog, Input, Message,MessageBox } from 'element-react'
import 'element-theme-default'
import './role-add.css'

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
    if (nodes[i].children&&level<1) {
      deptDatatoList(nodes[i].children, path,level+1)
    }
  }
  return path
}
class Departlist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      defalutKeys:[],
      isModify: false,
      dialogVisible1: false,
      data: [],
      department: [],
      nodes: [],
      deptName:'',
      companyName:'',
      options: {
        children: 'children',
        label: 'deptName'
      },
      form: {
        superDept: '',
        deptName: ''
      },
      rules: {
        deptName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ],
        superDept: [
          { required: true, message: '请选择上级部门名称', trigger: 'change' }
        ]
      }
    }
  }

  showTree = (cb) => {
    Http.get('/system/dept/select')
      .then(res => {
        if (res.data.content) {
          console.log(deptDatatoList(res.data.content))
          if(cb){
            cb(res.data.content)
          }
          if(res.data.content&&res.data.content[0]){
            this.setState({
              companyName:res.data.content[0]['deptName']
            })
          }
          this.setState({
            department:deptDatatoList(res.data.content),
            data: res.data.content,
            nodes: []
          })
        }
      })
  }

  addDepart = () => {
    this.setState({
      dialogVisible1: true,
      isModify: false
    })
  }
  // removeDepart = () => {
  //   const { nodes } = this.state
  //   if (nodes.length !== 0) {
  //     let removeId = nodes[0].id
  //     Http.get(`/system/dept/delete/${removeId}`)
  //       .then(res => {
  //         alert(res.data.message)
  //         this.showTree()
  //       })
  //   }
  //   else (
  //     alert('请选择需要操作的节点')
  //   )
  // }

  addSure = () => {
    const { form } = this.state
    const { superDept, deptName } = form
    this.refs.form.validate((valid) => {
      if (valid) {
        Http.post('/system/dept/add', { superDept, deptName })
          .then(res => {
            if(res.data.code == 0) {
              Message({
                type:'success',
                message:'新增成功!'
              })
              this.setState({
                dialogVisible1: false,
                form: { superDept: '', deptName: '' }
              })

              this.showTree()
            }else{
              Message({
                type:'error',
                message:'新增失败!'+res.data.message
              })
            }

          })
      } else {
        Message({
          type:'info',
          message:'检查字段填写规则!'
        })
        return false
      }
    })


  }

  modifySure = () => {
    const { form } = this.state
    const { id, superDept, deptName } = form
    this.refs.form.validate((valid) => {
      if (valid) {
        if(this.state.deptName == deptName){
          Message({
            type:'success',
            message:'修改成功!'
          })
          this.setState({
            dialogVisible1: false,
            form: { superDept: '', deptName: '' }
          })
          return
        }
        Http.post('/system/dept/update', { id, superDept, deptName })
          .then(res => {
            if(res.data.code == 0) {
              Message({
                type:'success',
                message:'修改成功!'
              })
              this.setState({
                dialogVisible1: false,
                form: { superDept: '', deptName: '' }
              })

              this.showTree()
            }else{
              Message({
                type:'error',
                message:'修改失败!'+res.data.message
              })
            }

          })
      } else {
        Message({
          type:'info',
          message:'检查字段填写规则!'
        })
        return false
      }
    })
  }

  cancle = () => {
    this.setState({
      dialogVisible1: false,
      form: Object.assign({}, this.state.form, { superDept: '', deptName: '' })
    })
  }

  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }

  // handleClick = (data, checked) => {
  //   if (checked) {
  //     this.tree.setCheckedNodes([data])
  //   }
  // }

  // nodeClick = () => {
  //   this.setState({
  //     nodes: this.tree.getCheckedNodes(false)
  //   })
  // }

  renderContent (nodeModel, data) {
    var isshowdelete = data.children.length>0?false:true
    return (
      <span>
        <span>
          <span>{data.deptName}</span>
        </span>
        <span style={{ float: 'right', marginRight: '20px' }}>
          <Button size="mini" type="primary" nativeType="button" onClick={(e) => this.modify(data,e)}>修改</Button>
          {isshowdelete?<Button size="mini" type="primary" nativeType="button" onClick={(e) => this.remove(data,e)}>删除</Button>:<span style={{width:'44px',display:'inline-block'}}></span>}
        </span>
      </span>
    )
  }

  modify (data,e) {
    e.stopPropagation()
    this.addDepart()
    let { form, isModify } = this.state
    Http.get(`/system/dept/findById/${data.id}`)
      .then(res => {
        if (res.data.content) {
          this.setState({
            form: res.data.content,
            deptName:res.data.content.deptName,
            isModify: true
          })
        }
      })
  }

  remove (data,e) {
    e.stopPropagation()
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/system/dept/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          this.showTree()
        }else{
          Message({
            type:'error',
            message: '删除失败!'+res.data.message
          })
        }
      })
    }).catch(() => {
      Message({
        type: 'info',
        message: '已取消操作'
      })
    })
  }

  componentDidMount () {
    this.showTree((data)=>{
      //显示第一层
      if(data&&data[0]){
        let id = data[0].id

        this.setState({
          defalutKeys:[id]
        },()=>{console.log(this.state.defalutKeys)})
      }
    })

  }

  render () {
    return (
      <React.Fragment>

        <Form>
          <Form.Item label={this.state.companyName}>
            <Button type="primary" nativeType="button" size="small" onClick={this.addDepart} style={{ float: 'right', marginRight: '20px' }}>新增</Button>
            {/* <Button type="primary" nativeType="button" size="small" onClick={this.removeDepart}>删除</Button>
            <Button type="primary" nativeType="button" size="small">修改</Button> */}
          </Form.Item>
          <Form.Item>
            {this.state.defalutKeys.length>0?<Tree
              ref={e => this.tree = e}
              className="filter-tree"
              data={this.state.data}
              options={this.state.options}
              nodeKey="id"
              defaultExpandedKeys={this.state.defalutKeys}
              expandOnClickNode={true}
              default
              // isShowCheckbox={true}
              // onCheckChange={this.handleClick}
              // onNodeClicked={this.nodeClick}
              renderContent={(...args) => this.renderContent(...args)}
            />:''}
          </Form.Item>
        </Form>
        <Dialog
          title={this.state.isModify ? '部门修改' : '部门新增'}
          visible={this.state.dialogVisible1}
          onCancel={this.cancle}
        >
          <Dialog.Body>
            <Form model={this.state.form} rules={this.state.rules} ref='form'>
              <Form.Item label={`公司名称:${this.state.companyName}`} labelWidth="280" ></Form.Item>
              <Form.Item label="上级部门：" labelWidth="120" prop="superDept" className="input-style">
                <Select value={this.state.form.superDept} placeholder="请选择上级部门名称" onChange={this.onChange('superDept')} disabled={this.state.isModify ? true : false}>
                  {
                    this.state.department.map(data =>
                      <Select.Option key={data.id} label={data.deptName} value={data.id} >
                        <span style={{paddingLeft:data.padding+'px'}}>{data.deptName}</span>
                      </Select.Option>
                    )
                  }
                </Select>
              </Form.Item>
              <Form.Item label="部门名称：" labelWidth="120" prop="deptName" className="input-style">
                <Input value={this.state.form.deptName} placeholder="请输入部门名称" onChange={this.onChange('deptName')}></Input>
              </Form.Item>
            </Form>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer">
            {this.state.isModify ?
              <Button type="primary" onClick={this.modifySure}>确认修改</Button> :
              <Button type="primary" onClick={this.addSure}>确认新增</Button>
            }
            <Button onClick={this.cancle}>取 消</Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default Departlist
