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
import WinningbidAdd from './winningbid-form'
import {formatDate, setStateWrap, handleEmpty} from '../../utils'
import _ from 'lodash'
import Autocomplete from 'react-autocomplete'

class BiddinginfoList extends React.Component {
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
        label: '中标名称',
        prop: 'projectName',
        width: 200
      },
      {
        label: '中标企业',
        prop: 'bidCompanyName',
        width:200
      },
      {
        label: '项目经理',
        prop: 'projectManager',
        width:200
      },{
        label: '中标金额（万元）',
        prop: 'bidFunds',
        width:200
      },
      {
        label: '省',
        prop: 'province',
        width:100
      },
      {
        label: '市',
        prop: 'city',
        width:100
      },
      {
        label: '中标时间',
        prop: 'bidTime',
        width:190
      },
      {
        label: '更新时间',
        prop: 'updateTime',
        width:190
      },
      {
        label: '更新员工',
        prop: 'operator',
        width:100
      },
      {
        label: '',
        prop: ''
      },
      {
        label: '操作',
        width:130,
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
    provinceData: [],
    regionData: [],
    provinceValue: [],
    regionValue: [],
    projectName: null,
    areaCode: null,
    regisAddress:'',
    suggestList:[],
    bidCompanyName:'',
    projectManager:'',
    updateTime:['', ''],
    bidTime:['',''],
    operator:'',
    operatorobj:{},
    page: 1,
    size: 10
  }
  goAdd=()=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=winningbidinfo-add`
    })
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=winningbidinfo-update&id=${data.id}`
    })
  }

  fetchRegionData = (level, id = 0,name) => {
    Http.get(`/dict/area/${id}`)
      .then(res => {
        if(res.data.content) {
          if(level === 1) {
            setStateWrap.call(this, {
              ...this.state,
              provinceData: res.data.content
            }, this._isMounted)

          }

        }
        if (level === 2) {
          if(!!name&&['上海市','天津市','重庆市','北京市'].some((item)=>{return item.indexOf(name)!=-1})){
            let zxid = _.get(res,"data.content[0]['id']",'')
            if(zxid!=''){
              Http.get(`/dict/area/${zxid}`)
                .then(
                  res1=>{
                    this.setState({
                      regionData: res1.data.content
                    })
                  }
                )
            }

          }else{
            this.setState({
              regionData: res.data.content
            })
          }
        }
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
  handleSelectChange = level => value => {
    if(level == 1){
      this.setState({
        areaCode:value.name,
        regionData: []
      },()=>{
        this.fetchRegionData(2, value.id,value.name)
      })

    }else{
      this.setState({
        regisAddress:value.name
      })
    }
  }
  resetSearch = () => {
    this.setState({
      page:1,
      projectName: null,
      lealPerson: null,
      areaCode: null,
      bidCompanyName:'',
      updateTime:['', ''],
      publishTime:['',''],
      projectManager:'',
      bidTime:['',''],
      operator:'',
      operatorobj:{},
      regisAddress:''

    },()=>{
      this.fetchBiddinginfoList(1)
    })

  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.post(`/bid/tender/delete`,{ids:data.id}).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchBiddinginfoList()
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

  fetchBiddinginfoList = (page = 1) => {
    let {updateTime,
      bidTime,
      projectName,
      areaCode,
      regisAddress,
      size,
      bidCompanyName,
      projectManager,
      operator
    } = this.state
    let strobj = {
      projectName,
      bidCompanyName,
      projectManager,
      province:areaCode,
      city: regisAddress
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
    if(bidTime && bidTime.length > 0) {
      if(!!bidTime[0]) {
        strobj.bidStartTime = formatDate(bidTime[0])
      }
      if(!!bidTime[1]) {
        strobj.bidEndTime = formatDate(bidTime[1])
      }
    }
    if(this.state.operatorobj.name == operator) {
      strobj.operator = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
    }
    Http.get('/bid/tender/list', {
      ...strobj,
      projectStage:"4",
      page,
      size
    }).then(res => {
      if(res.data.content) {
        this.setState({
          data: res.data.content,
          page

        })
      }
    })
  }
  componentDidUpdate(prevProps) {
    if(this.props.location !== prevProps.location) {
      this.fetchBiddinginfoList()
    }
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchRegionData(1)
    this.fetchBiddinginfoList()
  }
  componentWillUnmount() {
    this._isMounted = false

  }
  handlePageChange = (page) => {
    this.fetchBiddinginfoList(page)
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      bidCompanyName:e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.bidCompanyName}`)
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
      if(Parse.page === 'winningbidinfo-update' && Parse.id)
        return <WinningbidAdd isUpdatePage={true} />
     else{
        return <Redirect to={this.props.match.url} />
      }

    } else if(Parse.page === 'winningbidinfo-add'){
      return <WinningbidAdd isUpdatePage={false} />
    }
    return (
      <React.Fragment>


        <Form inline>
          <Form.Item label="中标名称:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('projectName')} value={this.state.projectName} />
          </Form.Item>
          <Form.Item label="中标企业:" style={{marginRight:'30px'}}>
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.bidCompanyName}
              onChange={this.handleQueryChange}
              renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
              onSelect={value => this.setState({bidCompanyName:value})}
              wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
            />  </Form.Item>
          <Form.Item label="项目经理:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('projectManager')} value={this.state.projectManager} />
          </Form.Item>
          <br></br>
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
          <Form.Item label="中标时间:">
            <DateRangePicker
              size="small"
              value={this.state.bidTime}
              placeholder="选择日期范围"
              onChange={this.handleChange('bidTime') }
            />
          </Form.Item>
          <Form.Item style={{marginRight:'30px'}} label={'更新员工:'}>
            <AutoComplete
              size="small"
              placeholder="请输入"
              value={this.state.operator}
              fetchSuggestions={_.throttle(this.fetchOperator, 1000)}
              onSelect={this.handleOperatorObj.bind(this)}
              triggerOnFocus={false}
              style={{width:'100%'}}
            ></AutoComplete>
          </Form.Item>
          <Form.Item label="更新时间:">
            <DateRangePicker
              size="small"
              value={this.state.updateTime}
              placeholder="选择日期范围"
              onChange={this.handleChange('updateTime') }
            />
          </Form.Item>
          <br></br>
          <Form.Item >
            <Button type="primary"
                    icon={'search'}
              nativeType="button" size="small"
              onClick={() => this.fetchBiddinginfoList()}>
              搜索</Button>
          </Form.Item>
          <Form.Item >
            <Button type="text"
              style={{border:'1px solid', paddingLeft:'5px', paddingRight:'5PX'}}
              nativeType="button" size="small"
              onClick={() => this.resetSearch()}>
              重置搜索</Button>
          </Form.Item>
          <Form.Item >
            <Button type="primary"
                    nativeType="button" size="small"
                    onClick={() => this.goAdd()}>
              中标新增</Button>
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

export default BiddinginfoList
