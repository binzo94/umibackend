import React from 'react'
import { Http } from '../../services'
import { Button, Form, Input, Table, DateRangePicker,Pagination,Message,MessageBox ,Select,AutoComplete} from 'element-react'
import { parse } from 'query-string'
import { Redirect } from 'react-router-dom'
import 'element-theme-default'
import './sys-user-list.css'
import _ from 'lodash'
import UserAdd from './sys-user-add'
import {formatDate, handleEmpty} from "../../utils";

class userList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 10,
      user_account: '',
      user_name: '',
      mobile: '',
      status:'',
      updatetime:['',''],
      operator:'',
      operatorobj:{},
      data: [],
      columns: [
        {
          label: '编号',
          prop: 'rn',
          width: 150
        },
        {
          label: '账号',
          prop: 'user_account',
          width: 160
        },
        {
          label: '用户姓名',
          prop: 'user_name'
        },
        {
          label: '用户角色',
          prop: 'role_name'
        },
        {
          label: '状态',
          prop: 'status',
          render:function (data) {
            let obj= {'0':'禁用','1':'可用'}
            return obj[data.status]?obj[data.status]:''
          }
        },
        {
          label: '更新员工',
          prop: 'modifier'
        },
        {
          label: '更新时间',
          prop: 'updated_at'
        },
        {
          label: '操作',
          width: 130,
          render: (data) => {
            return (
              <span>
                <Button type="text" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
                {/* <Button type="text" size="small" onClick={() => this.tableEnable(data)} plain={true} className={data.status === '1' ? 'highlight' : 'gray'}>{data.status === '1' ? '启用' : '禁用'}</Button> */}
                {data.status == '1' ?
                  <Button type="text" size="small" onClick={() => this.tableEnable(data)} style={{ color: 'gray' }}>禁用</Button> :
                  <Button type="text" size="small" onClick={() => this.tableEnable(data)} style={{ color: 'blue' }}>启用</Button>
                }
                <Button type="text" size="small" onClick={() => this.tableDelete(data)}>删除</Button>
              </span>
            )
          }
        }
      ]
    }
  }

  addResource = () => {
    this.props.history.push('/internal-admin/sys-user-add')
  }

  queryTableList = (page = 1) => {
    let { columns, data,operator,
      user_account,
      user_name,
      mobile,
      pageSize,
      updatetime,
      status} = this.state
    let strobj = {
      user_account,
      user_name,
      mobile,
      pageSize,
      status
    }
     strobj=handleEmpty(strobj)
    if(this.state.operatorobj.name == operator) {
      strobj.updatedUser = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
    }
    if(updatetime && updatetime.length > 0) {
      if(!!updatetime[0]) {
        strobj.updatedTimeStart= formatDate(updatetime[0])
      }
      if(!!updatetime[1]) {
        strobj.updatedTimeEnd = formatDate(updatetime[1])
      }
    }
    Http.get('/system/user/select', { ...strobj, page })
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
      search: `page=sys-user-modify&id=${data.id}`
    })
  }

  tableEnable = (data) => {
    let tempState = ''
    if (data.status == '0') {
      tempState = '1'
    } else if (data.status == '1') {
      tempState = '0'
    }
    Http.get(`/system/user/update/status/${data.id}/${tempState}`)
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

  tableDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/system/user/delete/${data.id}`).then(res => {
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

  inputChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  fetchOperator=(str, cb) => {
    Http.get('/system/user/operator', {
      name:str
    })
      .then(res => {
        if (res.data.code == 0) {
          let list = []
          let {content} = res.data
          for(let key in content) {
            list.push({
              value:content[key].userName,
              id:content[key].id
            })
          }
          cb(list)
        }})
  }
  handleOperatorObj=(item) => {
    this.setState({
      operator:item.value,
      operatorobj:{
        name:item.value,
        id:item.id
      }
    })
  }
  resetSearch=()=>{
    this.setState({
      page: 1,
      pageSize: 10,
      user_account: '',
      user_name: '',
      mobile: '',
      status:'',
      operator:'',
      operatorobj:{},

      updatetime:['','']

    },()=>{
      this.queryTableList()
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
      if (Parse.page === 'sys-user-modify' && Parse.id)
        return <UserAdd isModifyPage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="账号">
            <Input className="i-size" placeholder="请输入账号" onChange={this.inputChange('user_account')} value={this.state.user_account} />
          </Form.Item>
          <Form.Item label="姓名">
            <Input className="i-size" placeholder="请输入姓名" onChange={this.inputChange('user_name')} value={this.state.user_name} />
          </Form.Item>
          <Form.Item label="手机号">
            <Input className="i-size" placeholder="请输入手机号" onChange={this.inputChange('mobile')} value={this.state.mobile} />
          </Form.Item>
          <Form.Item label="状态">
            <Select value={this.state.status} placeholder="请选择" onChange={this.inputChange('status')}>
              {
                [{label:'启用',value:'1'},{label:'禁用',value:'0'}].map(el => {
                  return <Select.Option key={el.value} label={el.label} value={el.value} />
                })
              }
            </Select>
              </Form.Item>
          <Form.Item style={{marginRight:'30px'}} label={'更新员工:'}>
            <AutoComplete
              placeholder="请输入"
              value={this.state.operator}
              fetchSuggestions={_.throttle(this.fetchOperator, 1000)}
              onSelect={this.handleOperatorObj.bind(this)}
              triggerOnFocus={false}
              style={{width:'100%'}}
            ></AutoComplete>
          </Form.Item>
          <Form.Item label="更新时间:" style={{marginRight:'15px'}}>
            <DateRangePicker
              value={this.state.updatetime}
              placeholder="选择日期范围"
              onChange={this.inputChange('updatetime') }
            />

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

export default userList
