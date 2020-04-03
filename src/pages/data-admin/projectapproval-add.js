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
import Autocomplete from 'react-autocomplete'
import { Http } from '../../services'
import {formatDate, isEmptyObject, setStateWrap} from '../../utils'
import { parse } from 'query-string'
import _ from 'lodash'

class ProjectapprovalAdd extends React.Component {
  state = {
    loading: false,
    labelPosition: 'right',
    isAdd: false,
    provinceData: [],
    regionData: [],
    regionValue: '',
    provinceValue: '',
    projectType:[],
    repeatCompanyName: '',
    repeatsocialCreditCode: '',
    companyId:'',
    form: {
      projectName:'',
      constructionUnit:'',
      projectNum:'',
      constructionScale:'',
      projectStatus:'',
      investmentFunds:'',
      fundsSource:'',
      projectType:'',
      urlName:'',
      url:'',
      city:'',
      province:'全国',
      releaseTime:null,
      otherUrl:[]
    },
    suggestList:[],
    rules:{
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
      ],
      projectName:[{
        required: true,
        message: '项目名称不能为空',
        trigger: 'submit'
      }],
      releaseTime:[{
        required: true,
        type:'object',
        message: '发布时间不能为空',
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
                          return item.name.indexOf(this.state.form.city) != -1
                        }
                      )
                      if(matchCity.length) {
                        this.setState({
                          regionValue:matchCity[0].name,
                          form:{
                            ...this.state.form,
                            city:matchCity[0].name
                          }
                        })

                      }
                    }
                  }
                )
            }

          }else{
            this.setState({
              regionData: res.data.content
            })
            if(regionchecked){
              let matchCity= res.data.content.filter(item => {
                  return item.name.indexOf(this.state.form.city) != -1
                }
              )
              if(matchCity.length) {
                this.setState({
                  regionValue:matchCity[0].name,
                  form:{
                    ...this.state.form,
                    city:matchCity[0].name
                  }
                })

              }
            }
          }




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

          for (let state in content) {
            if(state in form) {
              this.setState({
                ...this.state,
                form: {
                  ...this.state.form,
                  province:!!content.province?content.province:'全国',
                  [state]: state === 'releaseTime' ? new Date(content[state]) : content[state].toString()
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
          province: province.length ? province[0].name : '',
          city:''
        }
      }, () => {
        if(!value) {
          this.setState({
            ...this.state,
            regionData: [],
            regionValue: ''
          })
        }
        if (level === 1 && this.state.form.province) {
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
          city: region.length ? region[0].name: null
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
    for (let state in form) {
      this.setState({
        ...this.state,
        regionValue: '',
        provinceValue: '',
        form: {
          [state]: '',
          province:'全国'
        }
      })
    }
    this.refs.form.resetFields()
  }
  submit = (url) => {
    this.setState({
      ...this.state,
      loading: true
    })
    Http.post(url, {
      ...this.state.form,
      otherUrl:[],
      province:this.state.form.province=='全国'?'':this.state.form.province,
      projectStage:"1",
      releaseTime: this.state.form.releaseTime?formatDate(this.state.form.releaseTime, false):'',
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
          this.props.history.push('/data-admin/projectapproval-list')
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
  fetchDictType=()=>{
    Http.get(`/dict/type/projectType`).then(res=>{
      this.setState({
        projectType:res.data.content
      })
    })
  }
  componentWillMount () {

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
  componentDidMount () {
    this.fetchRegionData(1)
    this.fetchDictType()
    if (this.props.isUpdatePage) {
      Promise.all([
        this.fetchRegionData(1),
        this.fetchCompanyInfoById()
      ]).then(() => {
        if(_.get(this.state,'form.province')==''){
          return
        }
        let matchProvince = this.state.provinceData.filter(item =>{
          return item.provinceName.indexOf(_.get(this.state,'form.province')) != -1
        }
        )
        if(matchProvince.length>0&&_.get(this.state,'form.province')!='') {
          this.setState({
            form:{
              ...this.state.form,
              province:matchProvince[0].name||''
            }
          })
          console.log('1111')
          this.fetchRegionData(2, matchProvince[0].id,true,matchProvince[0].name)

        }
      })
    }
  }
  componentWillUpdate (prevProps, prevState) {
  }
  render () {
    let { form, rules, isAdd } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">立项信息{this.props.isUpdatePage ? '修改' : '新增'}</h3>
        <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
          <Form ref="form" model={form} rules={rules} labelWidth={100}>
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
            <Form.Item label="项目状态" prop="projectStatus" >
              <Input value={form.projectStatus} size="small" onChange={this.handleChange('projectStatus')} style={{ width: '120px' }} />
            </Form.Item>
            <Form.Item label="项目属地" prop="f" >
              <Select
                clearable
                size="small"
                placeholder="请选择"
                style={{ marginRight: '10px',width:'132px'}}
                value={form.province}
                onChange={this.handleSelectChange(1)}
              >
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>{
              form.province=='全国'?null:<Select
                clearable
                size="small"
                placeholder="请选择"
                style={{ marginRight: '10px',width:'132px'}}
                value={form.city}
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
            <Form.Item label="发布时间" prop="releaseTime">
              <DatePicker
                value={form.releaseTime}
                placeholder="选择日期"
                onChange={this.handleChange('releaseTime')
                } />
            </Form.Item>
            <Form.Item label="总投资" prop="investmentFunds" >
              <Input value={form.investmentFunds} size="small" onChange={this.handleChange('investmentFunds')} style={{ width: '120px' }} />
              <span style={{ marginLeft: '10px', color: '#48576a' }}>万</span>
            </Form.Item>
            <Form.Item label="资金来源" prop="fundsSource">
              <Select
                clearable
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={form.fundsSource}
                onChange={this.handleChange('fundsSource')}
              >
                {
                  [{value:'业主自筹',label:'业主自筹'},{value:'银行贷款',label:'银行贷款'},{value:'国有资金',label:'国有资金'}].map(data =>
                    <Select.Option key={data.value} label={data.label} value={data.value} />
                  )
                }
              </Select>
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
              <Button onClick={() => this.props.history.push('/data-admin/projectapproval-list')}>取消</Button>
            </Form.Item>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(ProjectapprovalAdd)
