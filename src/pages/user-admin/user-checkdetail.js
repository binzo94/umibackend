import React from 'react'
import {Http} from '../../services'
import {Form, Input, Layout, Upload, Button, Message, Steps } from 'element-react'
import {} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link, withRouter} from 'react-router-dom'
import './user-checkdetail.less'
import _ from 'lodash'
class UserCheckDetail extends React.Component {

  state = {
    recheck:false,
    data:null,
    urls:[],
    recordList:[],
    form:{

    }
  }
  changeStatus=(status) => {

    // 调用审核/company/auth/check
    const {companyId, id} = this.state.data
    Http.post('/company/auth/check', {
      status,
      companyId,
      id,
      rejectReason: '',
      remark: ''
    }).then(res => {
      if(res.data.code == 0) {
        Message({
          type:'success',
          message:'操作成功!'
        })
        // 回退到列表页
        setTimeout(() => {
          this.props.history.goBack()}, 1500)
      }else{
        Message({
          type:'error',
          message:'操作失败!'+res.data.message
        })
      }
    })

  }
  computeDict= (value, type) => {
    const statusDict = {
      0:'待审核',
      1:'审核中',
      2:'通过',
      3:'未通过'
    }
    if(type = 'status') {
      return statusDict[value] ? statusDict[value] : ''
    }
    return ''
  }
  fetchOssUrlByIds=(ids) => {
    Http.post('/oss/get', {
      ids
    }).then(res => {
      if(res.data.code == 0) {
        this.setState({
          urls:res.data.content
        })


      }else{

      }
    })
  }
  componentDidMount() {
    let { location } = this.props
    let id = parse(location.search).id
    if(id) {
      // 获取详情数据
      console.log('获取公司', id)
      Http.get(`/company/auth/get/${id}`, {

      }).then(res => {
        if(res.data.code == 0) {
          let data = res.data.content
          let recordList=data.recordList
          _.isArray(recordList) && _.reverse(recordList)
          this.setState({
            data,
            recordList
          })
          // 调取ossid获取图片地址列表
          this.fetchOssUrlByIds([data.businessLicenseUrl ? data.businessLicenseUrl : '', data.idCardUrl ? data.idCardUrl : ''].join(','))
        }else{

        }
      })
    }else{
      this.props.history.push({
        pathname:this.props.match.url
      })
    }
  }


  componentDidUpdate() {

  }
  componentWillUnmount() {

  }

  render() {
    const {data, urls, recordList} = this.state
    if(!data) {
      return <div></div>
    }
    return <div className={'user-checkdetail'}>
      <h3 className="page-title">审核详情<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span></h3>
      <div className={'user-checkdetail-content'}>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>当前状态:</div>
          <div className='checkdetai-item-content'>{this.computeDict(data.status, 'status')}</div>

        </div>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>认证企业:</div>
          <div className='checkdetai-item-content'>{data.companyName}</div>
        </div>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>申请人:</div>
          <div className='checkdetai-item-content'>{data.createUserName}</div>
        </div>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>申请时间:</div>
          <div className='checkdetai-item-content'>{data.createTime}</div>
        </div>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>电话号码:</div>
          <div className='checkdetai-item-content'>{data.tel}</div>
        </div>
        <div className="user-checkdetail-infoitem">

          <div className='checkdetai-item-label'>邮箱:</div>
          <div className='checkdetai-item-content'>{data.email}</div>
        </div>
        <div className="user-checkdetail-infoitem">
          <div className='checkdetai-item-label'>营业执照:</div>
          <div className='checkdetai-item-content'><img src={urls[0] ? urls[0].resourceUrl : ''} alt=""/></div>

        </div>

        <div className="user-checkdetail-infoitem" style={{marginTop:'30px'}}>
          <div className='checkdetai-item-label'>个人名片:</div>
          <div className='checkdetai-item-content'><img src={urls[1] ? urls[1].resourceUrl : ''} alt=""/></div>

        </div>
        <div className="user-checkdetail-infoitem" style={{marginTop:'76px'}}>
          {this.state.data.status == '2'?'': (this.state.data.status=='0'||this.state.recheck ? <> <Button type='primary' onClick={() => this.changeStatus('2')} style={{border:'1px solid #20a0ff', padding:'10px 15px', marginLeft:'76px'}}>通过审核</Button>
            <Button type='text' style={{border:'1px solid #20a0ff', padding:'10px 15px', marginLeft:'50px'}} onClick={() => this.changeStatus('3')}>未通过审核</Button>
          </> : <Button type='text' onClick={() => {this.setState({recheck:!this.state.recheck})}} style={{border:'1px solid #20a0ff', padding:'10px 15px', marginLeft:'76px'}}>重新审核</Button>)
          }
           </div>
      </div>
      <div className='user-checkstep'>
        <Steps space={60} direction="vertical" >
          {_.isArray(recordList) ? recordList.map((d, i) => {
            return <Steps.Step title={d.operate_time + ' ' + d.operate_description} key={i}></Steps.Step>
          }) : ''}
        </Steps>
      </div>
    </div>
  }
}

export default withRouter(UserCheckDetail)
