import React from 'react'
import {Http} from '../../services'
import {Form, Input, Button, Select, DatePicker, Table, Pagination, AutoComplete, DateRangePicker,MessageBox,Message} from 'element-react'
import {setStateWrap, formatDate, isEmptyObject, handleEmpty} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link} from 'react-router-dom'
import PersonQualificationList from './person-qualification-list'
import PersonForm from './person-form'
import _ from 'lodash'
class PersonList extends React.Component {
  _isMounted = false

  state = {
    suggestList: [],
    page: 0,
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
    personName: '',
    certificateSealId: '',
    certificateCompanyName: '',
    operator:'',
    operatorobj:{},
    updatetime:['', ''],
    data: null,
    columns: [{
      label: '编号',
      width:100,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '姓名',
      prop: 'name',
      width:110,
      render: (data, columns, idx) => {
        return <Link to={`/data-admin/person-list?page=person-qualification-list&id=${data.personId}&personName=${data.name}&type=${data.identificationType}&number=${data.identificationId}&sex=${data.sex}`} style={{color:'#20a0ff'}}>{data.name}</Link>
      }
    }, {
      label:'证件类型',
      prop:'identificationType',
      width:100
    }, {
      label: '证件号码',
      prop: 'identificationId',
      width: 230
    }, {
      label: '性别',
      prop: 'sex',
        width:80
    }, {
      label : '所属企业',
      prop: 'companyName',
      width:190
    }, {
      label: '更新时间',
      prop: 'updatedAt',
      width:200
    }, {
      prop:'operatorName',
      label: '更新员工',
      width:120
    }, {prop:'',
  label: ''},{
      label: '操作',
      width:120,
      fixed:'right',
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
      search: `page=person-update&id=${data.id}`
    })
  }
  handlePageChange = (page) => {
    this.fetchPersonInfo(page)
  }
  fetchPersonInfo = (page = 1) => {
    let {
      aptitudeTypeId,
      aptitudeLargeId,
      aptitudeSmallId,
      aptitudeMajorId,
      levelId,
      companyId,
      personName,
      certificateSealId,
      certificateCompanyName,
      updatetime,
      operator,
      currentlevel,
      lastlevel,
      size
    } = this.state
    let strobj = {
      aptitudeTypeId,
      aptitudeLargeId,
      aptitudeSmallId,
      aptitudeMajorId,
      levelId,
      companyId,
      personName,
      certificateSealId,
      certificateCompanyName
    }
    strobj = handleEmpty(strobj)
    if(currentlevel<lastlevel){
      Message({
        type:'warning',
        message:'请选择完所有资质条件'
      })
      return
    }
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
    Http.post('/personInfo/select', {
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

  findListLevel = (list, level) => {
    if(!list.length) return false
    return list.every(item => item.level === level)
  }

  findByPidAndType = (pid = 0,level) => {
    Http.get(`/qualification/getPQByPid/${pid}`, {
    }).then(res => {
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


        if(this.findListLevel(content, '0')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeTypeList: content
          }, this._isMounted)
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

      }
    })
  }

  handleSelectChange =(level)=>(value) => {
    let currentlevel = level

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
    this.setState({
      currentlevel
    })
    if(level !== '4') {
      this.findByPidAndType(value.id,level)
    }
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
  handleChange = key => value => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      certificateCompanyName: e.target.value

    }, () => {
      if(this.state.certificateCompanyName)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.certificateCompanyName}`)
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
          certificateCompanyName: ''
        })

    })
  }
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/personInfo/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{
            this.fetchPersonInfo()
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
  resetSearch=() => {
    this.setState({
      currentlevel:1,
      lastlevel:0,
      page:1,
      aptitudeTypeId: null,
      aptitudeLargeId: null,
      aptitudeSmallId: null,
      aptitudeMajorId: null,
      levelId: null,
      companyId: '',
      personName: '',
      certificateSealId: '',
      certificateCompanyName: '',
      operator:'',
      operatorobj:{},
      updatetime:['', '']
    }, () => this.fetchPersonInfo(1))
  }
  componentDidMount() {
    this._isMounted = true
    this.findByPidAndType()
    this.fetchPersonInfo()
  }

  componentDidUpdate(prevProps) {
    this._isMounted = true
    if(this.props.location !== prevProps.location) {
      this.fetchPersonInfo()
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
      else if(Parse.page === 'person-update' && Parse.id)
        return <PersonForm isUpdatePage={true} />
      else if(Parse.page === 'person-qualification-list' && Parse.id)
        return <PersonQualificationList></PersonQualificationList>
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
            <Form.Item label="姓名:" style={{marginRight:'30px'}}>
              <Input size="small" onChange={this.handleChange('personName')} value={this.state.personName} />
            </Form.Item>
            <Form.Item label="注册号:" style={{marginRight:'30px'}}>
              <Input size="small" onChange={this.handleChange('certificateSealId')} value={this.state.certificateSealId} />
            </Form.Item>
            <Form.Item label="所属企业:">
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={this.state.certificateCompanyName}
                onChange={this.handleQueryChange}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.companyName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.setState({
                    ...this.state,
                    certificateCompanyName:value,
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
            <Form.Item label={'更新时间:'}>
              <DateRangePicker
                value={this.state.updatetime}
                placeholder="选择日期范围"
                onChange={this.handleChange('updatetime') }
              />

            </Form.Item>
            <Form.Item>
              <Button type="primary"
                      icon={'search'} size="small" onClick={() => this.fetchPersonInfo()}>搜索</Button>
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

export default PersonList
