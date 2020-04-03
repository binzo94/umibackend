import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, DateRangePicker, Table, Pagination, Dialog, MessageBox, Message} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import UserAuth from './user-auth'
import UserForm from './user-form'
import _ from 'lodash'
class UserList extends React.Component {
  _isMounted = false
  myRef = React.createRef();
  state = {
    userName:'',
    tel:'',
    companyName:'',
    userAccount:'',
    grade:'',
    isChild:'',
    createtime:['', ''],
    viptime:['',''],
    vipexpiretime:['',''],
    suggestList: [],
    page: 1,
    size: 10,
    editdata:{},
    data: null,
    total:0,
    currentData:{},
    isupdate: false,
    dialogVisible: false,

    acclevel:[{
      label:'游客',
      value:'NEED_LOGIN'
    }, {
      label: '普通用户(未认证)',
      value: 'NEED_AUTH_USER'
    }, {
      label:'普通用户(已认证)',
      value:'AUTH_USER'
    }, {
      label:'VIP用户(未认证)',
      value:'NEED_AUTH_VIP'
    }, {
      label:'VIP用户(已认证)',
      value:'AUTH_VIP'
    }],
    columns: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '姓名',
      prop: 'userName',
      width:100
    }, {
      label: '电话号码',
      prop: 'tel',
      width: 150
    }, {
      label: '账号',
      prop: 'userAccount',
      width: 150
    }, {
      label: '昵称',
      prop: 'nickName',
      width: 150
    }, {
      label : '所属企业',
      prop: 'companyName',
      width:120
    }, {
      label: '账号等级',
      prop: 'grade',
      width:160,
      render: (data, columns, idx) => {
        return <>{this.computeDict(data.grade, 'grade')}</>
      }
    }, {
      label: '账号属性',
      width:120,
      prop: 'child',
      render: (data, columns, idx) => {
        return <>{this.computeDict(data.child, 'child',data)}</>
      }
    }, {
      label: '创建时间',
      prop: 'createTime',
      sortable: true,
      width:190
    }, {
      label: '开通VIP时间',
      prop: 'startTime',
      sortable: true,
      width:190
    }, {
      label: '到期时间',
      prop: 'endTime', width:190,
      sortable: true
    }, {
      label: '最近登录',
      prop: 'loginDate', width:190,
      sortable: true
    }, {
      label: '登录次数',
      prop: 'visits',
      width:100,
      sortable: true
    }, {
      label: '操作',
      width:180,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleIsUse(data)}>{this.computeDict(data.status, 'status')}</Button>
            <Button type="text" size="small" onClick={() => this.handleEdit(data)}>编辑</Button>
            {_.trim(data.companyName) != '' ? <Button type='text' disabled={true} size={'small'}>认证</Button> : <Button type="text" size="small" onClick={() => this.handleUserAuth(data.userId)}>认证</Button>}
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
  resetSearch = (data) => {
    this.setState({
      userName:'',
      tel:'',
      companyName:'',
      userAccount:'',
      grade:'',
      isChild:'',
      createtime:['', ''],
      viptime:['',''],
      vipexpiretime:['',''],
      vipStartTime:'',
      vipEndTime:'',
      page:1
    }, () => {
      this.fetchUserList()
    })
  }
  handleIsUse = (data) => {
    // 判断是否
    console.log(data)
    const id = data.userId
    const newStatus = data.status == 1 ? '0' : '1'
    const actionType = data.status == 1 ? '禁用' : '启用'
    MessageBox.confirm(`此操作将${actionType}该用户, 是否继续?`, '提示', {
      type: 'warning'
    }).then(() => {
      Http.post('/cic/user/enable', {
        ids:id,
        child:data.child,
        status:newStatus
      }).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: `${actionType}成功!`
          })
          this.fetchUserList()

        }else{
          Message({
            type:'error',
            message: '操作失败!'+res.data.message
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
  handleUserAuth=(id) => {
    this.props.history.push(
      {
        pathname: this.props.match.url,
        search: `page=user-auth&id=${id}`
      })
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
      userName,
      tel,
      companyName,
      userAccount,
      grade,
      isChild,
      createtime,
      vipStartTime,
      vipEndTime,
      viptime,
      vipexpiretime
    } = this.state
    let strobj = {
      userName,
      tel,
      companyName,
      userAccount,
      grade,
      isChild
    }
    // 处理非空
    strobj = this.handlEmpty(strobj)
    // 处理时间
    if(createtime && createtime.length > 0) {
      if(!!createtime[0]) {
        strobj.createTimeStart = formatDate(createtime[0])
      }
      if(!!createtime[1]) {
        strobj.createTimeEnd = formatDate(createtime[1])
      }
    }
    if(viptime && viptime.length > 0) {
      if(!!viptime[0]) {
        strobj.vipStartTime = formatDate(viptime[0])
      }
      if(!!viptime[1]) {
        strobj.vipEndTime = formatDate(viptime[1])
      }
    }
    if(vipexpiretime && vipexpiretime.length > 0) {
      if(!!vipexpiretime[0]) {
        strobj.vipExpireTimeStart = formatDate(vipexpiretime[0])
      }
      if(!!vipexpiretime[1]) {
        strobj.vipExpireTimeEnd = formatDate(vipexpiretime[1])
      }
    }
    Http.get('/cic/user/list', {
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

  handleChange = key => value => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }
  handleDelete = (data) => {
    const {userId:id} = data
    MessageBox.confirm('此操作将删除该用户, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.post('/cic/user/delete', {
        ids:id
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
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchUserList()
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
      else if(Parse.page === 'user-auth' && Parse.id)
        return <UserAuth />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <UserForm ref={this.myRef} currentData={this.state.currentData} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible: false })} isupdate={this.state.isupdate} dialogVisible={this.state.dialogVisible}></UserForm>

        <Form inline labelPosition={'right'} labelWidth={'100'}>
          <div>
            <Form.Item label="用户姓名:" >
              <Input size="small" onChange={this.handleChange('userName')} value={this.state.userName} />
            </Form.Item>
            <Form.Item label="电话号码:" >
              <Input size="small" onChange={this.handleChange('tel')} value={this.state.tel} />
            </Form.Item>
            <Form.Item label="所属企业:">
              <Input size="small" onChange={this.handleChange('companyName')} value={this.state.companyName} />
            </Form.Item>
            <Form.Item label="账号:" >
              <Input size="small"  onChange={this.handleChange('userAccount')} value={this.state.userAccount} />
            </Form.Item>
            <Form.Item label="账号等级:">
              <Select value={this.state.grade} placeholder={'请选择'} onChange={this.handleChange('grade')}>
                {this.state.acclevel.map((d, i) => {
                  return <Select.Option key={i} value={d.value} label={d.label}></Select.Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item label="账号属性:">
              <Select value={this.state.isChild} placeholder={'请选择'} onChange={this.handleChange('isChild')}>
                {[{label:'子账号', value:'1'}, {label: '主账号', value: '0'}].map((d, i) => {
                  return <Select.Option key={i} value={d.value} label={d.label}></Select.Option>
                })}
              </Select>
            </Form.Item>

            <Form.Item label="创建时间:">
              <DateRangePicker
                value={this.state.createtime}
                placeholder="选择日期范围"
                onChange={this.handleChange('createtime') }
              />

            </Form.Item>
            <Form.Item label="开通VIP时间:">
              <DateRangePicker
                  value={this.state.viptime}
                  placeholder="选择日期范围"
                  onChange={this.handleChange('viptime') }
              />
            </Form.Item>
            <Form.Item label="到期时间:">
              <DateRangePicker
                  value={this.state.vipexpiretime}
                  placeholder="选择日期范围"
                  onChange={this.handleChange('vipexpiretime') }
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={() => {this.setState({page:1});this.fetchUserList(1)}} icon={'search'}>搜索</Button>
              <Button onClick={() => this.resetSearch()} icon={'search'}>重置查询</Button>
              <Button onClick={() => {this.setState({isupdate:false, dialogVisible:true})}} icon={'search'}>新增用户</Button>
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
