import React from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Message,
  Radio,
  Checkbox
} from 'element-react'
import {withRouter} from 'react-router-dom'
import {parse} from 'query-string'
import {Http} from '../../services'
import {setStateWrap, formatDate} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {createHashHistory} from 'history'
import ImageUpload from '../../component/ImgUpload/ImageUpload'
import ClipUpload from '../../component/ImgUpload/ClipUpload'
import _ from 'lodash'
const history = createHashHistory()
class WinningbidForm extends React.Component {
  _isMounted = false

  state = {
    loading: false,
    disabled: false,
    suggestList: [],
    msuggestList:[],
    provinceData: [],
    regionData: [],
    provinceValue: '全国',
    regionValue: '',
    query: '',
    id: '',
    screenshotFileList:[],
    uploadType:'1',
    clipUploadData:{},
    otherUrl:[],
    newBidPm:[],
    inputDisabled:false,
    companyPersonList:[],form: {
      projectName:'',
      projectNum:'',
      urlName:'',
      url:'',
      personRegisterNum:'',
      bidTime:'',
      bidFunds:'',
      bidType:'',
      bidCompanyName:'',
      projectManager:'',
      projectManagerId:'',
      bidCompanyId:''
    },
    rules:{
      projectName:[{
        required: true,
        message: '项目名称不能为空',
        trigger: 'submit'
      }],
      bidFunds:[ {
        validator: (rules, value, callback) => {
          var urlReg =  /^\d+(\.\d+)?$/
          if(!urlReg.test(value)&&_.trim(value)!='') {
            callback(new Error('金额必须是数字'))
          }
          else
            callback()
        },
        trigger: 'submit'
      }
      ],
      bidCompanyName:[{
        required: true,
        message: '中标单位不能为空',
        trigger: 'submit'
      }],
      bidTime:[{
        required: true,
        type:'object',
        message: '中标时间不能为空',
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
  componentDidMount() {
    this._isMounted = true
    this.fetchRegionData(1)
    if (this.props.isUpdatePage) {
      this.setState({
        ...this.state,
        visible: true,
        inputDisabled:true
      })
      Promise.all([
        this.fetchRegionData(1),
        this.fetchBehaviorInfoById()
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
            provinceValue:matchProvince[0].name||''
          })
          this.fetchRegionData(2, matchProvince[0].id,true,matchProvince[0].name)
        }
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this._isMounted = true
    if(this.state.visible !== prevState.visible) {
      this.fetchRegionData(1)
    }
  }
  componentWillUnmount() {
    this._isMounted = false
  }
  handleChange = key => (value) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: value
      }
    }, () => {
    })
  }
  clipUploadChange=(res)=>{
    this.setState({
      clipUploadData:res,
      form:{...this.state.form, bidSnapshoot2:res.id?res.id:''}
    })
  }
  handleSelectChange = level => value => {
    let province = this.state.provinceData.filter(item => item.name === value)
    let region = this.state.regionData.filter(item => item.name === value)
    if(level === 1) {

      this.setState({
        ...this.state,
        provinceValue: value,
        form: {
          ...this.state.form,
          areaCode: province.length ? province[0].id : null
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
          this.fetchRegionData(2, this.state.form.areaCode,false,province[0].name)
        }
      })
    }
    else {
      this.setState({
        ...this.state,
        regionValue: value,
        form: {
          ...this.state.form,
          areaCode: region.length ? region[0].id : null
        }
      }, () => {
      })
    }

  }
  fetchRegionData = (level, id = 0,regionchecked=false,value) => {
    return Http.get(`/dict/area/${id}`)
      .then(res => {
        if(res.data.content) {
          if(level === 1) {
            setStateWrap.call(this, {
              ...this.state,
              provinceData:[{id:'',name:'全国',provinceName:''}].concat(_.get(res,'data.content',[]))
            }, this._isMounted)

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
                  return item.cityName.indexOf(this.state.regionValue) != -1
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
  fetchBehaviorInfoById = () => {
    let { location, match, history } = this.props
    return Http.get(`/bid/tender/get/${parse(location.search).id}`)
      .then(res => {

        let {content} = res.data
        this.setState({
          provinceValue:!!content.province?content.province:'全国',
          regionValue:content.city,
          form:{
            ...content,
            oldProjectManagerId:content.projectManagerId,
            oldProjectManager:content.projectManager,
            oldBidCompanyId:content.bidCompanyId,
            oldBidCompanyName:content.bidCompanyName,
            oldPersonRegisterNum:content.personRegisterNum,
            bidSnapshoot1:content.bidSnapshoot,
            bidTime:content.bidTime?new Date(content.bidTime):null
          }
        },()=>{
          this.handleQueryChangeM({target:{
            value:content.projectManager
            }},false)
        })
        this.fetchCompanyList(content.bidCompanyName)
        if(content.otherUrl&&content.otherUrl.length>0){
          this.setState({
            otherUrl:content.otherUrl
          })
        }
        let screenshotId = content.bidSnapshoot
        // 处理图片
        if(!!screenshotId) {
          Http.post('/oss/get', {ids:screenshotId}).then((res) => {
            this.setState({
              screenshotFileList:[{
                uid: '-1',
                status: 'done',
                thumbUrl: _.get(res, 'data.content[0].resourceUrl') || ''
              }]
            })
          })
        }
      })
  }
  reset = () => {
    let { form } = this.state
    this.setState({
      ...this.state,
      inputDisabled:false,
      regionValue: '',
      provinceValue: '全国',
      otherUrl:[],
      screenshotFileList:[],
      newBidPm:[]
    })
    this.refs.form.resetFields()
    if(this.mynode){
      this.mynode.reset()
    }
    if(this.mynode1){
      this.mynode1.remove()
    }
  }
  submit = (url) => {
    if(this.state.newBidPm.length==0&&this.state.form.projectManager!=''&&this.state.form.personRegisterNum!=''){
      let result= _.findIndex(this.state.companyPersonList,{
        personName:this.state.form.projectManager,
        personRegisterNum:this.state.form.personRegisterNum
      })
      if(result==-1){
        Message({
          type:'warning',
          message:"该企业不存在该人员!如需要新增请勾选新增按钮！",
          duration:4000
        })
        return
      }
    }
    this.setState({
      ...this.state,
      loading: true
    })
    let params = {
      ...this.state.form,
      projectStage:'4',
      bidSnapshoot:this.state.uploadType=='1'?this.state.form.bidSnapshoot1:this.state.form.bidSnapshoot2,
      province:this.state.provinceValue=='全国'?'':this.state.provinceValue,
      city:this.state.regionValue,
      otherUrl:this.state.otherUrl,
      bidTime:this.state.form.bidTime?formatDate(this.state.form.bidTime,false):''
    }
    if(this.state.newBidPm.length>0){
      params.newBidPm='1'
    }
    Http.post(url, params).then(res => {
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

          this.props.history.push('/data-admin/winningbid-list')
        },1000)
      }
      else {
        Message({
          type:'error',
          message:"操作失败!"+res.data.message
        })
      }
    }).catch(err => {

    })
  }
  delete=() => {
    this.setState({
      screenshotFileList:[],
      form:{
        ...this.state.form,
        bidSnapshoot1:''
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if (this.props.isUpdatePage)
          this.submit(`/bid/tender/update`)
        else
          this.submit('/bid/tender/add')
      } else {
        return false
      }
    })
  }
  onFileChange=(res) => {
    if(res && res.length > 0) {
      this.setState({
        form:{...this.state.form, bidSnapshoot1:res[0].id}
      })
    }
  }

  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      form: {
        ...this.state.form,
        bidCompanyName: e.target.value
      }
    }, () => {
      if(this.state.form.bidCompanyName)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.form.bidCompanyName}`)
            .then(res => {
              this.setState({
                suggestList: res.data.content
              })
            })
        }, 300)
      else
        this.setState({
          suggestList: [],
          form: {
            ...this.state.form,
            bidCompanyName: ''
          }
        })

    })
  }
  handleQueryChangeM = (e,needIdEmpty=true) => {
    this.timer && clearTimeout(this.timer)
    this.timer1&& clearTimeout(this.timer1)
    this.setState({
      form: {
        ...this.state.form,
        projectManagerId:needIdEmpty?'':this.state.form.projectManagerId,
        projectManager: e.target.value
      }
    }, () => {
      if(this.state.form.projectManager){
        this.timer = setTimeout(() => {
          Http.get(`/merge/bidPmFilter`,{
            companyId:this.state.form.bidCompanyId,
            name:this.state.form.projectManager
          })
            .then(res => {
              this.setState({
                msuggestList: res.data.content
              })
            })

        }, 300)
        this.timer1=setTimeout(()=>{
          this.fetchCompanyList(this.state.form.bidCompanyName)
        },3000)
    }
      else
        this.setState({
          msuggestList: [],
          form: {
            ...this.state.form,
            projectManager: ''
          }
        })

    })
  }
  addUrlInput=()=>{
    this.setState({
      otherUrl:this.state.otherUrl.concat([{name:'',url:""}])
    })
}
  deleteUrlInput=(index)=>{
    let temp = this.state.otherUrl.concat([])
    temp.splice(index,1)
    this.setState({
      otherUrl:temp
    })
  }
  handleOtherUrlChange=(type,index)=>(val)=>{
    let temp = this.state.otherUrl.concat([])
    temp[index][type]=val
    this.setState({
      otherUrl:temp
    })
  }
  changeUploadType=(value)=>{
    this.setState({
      uploadType:value
    })
  }
  onCheckboxChange=(value)=>{
    this.setState({
      newBidPm:value
    })
    if(value.length>0){
      this.setState({
        inputDisabled:false
      })
    }else{
      let result= _.findIndex(this.state.msuggestList,{
        personName:this.state.form.projectManager,
        personRegisterNum:this.state.form.personRegisterNum
      })
      if(result!=-1){
        this.setState({
          inputDisabled:true
        })
      }
    }
    }
    fetchCompanyList=(value)=>{
      Http.get('/bid/pm/list', {
        companyName:value,
        page:1,
        size:10000
      }).then(res => {
        console.log(res.data.content)
        if(res.data.content) {
          this.setState({
            companyPersonList:res.data.content.content
          })
        }
      })
    }
  render() {
    console.log(this.state.newBidPm)
    console.log(this.state.newBidPm.length==0)
    let {form} = this.state
    let isedit = this.props.isUpdatePage ? '修改' : '新增'
    return (
      <React.Fragment>
        <h3 className="page-title">{`中标信息${isedit}`}
          { this.props.isUpdatePage ? <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span> : ''}

        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth={150}>
          <div>
            <Form.Item prop="projectName" label={`中标名称`}>
              <Input size="small" style={{width:'300px'}} onChange={this.handleChange('projectName')} value={this.state.form.projectName} />
            </Form.Item>
            <Form.Item prop="projectNum" label={`项目编号`}>
              <Input size="small" style={{width:'300px'}} onChange={this.handleChange('projectNum')} value={this.state.form.projectNum} />
            </Form.Item>
            <Form.Item prop="bidCompanyName" label={`中标单位`}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={this.state.form.bidCompanyName}
                onChange={this.handleQueryChange}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.companyName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.fetchCompanyList(value)
                  this.setState({
                    form:{
                      ...this.state.form,
                      bidCompanyName:value,
                      bidCompanyId: data.companyId
                    }
                  })}}
                wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'900'}}
              />
            </Form.Item>
            <Form.Item prop="projectManager" label={`项目经理`}>
              <Autocomplete
                items={this.state.msuggestList}
                getItemValue={item => item.personName}
                value={this.state.form.projectManager}
                onChange={this.handleQueryChangeM}
                inputProps={{
                  disabled:this.state.inputDisabled,
                  style:{
                  borderColor: this.state.inputDisabled?'#d1dbe5':'',
                  color: this.state.inputDisabled?'#bbb':'',
                  cursor: this.state.inputDisabled?'not-allowed':'',
                    backgroundColor:this.state.inputDisabled?'#eef1f6':''
                  }
                }}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.personName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.setState({
                    inputDisabled:true,
                    form:{
                      ...this.state.form,
                      projectManager:data.personName,
                      projectManagerId: data.personId,
                      personRegisterNum:data.personRegisterNum
                    }
                  })}}
                wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}
              />
              <Checkbox.Group value={this.state.newBidPm} onChange={this.onCheckboxChange} style={{display:'inline-block',marginLeft:'20px'}}>
                <Checkbox label="1">新增</Checkbox>
              </Checkbox.Group>
              <Button type="text"
                      style={{marginLeft:'20px'}}
                      nativeType="button" size="small"
                      onClick={() => this.setState({
                        inputDisabled:false
                      })}>
                重新选择</Button>
                </Form.Item>
            <Form.Item prop="personRegisterNum" label={`证件注册号`}>
              <Input disabled={this.state.inputDisabled} size="small" style={{width:'300px'}} onChange={this.handleChange('personRegisterNum')} value={this.state.form.personRegisterNum} />
            </Form.Item>
            <Form.Item label="中标来源" prop="urlName">
              <Input size="small" onChange={this.handleChange('urlName')} value={this.state.form.urlName} style={{width:'300px'}} />
              <i onClick={()=>this.addUrlInput()} className="el-icon-plus" style={{marginLeft:'15px',color:'#1890ff',cursor:'pointer',display:this.state.otherUrl.length>=2?'none':''}}></i>
            </Form.Item>
            <Form.Item label="来源URL" prop="url">
              <Input size="small" onChange={this.handleChange('url')} value={this.state.form.url} style={{width:'300px'}} />
            </Form.Item>
            {this.state.otherUrl.map((item,index)=>{
              return <div key={index}>
                <Form.Item label={"其它来源"+(index+1)} prop="urlName">
                  <Input size="small" onChange={this.handleOtherUrlChange('name',index)} value={item.name} style={{width:'300px'}} />
                  <i className="el-icon-minus" onClick={()=>this.deleteUrlInput(index)} style={{marginLeft:'15px',color:'red',cursor:'pointer'}}></i>
                </Form.Item>
                <Form.Item label={"其它来源URL"+(index+1)} prop="url">
                  <Input size="small" onChange={this.handleOtherUrlChange('url',index)} value={item.url} style={{width:'300px'}} />
                </Form.Item>
              </div>
            })}
            <Form.Item prop="areaCode" label={`所在地`}>
              <Select size="small"
                      placehoder="请选择"
                      clearable
                      style={{ marginRight: '10px',width:'132px' }}
                      value={this.state.provinceValue}
                      onChange={this.handleSelectChange(1)}
              >
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.name} />
                  )
                }
              </Select>
              {this.state.provinceValue!='全国'? <Select size="small"
                                                       placehoder="请选择"
                                                       clearable
                                                       style={{ marginRight: '10px',width:'132px' }}
                                                       value={this.state.regionValue}
                                                       onChange={this.handleSelectChange(2)}
              >
                {
                  this.state.regionData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.name} />
                  )
                }
              </Select>:null

            }

            </Form.Item>
            <Form.Item prop="bidTime" label={`中标时间`}>
              <DatePicker
                value={this.state.form.bidTime || null}
                className="el-input el-input--small"
                format="yyyy-MM-dd"
                placeholder="请选择中标时间"
                onChange={this.handleChange('bidTime')}
              />
            </Form.Item>
            <Form.Item label="中标金额" prop="bidFunds" >
              <Input value={form.bidFunds} size="small" onChange={this.handleChange('bidFunds')} style={{ width: '120px' }} />
              <span style={{ marginLeft: '10px', color: '#48576a' }}>万</span>
            </Form.Item>
            <Form.Item label="中标类型" prop="bidType">
              <Select
                clearable
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={form.bidType}
                onChange={this.handleChange('bidType')}
              >
                {
                  [{value:'勘察',label:'勘察'},
                    {value:'设计',label:'设计'},
                    {value:'施工',label:'施工'},
                    {value:'监理',label:'监理'},
                    {value:'设计施工一体化',label:'设计施工一体化'}].map(data =>
                    <Select.Option key={data.value} label={data.label} value={data.value} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="中标快照" prop="bidSnapshoot">
              <Radio.Group value={this.state.uploadType} onChange={this.changeUploadType} size={'small'}>
                <Radio.Button value="1" >文件方式上传</Radio.Button>
                <Radio.Button value="2" >截图方式上传</Radio.Button>
              </Radio.Group>
              <div style={{display:this.state.uploadType == '1'?'':'none'}}>
                <ImageUpload onChange={this.onFileChange} phd={'上传图片'} ref={node=>this.mynode1=node} fileList={_.get(this.state, 'screenshotFileList')} delete={() => this.delete()}></ImageUpload>

              </div>
              <div style={{display:this.state.uploadType == '2'?'':'none'}}>
                <ClipUpload onChange={this.clipUploadChange} ref={node=>this.mynode=node}></ClipUpload>

              </div>
             <div>请上传不超过5M的图片</div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                {this.props.isUpdatePage ? '确认修改' : '确认新增'}
              </Button>
              <Button onClick={this.reset}>重置</Button>
              <Button onClick={() => this.props.history.push('/data-admin/winningbid-list')} >取消</Button>
            </Form.Item>

          </div>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(WinningbidForm)
