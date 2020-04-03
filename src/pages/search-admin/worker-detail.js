import React from 'react'
import {Http} from '../../services'
import {Form, Input, Layout, Table, Button, Message, Pagination,Tabs } from 'element-react'
import {} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link, withRouter} from 'react-router-dom'
import { formatDate, isEmptyObject,setStateWrap } from '../../utils'
import './worker-detail.less'
import ProjectForm from './project-form'
import CerficationForm from './cerfication-form'

import _ from 'lodash'
class UserCheckDetail extends React.Component {
  myRef = React.createRef();
  state = {
    recheck:false,
    data:{},
    addData:{},
    projectList:[],
    cardList:[],
    urls:[],
    page1: 1,
    size1: 10,
    total1:0,
    isupdate1: false,
    dialogVisible1: false,
    currentData1:{},
    page2: 1,
    size2: 10,
    total2:0,
    isupdate2: false,
    dialogVisible2: false,
    currentData2:{},
    recordList:[],
    form:{

    },

    columns1: [{
      label: '序号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber1(idx)}</span>
      }
    },
    {
      label: '岗位',
      prop: 'workPostName',
      width:120
    }, {
      label: '开始时间',
      prop: 'joinDate',
      width: 150
    }, {
      label: '结束时间',
      prop: 'leaveDate',
      width: 150
    }, {
      label: '薪资待遇(元)',
      prop: 'salary',
      width: 150
    }, {
      label : '项目名称',
      prop: 'name',
      width:200
    }, {
      label: '建设单位',
      prop: 'jsName',
      width:200,
    }, {
      label: '施工单位',
      prop: 'sgUnitName', 
      width:190,
    },{
      label: '是否挂证',
      prop: 'hasCard', 
      width:190,
    },  {
      label: '操作',
      width:80,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleEdit1(data)}>修改</Button>
          </p>
        )
      }
    }],
    columns2: [{
      label: '序号',
      width:100,
      render: (data, column, idx) => {
        return <span>{this.tableNumber2(idx)}</span>
      }
    },
    {
      label: '证书名称',
      prop: 'certName',
      // width:200
    }, {
      label: '注册专业',
      prop: 'certCategory',
      // width: 200
    }, {
      label: '证书有效期',
      prop: 'endTime',
      // width: 200
    }, {
      label: '注册公司',
      prop: 'companyName',
      // width: 300
    }, {
      label: '操作',
      width:100,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleEdit2(data)}>修改</Button>
          </p>
        )
      }
    }]
  }

  handleEdit1=(data) => {
    this.setState({dialogVisible1:true, isupdate1:true, currentData1:data}
    )
  }
  handleEdit2=(data) => {
    this.setState({dialogVisible2:true, isupdate2:true, currentData2:data}
    )
  }
  tableNumber1 = (idx) => {
    let {page1, size1} = this.state
    return (idx + 1) + ((page1 - 1) * size1)
  }
  tableNumber2 = (idx) => {
    let {page2, size2} = this.state
    return (idx + 1) + ((page2 - 1) * size2)
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
  fetchUserList = (mypage, size = 10) => {
    let { location } = this.props
    let id = parse(location.search).id
    const page = mypage || this.state.page1
    Http.post(`/chrRecruit/worker/selectProjectList`, {
      workerId:id,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        this.setState({
          projectList: res.data.content.content,
          page1:page,
          total1:res.data.content.totalCount
        })
      }
    })
  }
  fetchCardList = (mypage, size = 10) => {
    let { location } = this.props
    let id = parse(location.search).id
    const page = mypage || this.state.page2
    Http.post(`/chrRecruit/worker/selectCertificatesList`, {
      workerId:id,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        this.setState({
          cardList: res.data.content.content,
          page2:page,
          total2:res.data.content.totalCount
        })
      }
    })
  }
  componentDidMount() {
    let { location } = this.props
    let id = parse(location.search).id
    if(id) {
      // 获取详情数据
      Http.get(`/chrRecruit/worker/selectById/${id}`, {

      }).then(res => {
        if(res.data.code == 0) {
          this.setState({
            data:res.data.content
          })
        }
      })
      this.fetchUserList()
      this.fetchCardList()
    }else{
      this.props.history.push({
        pathname:this.props.match.url
      })
    }
  }

  handlePageChange = (page) => {

    this.fetchUserList(page)
  }
  handlePageChange2 = (page) => {

    this.fetchCardList(page)
  }
  resetSearch = (data) => {
    this.setState({
    }, () => {
      this.fetchUserList()
      this.fetchCardList()
    })
  }

  componentDidUpdate() {

  }
  componentWillUnmount() {

  }

  render() {
    const {data, urls, recordList} = this.state
    // if(!data) {
    //   return <div></div>
    // }
    return <div className={'user-checkdetail'}>
      <ProjectForm ref={this.myRef} currentData={this.state.currentData1} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible1: false })} isupdate={this.state.isupdate1} dialogVisible={this.state.dialogVisible1}></ProjectForm>
      <CerficationForm ref={this.myRef} currentData={this.state.currentData2} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible2: false })} isupdate={this.state.isupdate2} dialogVisible={this.state.dialogVisible2}></CerficationForm>

      <h3 className="page-title">简历详情<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span></h3>
      <div className='first-div'>
        <div style={{fontSize:'16px',width:'200px'}}>姓名<span style={{marginLeft:'62px'}}>{data.name}</span></div>
        <div style={{fontSize:'16px',width:'180px'}}>性别<span style={{marginLeft:'30px'}}>{data.gender === 'MALE' ? '男':  data.gender === 'FEMALE'?'女':''}</span></div>
        <div style={{fontSize:'16px',width:'300px'}}>证件号<span style={{marginLeft:'30px'}}>{data.idNo}</span></div>
        <div style={{fontSize:'16px',width:'200px'}}>出生时间<span style={{marginLeft:'30px'}}>{data.birthAt ? formatDate(data.birthAt,false) : ''}</span></div>
      </div>
      <div className='first-div'>
        <div style={{fontSize:'16px',width:'200px'}}>婚姻状况<span style={{marginLeft:'30px'}}>{data.maritalStatus == '01' ? '未婚' : data.maritalStatus == '02' ? '已婚' : data.maritalStatus == '03' ? '离异' : data.maritalStatus == '04' ? '丧偶' : ''}</span></div>
        <div style={{fontSize:'16px',width:'180px'}}>学历<span style={{marginLeft:'30px'}}>{data.degreeName}</span></div>
        <div style={{fontSize:'16px',width:'300px'}}>手机号<span style={{marginLeft:'30px'}}>{data.cellPhone}</span></div>
        <div style={{fontSize:'16px',width:'200px'}}><span style={{marginLeft:'30px'}}></span></div>
      </div>
      <Tabs activeName="1" onTabClick={ (tab) => console.log(tab.props.name) } style={{marginTop:'50px'}}>
        <Tabs.Pane label="项目履历" name="1">
          <Button onClick={()=>{this.setState({isupdate1:false, dialogVisible1:true,currentData1:this.state.data})}} type="primary">新增项目履历</Button>
          {
            // this.state.data && 
            <Table
              columns={this.state.columns1}
              style={{width:'100%',marginTop:'20px'}}
              data={this.state.projectList}
              stripe
            />
          }
          {
            // this.state.data && this.state.data.content
              // && this.state.data.content.length ?
              <div className="page-ct">
                <Pagination
                  currentPage={this.state.page1}
                  total={this.state.total1}
                  pageSize={this.state.size1}
                  onCurrentChange={this.handlePageChange}
                />
              </div> 
              // : null
          }
        </Tabs.Pane>
        <Tabs.Pane label="资格证书" name="2">
          <Button onClick={()=>{this.setState({isupdate2:false, dialogVisible2:true})}} type="primary">新增资格证书</Button>
          {
            // this.state.data && 
            <Table
              columns={this.state.columns2}
              style={{width:'100%',marginTop:'20px'}}
              data={this.state.cardList}
              stripe
            />
          }
          {
            // this.state.data && this.state.data.content
              // && this.state.data.content.length ?
              <div className="page-ct">
                <Pagination
                  currentPage={this.state.page2}
                  total={this.state.total2}
                  pageSize={this.state.size2}
                  onCurrentChange={this.handlePageChange2}
                />
              </div> 
              // : null
          }
        </Tabs.Pane>

      </Tabs>
    </div>
  }
}

export default withRouter(UserCheckDetail)
