import React from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Message,
  Radio
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
class BehaviorForm extends React.Component {
  _isMounted = false

  state = {
    loading: false,
    disabled: false,
    suggestList: [],
    provinceData: [],
    regionData: [],
    provinceValue: '',
    regionValue: '',
    visible: false,
    behaviorTypeList: [],
    query: '',
    id: '',
    comobj:{},
    recordType: '',
    screenshotFileList:[],
    uploadType:'1',
    clipUploadData:{},
    form: {
      mainId: '',
      mainType: 'QY',
      recordType: '',
      recordName: '',
      recordMain: '',
      publishDate: null,
      inDate: null,
      outDate: null,
      areaCode: '',
      url: '',
      sourceName: '',
      content: '',
      department: '',
      referNum: '',
      relevantPerson:'',
      relevantProject:'',
      relevantProjectName: '',
      relevantPersonName: '',
      screenshotId:''
    },
    rules: {
      recordType: [{
        required: true,
        trigger:'submit'
      }],
      recordName: [{
        required: true,
        trigger: 'submit',
        message: '诚信名称不能为空'
      }],
      recordMain: [{
        required: true,
        trigger: 'submit',
        message: '诚信主体不能为空'
      }],
      inDate: [{
        type: 'date',
        required: true,
        trigger: 'submit',
        message: '请选择发布开始时间'
      }],
      // outDate: [{
      //   type: 'date',
      //   required: true,
      //   trigger: 'submit',
      //   message: '请选择发布截止时间'
      // }],
      areaCode: [{

      }],
      relevantProject: [{}],
      relevantPerson: [{}],
      // department: [{
      //   required: true,
      //   trigger: 'submit',
      //   message: '认定单位不能为空'
      // }],
      // referNum: [{
      //   required: true,
      //   trigger: 'submit',
      //   message: '认定文号不能为空'
      // }],
      // content: [{
      //   required: true,
      //   trigger: 'submit',
      //   message: '认定依据不能为空'
      // }],
      sourceName: [{
        required: true,
        trigger: 'submit',
        message: '来源名称不能为空'
      }],
      url: [{
        required: true,
        trigger: 'submit',
        message: '来源url不能为空'
      }, {
        validator: (rules, value, callback) => {
          var urlReg = /^(https?:\/\/).+$/
          if(!urlReg.test(value)) {
            callback(new Error('来源url格式错误,重新输入'))
          }
          else
            callback()
        },
        trigger: 'submit'
      }]


    }
  }
  fetchBehaviorType = () => {
    Http.get('/dict/behaviorType')
      .then(res => {
        if(res.data.content)
          setStateWrap.call(this, {
            ...this.state,
            behaviorTypeList: res.data.content,
            recordType:_.get(res, 'data.content[0]["dictName"]', ''),
            visible: true,
            form: {
              recordType: _.get(res, 'data.content[0]["dictName"]', '') === '荣誉信息' ? 'honor' : 'bad'
            }
          }, this._isMounted)
      })
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchBehaviorType()
    this.fetchRegionData(1)
    if (this.props.isUpdatePage) {
      this.setState({
        ...this.state,
        visible: true
      })
      Promise.all([
        this.fetchRegionData(1),
        this.fetchBehaviorInfoById()
      ]).then(() => {
        let matchProvince = this.state.provinceData.filter(item =>
          item.provinceName === this.state.provinceValue
        )
        console.log(matchProvince)
        if(matchProvince.length) {
          this.fetchRegionData(2, matchProvince[0].id)
        }
      })
    }else {
      this.setState({
        uploadType:'2'
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
      ...this.state,
      form: {
        ...this.state.form,
        [key]: value
      }
    }, () => {
      if(key == 'inDate') {
        this.setState({
          form:{
            ...this.state.form,
            publishDate: value
          }
        })
      }
    })
  }
  handleTypeChange = (value) => {
    this.setState({
      ...this.state,
      recordType: value
    }, () => {
      if(this.state.recordType) {
        this.setState({
          ...this.state,
          visible: true,
          form: {
            recordType: this.state.recordType === '荣誉信息' ? 'honor' : 'bad'
          }
        })
      }
    })
  }
  clipUploadChange=(res)=>{
    this.setState({
      clipUploadData:res,
      form:{...this.state.form, screenshotId:res.id?res.id:''}
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
          this.fetchRegionData(2, this.state.form.areaCode)
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
  fetchRegionData = (level, id = 0) => {
    return Http.get(`/dict/area/${id}`)
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
  fetchBehaviorInfoById = () => {
    let { location, match, history } = this.props
    let Parse = parse(location.search)
    let url =''
    if(!!Parse.editid){
      //批量导入里的编辑
      url=`/behavior/import/detail/${Parse.editid}`
    }else{
      url=`/behavior/select/${parse(location.search).id}`
    }
    return Http.get(url)
      .then(res => {
        let {content:rescontent} = res.data
        if(rescontent) {
          let { areaCode,
            cityName,
            department,
            effective,
            id,
            inDate,
            labels,
            relevantPersonName,
            mainId,
            mainType,
            outDate,
            provinceName,
            publishDate,
            recordMain,
            recordName, recordType,
            referNum,
            relevantProject,
            relevantProjectName,
            relevantPerson,
            sourceName,
            content,
            screenshotId,
            importId,
            url} = rescontent
          this.setState({
            comobj:{
              recordMain:recordMain,
              mainId:mainId
            },
            provinceValue: rescontent.provinceName || '',
            regionValue: rescontent.cityName || '',
            recordType: rescontent.recordType === 'honor' ? '荣誉信息' : '不良信息',
            disabled: true,
            form: {
              mainId,
              mainType,
              recordType,
              recordName,
              recordMain,
              publishDate,
              areaCode,
              url,
              sourceName,
              department,
              referNum,
              relevantProject,
              relevantProjectName,
              relevantPersonName,
              screenshotId,
              content,
              importId,
              relevantPerson,
              inDate: inDate ? new Date(inDate) : null,
              outDate: outDate ? new Date(outDate) : null
            }
          })
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
        }

      })
  }
  reset = () => {
    let { form } = this.state
    this.setState({
      regionValue: '',
      provinceValue: '',
      screenshotFileList:[],
      form: {
        mainId: '',
        mainType: 'QY',
        recordType: '',
        recordName: '',
        recordMain: '',
        publishDate: null,
        inDate: null,
        outDate: null,
        areaCode: '',
        url: '',
        sourceName: '',
        content: '',
        department: '',
        referNum: '',
        relevantPerson:'',
        relevantProject:'',
        relevantProjectName: '',
        relevantPersonName: '',
        screenshotId:''
      }
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
    this.setState({
      loading: true
    })
    let id = ''
    let { location, match, history } = this.props
    let Parse = parse(location.search)
    if(!!Parse.editid){
      //批量导入里的编辑
      id=Parse.editid
    }else{
      id=Parse.id
    }
    if(this.state.form.mainId==''||(this.state.comobj.recordMain!=this.state.form.recordMain)){
      Message({
        type:'warning',
        message:"所选企业不合法,请重新确认!"
      })
      this.setState({
        ...this.state,
        loading: false
      })
      return
    }
    Http.post(url, {
      ...this.state.form,
      provinceName: this.state.provinceValue,
      cityName:this.state.regionValue,
      publishDate: this.state.form.publishDate ? formatDate(this.state.form.publishDate, false) : null,
      inDate: this.state.form.inDate ? formatDate(this.state.form.inDate, false) : null,
      outDate: this.state.form.outDate ? formatDate(this.state.form.outDate, false) : null,
      id: id,
      esId: this.props.isUpdatePage ? parse(this.props.location.search).esId : null
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
          if(!!Parse.editid){
            this.props.history.push({
              pathname: this.props.match.url,
              search: `page=behavior-upload-list&id=${Parse.id}`
            })
          }else{
            this.props.history.push('/data-admin/behavior-list')
          }

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
        screenshotId:''
      }
    })
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if (this.props.isUpdatePage){
          let { location, match, history } = this.props
        let Parse = parse(location.search)
          if(!!Parse.editid){
            this.submit(`/behavior/import/detail/update`)
          }else{
            this.submit(`/behavior/update`)
          }
        }
        else
          this.submit('/behavior/add')
      } else {
        return false
      }
    })
  }
  onFileChange=(res) => {
    if(res && res.length > 0) {
      this.setState({
        form:{...this.state.form, screenshotId:res[0].id}
      })
    }
  }

  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      form: {
        ...this.state.form,
        recordMain: e.target.value
      }
    }, () => {
      if(this.state.form.recordMain)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.form.recordMain}`)
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
          form: {
            ...this.state.form,
            recordMain: ''
          }
        })

    })
  }
  changeUploadType=(value)=>{
    this.setState({
      uploadType:value,
      form:{
        ...this.state.form,
        screenshotId:''
      }
    })
  }
  render() {
    let isedit = this.props.isUpdatePage ? '修改' : '新增'
    let status = this.state.form.recordType === 'bad' ? '不良' : '荣誉'
    return (
      <React.Fragment>
        <h3 className="page-title">{`${status}信息${isedit}`}
          { this.props.isUpdatePage ? <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span> : ''}

        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth={150}>
          <Form.Item label="诚信类型" prop="recordType">
            <Select size="small" disabled={this.state.disabled} onChange={this.handleTypeChange} value={this.state.recordType}>
              {
                this.state.behaviorTypeList.map(data =>
                  <Select.Option key={data.id} value={data.dictName} label={data.dictName} />)
              }
            </Select>
          </Form.Item>
          {
            this.state.visible ? <div>
              <Form.Item prop="recordName" label={`${status}名称`}>
                <Input size="small" style={{width:'300px'}} onChange={this.handleChange('recordName')} value={this.state.form.recordName} />
              </Form.Item>
              <Form.Item prop="recordMain" label={`${status}主体`}>
                <Autocomplete
                  items={this.state.suggestList}
                  getItemValue={item => item.companyName}
                  value={this.state.form.recordMain}
                  onChange={this.handleQueryChange}
                  renderItem={(item, isHighlighted) =>
                    <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                      {item.companyName}
                    </p>
                  }
                  onSelect={(value, data) => {
                    this.setState({
                      ...this.state,
                      comobj:{
                        recordMain:value,
                        mainId: data.companyId
                      },
                      form:{
                        ...this.state.form,
                        recordMain:value,
                        mainId: data.companyId
                      }
                    })}}
                  wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}
                />
              </Form.Item>
              <Form.Item prop="inDate" label={`发布时间`}>
                <DatePicker
                  value={this.state.form.inDate || null}
                  className="el-input el-input--small"
                  format="yyyy-MM-dd"
                  placeholder="发布时间"
                  onChange={this.handleChange('inDate')}
                />
              </Form.Item>
              <Form.Item prop="outDate" label={`截止时间`}>
                <DatePicker
                  value={this.state.form.outDate || null}
                  className="el-input el-input--small"
                  format="yyyy-MM-dd"
                  placeholder="截止时间"
                  onChange={this.handleChange('outDate')}
                />
              </Form.Item>
              <Form.Item prop="areaCode" label={`所在地`}>
                <Select size="small"
                        placehoder="请选择"
                        clearable
                        style={{marginRight:'15px'}}
                        value={this.state.provinceValue}
                        onChange={this.handleSelectChange(1)}
                >
                  {
                    this.state.provinceData.map(data =>
                      <Select.Option key={data.id} label={data.name} value={data.name} />
                    )
                  }
                </Select>
                <Select size="small"
                        placehoder="请选择"
                        clearable
                        value={this.state.regionValue}
                        onChange={this.handleSelectChange(2)}
                >
                  {
                    this.state.regionData.map(data =>
                      <Select.Option key={data.id} label={data.name} value={data.name} />
                    )
                  }
                </Select>
              </Form.Item>
              <Form.Item label="相关工程" prop="relevantProjectName">
                <Input size="small" onChange={this.handleChange('relevantProjectName')} value={this.state.form.relevantProjectName} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="相关人员" prop="relevantPersonName">
                <Input size="small" onChange={this.handleChange('relevantPersonName')} value={this.state.form.relevantPersonName} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="认定文号" prop="referNum">
                <Input size="small" onChange={this.handleChange('referNum')} value={this.state.form.referNum} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="认定单位" prop="department">
                <Input size="small" onChange={this.handleChange('department')} value={this.state.form.department} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="认定依据" prop="content">
                <Input size="small" onChange={this.handleChange('content')} value={this.state.form.content} style={{width:'300px'}}/>
              </Form.Item>
              <Form.Item label="来源名称" prop="sourceName">
                <Input size="small" onChange={this.handleChange('sourceName')} value={this.state.form.sourceName} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="来源URL" prop="url">
                <Input size="small" onChange={this.handleChange('url')} value={this.state.form.url} style={{width:'300px'}} />
              </Form.Item>
              <Form.Item label="信息快照" prop="screenshotId">
                <Radio.Group value={this.state.uploadType} onChange={this.changeUploadType} size={'small'}>
                  <Radio.Button value="1" >文件方式上传</Radio.Button>
                  <Radio.Button value="2" >截图方式上传</Radio.Button>
                </Radio.Group>
                {this.state.uploadType == '1'?  <ImageUpload onChange={this.onFileChange} phd={'上传图片'} ref={node=>this.mynode1=node} fileList={_.get(this.state, 'screenshotFileList')} delete={() => this.delete()}></ImageUpload>
                  :<ClipUpload onChange={this.clipUploadChange} ref={node=>this.mynode=node}></ClipUpload>}
                <div>请上传不超过5M的图片</div>
              </Form.Item>
              <Form.Item>
                <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                  {this.props.isUpdatePage ? '确认修改' : '确认新增'}
                </Button>
                <Button onClick={this.reset}>重置</Button>
                <Button onClick={() =>{
                  let { location, match, history } = this.props
                  let Parse = parse(location.search)
                  if(!!Parse.editid){
                    this.props.history.push({
                      pathname: this.props.match.url,
                      search: `page=behavior-upload-list&id=${Parse.id}`
                    })
                  }else{
                    this.props.history.push('/data-admin/behavior-list')
                  }

                }} >取消</Button>
              </Form.Item>

            </div> : null
          }
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(BehaviorForm)
