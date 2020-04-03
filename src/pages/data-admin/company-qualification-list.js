import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, Table, Pagination, DateRangePicker, AutoComplete,MessageBox,Message} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject, handleEmpty} from '../../utils'
import {Redirect, Link} from 'react-router-dom'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import CompanyQualificationForm from './company-qualification-form'
import _ from 'lodash'
class CompanyQualificationList extends React.Component {
  _isMounted = false

  state = {
    suggestList: [],
    page: 1,
    size: 10,

    currentlevel:1,
    lastlevel:0,
    // level: [],
    aptitudeTypeList: [],
    aptitudeLargeList: [],
    aptitudeSmallList: [],
    aptitudeMajorList: [],
    levelList: [],
    aptitudeTypeId: null,
    aptitudeLargeId: null,
    aptitudeSmallId: null,
    aptitudeMajorId: null,
    levelId: null,
    companyId: '',
    companyName: '',
    updatetime:['',''],
    operator:'',
    operatorobj:{},
    data: null,
    columns: [{
      label: '编号',
      width:80,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '资质类别',
      prop: 'aptitudeTypeName',
      width:140
    }, {
      label: '资质大类',
      prop: 'aptitudeLargeName',
      width:160
    }, {
      label: '资质小类',
      prop: 'aptitudeSmallName',
      width:160
    }, {
      label : '专业',
      prop: 'aptitudeMajorName',
        width:160
    }, {
      label: '等级',
      prop: 'levelName',
        width:140
    }, {
      label:'更新员工',
        prop:'operatorName',
        width:110
      },{
      label: '企业名称',
      prop: 'companyName',
      width:160
    }, {
      label: '更新时间',
      prop: 'updatedAt',
      width:190
    }, {
        label: '',
        prop: ''
      }, {
      label: '操作',
      fixed:'right',
      width:110,
      render: (data, column) => {
        return (
          <p>
            <Button type="text" size="small" onClick={() => this.handleUpdate(data)}>编辑</Button>
            <Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>
          </p>
        )
      }
    }]
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page - 1) * size)
  }
  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=company-qualification-update&id=${data.id}&companyName=${data.companyName || ''}`
    })
  }
  handlePageChange = (page) => {
    this.fetchCompanyQualification(page)
  }
  resetSearch=()=>{
    this.setState({

      currentlevel:1,
      lastlevel:0,
      aptitudeTypeId: null,
      aptitudeLargeId: null,
      aptitudeSmallId: null,
      aptitudeMajorId: null,
      levelId: null,
      companyId: '',
      companyName: '',
      updatetime:['',''],
      operator:'',
      operatorobj:{}
    },()=>this.fetchCompanyQualification())
  }
  fetchCompanyQualification = (page = 1) => {
    let {
      aptitudeTypeId,
      aptitudeLargeId,
      aptitudeSmallId,
      aptitudeMajorId,
      levelId,
      companyId,
      companyName,
      updatetime,
      size,
      currentlevel,
      lastlevel,
      operator
    } = this.state
    let strobj = {
      aptitudeTypeId,
      aptitudeLargeId,
      aptitudeSmallId,
      aptitudeMajorId,
      levelId,
      companyId,
      companyName
    }
    if(currentlevel<lastlevel){
      Message({
        type:'warning',
        message:'请选择完所有资质条件'
      })
      return
    }
    strobj = handleEmpty(strobj)
    if(this.state.operatorobj.name == operator) {
      strobj.operator = this.state.operatorobj.id
    }else{
      // 更新员工不能手输入
    }
    if(updatetime && updatetime.length > 0) {
      if(!!updatetime[0]) {
        strobj.updateStart = formatDate(updatetime[0])
      }
      if(!!updatetime[1]) {
        strobj.updateEnd = formatDate(updatetime[1])
      }
    }
    Http.post('/companyQualification/select', {
      ...strobj,
      page,
      size
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, {
          ...this.state,
          data: res.data.content,
          page
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
  handleOperatorObj=(item) => {
    this.setState({
      operator:item.value,
      operatorobj:{
        name:item.value,
        id:item.id
      }
    })
  }
  findListLevel = (list, level) => {
    if(!list.length) return false
    return list.every(item => item.level === level)
  }

  findByPidAndType = (pid = 0, level) => {
    Http.get(`/qualification/getCQByPid/${pid}`, {
    }).then(res => {
      if(res.data.content) {
        let {content} = res.data
        if(content) {
          // 判断最后一级的level
          if(content[0]) {
            this.setState({
              lastlevel: parseInt(content[0].level) + 1
            })

          }else {
            //
            this.setState({
              lastlevel: level
            })
          }

          if(this.findListLevel(content, '1')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeLargeList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '2')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeSmallList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '3')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeMajorList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '4')) {
          setStateWrap.call(this, {
            ...this.state,
            levelList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '0')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeTypeList: content
          }, this._isMounted)
        }
      }
    }})
  }

  handleSelectChange = (level)=>(value) => {
    let currentlevel = level
    this.setState({
      currentlevel
    })
    if(level !== '4') {
      this.findByPidAndType(value.id)
    }
    if(level == '0') {
      this.setState({
        ...this.state,
        aptitudeLargeList: [],
        aptitudeSmallList: [],
        aptitudeMajorList: [],
        levelList: [],
        aptitudeTypeId: value.id,
        aptitudeLargeId: null,
        aptitudeSmallId: null,
        aptitudeMajorId: null,
        levelId: null
      })
    }
    else if (level == '1') {
      this.setState({
        ...this.state,
        aptitudeSmallList: [],
        aptitudeMajorList: [],
        levelList: [],
        aptitudeLargeId: value.id,
        aptitudeSmallId: null,
        aptitudeMajorId: null,
        levelId: null
      })
    }
    else if (level == '2') {
      this.setState({
        ...this.state,
        aptitudeMajorList: [],
        levelList: [],
        aptitudeSmallId: value.id,
        aptitudeMajorId: null,
        levelId: null
      })
    }
    else if (level == '3') {
      this.setState({
        ...this.state,
        levelList: [],
        aptitudeMajorId: value.id,
        levelId: null
      })
    }
    else if (level == '4') {
      this.setState({
        ...this.state,
        levelId: value.id
      })
    }
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      companyName: e.target.value

    }, () => {
      if(this.state.companyName)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.companyName}`)
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
          companyName: ''
        })

    })
  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/companyQualification/delete/${data.id}` ).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchCompanyQualification()
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
  handleChange = key => value => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }
  componentDidMount() {
    this._isMounted = true
    this.findByPidAndType()
    this.fetchCompanyQualification()
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchCompanyQualification()
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
      else if(Parse.page === 'company-qualification-update' && Parse.id)
        return <CompanyQualificationForm isUpdatePage={true} />
      return <Redirect to={this.props.match.url} />
    }
    return (
      <React.Fragment>
        <Form inline>
          <Form.Item label="资质类别:" style={{marginRight:'30px'}}>
            <Select
              size="small"
              value={this.state.aptitudeTypeId} onChange={this.handleSelectChange(0)}>
              {
                this.state.aptitudeTypeList.map(item =>
                  <Select.Option key={item.id} label={item.name} value={item} />
                )
              }
            </Select>
          </Form.Item>
          {
            this.state.aptitudeLargeList.length ?
              <Form.Item label="资质大类:"
                style={{
                  marginRight:'30px'
                }}
              >
                <Select
                  size="small" value={this.state.aptitudeLargeId} onChange={this.handleSelectChange(1)}>
                  {
                    this.state.aptitudeLargeList.map(item =>
                      <Select.Option key={item.id} label={item.name} value={item} />
                    )
                  }
                </Select>
              </Form.Item> : null}
          {
            this.state.aptitudeSmallList.length ? <Form.Item label="资质小类:"
              style={{
                marginRight:'30px'
              }}
            >
              <Select
                size="small" value={this.state.aptitudeSmallId} onChange={this.handleSelectChange(2)}>
                {
                  this.state.aptitudeSmallList.map(item =>
                    <Select.Option key={item.id} label={item.name} value={item} />
                  )
                }
              </Select>
            </Form.Item> : null
          }
          {
            this.state.aptitudeMajorList.length ? <Form.Item label="专业:"
              style={{
                marginRight:'30px'
              }}
            >
              <Select
                size="small" value={this.state.aptitudeMajorId} onChange={this.handleSelectChange(3)}>
                {
                  this.state.aptitudeMajorList.map(item =>
                    <Select.Option key={item.id} label={item.name} value={item} />
                  )
                }
              </Select>
            </Form.Item> : null
          }
          {
            this.state.levelList.length ? <Form.Item label="等级:"
              style={{
                marginRight:'30px'
              }}
            >
              <Select
                size="small" value={this.state.levelId} onChange={this.handleSelectChange(4)}>
                {
                  this.state.levelList.map(item =>
                    <Select.Option key={item.id} label={item.name} value={item} />
                  )
                }
              </Select>
            </Form.Item> : null
          }
          <div>
            <Form.Item label="企业名称:" style={{marginRight:'30px'}}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={this.state.companyName}
                onChange={this.handleQueryChange}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.companyName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.setState({
                    ...this.state,
                    companyName:value,
                    companyId: data.companyId
                  })
                }}
                wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}
              />
            </Form.Item>
            <br/>
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
            <Form.Item label="更新时间:" style={{marginRight:'15px'}}>
              <DateRangePicker
                value={this.state.updatetime}
                placeholder="选择日期范围"
                onChange={this.handleChange('updatetime') }
              />

            </Form.Item>
            <Form.Item>
              <Button type="primary"
                      icon={'search'} size="small" onClick={() => this.fetchCompanyQualification()}>搜索</Button>
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

export default CompanyQualificationList
