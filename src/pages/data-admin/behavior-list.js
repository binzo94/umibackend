import React from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  Pagination, DateRangePicker,
  AutoComplete,MessageBox,Message
} from 'element-react'
import {setStateWrap, formatDate, handleEmpty} from '../../utils'
import {Http} from '../../services'
import {Redirect} from 'react-router-dom'
import BehaviorForm from './behavior-form'
import {parse} from 'query-string'
import OtherAuto from 'react-autocomplete'
import _ from 'lodash'

class BehaviorList extends React.Component {
  _isMounted = false
  state = {
    page: 1,
    size: 10,
    suggestList: [],

    areaCode: '',
    recordName: '',
    recordType: '',
    recordTypeName: '',
    recordMain: '',
    publishTime:['', ''],
    updateTime:['', ''],
    mainId: '',
    operator:'',
    operatorobj:{},
    provinceData: [],
    regionData: [],
    data: null,
    behaviorTypeList: [],
    company:{},
    columns: [{
      label: '编号',
      width:100,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    }, {
      label: '诚信名称',
      prop: 'recordName',
      width:240
    }, {
      label: '诚信类型',
      prop: 'recordType',
      width:110,
      render: (data, columns) => {
        return <span>{data.recordType === 'honor' ? '荣誉' : '不良'}</span>
      }
    }, {
      label: '诚信主体',
      prop: 'recordMain',
      width:110
    }, {
      label: '相关人员',
      prop: 'relevantPersonName',
      width:110
    }, {
      label: '信息来源',
      prop: 'sourceName',
      width:140
    }, {
      label: '发布时间',
      prop: 'inDate',
      width:140
    }, {
      label: '更新员工',
      prop: 'operatorName',
      width:180
    }, {
      label: '更新时间',
      prop: 'updatedAt',
      width:190
    },{
      label: '',
      prop: ''
    }
    ,{
      label: '操作',
      width:100,
      fixed:'right',
      render: (data, columns) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleUpdate(data)}>修改</Button>
            <Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>
          </p>
        )
      }
    }]
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=behavior-update&id=${data.id}&esId=${data.esId}`
    })
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1)* size)
  }
  fetchBehavior = (page = 1) => {
    let {areaCode,
      mainId,
      recordMain,
      recordName,
      recordType, size, updateTime, publishTime, operator} = this.state
    let strobj = {
      areaCode,
      recordMain,
      recordName,
      recordType
    }
    // 如果主题id与主体不匹配
    if(this.state.company.value == recordMain) {
      strobj.mainId = mainId
    }
    if(this.state.operatorobj.name == operator) {
      strobj.operator = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
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
    if(publishTime && publishTime.length > 0) {
      if(!!publishTime[0]) {
        strobj.publishDateStart = formatDate(publishTime[0],false)
      }
      if(!!publishTime[1]) {
        strobj.publishDateEnd= formatDate(publishTime[1],false)
      }
    }
    Http.post('/behavior/select', {
      ...strobj,
      size,
      page
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, {
          ...this.state,
          data: res.data.content,
          page
        }, this._isMounted, () => {
        })
      }
    }).catch(err => {})
  }

  fetchRegionData = (level, id = 0) => {
    Http.get(`/dict/area/${id}`)
      .then(res => {
        if (res.data.content) {
          if (level === 1) {
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
  handlePageChange = (page) => {
    this.fetchBehavior(page )
  }

  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      recordMain: e.target.value

    }, () => {
      if(this.state.recordMain)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.recordMain}`)
            .then(res => {
              setStateWrap.call(this, {
                ...this.state,
                suggestList: res.data.content
              }, this._isMounted, () => {
              })
            })
        }, 300)
      else
        this.setState({
          ...this.state,
          suggestList: [],
          recordMain: '',
          mainId: ''
        })

    })
  }
  resetSearch=() => {
    this.setState({
      data:[],
      page:1,
      areaCode: '',
      provinceValue:'',
      regionValue:'',
      recordName: '',
      recordType: '',
      recordTypeName: '',
      recordMain: '',
      publishTime:['', ''],
      updateTime:['', ''],
      mainId: '',
      operator:'',
      operatorobj:{}
    }, () => {
      this.fetchBehavior()
    })
  }
  handleChange = key => (value) => {
    this.setState({
      ...this.state,
      [key]: value
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
  handleSelectChange = level => value => {
    let province = this.state.provinceData.filter(item => item.name === value)
    let region = this.state.regionData.filter(item => item.name === value)
    if(level === 1) {

      this.setState({
        ...this.state,
        provinceValue: value,

        areaCode: province.length ? province[0].id : null

      }, () => {
        if(!value) {
          this.setState({
            ...this.state,
            regionData: [],
            regionValue: ''
          })
        }
        if (level === 1 && this.state.areaCode) {
          this.setState({
            ...this.state,
            regionData: [],
            regionValue: ''
          })
          this.fetchRegionData(2, this.state.areaCode)
        }
      })
    }
    else {
      this.setState({
        ...this.state,
        regionValue: value,
        areaCode: region.length ? region[0].id : null
      }, () => {
      })
    }

  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/behavior/delete`,{
        id:data.id,
        esId:data.esId
      }).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchBehavior()
          },1000)
        }else{
          Message({
            type:'error',
            message: '操作失败!'
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
  componentDidUpdate(prevProps) {
    if(this.props.location !== prevProps.location) {
      this._isMounted = true
      this.fetchBehavior()
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.fetchBehavior()
    this.fetchRegionData(1)
  }
  componentWillUnmount() {
    this._isMounted = false
  }

  render() {
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if(Parse.page === 'behavior-update' && Parse.id)
        return <BehaviorForm isUpdatePage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <Form inline>
          <div>
            <Form.Item label="诚信类型:" style={{marginRight:'30px'}}>
              <Select size="small"
                onChange={this.handleChange('recordType')}
                value={this.state.recordType}>
                {
                  [{label:'荣誉信息',value:'honor'},{label:'不良信息',value:'bad'}].map(data =>
                    <Select.Option key={data.value} value={data.value} label={data.label} />)
                }
              </Select>
            </Form.Item>

            <Form.Item label="诚信主体名称:">
              <OtherAuto
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={this.state.recordMain}
                onChange={this.handleQueryChange}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.companyName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.setState({
                    recordMain:value,
                    mainId: data.companyId,
                    company:{value, id:data.companyId}
                  })}}
                wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}
              />
            </Form.Item>

          </div>
          <div>
            <Form.Item label="发布时间:" style={{marginRight:'30px'}}>
              <DateRangePicker
                value={this.state.publishTime}
                placeholder="选择日期范围"
                onChange={this.handleChange('publishTime') }
              />
            </Form.Item>
            <Form.Item label="更新时间:" style={{marginRight:'15px'}}>
              <DateRangePicker
                value={this.state.updateTime}
                placeholder="选择日期范围"
                onChange={this.handleChange('updateTime') }
              />
            </Form.Item>
            <br/>
            <Form.Item label="地区:">
              <Select size="small"
                placeholder="请选择"
                style={{ marginRight: '15px', width:'90px'}}
                value={this.state.provinceValue}
                onChange={this.handleSelectChange(1)}>
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>
              <Select size="small"
                size="small"
                placeholder="请选择"
                style={{ marginRight: '10px', width:'90px'}}
                value={this.state.regionValue}
                onChange={this.handleSelectChange(2)}>
                {
                  this.state.regionData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>
            </Form.Item>
            {
              this.state.recordType ? <Form.Item label={this.state.recordType === 'honor' ? '荣誉关键字:' : '不良关键字:'} style={{marginRight:'30px'}}>
                <Input size="small" onChange={this.handleChange('recordName')} value={this.state.recordName} />
              </Form.Item> : null
            }
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
            <Form.Item>
              <Button type="primary"
                      icon={'search'} size="small" onClick={() => this.fetchBehavior()}>搜索</Button>
            </Form.Item>

            <Form.Item >
              <Button type="text"
                style={{border:'1px solid', paddingLeft:'5px', paddingRight:'5PX'}}
                nativeType="button" size="small"
                onClick={() => this.resetSearch()}>
                重置搜索</Button>
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
                total={this.state.data.totalCount}
                pageSize={this.state.size}
                onCurrentChange={this.handlePageChange}
              />
            </div> : null
        }

      </React.Fragment>
    )
  }
}
export default BehaviorList
