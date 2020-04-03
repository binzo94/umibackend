import React from 'react'
import {Http} from '../../services'
import {parse} from 'query-string'
import {
  Table,
  Page,
  Pagination,
  Button,
  Message,
  Input,
  Form,
  Select,
  DatePicker, DateRangePicker, AutoComplete,MessageBox
} from 'element-react'
import {Redirect} from 'react-router-dom'
import ProjectmanagerAdd from './projectmanager-add'
import {formatDate, setStateWrap, handleEmpty} from '../../utils'
import _ from 'lodash'
import Autocomplete from 'react-autocomplete'

class ProjectmanagerList extends React.Component {
  _isMounted = false
  state = {
    total:0,
    columns: [
      {
        label: '编号',
        width:80,
        render: (data, column, idx) => {
          return <span>{this.tableNumber(idx)}</span>
        }
      },
      {
        label: '项目经理姓名',
        prop: 'personName',
        width: 120
      },
      {
        label: '注册号',
        prop: 'personRegisterNum',
        width:180
      },
      {
        label: '所属企业',
        prop: 'companyName',
        width:200
      },
      {
        label: '中标数',
        prop: 'bidCount',
        width:100
      },
      {
        label: '更新时间',
        prop: 'updateTime',
        width:190
      },
      {
        label: '更新员工',
        prop: 'operator',
        width:120
      },
      {
        label: '',
        prop: ''
      },
      {
        label: '操作',
        width:120,
        fixed:'right',
        render: (data, column) => {
          return (
            <span>
              <Button type="text" size="small" onClick={() => this.handleUpdate(data)}>修改</Button>
                <Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>
               </span>
          )
        }
      }
    ],
    data: [],
    updateTime:['', ''],
    operator:'',
    operatorobj:{},
    personName:'',
    personRegisterNum:'',
    companyName:'',
    suggestList:[],
    page: 1,
    size: 10
  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.post(`/bid/pm/delete`,{ids:data.id}).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchProjectmanagerList()
          },1000)
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
  goAdd=()=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=projectmanager-add`
    })
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=projectmanager-update&id=${data.id}`
    })
  }

  handleOperatorObj=(item) => {
    this.setState({
      operator:item.value,
      operatorobj:{
        name:item.value,
        id:item.id
      }
    })
  }
  fetchOperator=(str, cb) => {
    Http.get('/system/user/operator', {
      name:str
    })
      .then(res => {
        if (res.data.code == 0) {
          let list = []
          let {content} = res.data
          for(let key in content) {
            list.push({
              value:content[key].userName,
              id:content[key].id
            })
          }
          cb(list)
        }})
  }
  resetSearch = () => {
    this.setState({
      page:1,
      updateTime:['', ''],
      operator:'',
      operatorobj:{},
      personName:'',
      personRegisterNum:'',
      companyName:'',
      suggestList:[],

    },()=>{
      this.fetchProjectmanagerList(1)
    })

  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page - 1) * size)
  }
  handleChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  fetchProjectmanagerList = (page = 1) => {
    let {updateTime,
      personName,
      personRegisterNum,
      size,
      operator,
      companyName
    } = this.state
    let strobj = {
      personName,
      personRegisterNum,
      companyName
    }
    strobj = handleEmpty(strobj)
    if(updateTime && updateTime.length > 0) {
      if(!!updateTime[0]) {
        strobj.updateStartTime = formatDate(updateTime[0])
      }
      if(!!updateTime[1]) {
        strobj.updateEndTime = formatDate(updateTime[1])
      }
    }
    if(this.state.operatorobj.name == operator) {
      strobj.updateUser = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
    }
    Http.get('/bid/pm/list', {
      ...strobj,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, () => ({
          data: res.data.content,
          page
        }), this._isMounted, () => {
        })
        // this.setState({
        //   ...this.state,
        //   data: res.data.content,
        //   page
        // })
      }
    })
  }
  componentDidUpdate(prevProps) {
    if(this.props.location !== prevProps.location) {
      this.fetchProjectmanagerList()
    }
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchProjectmanagerList()
  }
  componentWillUnmount() {
    this._isMounted = false

  }
  handlePageChange = (page) => {
    this.fetchProjectmanagerList(page)
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      companyName:e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.companyName}`)
            .then(res => {
              this.setState({
                suggestList: res.data.content
              })
            })
        }, 300)
      else {
        this.setState({
          suggestList: []
        })
      }
    })
  }
  render() {
    let {...state} = this.state
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if(Parse.page === 'projectmanager-update' && Parse.id)
        return <ProjectmanagerAdd isUpdatePage={true} />
     else{
        return <Redirect to={this.props.match.url} />
      }

    } else if(Parse.page === 'projectmanager-add'){
      return <ProjectmanagerAdd isUpdatePage={false} />
    }
    return (
      <React.Fragment>


        <Form inline>
          <Form.Item label="人员姓名:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('personName')} value={this.state.personName} />
          </Form.Item>
          <Form.Item label="注册号:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('personRegisterNum')} value={this.state.personRegisterNum} />
          </Form.Item>
          <Form.Item label="所属企业:" style={{marginRight:'30px'}}>
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.companyName}
              onChange={this.handleQueryChange}
              renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
              onSelect={value => this.setState({companyName:value})}
              wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
            />
          </Form.Item>
          <br></br>
          <Form.Item style={{marginRight:'30px'}} label={'更新员工:'}>
            <AutoComplete
              placeholder="请输入"
              size={'small'}
              value={this.state.operator}
              fetchSuggestions={_.throttle(this.fetchOperator, 1000)}
              onSelect={this.handleOperatorObj.bind(this)}
              triggerOnFocus={false}
              style={{width:'100%'}}
            ></AutoComplete>
          </Form.Item>
          <Form.Item label="更新时间:">
            <DateRangePicker
              value={this.state.updateTime}
              placeholder="选择日期范围"
              onChange={this.handleChange('updateTime') }
            />
          </Form.Item>
          <Form.Item >
            <Button type="primary"
                    icon={'search'}
              nativeType="button" size="small"
              onClick={() => this.fetchProjectmanagerList()}>
              搜索</Button>
          </Form.Item>
          <Form.Item >
            <Button type="text"
              style={{border:'1px solid', paddingLeft:'5px', paddingRight:'5PX'}}
              nativeType="button" size="small"
              onClick={() => this.resetSearch()}>
              重置搜索</Button>
          </Form.Item>
        </Form>
         <div style={{margin:"15px 0px"}}>共有数据:<span style={{fontWeight:'500',margin:'0 10px'}}>{_.get(state,'data.totalCount','0')}</span>条</div>
        <Table
          columns={state.columns}
          data={state.data.content}
          style={{width:'100%'}}
          stripe
        />
        {
          state.data.content
            && state.data.content.length ?
            <div className="page-ct">
              <Pagination
                currentPage={state.page}
                total={state.data.totalCount}
                pageSize={state.size}
                onCurrentChange={this.handlePageChange}
              />
            </div> : null
        }
      </React.Fragment>
    )


  }
}

export default ProjectmanagerList
