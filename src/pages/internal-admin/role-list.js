import React from 'react'
import { Redirect } from 'react-router-dom'
import { Http } from '../../services'
import { parse } from 'query-string'
import { Button, Input, Select, Table, Pagination, Form,MessageBox,Message } from 'element-react'
import RoleAdd from './role-add'
import 'element-theme-default'
import './role-list.css'
import {handleEmpty} from "../../utils";

class Rolelist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 10,
      role_name: '',
      status: '1',
      data: [],
      options: [
        {
          value: '1',
          label: '可用'
        },
        {
          value: '0',
          label: '冻结'
        }
      ],
      columns: [
        // {
        //   type: 'selection'
        // },
        {
          label: '编号',
          prop: 'rn',
          width: 150
        },
        {
          label: '角色名称',
          prop: 'role_name',
          width: 160
        },
        {
          label: '角色描述',
          prop: 'role_desc'
        },
        {
          label: '状态',
          prop: 'status',
          render: (data, column) => {
            return (
              <>{data.status == 0 ? '冻结' : '可用'}</>
            )
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

  queryTableList = (page = 1) => {
    let { columns, options, data, ...state } = this.state
    state=handleEmpty(state)
    Http.get('/system/role/select', { ...state, page })
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

  tableDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/system/role/delete/${data.id}`).then(res => {
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

  getSubmit = () => {
    this.queryTableList()
  }

  changePage = (page) => {
    this.queryTableList(page)
  }

  chooseHandle = (value) => {
    this.setState({
      ...this.state,
      status: value
    })
  }

  tableUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=role-modify&id=${data.id}`
    })
  }

  inputChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  resetSearch=()=>{
    this.setState({
      page: 1,
      role_name: '',
      status: '',
    },()=>{
      this.queryTableList()
    })
  }
  addRole = () => {
    this.props.history.push('/internal-admin/role-add')
  }

  componentDidMount () {
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
      if (Parse.page === 'role-modify' && Parse.id)
        return <RoleAdd isModifyPage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="角色名称：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('role_name')} value={this.state.role_name} />
          </Form.Item>
          <Form.Item label="状态：">
            <Select value={this.state.status} placeholder="未选择" onChange={this.chooseHandle}>
              {
                this.state.options.map(el => {
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

export default Rolelist

