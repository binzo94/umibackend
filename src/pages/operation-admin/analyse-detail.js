import React from 'react'
import { Http } from '../../services'
import { withRouter } from 'react-router-dom'
import { parse } from 'query-string'
import {DateRangePicker,Message, Input,Button, Table, Pagination} from 'element-react'
import 'element-theme-default'
import './analyse-detail.less'
import _ from 'lodash'
import {formatDate, handleEmpty} from "../../utils";
import AnalyseTable from "../../component/analyse-table";
class AnalyseDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      data:[],
      userId:'',
      loading:false,
      detailData:{},
    }
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

  queryTableList = (page = 1) => {
    let {
      areaCode,
      regisAddress,
      ip,
      ipStatus,
      userVisit,
      loginLast,size} = this.state
    let strobj={
      province:areaCode,
      city:regisAddress,
      ip,
      ipStatus,
      userVisit,

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
  fetchUserDetail=(id)=>{
    this.setState({
      loading:false
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
  componentDidMount () {
     let queryobj = parse(this.props.location.search)
    this.setState({
      userId:queryobj.id
    })
    this.fetchUserDetail(queryobj.id)
  }

  componentDidUpdate (nextProps) {

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
    let {detailData:r} = this.state
    return (
      <React.Fragment>
        <div className={'analyse-tolist'} onClick={()=>{this.props.history.goBack()}}>&lt;返回列表</div>
        <div className={'analyse-detail-container'}>
          <div className={'analyse-userdetail-title'}>用户详情</div>
            <div className={'analyse-userdetail'}>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                     用户账号
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'userAccount','')}
                </div>
              </div>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                  用户昵称
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'nickName','')}
                </div>
              </div>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                  所属企业
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'companyName','')}
                </div>
              </div>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                  手机号码
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'tel','')}
                </div>
              </div>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                  邮箱地址
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'email','')}
                </div>
              </div>
              <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                  账号等级
                </div>
                <div className={'analyse-userdetail-value'}>
                  {this.computeDict(_.get(r,'grade',''),'grade')}
                </div>
              </div>
              {_.get(r,'grade','').indexOf('VIP')!=-1? <> <div className={'analyse-userdetail-item'}>
                  <div className={'analyse-userdetail-label'}>
                    购买时间
                  </div>
                  <div className={'analyse-userdetail-value'}>
                    {_.get(r,'startTime','')}
                  </div>
                </div>
                <div className={'analyse-userdetail-item'}>
                <div className={'analyse-userdetail-label'}>
                到期时间
                </div>
                <div className={'analyse-userdetail-value'}>
                  {_.get(r,'endTime','')}
                </div>
                </div></>:null}
            </div>
        </div>
        {this.state.userId?<div className={'analyse-tables'}>
          <div className={'analyse-table'}>
            <AnalyseTable text={'接口请求总数:'} type='request' userId={this.state.userId} url={'/userAnalyse/selectRequestUser'} ></AnalyseTable>
          </div>
          <div className={'analyse-table'}>
            <AnalyseTable text={'登录IP总数:'} type='ip' userId={this.state.userId} url={'/ipManage/selectUser'}></AnalyseTable>
          </div>
        </div>:null}

      </React.Fragment>
    )
  }
}

export default withRouter(AnalyseDetail)
