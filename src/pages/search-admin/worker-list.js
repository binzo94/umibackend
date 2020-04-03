import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, DateRangePicker, Table, Pagination, Dialog, MessageBox, Message} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject,handleEmpty} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import UserAuth from './user-auth'
import WorkerForm from './worker-form'
import WorkerDetail from './worker-detail'

import _ from 'lodash'
class UserList extends React.Component {
  _isMounted = false
  myRef = React.createRef();
  state = {
    projectName:'', //项目名称
    projectId:'',
    jsName:'', //业主单位
    sgUnitName:'', //施工单位
    name:'', //人员姓名
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
    cellPhone:'1',
    idNo:'',
    columns: [{
      label: '序号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      },
    },
    {
      label: '姓名',
      prop: 'name',
      // width:100
    }, {
      label: '证件号',
      prop: 'idNo',
      width: 150
    },{
        label: '手机号',
        prop: 'cellPhone',
        width: 150
      }, {
      label: '性别',
      prop: 'genderName',
      // width: 120
    },{
      label: '更新时间',
      prop: 'updateAt',
      // width:190,
    }, {
      label: '操作',
      width:160,
      fixed:'right',
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.goDetail(data)}>查看详情</Button>
            <Button type="text" size="small" onClick={() => this.handleEdit(data)}>修改</Button>
            <Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>
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
    console.log(123123,data.id)
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=worker-detail&id=${data.id}`
    })
  }
  resetSearch = (data) => {
    this.setState({
      projectName:'',
      jsName:'',
      sgUnitName:'',
      name:'',
      grade:'',
      isChild:'',
      createtime:['', ''],
      viptime:['',''],
      vipexpiretime:['',''],
      vipStartTime:'',
      vipEndTime:'',
      page:1,
      cellPhone:'',
      idNo:''

    }, () => {
      this.fetchUserList()
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
      projectName,
      jsName,
      sgUnitName,
      name,
      cellPhone,
      idNo
    } = this.state
    let strobj = {
      projectName,
      jsName,
      sgUnitName,
      name,
      cellPhone,
      idNo
    }
    // 处理非空
    strobj = handleEmpty(strobj)
    Http.post('/chrRecruit/worker/select', {
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
    const {id} = data
    MessageBox.confirm('此操作将删除该用户简历信息, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/chrRecruit/worker/delete/${id}`).then(res => {
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


  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      projectName: e.target.value
    }, () => {
      if(this.state.projectName)
        this.timer = setTimeout(() => {
          Http.post(`/chrRecruit/project/select?projectName=${this.state.projectName}`)
            .then(res => {
              if(res.data.code == '0'){
                setStateWrap.call(this, {
                  ...this.state,
                  suggestList: res.data.content
                }, this._isMounted, () => {
                })
              }
            })
        }, 300)
      else
        this.setState({
          ...this.state,
          suggestList: [],
          projectName: ''
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
      else if(Parse.page === 'worker-detail' && Parse.id)
        return <WorkerDetail />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <WorkerForm ref={this.myRef} currentData={this.state.currentData} resetSearch={() => this.resetSearch()} onCancel={() => this.setState({ dialogVisible: false })} isupdate={this.state.isupdate} dialogVisible={this.state.dialogVisible}></WorkerForm>

        <Form inline labelPosition={'right'} labelWidth={'100'}>
          <div>

          <Form.Item label="项目名称:">
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.name}
              value={this.state.projectName}
              onChange={this.handleQueryChange}
              renderItem={(item, isHighlighted) =>
                <p key={item.id} style={{  whiteSpace: 'nowrap',
                  textOverflow:'ellipsis',
                  overflow: 'hidden',
                  wordBreak: 'break-all', paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                  {item.name}
                </p>
              }
              onSelect={(value, data) => {
                console.log(66666,value,data)
                this.setState({
                  projectName: value,
                  projectId: data.id
                  // form:{
                  //   ...this.state.form,
                  // }
                })}}
              menuStyle={{  borderRadius: '3px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '2px 0',
                fontSize: '90%',
                position: 'fixed',
                maxWidth:'500px',
                overflow: 'auto',
                maxHeight: '50%' }}
              wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}/>
          </Form.Item>
            {/* <Form.Item label="项目名称:" >
              <Input size="small" onChange={this.handleChange('projectName')} value={this.state.projectName} />
            </Form.Item> */}
            <Form.Item label="业主单位:" >
              <Input size="small" onChange={this.handleChange('jsName')} value={this.state.jsName} />
            </Form.Item>
            <Form.Item label="施工单位:">
              <Input size="small" onChange={this.handleChange('sgUnitName')} value={this.state.sgUnitName} />
            </Form.Item>
            <Form.Item label="人员姓名:" >
              <Input size="small"  onChange={this.handleChange('name')} value={this.state.name} />
            </Form.Item>
            <Form.Item label="手机号码:" >
              <Input size="small"  onChange={this.handleChange('cellPhone')} value={this.state.cellPhone} />
            </Form.Item>
            <Form.Item label="身份证号:" >
              <Input size="small"  onChange={this.handleChange('idNo')} value={this.state.idNo} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={() => {this.setState({page:1});this.fetchUserList(1)}} icon={'search'}>搜索</Button>
              <Button onClick={() => this.resetSearch()} icon={'search'}>重置查询</Button>
              <Button onClick={() => {this.setState({isupdate:false, dialogVisible:true})}} >新增简历</Button>
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
