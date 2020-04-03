import React from 'react'
import { Redirect } from 'react-router-dom'
import { Http } from '../../services'
import { parse } from 'query-string'
import { Button, Input, Select, Table, Pagination, Form,MessageBox,Message } from 'element-react'
import DomainAdd from './domain-add'
import 'element-theme-default'
import './role-list.css'
import _ from 'lodash'
import {handleEmpty} from "../../utils";

class DomainList extends React.Component {
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
          label: '域名',
          prop: 'domainName',
          width: 260
        },
        {
          label: '域名图标',
          width: 160,
          render: (data, column, idx) => {
            return <img src={data.icon} alt="" style={{height:'100%',width:'100%'}}/>
          }
        },
        {
          label: '状态',
          width: 80,
          render: (data, column, idx) => {
            return data.status=='1'? <span>启用</span>:<span>禁用</span>
          }
        },
        {
          label: '排序',
          prop:'sort'
        },
        {
          label: '操作',
          width: 200,
          fixed:'right',
          render: (data, column) => {
            return (
              <span>
                 <Button type="success" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
                <Button type="danger" size="small" onClick={() => this.tableDelete(data)}>删除</Button>
                {data.status!='1'?<Button type="primary" size="small" onClick={() => this.changeStatus(data)}>启用</Button>
                :<Button type="text" size="small" onClick={() => this.changeStatus(data)}>禁用</Button>
                }
                  </span>
            )
          }
        }
      ]
    }
  }
  tableDelete=(data)=>{
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.post(`/cic/domain/delete`,{ids:data.id}).then(res => {
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
  changeStatus=(data)=>{
    let tempState = ''
    if (data.status == '0') {
      tempState = '1'
    } else if (data.status == '1') {
      tempState = '0'
    }
    Http.post(`/cic/domain/enable`,{id:data.id,status:tempState})
      .then(res => {
        if (res.data.code == '0') {
          Message({
            type:'success',
            message: '操作成功!'
          })
          this.queryTableList()
        } else {
          Message({
            type:'error',
            message: '操作失败!'+res.data.message
          })
        }
      })
  }
  queryTableList = (page = 1) => {
    let { columns, options, data, ...state } = this.state
    state=handleEmpty(state)
    Http.get('/cic/domain/list', { ...state, page })
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
  goDomainAdd = ()=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=domain-add`
    })
  }
  tableUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=domain-modify&id=${data.id}`
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
      if (Parse.page === 'domain-modify' && Parse.id)
        return <DomainAdd isModifyPage={true} />
      return <Redirect to={this.props.match.url} />
    }else{
      if(Parse.page === 'domain-add'){
        return  <DomainAdd  />
      }
    }
    return (
      <React.Fragment>
        <Button type="success" className="b-size" onClick={this.goDomainAdd} style={{marginBottom:'10px'}}>新增域名</Button>
        <Table
          className="t-style"
          columns={this.state.columns}
          data={state.data}
          border={true}
          onSelectChange={(selection) => { console.log(selection) }}
          onSelectAll={(selection) => { console.log(selection) }}
        />
      </React.Fragment>
    )
  }
}

export default DomainList

