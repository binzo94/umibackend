import React from 'react'
import {Http} from '../../services'
import {Form, Input, Layout, Table, Button, Message, Pagination,Tabs,Popover } from 'element-react'
import {} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link, withRouter} from 'react-router-dom'
import './worker-detail.less'
import CurrForm from './curriculum-form'

import _ from 'lodash'
class GroupDetail extends React.Component {
  myRef = React.createRef();
  state = {
    data:{},
    projectList:[],
    urls:[],
    page1: 1,
    size1: 10,
    total1:0,
    isupdate1: false,
    dialogVisible1: false,
    currentData1:{},
    form:{

    },

    columns1: [{
      label: '序号',
      width:100,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '开始时间',
      prop: 'realStartDate',
      width:150
    }, {
      label: '结束时间',
      prop: 'realFinishDate',
      width: 150
    }, {
      label: '项目名称',
      prop: 'name',
      // width: 150
    }, {
      label: '建设单位',
      prop: 'jsName',
      // width:160,
    }, {
      label: '施工单位',
      prop: 'sgUnitName', 
      // width:190,
    },{
      label: '班组评价',
      // prop: 'evaluate', 
      width:100,
      render: (data, column) => {
        console.log(6000,data)
        return (
          <p>
            <Popover placement="right" title="班组评价" width="200" trigger="click" content={data.evaluate}>
              <Button>查看</Button>
            </Popover>
          </p>
        )
      }
    }, {
      label: '操作',
      width:80,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleEdit(data)}>修改</Button>
          </p>
        )
      }
    }],
  }

  tableNumber = (idx) => {
    let {page1, size1} = this.state
    return (idx + 1) + ((page1 - 1) * size1)
  }
  handleEdit=(data) => {
    this.setState({dialogVisible1:true, isupdate1:true, currentData1:data}
    )
  }
  fetchProjectList = (mypage, size = 10) => {
    let { location } = this.props
    let id = parse(location.search).id
    const page = mypage || this.state.page1
    Http.post(`/chr/group/project/list`, {
      groupId:id,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        this.setState({
          data:res.data.content,
          projectList: res.data.content.projectGroupList,
          page1:page,
          total1:res.data.content.totalCount
        })
      }
    })
  }
  componentDidMount() {
    let { location } = this.props
    let id = parse(location.search).id
    if(id) {
      // 获取详情数据
      Http.get(`/chr/group/get/${id}`, {

      }).then(res => {
        if(res.data.code == 0) {
          this.setState({
            data:res.data.content
          })
        }
      })
      this.fetchProjectList()
    }else{
      this.props.history.push({
        pathname:this.props.match.url
      })
    }
  }

  handlePageChange = (page) => {

    this.fetchProjectList(page)
  }
  resetSearch = (data) => {
    this.setState({
      data:{},
      projectList:[],
      page1: 1,
      size1: 10,
      total1:0,
      isupdate1: false,
      dialogVisible1: false,
    }, () => {
      this.fetchProjectList()
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
      <CurrForm ref={this.myRef} currentData={this.state.currentData1} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible1: false })} isupdate={this.state.isupdate1} dialogVisible={this.state.dialogVisible1}></CurrForm>

      <h3 className="page-title">班组详情<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span></h3>
      <div className='first-div'>
        <div style={{fontSize:'16px',width:'250px'}}>姓名<span style={{marginLeft:'62px'}}>{data.name}</span></div>
        <div style={{fontSize:'16px',width:'150px'}}>性别<span style={{marginLeft:'30px'}}>{data.gender}</span></div>
        <div style={{fontSize:'16px',width:'300px'}}>证件号<span style={{marginLeft:'30px'}}>{data.idNo}</span></div>
        <div style={{fontSize:'16px',width:'200px'}}>出生时间<span style={{marginLeft:'30px'}}>{data.birthAt}</span></div>
      </div>
      <div className='first-div'>
        <div style={{fontSize:'16px',width:'250px'}}>公司名称<span style={{marginLeft:'30px'}}>{data.companyName}</span></div>
        <div style={{fontSize:'16px',width:'150px'}}>班组身份<span style={{marginLeft:'20px'}}>{data.groupRole}</span></div>
        <div style={{fontSize:'16px',width:'300px'}}>手机号<span style={{marginLeft:'30px'}}>{data.cellPhone}</span></div>
        <div style={{fontSize:'16px',width:'200px'}}><span style={{marginLeft:'30px'}}></span></div>
      </div>
      <div  style={{margin:'50px 0px 30px',color:'#20a0ff',fontSize:'20px'}}>项目履历</div>
        <Button onClick={()=>{this.setState({isupdate1:false, dialogVisible1:true})}} type="primary">新增项目履历</Button>
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
    </div>
  }
}

export default withRouter(GroupDetail)
