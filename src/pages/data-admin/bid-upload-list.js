import React from 'react'
import {Table, Dialog,MessageBox, Button, Pagination, Upload, Radio,Message,Select,Form} from 'element-react'
import {Http} from '../../services'
import {handleEmpty, setStateWrap} from '../../utils'
import { BASEURL} from '../../config/config'
import {Redirect} from 'react-router-dom'
import BehaviorForm from './behavior-form'
import {parse} from 'query-string'
import BehaviorList from "./behavior-listforupload";
class BehaviorUploadList extends React.Component {
  _isMounted = false
  state = {
    page: 1,
    size: 10,
    data: null,
    fileList: [],
    type: 'bad',
    file: null,
    importType:'',
    status:'',
    columns: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    }, {
      label: '导入数据条数',
      prop: 'importSum',
      width:120
    }, {label:'导入失败条数',
      prop:'failSum',  width:120},
      {label:'es条数',
      prop:'esSum',  width:120},
      {label:'数据库条数',
      prop:'databaseNum',  width:120},{
      label: '导入文件',
      prop: 'importFile',
      width:190
    }, {
      label: '导入时间',
      prop: 'importTime',
  width:190
    }, {
      label: '导入类型',
      prop: 'importType',
      width:170,
      render:(data)=>{

        //1.立项  2.招标  3.废标  4.中标
        if(!!data.importType){
          return ['','立项','招标','废标','中标'][data.importType]
        }else{
          return  ''
        }

      }
    },
    {
      label: '导入状态',
      width:120,
      render:(data)=>{
        // 0=失败 1=导入中 2=成功
        if(!!data.status){
          return ['失败','导入中','成功'][data.status]
        }else{
          return  ''
        }

      }
    },
     {
      label: '完成时间',
      prop: 'completeTime',
       width:190
    }, {
      label: '操作',
        fixed:'right',
        width:150,
      render: (data) => {
        return <>
          {data.status=='0'?<Button type="text" size="small" onClick={() => this.seeFailReason(data)}>查看失败原因</Button>:null}
            <Button type="text" size="small" onClick={() => this.downloadFailData(data)}>下载</Button>
         </>
      }
    }],
    errorcolumns:[
      {label:'错误行数',
        prop:'line'},
      {label:'错误原因',
        prop:'reason'}
    ],
    errordata:[],
    dialogVisible2:false
  }
  seeFailReason=(data)=>{
    let remarkarr=data.remark.split('*')

    let errordata=remarkarr.map((i)=>{
      return {
        line:i.split(',')[0],
        reason:i.split(',')[1]
      }
    })
    this.setState({
      errordata,
      dialogVisible2:true
    })
  }
  resetSearch=()=>{
    this.setState({
      importType:'',
      status:''
    },()=>{
      this.fetchBehaviorTask()
    })
  }
  editData=(data)=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=behavior-upload-list&id=${data.id}`
    })
  }
  goSyn = (data,isCovered)=>{
    Http.get(`/behavior/import/sync/${data.id}`,{
      isCovered:isCovered
    })
      .then(res => {
        if(res.data.code == '0') {
          Message({
            type:'success',
            message: res.data.message
          })
          this.fetchBehaviorTask()
        }else{
          Message({
            type:'error',
            message: '同步失败!'+res.data.message
          })
        }
      })

  }
  downloadFailData = (data) => {

    window.open(BASEURL+`/export/task/fail?id=${data.id}&importType=${data.importType}`,'_blank')
  }

  fetchBehaviorTask = (p = 1) => {
    var {page, size,importType,status} = this.state
    let strob={
      importType,
      status
    }
    strob=handleEmpty(strob)
    Http.get('/bid/tender/import/task/list', {
      ...strob,
      page: p,
      size:size
    }).then(res => {
      if(res.data.content) {
        setStateWrap.call(this, {
          ...this.state,
          data: res.data.content,
          page: p
        }, this._isMounted)
      }
    })
  }

  onChange = (value) => {
    this.setState({
      type: value
    }, () => {
      console.log(this.state.type)
    })
  }
  handleFileChange = file => {
    console.log(file)
    // this.setState({
    //   ...this.state,
    //   fileList: file
    // }, () => {
    // })
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page - 1) * size)
  }
  handlePageChange = (page) => {
    this.fetchBehaviorTask(page)
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchBehaviorTask()
  }
  componentWillUnmount() {
    this._isMounted = false
  }
  successCallback=(res)=>{
    if(res.code == '0'){
      Message({type:'success',message:res.message,duration:2000})
    }else{
      Message({type:'error',message:res.message,duration:2000})
    }
    this.fetchBehaviorTask()
  }
  handlePreview=(file)=>{

  }
  beforeAvatarUpload(file) {
    console.log(file)
    const isXls = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'||file.type==='application/vnd.ms-excel';

    if (!isXls) {
      Message('上传文件必须是xls或者xlsx文件!');
    }
    return isXls
  }
  handleChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  render() {
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if(Parse.page === 'behavior-upload-list' && Parse.id)
        return <BehaviorList />
      return <Redirect to={this.props.match.url} />
    }
    return (

      <React.Fragment>
        <div style={{color:'red',backgroundColor:'',marginBottom:'0px'}}>提示:上传文件名名称中必须包含'立项','招标'或'中标'</div>
        <div style={{width:'40%', paddingBottom: '30px'}}>
          <Upload
            className="upload-demo"
            multiple={true}
            beforeUpload={file => this.beforeAvatarUpload(file)}
            action={BASEURL+'/bid/tender/import'}
            headers={{token: localStorage.getItem('token')}}
            onChange ={file => this.handleFileChange(file)}
            onPreview={file => this.handlePreview(file)}
            onSuccess={(res, file) => {this.successCallback(res)}}
            onError={(err, file, fileList)=>{Message({type:"error",message:"上传失败!请稍后重试！",duration:2000})}}
            // onRemove={(file, fileList) => this.handleRemove(file, fileList)}
            fileList={this.state.fileList}
            onExceed={(files, fileList) => {
            }}
            tip={<div className="el-upload__tip">请上传文件</div>}
          >
            <Button size="small" type="primary" style={{margin:'20px 0'}}>点击上传</Button>
          </Upload>
        </div>
        <div style={{color:'#333',fontWeight:'600',marginBottom:'10px'}}>
          上传列表
        </div>
        <div>
          <Form inline>
            <Form.Item label="导入类型:" style={{marginRight:'30px'}}>
              <Select
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={this.state.importType}
                onChange={this.handleChange('importType')}
              >
                {//'立项','招标','废标','中标'
                  [{value:'1',label:'立项'},
                    {value:'2',label:'招标'},
                    {value:'3',label:'废标'},
                    {value:'4',label:'中标'}].map(data =>
                    <Select.Option key={data.value} label={data.label} value={data.value} />
                  )
                }
              </Select>
                </Form.Item>
            <Form.Item label="导入状态:" style={{marginRight:'30px'}}>
              <Select
                size="small"
                style={{ width: '140px' }}
                placeholder="请选择"
                value={this.state.status}
                onChange={this.handleChange('status')}
              >
                {//'失败','导入中','成功'
                  [{value:'0',label:'失败'},
                    {value:'1',label:'导入中'},
                    {value:'2',label:'成功'}].map(data =>
                    <Select.Option key={data.value} label={data.label} value={data.value} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item >
              <Button type="primary"
                      icon={'search'}
                      nativeType="button" size="small"
                      onClick={() => this.fetchBehaviorTask()}>
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

        </div>
        <div>
          {
            this.state.data && <Table
              columns={this.state.columns}
              data={this.state.data.content}
              style={{width:'100%'}}
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
        </div>
        <Dialog
          title="导入任务错误信息"
          visible={ this.state.dialogVisible2 }
          onCancel={ () => this.setState({ dialogVisible2: false }) }
        >
          <Dialog.Body>
            {this.state.dialogVisible2 && (
              <Table
                style={{width: '100%'}}
                stripe={true}
                height={400}
                columns={this.state.errorcolumns}
                data={this.state.errordata} />
            )}
          </Dialog.Body>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default BehaviorUploadList
