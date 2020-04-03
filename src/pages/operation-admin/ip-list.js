import React from 'react'
import { Http } from '../../services'
import { Dialog,Layout,Button,DateRangePicker,Loading, Modal,Form, Message,Select, Input, Table, Pagination,MessageBox} from 'element-react'
import { parse } from 'query-string'
import { Redirect } from 'react-router-dom'
import 'element-theme-default'
import _ from 'lodash'
import {formatDate, handleEmpty, setStateWrap} from "../../utils";
import './ip-list.less'
class Iplist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      dialogVisible:false,
      data:[],
      provinceData: [],
      regionData: [],
      detailData:{},
      areaCode: '',
      regisAddress: '',
      ip:'',
      ipStatus:'',
      userVisit:'',
      opTime:['',''],
      columns: [
        {
          label: '编号',
          width:100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },
        {
          label: 'IP地址',
          prop: 'ip',
          width: 160
        },
        {
          label: '省份',
          prop: 'province',
          width: 160
        },

        {
          label: '城市',
          prop:'city',
          width: 160
        },
        {
          label: 'IP归属地',
          prop: 'ipAddress',
          width: 160
        },
        {
          label: '当日最后请求时间',
          prop: 'requestLast',
          width: 200
        },{
          label: '当日请求数量',
          prop: 'requestNums',
          width: 130
        },{
          label: '数据更新时间',
          prop: 'updatedAt',
          width: 200
        },
        {
          label: 'IP状态',
          prop: 'ipStatusStr',
          width: 100
        },
        {
          label: '用户状态',
          prop: 'userVisitStr',
          width: 100
        },
        {
          label: '操作',
          fixed:'right',
          width:100,
          render: (data, column) => {
            return (
              <span>
                {data.ipStatus? <Button type="text" size="small" onClick={() => this.changeIpStatus(data)}>禁用</Button>: <Button type="text" size="small" onClick={() => this.changeIpStatus(data)}>启用</Button>}
                {data.userId? <Button type="text" size="small" onClick={() => this.getDetail(data)}>详情</Button>
                :null}
               </span>
            )
          }
        }
      ]
    }
  }
  changeIpStatus=(data)=> {
    let {ipStatus} = data
    let ipStatusStr = ipStatus?'禁用':'启用'
    MessageBox.confirm(`此操作将${ipStatusStr}该条数据, 是否继续?`, '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/ipManage/manage`,{
        ip:data.ip,
        status:ipStatus?false:true
      }).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: `${ipStatusStr}成功!`
          })
          setTimeout(()=>{

            this.queryTableList(1)
          },1000)
        }else{
          Message({
            type:'error',
            message: `${ipStatusStr}失败!`+res.data.message
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
  getDetail=(data)=>{
    let id = data.userId
    this.setState({
      dialogVisible:true,
      detailData:{},
      loading:true
    })
    Http.get(`/cic/user/get/${id}`).then((res)=>{
      this.setState({
        loading:false
      })
      if(res.data.code == '0'){
        this.setState({
          detailData:res.data.content

        })
      }else{
        Message({
          type:'error',
          content:'获取用户信息失败'
        })
      }
    }).catch((err)=>{
      this.setState({
        loading:false
      })
    })
  }
  resetSearch=()=>{
    this.setState({
      page:1,
      areaCode: '',
      regisAddress: '',
      ip:'',
      ipStatus:'',
      userVisit:'',
      opTime:['','']
    },()=>{
      this.queryTableList(1)
    })
  }

  queryTableList = (page = 1) => {
    let {
      areaCode,
      regisAddress,
      ip,
      ipStatus,
      userVisit,
      opTime,size} = this.state
    let strobj={
      province:areaCode,
      city:regisAddress,
      ip,
      ipStatus,
      userVisit:userVisit=='1'?true:(userVisit=='0'?false:''),

    }
    if(opTime && opTime.length > 0) {
      if(!!opTime[0]) {
        strobj.opTimeStart = formatDate(opTime[0])
      }
      if(!!opTime[1]) {
        strobj.opTimeEnd = formatDate(opTime[1])
      }
    }
    strobj=handleEmpty(strobj)
    Http.post('/ipManage/select', { ...strobj, page,size })
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
  tableUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=resource-modify&id=${data.id}`
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
    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="IP地址：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('ip')} value={this.state.ip} />
          </Form.Item>
          <Form.Item label="状态：">
            <Select value={this.state.ipStatus} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('ipStatus')}>
              {
                [{label:'正常',value:true},{label:'黑名单',value:false}].map(el => {
                  return <Select.Option key={el.label} label={el.label} value={el.value} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="访问类型：">
            <Select value={this.state.userVisit} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('userVisit')}>
              {
                [{label:'用户访问',value:'1'},{label:'游客访问',value:'0'}].map(el => {
                  return <Select.Option key={el.label} label={el.label} value={el.value} />
                })
              }
            </Select>
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
          <Form.Item label="访问时间:">
            <DateRangePicker
              value={this.state.opTime}
              placeholder="选择日期范围"
              onChange={this.inputChange('opTime')}
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
        <Dialog
          title="相关用户信息"
          visible={ this.state.dialogVisible }
          customClass={'ip-list-dialog'}
          onCancel={ () => this.setState({ dialogVisible: false }) }
        >  <Loading loading={loading} text={'加载数据中'}>
          <Dialog.Body>

            {_.isEmpty(r)? null:<Layout.Row >
              <Layout.Col span="12">
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    用户账号
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'userAccount','')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    手机号
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'tel','')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    所属企业
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'companyName','')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    用户昵称
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'nickName','')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    邮箱地址
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'email','')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    性别
                  </Layout.Col>
                  <Layout.Col span="18">
                    {r.sex=='0'?'男':(r.sex=='1'?'女':'未知')}
                  </Layout.Col>
                </Layout.Row>
                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    创建时间
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'createTime','')}
                  </Layout.Col>
                </Layout.Row>
              </Layout.Col>
              <Layout.Col span="12">

                <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    账号等级
                  </Layout.Col>
                  <Layout.Col span="18">
                    {this.computeDict(_.get(r,'grade',''),'grade')}
                  </Layout.Col>
                </Layout.Row >
                {r.grade&&r.grade.indexOf('VIP')!=-1? <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    VIP开通时间
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'startTime','')}
                  </Layout.Col>
                </Layout.Row>:null}
                {r.grade&&r.grade.indexOf('VIP')!=-1? <Layout.Row style={{marginBottom:'10px'}}>
                  <Layout.Col span="6">
                    VIP到期时间
                  </Layout.Col>
                  <Layout.Col span="18">
                    {_.get(r,'endTime','')}
                  </Layout.Col>
                </Layout.Row>:null}
              </Layout.Col>
            </Layout.Row>}

          </Dialog.Body>
        </Loading>
        </Dialog>
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

export default Iplist
