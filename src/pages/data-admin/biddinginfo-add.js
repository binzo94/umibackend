import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Message
} from 'element-react'
import { Http } from '../../services'
import { formatDate, isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import Autocomplete from 'react-autocomplete'
import _ from 'lodash'

class BiddinginfoAdd extends React.Component {
  state = {
    loading: false,
    labelPosition: 'right',
    isAdd: false,
    provinceData: [],
    regionData: [],
    regionValue: '',
    provinceValue: '全国',
    companyId:'',
    projectType:[],
    suggestListQ1:[],
    suggestListQ2:[],
    qualificationRequireMin1:"",
    qualificationRequireMin2:'',
    showother:false,
    suggestList:[],
    form: {
      projectName:'',
      constructionUnit:'',
      projectNum:'',
      constructionScale:"",
      qualificationRequire:'',
      qualificationRequireMin:'',
      investmentFunds:'',
      projectType:'',
      bidStartTime:null,
      bidEndTime:null,
      tenderType:'',
      urlName:'',
      url:'',
      otherUrl:''
    },
    rules:{
      projectName:[{
        required: true,
        message: '项目名称不能为空',
        trigger: 'submit'
      }],
      qualificationRequire:[
        { required: true,
          message: '资格要求不能为空',
          trigger: 'submit'}
      ],
      investmentFunds:[ {
        validator: (rules, value, callback) => {
          var urlReg =  /^\d+(\.\d+)?$/
          if(!urlReg.test(value)&&_.trim(value)!='') {
            callback(new Error('金额必须是数字'))
          }
          else{
            callback()
          }

        },
        trigger: 'submit'
      }
      ]
      ,
      bidStartTime:[{
        required: true,
        type:'object',
        message: '开始时间不能为空',
        trigger: 'submit'
      }],
      bidEndTime:[{
        required: true,
        type:'object',
        message: '结束时间不能为空',
        trigger: 'submit'
      }],
      urlName:[{
        required: true,
        message: '来源名称不能为空',
        trigger: 'submit'
      }],
      url:[{
        required: true,
        message: '来源URL不能为空',
        trigger: 'submit'
      }]
    }
  }
  isNeedNewContact = (status) => {
    this.setState({
      ...this.state,
      isAdd: status
    })
  }
  //第三个参数为true,根据已有的regionValue找到对应的areacode
  fetchRegionData = (level, id = 0,regionchecked,value) => {
    return Http.get(`/dict/area/${id}`)
      .then(res => {
        if (res.data.content) {
          if (level === 1) {
            this.setState({
              ...this.state,
              provinceData: [{id:'',name:'全国',provinceName:''}].concat(_.get(res,'data.content',[]))
            })
          }
        }
        if (level === 2) {
          if(!!value&&['上海市','天津市','重庆市','北京市'].some((item)=>{return item.indexOf(value)!=-1})){
            let zxid = _.get(res,"data.content[0]['id']",'')
            if(zxid!=''){
              Http.get(`/dict/area/${zxid}`)
                .then(
                  res1=>{
                    this.setState({
                      regionData: res1.data.content
                    })
                    if(regionchecked){
                      let matchCity= res1.data.content.filter(item => {
                          return item.name.indexOf(this.state.regionValue) != -1
                        }
                      )
                      if(matchCity.length>0) {
                        this.setState({
                          regionValue:matchCity[0].name,
                          form:{
                            ...this.state.form,
                            regisAddress:matchCity[0].name
                          }
                        })

                      }
                    }
                  }
                )
            }

          }else{
            this.setState({
              ...this.state,
              regionData: res.data.content
            })
            if(regionchecked){
              let matchCity= res.data.content.filter(item => {
                  return item.cityName.indexOf(this.state.regionValue) != -1
                }
              )
              if(matchCity.length>0) {
                this.setState({
                  regionValue:matchCity[0].name,
                  form:{
                    ...this.state.form,
                    regisAddress:matchCity[0].name
                  }
                })

              }
            }

          }

        }
      })
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    let {form} = this.state
    this.setState({
      form:{...form,constructionUnit:e.target.value}
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.form.constructionUnit}`)
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
  fetchCompanyInfoById = () => {
    let { location, match, history } = this.props
    return Http.get(`/bid/tender/get/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let {content} = res.data
          let {form} = this.state
          this.setState({
            provinceValue:!!content.province?content.province:'全国',
            regionValue:content.city
          })
          if(!!content.qualificationRequireMin&&content.qualificationRequireMin.indexOf(',')!=-1){
            let qualificationRequireMinArray =content.qualificationRequireMin.split(',')
            if(qualificationRequireMinArray.length>1){
              this.setState({
                qualificationRequireMin1:qualificationRequireMinArray[0],
                qualificationRequireMin2:qualificationRequireMinArray[1],
                showother:true
              })
            }else{
              this.setState({
                qualificationRequireMin1:qualificationRequireMinArray[0],
                qualificationRequireMin2:'',
                showother:false
              })
            }
          }else{
            this.setState({
              qualificationRequireMin1:content.qualificationRequireMin,
              qualificationRequireMin2:'',
              showother:false
            })
          }

          for (let state in content) {
            if(state in form) {
              this.setState({
                form: {
                  ...this.state.form,
                  [state]: state === 'bidStartTime'||state==='bidEndTime'? new Date(content[state]) : content[state].toString()
                }
              }, () => {
              })
            }
          }

        }
      })
  }

  getAreaCode = (level, id) => {


  }

  handleSelectChange = level => value => {
    let province = this.state.provinceData.filter(item => item.name === value)
    let region = this.state.regionData.filter(item => item.name === value)
    if(level === 1) {

      this.setState({
        provinceValue: value,
        form: {
          ...this.state.form,
          areaCode: province.length ? province[0].name : ''
        }
      }, () => {
        if(!value) {
          this.setState({
            ...this.state,
            regionData: [],
            regionValue: ''
          })
        }
        if (level === 1 && this.state.form.areaCode) {
          this.setState({
            ...this.state,
            regionData: [],
            regionValue: ''
          })
          this.fetchRegionData(2, province[0].id,false,province[0].name)
        }
      })
    }
    else {
      this.setState({
        regionValue: value,
        form: {
          ...this.state.form,
          regisAddress: region.length ? region[0].name: null
        }
      }, () => {
      })
    }

  }
  handleChange = (key) => (value) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: value
      }
    })
  }
  reset = () => {
    let { form } = this.state
    this.setState({
      regionValue: '',
      provinceValue: '全国',
      qualificationRequireMin1:"",
      qualificationRequireMin2:'',
      showother:false,
      form: {
      projectName:'',
        constructionUnit:'',
        projectNum:'',
        constructionScale:"",
        qualificationRequire:'',
        qualificationRequireMin:'',
        investmentFunds:'',
        projectType:'',
        bidStartTime:null,
        bidEndTime:null,
        tenderType:'',
        urlName:'',
        url:'',
        otherUrl:[]
    }})
    this.refs.form.resetFields()
  }
  submit = (url) => {
    let {form}=this.state
    if(this.state.provinceValue!='全国'&&this.state.regionValue==''){
      Message({
        type:'warning',
        message:"请选择完整项目属地!"
      })
      return
    }
    this.setState({
      loading: true
    })
    let qualificationRequireMin=this.state.qualificationRequireMin2==''?this.state.qualificationRequireMin1:this.state.qualificationRequireMin1+','+this.state.qualificationRequireMin2
    Http.post(url, {
      ...this.state.form,
      projectStage:"2",
      qualificationRequireMin,
      otherUrl:[],
      province:this.state.provinceValue=='全国'?'':this.state.provinceValue,
      city:this.state.regionValue,
      bidStartTime:form.bidStartTime?formatDate(form.bidStartTime):"",
      bidEndTime:form.bidEndTime?formatDate(form.bidEndTime):'',
      id: this.props.isUpdatePage ? parse(this.props.location.search).id : null
    }).then(res => {
      this.setState({
        ...this.state,
        loading: false
      })
      if (res.data.code == '0') {
        Message({
          type:'success',
          message:"操作成功!"
        })
        setTimeout(()=>{

          this.props.history.push('/data-admin/biddinginfo-list')
        },1000)
      }
      else {
        Message({
          type:'error',
          message:"操作失败!"+res.data.message
        })
      }
    }).catch(err => {
      this.setState({
        ...this.state,
        loading: false
      })
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if (this.props.isUpdatePage)
          this.submit('/bid/tender/update')
        else
          this.submit('/bid/tender/add')
      } else {
        return false
      }
    })
  }
  componentWillMount () {

  }
  fetchDictType=()=>{
    Http.get(`/dict/type/projectType`).then(res=>{
      this.setState({
        projectType:res.data.content
      })
    })
  }

  componentDidMount () {
    this.fetchDictType()
    this.fetchRegionData(1)
    if (this.props.isUpdatePage) {
      Promise.all([
        this.fetchRegionData(1),
        this.fetchCompanyInfoById()
      ]).then(() => {
        if(this.state.provinceValue==''){
          return
        }
        let matchProvince = this.state.provinceData.filter(item =>{
          return item.provinceName.indexOf(this.state.provinceValue) != -1
        }
        )
        if(matchProvince.length>0&&this.state.provinceValue!='') {
          this.setState({
            provinceValue:matchProvince[0].name,
            form:{
              ...this.state.form
            }
          })
          this.fetchRegionData(2, matchProvince[0].id,true,matchProvince[0].name)

        }
      })
    }
  }
  handleQueryChangeQ1= (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    let {form} = this.state
    this.setState({
      qualificationRequireMin1:e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.get(`/qualification/selectByAptitude`,{
            aptitude:`${this.state.qualificationRequireMin1}`
          })
            .then(res => {
              this.setState({
                suggestListQ1: res.data.content
              })
            })
        }, 300)
      else {
        this.setState({
          suggestListQ1: []
        })
      }
    })
  }
  handleQueryChangeQ2= (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    let {form} = this.state
    this.setState({
      qualificationRequireMin2:e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.get(`/qualification/selectByAptitude`,{
            aptitude:`${this.state.qualificationRequireMin2}`
          })
            .then(res => {
              this.setState({
                suggestListQ2: res.data.content
              })
            })
        }, 300)
      else {
        this.setState({
          suggestListQ2: []
        })
      }
    })
  }
  computeStr=(long,short)=>{
    let longArr=long.split('')
    let shortArr=short.split('')
    return longArr.map((item)=>{
      if(_.indexOf(shortArr,item)!=-1){
        return <span style={{color:'red'}}>{item}</span>
      }else {
        return <span>{item}</span>
      }
    })
  }
  componentWillUpdate (prevProps, prevState) {
  }
  render () {
    let { form, rules, isAdd } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">招标信息{this.props.isUpdatePage ? '修改' : '新增'}</h3>
        <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
          <Form ref="form" model={form} rules={rules} labelWidth={140}>
            <Form.Item label="项目名称" prop="projectName" >
              <Input value={form.projectName} size="small" onChange={this.handleChange('projectName')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="建设单位" prop="constructionUnit" >
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={form.constructionUnit}
                onChange={this.handleQueryChange}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
                onSelect={value => this.setState({form: {...this.state.form,constructionUnit:value}})}
                wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
              />
            </Form.Item>
            <Form.Item label="项目编号" prop="projectNum" >
              <Input value={form.projectNum} size="small" onChange={this.handleChange('projectNum')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="建设规模" prop="constructionScale" >
              <Input
                value={form.constructionScale} size="small" onChange={this.handleChange('constructionScale')} style={{ width: '600px' }}
                type="textarea"
                autosize={{ minRows: 6, maxRows: 8}}
                placeholder="请输入建设规模"
              />

            </Form.Item>
            <Form.Item label="项目属地" prop="f" className={'auth-required bid'} style={{position:'relative'}}>
              <Select
                clearable
                size="small"
                placeholder="请选择"
                style={{ marginRight: '10px',width:'132px' }}
                value={this.state.provinceValue}
                onChange={this.handleSelectChange(1)}
              >
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>
              {this.state.provinceValue=='全国'?null:
                <Select
                  clearable
                  size="small"
                  style={{ marginRight: '10px',width:'132px' }}
                  placeholder="请选择"
                  value={this.state.regionValue}
                  onChange={this.handleSelectChange(2)}
                >
                  {
                    this.state.regionData.map(data =>
                      <Select.Option key={data.id} value={data.name} label={data.name} />
                    )
                  }
                </Select>
              }
            </Form.Item>
            <Form.Item label="总投资" prop="investmentFunds" >
              <Input value={form.investmentFunds} size="small" onChange={this.handleChange('investmentFunds')} style={{ width: '120px' }} />
              <span style={{ marginLeft: '10px', color: '#48576a' }}>万</span>
            </Form.Item>
            <Form.Item label="资格要求" prop="qualificationRequire" >
              <Input
                value={form.qualificationRequire} size="small" onChange={this.handleChange('qualificationRequire')} style={{ width: '600px' }}
                type="textarea"
                autosize={{ minRows: 6, maxRows: 8}}
                placeholder="请输入资格要求"
              />

            </Form.Item>
            <Form.Item label={this.state.showother?'最低资质要求1':'最低资质要求'} className={''}>
              <Autocomplete
                items={this.state.suggestListQ1}
                getItemValue={item => item.aptitude}
                value={this.state.qualificationRequireMin1}
                onChange={this.handleQueryChangeQ1}
                renderItem={(item, isHighlighted) => {
                  return <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{this.computeStr(item.aptitude,this.state.qualificationRequireMin1)}</p>
                }}
                onSelect={value => this.setState({qualificationRequireMin1:value})}
                wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
              />
              <i onClick={()=>{this.setState({showother:true})}} className="el-icon-plus" style={{marginLeft:'15px',color:'#1890ff',cursor:'pointer',display:this.state.showother?'none':''}}></i>
            </Form.Item>
            <Form.Item label="最低资质要求2" style={{display:this.state.showother?'block':'none'}} >
              <Autocomplete
                items={this.state.suggestListQ2}
                getItemValue={item => item.aptitude}
                value={this.state.qualificationRequireMin2}
                onChange={this.handleQueryChangeQ2}
                renderItem={(item, isHighlighted) => {
                  return <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{this.computeStr(item.aptitude,this.state.qualificationRequireMin2)}</p>
                }}
                onSelect={value => this.setState({qualificationRequireMin2:value})}
                wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
              />
              <i onClick={()=>{this.setState({showother:false,qualificationRequireMin2:''})}} className="el-icon-minus" style={{marginLeft:'15px',color:'red',cursor:'pointer'}}></i>
            </Form.Item>
            <Form.Item label="项目类型" prop="projectType">
              <Select
                clearable
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={form.projectType}
                onChange={this.handleChange('projectType')}
              >
                {
                  this.state.projectType.map(data =>
                    <Select.Option key={data.dictCode} label={data.dictName} value={data.dictCode} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="招投标开始时间" prop="bidStartTime">
              <DatePicker
                value={form.bidStartTime}
                isShowTime={true}
                format={'yyyy-MM-dd HH:mm:ss'}
                placeholder="选择日期"
                onChange={this.handleChange('bidStartTime')
                } />
            </Form.Item>
            <Form.Item label="招投标结束时间" prop="bidEndTime">
              <DatePicker
                value={form.bidEndTime}
                isShowTime={true}
                format={'yyyy-MM-dd HH:mm:ss'}
                placeholder="选择日期"
                onChange={this.handleChange('bidEndTime')
                } />
            </Form.Item>

            <Form.Item label="招标类型" prop="tenderType">
              <Select
                clearable
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={form.tenderType}
                onChange={this.handleChange('tenderType')}
              >
                {
                  [{value:'施工',label:'施工'},{value:'监理',label:'监理'},{value:'勘察/设计',label:'勘察/设计'}].map(data =>
                    <Select.Option key={data.value} label={data.label} value={data.value} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="信息来源" prop="urlName" >
              <Input value={form.urlName} size="small" onChange={this.handleChange('urlName')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="URL" prop="url" >
              <Input value={form.url} size="small" onChange={this.handleChange('url')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                {this.props.isUpdatePage ? '确认修改' : '确认新增'}
              </Button>
              <Button onClick={this.reset}>重置</Button>
              <Button onClick={() => this.props.history.push('/data-admin/biddinginfo-list')}>取消</Button>
            </Form.Item>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(BiddinginfoAdd)
