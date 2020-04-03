import React from 'react'
import { Redirect } from 'react-router-dom'
import { Http } from '../../services'
import { parse } from 'query-string'
import { Button, Input, Select, Table, Pagination, Form,MessageBox,Message } from 'element-react'
import RoleAdd from './role-add'
import 'element-theme-default'
import './role-list.css'
import _ from 'lodash'
import {handleEmpty} from "../../utils";

class Rolelist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      data: [],
      columns: [
        {
          label: '编号',
          width:100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },
        {
          label: '角色名称',
          prop: 'name',
          width: 160
        },
        {
          label: '标识',
          prop: 'sign',
          width: 160
        },
        {
          label: '备注',
          prop: 'remark',
          width: 160
        },{
         label:'更新人',
          prop:'updateUser',
          width: 160
        },{
          label:'更新时间',
          prop:'updateTime',
          width: 210,
          render:(data,colum)=>{
            let timestr = _.get(data,'updateTime','')
            return  typeof timestr == 'string'&&timestr.toLowerCase()!='null'?<>{timestr.substr(0,19)}</>:''
          }
        },{
        label:'请求上限',
          prop:'requestLimit',
          width: 160
        },
        {
          label:'子账号上限',
          prop:'childUserLimit',
          width: 160
        },{
          label:'终端上限',
          prop:'terminalLimit',
          width: 160
        },{
          label:'预警次数',
          prop:'warningLimit',
          width: 160
        },{
          label:'额外次数',
          prop:'additionalLimit',
          width: 160
        },
        {
          label: '操作',
          width: 130,
          fixed:'right',
          render: (data, column) => {
            return (
              <span>
                <Button type="text" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
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
    Http.get('/cic/role/list', { ...state, page })
      .then(res => {
        if (res.data.content) {
          this.setState({
            data: res.data.content,
            page
          })
        }
      })
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1)* size)
  }
  changePage = (page) => {
    this.queryTableList(page)
  }
  goRoleAdd = ()=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=role-add`
    })
  }
  tableUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=role-modify&id=${data.id}`
    })
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
    }else{
      if(Parse.page === 'role-add'){
        return  <RoleAdd  />
      }
    }
    return (
      <React.Fragment>
        
        <Button type="success" className="b-size" onClick={this.goRoleAdd} style={{marginBottom:'10px'}}>新增角色</Button>
        <Table
          className="t-style"
          columns={this.state.columns}
          data={state.data.content}
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

