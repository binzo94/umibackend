import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, Table, Pagination, DateRangePicker} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import UserAuth from './user-auth'
import _ from 'lodash'
class CompanyCertList extends React.Component {
  _isMounted = false

  state = {
    page: 1,
    size: 10,
    companyName: '', // 企业名称
    type: '', // 认领方式，1=用户提交，2=后台创建
    verifiesTimeStart: '', // 处理时间开始
    verifiesTimeEnd: '', // 处理时间结束
    verifiesTime:'',
    userName: '', // 认领人
    userAccount: '', // 用户账号
    systemUserName: '', // 处理人
    total:0,
    data: null,
    columns: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '企业名称',
      prop: 'companyName',
      width:190

    }, {
      label: '认领人',
      prop: 'cicUserName'
    }, {
      label: '用户账号',
      prop: 'userAccount'
    }, {
      label: '认证方式',
      prop: 'type',
      render: (data, columns, idx) => {
        return <>{this.computeDict(data.type,'type')}</>
      }
    }, {
      label : '处理员工',
      prop: 'systemUserName'
    }, {
      label: '最新处理时间',
      prop: 'verifiesTime',
        width:190,
        sortable:true
    }]
  }
  computeDict=(str, type) => {
    const typeDict = {
      1:"用户提交",
      2:'后台创建'
    }

    if(type == 'type') {
      return typeDict[str] ? typeDict[str] : ''


    }
  }
  handleUserAuth = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=user-auth&id=${data.id}`
    })
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1) * size)
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=person-update&id=${data.id}`
    })
  }
  handlePageChange = (page,size =10) => {
    this.fetchCertList(page)
  }
  fetchCertList = (mypage ,size) => {
    const page = mypage || this.state.page
    let {
      companyName,
      type,
      verifiesTime,
      userName,
      userAccount,
      systemUserName
    } = this.state
    let strobj = {
      companyName,
      type,
      userName,
      userAccount,
      systemUserName
    }
    // 处理非空
    strobj = this.handlEmpty(strobj)
    // 处理时间
    if(verifiesTime && verifiesTime.length > 0) {
      if(!!verifiesTime[0]) {
        strobj.verifiesTimeStart = formatDate(verifiesTime[0])
      }
      if(!!verifiesTime[1]) {
        strobj.verifiesTimeEnd = formatDate(verifiesTime[1])
      }
    }

    Http.get('/company/auth/list', {
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
  handleSearch = () =>{
    this.setState({
      page:1
    })
    this.fetchCertList(1)
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
  componentDidMount() {
    this._isMounted = true
    this.fetchCertList()
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchCertList()
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
        <Form inline labelWidth={100} labelPosition={'right'}>
          <div>
            <Form.Item label="企业名称:" >
              <Input size="small" onChange={this.handleChange('companyName')} value={this.state.companyName} />
            </Form.Item>
            <Form.Item label="认领方式:" >
              <Select value={this.state.type} placeholder={'请选择'} onChange={this.handleChange('type')}>
                {[{label:'用户提交', value:'1'}, {label: '后台创建', value: '2'}].map((d, i) => {
                  return <Select.Option key={i} value={d.value} label={d.label}></Select.Option>
                })}
              </Select>
            </Form.Item>
            <Form.Item label="处理时间:">
              <DateRangePicker
                value={this.state.verifiesTime}
                placeholder="选择日期范围"
                onChange={this.handleChange('verifiesTime') }
              />  </Form.Item>
            <Form.Item label="认领人:">
              <Input size="small" onChange={this.handleChange('userName')} value={this.state.userName} />
            </Form.Item>
            <Form.Item label="用户账号:">
              <Input size="small" onChange={this.handleChange('userAccount')} value={this.state.userAccount} />
            </Form.Item>
            <Form.Item label="处理员工:">
              <Input size="small" onChange={this.handleChange('systemUserName')} value={this.state.systemUserName} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" size="small" onClick={()=>this.handleSearch()} icon="search">查询</Button>
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

export default CompanyCertList
