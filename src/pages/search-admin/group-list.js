import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, DateRangePicker, Table, Pagination, Dialog, MessageBox, Message} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import UserAuth from './user-auth'
import GroupForm from './group-form'
import GroupDetail from './group-detail'

import _ from 'lodash'
class UserList extends React.Component {
  _isMounted = false
  myRef = React.createRef();
  state = {
    companyName:'',
    name:'',
    groupRole:'',
    grade:'',
    page: 1,
    size: 10,
    data: null,
    total:0,
    currentData:{},
    isupdate: false,
    dialogVisible: false,

    groupArr:[],
    columns: [{
      label: '序号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '姓名',
      prop: 'name',
      width:100
    }, {
      label: '证件号',
      prop: 'idNoMarked',
      width: 200
    }, {
      label: '性别',
      prop: 'gender',
      width: 100
    }, {
      label: '手机号码',
      prop: 'cellPhone',
      width: 150
    }, {
      label : '公司',
      prop: 'companyName',
      width:200
    }, {
      label: '班组身份',
      prop: 'groupRole',
      width:120,
    }, {
      label: '更新时间',
      prop: 'updateTime',
      width:190,
    }, {
      label: '操作',
      width:200,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.goDetail(data)}>查看详情</Button>
            <Button type="text" size="small" onClick={() => this.handleEdit(data)}>修改</Button>
            {this.handleCanDelete(data)?<Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>:<Button type="text" size="small" disabled={true}>删除</Button>}
          </p>
        )
      }
    }]
  }
  handleEdit=(data) => {
    this.setState({dialogVisible:true, isupdate:true, currentData:data}
    )
  }
  goDetail = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=group-detail&id=${data.id}`
    })
  }
  resetSearch = (data) => {
    this.setState({
      companyName:'',
      name:'',
      groupRole:'',
      vipStartTime:'',
      vipEndTime:'',
      page:1
    }, () => {
      this.fetchUserList()
      this.fetchGroupType()
    })
  }
  handleCanDelete=(data)=>{
    if(data.grade == 'NEED_AUTH_VIP'||data.grade == 'AUTH_VIP'){
      return false
    }
    if(data.childCount>0){
      return  false
    }
    return  true
  }
  computeDict=(str, type,data) => {
    const gradeDict = {
      NEED_AUTH_USER: '普通用户(未认证)',
      AUTH_USER:'普通用户(已认证)',
      NEED_AUTH_VIP:'VIP用户(未认证)',
      AUTH_VIP:'VIP用户(已认证)'
    }
    const childDict = {
      0: '主账号',
      1: '子账号'
    }
    const statusToActionDict = {
      1: '禁用',
      0:'启用'
    }
    if(type == 'grade') {
      return gradeDict[str] ? gradeDict[str] : ''


    } else if(type == 'child') {
      if(str == 1){
        return '子账号'
      }else{
        if(!!data.companyId){
          return '主账号'
        }else{
          return ''
        }
      }
      return childDict[str] ? childDict[str] : ''


    } else if (type == 'status') {
      return statusToActionDict[str] ? statusToActionDict[str] : ''
    }
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page - 1) * size)
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=person-update&id=${data.id}`
    })
  }
  handlePageChange = (page) => {

    this.fetchUserList(page)
  }
  handlEmpty=(data) => {

    let newdata = {}
    for(let key in data) {
      if(!!_.trim(data[key])&&!!data[key]) {
        newdata[key] = data[key]
      }
    }
    return newdata
  }
  fetchUserList = (mypage, size = 10) => {
    const page = mypage || this.state.page
    let {
      name,
      companyName,
      groupRole
    } = this.state
    let strobj = {
      name,
      companyName,
      groupRole
    }
    // 处理非空
    strobj = this.handlEmpty(strobj)
    Http.post('/chr/group/list', {
      ...strobj,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, {
          ...this.state,
          data: res.data.content,
          page,
          total:res.data.content.totalCount
        }, this._isMounted)
      }
    })
  }
  fetchGroupType = () => {
    Http.post('/dict/select', {
      dictType:'group_type',
      isNeed:false
    }).then(res => {
      if(res.data.content) {
        this.setState({
          groupArr:res.data.content
        })
      }
    })
  }
  handleChange = key => value => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }
  handleDelete = (data) => {
    console.log('handleDelete',data)
    MessageBox.confirm('此操作将删除该班组, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.post('/chr/group/delete', {
        ids:data.id
      }).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          this.fetchUserList()
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

  componentDidMount() {
    this._isMounted = true
    this.fetchUserList()
    this.fetchGroupType()
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchUserList()
      this.fetchGroupType()
    }
  }
  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    let Parse = parse(this.props.location.search)
    if(!isEmptyObject(Parse)) {
      if(!('page' in Parse) || !('id' in Parse)) {
        return <Redirect to={this.props.match.url} />
      }
      else if(Parse.page === 'group-detail' && Parse.id)
        return <GroupDetail />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <GroupForm ref={this.myRef} currentData={this.state.currentData} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible: false })} isupdate={this.state.isupdate} dialogVisible={this.state.dialogVisible}></GroupForm>

        <Form inline labelPosition={'right'} labelWidth={'100'}>
          <div>
            <Form.Item label="公司名称:" >
              <Input size="small" onChange={this.handleChange('companyName')} value={this.state.companyName} />
            </Form.Item>
            <Form.Item label="姓名:" >
              <Input size="small" onChange={this.handleChange('name')} value={this.state.name} />
            </Form.Item>
            <Form.Item label="班组身份:">
              <Select value={this.state.groupRole} placeholder={'请选择'} onChange={this.handleChange('groupRole')}>
                {this.state.groupArr.map((d, i) => {
                  return <Select.Option key={i} value={d.dictCode} label={d.dictName}></Select.Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={() => {this.setState({page:1});this.fetchUserList(1)}} icon={'search'}>搜索</Button>
              <Button onClick={() => this.resetSearch()} icon={'search'}>重置查询</Button>
              <Button onClick={() => {this.setState({isupdate:false, dialogVisible:true})}} >新增班组</Button>
            </Form.Item>
          </div>

        </Form>

        {
          this.state.data && <Table
            columns={this.state.columns}
            style={{width:'100%'}}
            data={this.state.data.content}
            stripe
          />
        }
        {
          this.state.data && this.state.data.content
            && this.state.data.content.length ?
            <div className="page-ct">
              <Pagination
                currentPage={this.state.page}
                total={this.state.total}
                pageSize={this.state.size}
                onCurrentChange={this.handlePageChange}
              />
            </div> : null
        }
      </React.Fragment>
    )
  }
}

export default UserList
