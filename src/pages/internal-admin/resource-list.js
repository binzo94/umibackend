import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input, Table, Pagination,MessageBox,Message} from 'element-react'
import { parse } from 'query-string'
import { Redirect } from 'react-router-dom'
import 'element-theme-default'
import './role-add.css'
import ResourceAdd from './resource-add'
import {handleEmpty} from "../../utils";


class Resourcelist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 10,
      per_name: '',
      parent_id: '',
      sys_id: '',
      status:'',
      data: [],
      superior: [],
      system: [],
      columns: [
        {
          label: '编号',
          prop: 'rn',
          width: 150
        },
        {
          label: '名称',
          prop: 'per_name',
          width: 160
        },
        {
          label: '上级名称',
          prop: 'parent_name'
        },
        {
          label: '所属系统',
          prop: 'sys_name'
        },

        {
          label: '状态',
          prop: 'status',
          render:function (data) {
            let obj= {'0':'禁用','1':'启用'}
            return obj[data.status]?obj[data.status]:''
          }
        },
        {
          label: '更新员工',
          prop: 'user_name'
        },
        {
          label: '更新时间',
          prop: 'updated_at'
        },
        {
          label: '操作',
          width: 130,
          render: (data, column) => {
            return (
              <span>
                <Button type="text" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
                <Button type="text" size="small" onClick={() => this.tableDelete(data)}>删除</Button>
              </span>
            )
          }
        }
      ]
    }
  }

  resetSearch=()=>{
  this.setState({
    page:1,
    per_name: '',
    parent_id: '',
    sys_id: '',
    status:''
  },()=>{
    this.queryTableList(1)
  })
  }

  queryTableList = (page = 1) => {
    let { columns, form, data, superior, system, ...state } = this.state
    state=handleEmpty(state)
    Http.get('/system/resource/select', { ...state, page })
      .then(res => {
        if (res.data.content) {
          this.setState({
            ...this.state,
            data: res.data.content,
            page
          })
        }
      })
  }


  tableUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=resource-modify&id=${data.id}`
    })
  }

  tableDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/system/resource/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          this.queryTableList()
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

  querySuperior = () => {
    Http.get('/system/resource/parent/list')
      .then(res => {
        if (res.data.content) {
          this.setState({
            superior: res.data.content
          })
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
        }
      })
  }

  getSubmit = () => {
    this.queryTableList()
  }

  changePage = (page) => {
    this.queryTableList(page)
  }

  inputChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  chooseHandle = (value) => {
    this.setState({
      ...this.state,
      parent_id: value
    })
  }

  chooseSelect = (value) => {
    this.setState({
      ...this.state,
      sys_id: value
    })
  }

  componentDidMount () {
    this.querySuperior()
    this.querySystem()
    this.queryTableList()
  }

  componentDidUpdate (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.queryTableList()
    }
  }

  render () {
    let { ...state } = this.state
    let { location, match, history } = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if (Parse.page === 'resource-modify' && Parse.id)
        return <ResourceAdd isModifyPage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="权限节点名称：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('per_name')} value={this.state.per_name} />
          </Form.Item>
          <Form.Item label="上级名称：">
            <Select value={this.state.parent_id} placeholder="未选择" onChange={this.chooseHandle}>
              {
                this.state.superior.map(el => {
                  return <Select.Option key={el.id} label={el.per_name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="所属系统：">
            <Select value={this.state.sys_id} placeholder="未选择" onChange={this.chooseSelect}>
              {
                this.state.system.map(el => {
                  return <Select.Option key={el.id} label={el.sys_name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="状态:">
            <Select value={this.state.status} placeholder="请选择" onChange={this.inputChange('status')}>
              {
                [{label:'启用',value:'1'},{label:'禁用',value:'0'}].map(el => {
                  return <Select.Option key={el.value} label={el.label} value={el.value} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon="search" className="b-size" onClick={this.getSubmit} >搜索</Button>
            <Button type="text"
                    style={{border:'1px solid', paddingLeft:'5px', paddingRight:'5PX'}}
                    nativeType="button"
                    onClick={() => this.resetSearch()}>
              重置搜索</Button>
          </Form.Item>
        </Form>

        <Table
          className="t-style"
          columns={this.state.columns}
          data={state.data.PageInfo}
          border={true}
          onSelectChange={(selection) => { console.log(selection) }}
          onSelectAll={(selection) => { console.log(selection) }}
        />
        <div className="page-style">
          <Pagination total={state.data.totalCount} pageSize={state.pageSize} currentPage={state.page} onCurrentChange={this.changePage} />
        </div>
      </React.Fragment>
    )
  }
}

export default Resourcelist
