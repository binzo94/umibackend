import React from 'react'
import { Http } from '../../services'
import { Dialog,Layout,Button,DateRangePicker,Loading, Modal,Form, Message,Select, Input, Table, Pagination,MessageBox} from 'element-react'
import { parse } from 'query-string'
import { Redirect } from 'react-router-dom'
import 'element-theme-default'
import _ from 'lodash'
import {formatDate, handleEmpty, setStateWrap} from "../../utils";
import AnalyseDetail from "./analyse-detail";
import RoleAdd from "./role-add";
class UserAnalyse extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      dialogVisible:false,
      data:[],
      provinceData: [],
      regionData: [],
      areaCode: '',
      regisAddress: '',
      userAccount:'',
      tel:'',
      ip:'',
      loginLast:['',''],
      columns: [
        {
          label: '编号',
          width:100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },{
        label:'账号',
          prop:'userAccount',
          width:160
        },
        {
          label:'手机号',
          prop:'tel',
          width:160
        },
        {
          label: '最近访问IP',
          prop: 'loginIp',
          width: 160
        },
        {
          label: 'IP所在地',
          render:(data)=>{
            return <>{_.get(data,'ipProvince','')}{_.get(data,'ipCity','')}</>
          },
          width: 140
        },
        {
          label: '用户等级',
          prop: 'name',
          width: 160
        },
        {
          label: '当日接口次数',
          prop: 'countRequestNums',
          width: 140
        },
        {
          label: '最后统计时间',
          prop: 'opTime',
          minWidth: 140

        },{
          label: '最近登录时间',
          prop: 'loginLast',
          minWidth: 190

        },
        {
          label: '当日首次访问时间',
          prop: 'firstTime',
          minWidth: 190

        },
        {
          label: '操作',
          fixed:'right',
          align:'center',
          width:140,
          render: (data, column) => {
            return (
              <span>

                {data.userId? <Button type="text" size="small" onClick={() => this.getDetail(data)}>详情</Button>
                  :null}
               </span>
            )
          }
        }
      ]
    }
  }
  getDetail=(data)=>{
    let id = data.userId
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=analyse-detail&id=${id}`
    })
  }
  resetSearch=()=>{
    this.setState({
      page:1,
      areaCode: '',
      regisAddress: '',
      userAccount:'',
      tel:'',
      ip:'',
      loginLast:['','']
    },()=>{
      this.queryTableList(1)
    })
  }

  queryTableList = (page = 1) => {
    let {
      areaCode,
      regisAddress,
      userAccount,
      tel,
      ip,loginLast,size} = this.state
    let strobj={
      province:areaCode,
      city:regisAddress,
      userAccount,
      tel,
      ip
    }
    if(loginLast && loginLast.length > 0) {
      if(!!loginLast[0]) {
        strobj.loginLastStart = formatDate(loginLast[0])
      }
      if(!!loginLast[1]) {
        strobj.loginLastEnd = formatDate(loginLast[1])
      }
    }
    strobj=handleEmpty(strobj)
    Http.post('/userAnalyse/select', { ...strobj, page,size })
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

  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1)* size)
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
  handleSelectChange = level => value => {
    if(level == 1){
      this.setState({
        areaCode:value.name,
        regionData: []
      },()=>{
        this.fetchRegionData(2, value.id)
      })

    }else{
      this.setState({
        regisAddress:value.name
      })
    }
  }
  fetchRegionData = (level, id = 0) => {
    Http.get(`/dict/area/${id}`)
      .then(res => {
        if(res.data.content) {
          if(level === 1) {
            this.setState({
              provinceData: res.data.content
            })

          }

        }
        if (level === 2) {
          this.setState({
            regionData: res.data.content
          })
        }
      })
  }
  componentDidMount () {
    this.fetchRegionData(1)
    this.queryTableList()
  }

  componentDidUpdate (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.queryTableList()
    }
  }
  computeDict=(str, type) => {
    const gradeDict = {
      NEED_AUTH_USER: '普通用户(未认证)',
      AUTH_USER:'普通用户(已认证)',
      NEED_AUTH_VIP:'VIP用户(未认证)',
      AUTH_VIP:'VIP用户(已认证)'
    }
    if(type == 'grade') {
      return gradeDict[str] ? gradeDict[str] : ''


    }
  }
  render () {
    let {state} = this
    let {detailData:r ,loading} = this.state
    let { location, match, history } = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if (Parse.page == 'analyse-detail' && Parse.id){
        console.log('跳转')
        return <AnalyseDetail></AnalyseDetail>
      }else{
        return <Redirect to={this.props.match.url} />
      }


    }

    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="账号：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('userAccount')} value={this.state.userAccount} />
          </Form.Item>
          <Form.Item label="手机号：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('tel')} value={this.state.tel} />
          </Form.Item>
          <Form.Item label="IP地址：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('ip')} value={this.state.ip} />
          </Form.Item>
          <Form.Item label="所在地区:">
            <Select  style={{ marginRight: '15px', width:'90px'}} clearable size="small" value={this.state.areaCode} onChange={this.handleSelectChange(1)} placeholder="请选择">
              {
                this.state.provinceData.map(data =>
                  <Select.Option key={data.id} label={data.name} value={data} />
                )
              }
            </Select>
          </Form.Item>
          <Form.Item style={{marginRight:'30px'}}>
            <Select  style={{ marginRight: '15px', width:'90px'}} clearable size="small" value={this.state.regisAddress} onChange={this.handleSelectChange(2)} placeholder="请选择">
              {
                this.state.regionData.map(data =>
                  <Select.Option key={data.id} label={data.name} value={data} />
                )
              }
            </Select>
          </Form.Item>
          <Form.Item label="登录时间:">
            <DateRangePicker
              value={this.state.loginLast}
              placeholder="选择日期范围"
              onChange={this.inputChange('loginLast')}
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

export default UserAnalyse
