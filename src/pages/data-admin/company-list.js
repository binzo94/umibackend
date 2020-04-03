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
import CompanyForm from './company-form'
import {formatDate, setStateWrap, handleEmpty} from '../../utils'
import _ from 'lodash'

class CompanyList extends React.Component {
  _isMounted = false
  state = {
    total:0,
    columns: [
      {
        label: '编号d',
        width:80,
        render: (data, column, idx) => {
          return <span>{this.tableNumber(idx)}</span>
        }
      },
      {
        label: '企业名称',
        prop: 'companyName',
        width: 200
      },
      {
        label: '统一社会信用代码',
        prop: 'socialCreditCode',
        width: 200
      },
      {
        label: '法人姓名',
        prop: 'lealPerson',
        width:100
      },
      {
        label: '地区',
        width:150,
        render: (data, column, idx) => {
          return <span>{data['provinceName']?data['provinceName']:''}{data['cityName']?data['cityName']:''}</span>
        }
      },
      {
        label: '更新时间',
        prop: 'updatedAt',
        width:190
      },
      {
        label: '更新员工',
        prop: 'operatorName',
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
    companyName: '',
    socialCreditCode: '',
    lealPerson:'',
    areaCode: '',
    regisAddress:'',
    updateTime:['', ''],
    operator:'',
    operatorobj:{},
    page: 1,
    size: 10
  }

  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=company-update&id=${data.id}`
    })
  }

  fetchRegionData = (level, id = 0) => {
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
          setStateWrap.call(this, {
            ...this.state,
            regionData: res.data.content
          }, this._isMounted)
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
        this.fetchRegionData(2, value.id)
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
      companyName:'',
      socialCreditCode: '',
      lealPerson: '',
      areaCode: '',
      updateTime:['', ''],
      operator:'',
      operatorobj:{},
      regisAddress:''

    },()=>{
      this.fetchCompanyList(1)
    })

  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/company/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchCompanyList()
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

  fetchCompanyList = (page = 1) => {
    let {updateTime,
      companyName,
      socialCreditCode,
      lealPerson,
      areaCode,
      regisAddress,
      size,
      operator
    } = this.state
    let strobj = {
      companyName,
      socialCreditCode,
      lealPerson,
      regisAddress,
      areaCode
    }
    strobj = handleEmpty(strobj)
    if(updateTime && updateTime.length > 0) {
      if(!!updateTime[0]) {
        strobj.updateStart = formatDate(updateTime[0])
      }
      if(!!updateTime[1]) {
        strobj.updateEnd = formatDate(updateTime[1])
      }
    }
    if(this.state.operatorobj.name == operator) {
      strobj.operator = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
    }
    Http.post('/company/select', {
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
      this.fetchCompanyList()
    }
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchRegionData(1)
    this.fetchCompanyList()
  }
  componentWillUnmount() {
    this._isMounted = false

  }
  handlePageChange = (page) => {
    this.fetchCompanyList(page)
  }

  render() {
    let {...state} = this.state
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if(Parse.page === 'company-update' && Parse.id)
        return <CompanyForm isUpdatePage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>


        <Form inline>
          <Form.Item label="企业名称:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('companyName')} value={this.state.companyName} />
          </Form.Item>
          <Form.Item label="统一社会信用代码:" style={{marginRight:'30px'}}>
            <Input size="small" onChange={this.handleChange('socialCreditCode')} value={this.state.socialCreditCode} />
          </Form.Item>
          <Form.Item label="法人姓名:">
            <Input size="small" onChange={this.handleChange('lealPerson')} value={this.state.lealPerson}/>
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
          <Form.Item style={{marginRight:'30px'}} label={'更新员工:'}>
            <AutoComplete
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
              value={this.state.updateTime}
              placeholder="选择日期范围"
              onChange={this.handleChange('updateTime') }
            />
          </Form.Item>
          <Form.Item >
            <Button type="primary"
                    icon={'search'}
              nativeType="button" size="small"
              onClick={() => this.fetchCompanyList()}>
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

export default CompanyList
