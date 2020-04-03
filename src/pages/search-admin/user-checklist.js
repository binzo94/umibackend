import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, Table, Pagination, DateRangePicker} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import UserCheckDetail from './worker-detail'
import _ from 'lodash'
class UserCheckList extends React.Component {
  _isMounted = false

  state = {
    companyName: '', // 企业名称
    status: '', // 审核状态
    createTimeStart: '', // 提交审核时间开始
    createTimeEnd: '', // 提交审核时间结束
    cicUserName: '', // 申请人
    cicUserAccount: '', // 账号
    verifiesTimeStart: '', // 处理时间开始
    verifiesTimeEnd: '', // 处理时间结束
    systemUserName: '', // 处理人,
    createTime:['', ''],
    verifiesTime:['', ''],
    suggestList: [],
    page: 1,
    size: 10,
    total:0,
    data: null,
    columns: [{
      label: '编号',
      width:100,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '企业名称',
      prop: 'companyName',
      width:120

    }, {
      label: '申请人',
      prop: 'cicUserName',
      width:120
    }, {
      label: '用户账号',
      prop: 'cicUserAccount',
      width:120
    }, {
      label: '审核状态',
      prop: 'status',
      width:120,
      render: (data, columns, idx) => {
        return <>{this.computeDict(data.status, 'status')}</>
      }
    }, {
      label : '处理员工',
      prop: 'systemUserName',
      width:120
    }, {
      label: '审核提交时间',
      prop: 'createTime',
        sortable: true,
      width:190
    }, {
      label: '最新处理时间',
      prop: 'verifiesTime',
        sortable: true
    }, {
      label: '操作',
      width:80,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.goDetail(data)}>查看详情</Button>
          </p>
        )
      }
    }]
  }
  computeDict=(str, type) => {
    const statusDict = {
      0: '待审核',
      1:'审核中',
      2:'通过',
      3:'未通过'
    }

    if(type == 'status') {
      var str1= statusDict[str] ? statusDict[str] : ''
      str=parseInt(str)
      var typebtn='success'
      switch(str) {
        case 0:
          typebtn='warning'
          break;
        case 1:
          typebtn='info'
          break;
        case 2:
          typebtn='success'
          break;
        case 3:
          typebtn='danger'
          break;
        default:
          typebtn='success'

      }

      return <Button type={typebtn} size={'small'}>{str1}</Button>

    }}
  handleUserAuth = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=user-auth&id=${data.id}`
    })
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page - 1) * size)
  }
  goDetail = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=user-checkdetail&id=${data.id}`
    })
  }
  handlePageChange = (page) => {
    this.fetchCheckList(page )
  }
  handlEmpty=(data) => {

    let newdata = {}
    for(let key in data) {
      if(!!_.trim(data[key])) {
        newdata[key] = data[key]
      }
    }
    return newdata
  }
  fetchCheckList = (mypage = 1, size= 10) => {
    const page = mypage || this.state.page
    let {
      companyName,
      status,
      cicUserName,
      cicUserAccount,
      systemUserName,
      createTime,
      verifiesTime
    } = this.state
    let strobj = this.handlEmpty({
      companyName,
      status,
      cicUserName,
      cicUserAccount,
      systemUserName
    })
    // 处理两个时间
    if(createTime && createTime.length > 0) {
      if(!!createTime[0]) {
        strobj.createTimeStart = formatDate(createTime[0])
      }
      if(!!createTime[1]) {
        strobj.createTimeEnd = formatDate(createTime[1])
      }
    }
    if(verifiesTime && verifiesTime.length > 0) {
      if(!!verifiesTime[0]) {
        strobj.verifiesTimeStart = formatDate(verifiesTime[0])
      }
      if(!!verifiesTime[1]) {
        strobj.verifiesTimeEnd = formatDate(verifiesTime[1])
      }
    }
    Http.get('/company/auth/user/check/list', {
      ...strobj,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, {
          ...this.state,
          data: res.data.content,
          page, total:res.data.content.totalCount
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
    Http.get(`/api/personInfo/delete/${data.id}`)
      .then(res => {
        if(res.data.code == '0') {
          alert('删除成功!')
          this.fetchCheckList()
        }
        if (res.data.code == '2') {
          alert(res.data.message)
        }
      })
      .catch(err => {})
  }
  resetSearch = (data) => {
    this.setState({
      companyName: '', // 企业名称
      status: '', // 审核状态
      cicUserName: '', // 申请人
      cicUserAccount: '', // 账号
      systemUserName: '', // 处理人,
      createTime:['', ''],
      verifiesTime:['', ''],
      page:1
    }, () => {
      this.fetchCheckList()
    })
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchCheckList()
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchCheckList()
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
      else if(Parse.page === 'user-checkdetail' && Parse.id)
        return <UserCheckDetail />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <Form inline labelWidth={100} labelPosition={'right'}>
          <div>
            <Form.Item label="企业名称:" >
              <Input size="small" onChange={this.handleChange('companyName')} value={this.state.companyName} />
            </Form.Item>
            <Form.Item label="审核状态:" >
              <Select value={this.state.status} placeholder={'请选择'} onChange={this.handleChange('status')}>
                {[{label:'待审核', value:'0'},{label: '通过', value: '2'},{label: '未通过', value: '3'}].map((d, i) => {
                  return <Select.Option key={i} value={d.value} label={d.label}></Select.Option>
                })}
              </Select>
                 </Form.Item>
            <Form.Item label="提交审核时间:">
              <DateRangePicker
                value={this.state.createTime}
                placeholder="选择日期范围"
                onChange={this.handleChange('createTime') }
              />
            </Form.Item>
            <Form.Item label="申请人:">
              <Input size="small" onChange={this.handleChange('cicUserName')} value={this.state.cicUserName} />
            </Form.Item>
            <Form.Item label="用户账号:">
              <Input size="small" onChange={this.handleChange('cicUserAccount')} value={this.state.cicUserAccount} />
            </Form.Item>
            <Form.Item label="最新处理时间:">
              <DateRangePicker
                value={this.state.verifiesTime}
                placeholder="选择日期范围"
                onChange={this.handleChange('verifiesTime') }
              />
            </Form.Item>
            <Form.Item label="处理员工:">
              <Input size="small" onChange={this.handleChange('systemUserName')} value={this.state.systemUserName} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" onClick={() => this.fetchCheckList()} icon="search">查询</Button>
              <Button onClick={() => this.resetSearch()} icon={'search'}>重置查询</Button>
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

export default UserCheckList
