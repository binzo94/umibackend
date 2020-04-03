import React from 'react'
import {Table, Button, Pagination, Upload, Radio,Message} from 'element-react'
import {Http} from '../../services'
import {setStateWrap} from '../../utils'
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
    columns: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    }, {
      label: '导入数据条数',
      prop: 'importData',

      width:120
    }, {label:'导入成功条数',
      prop:'completeData',  width:190},{
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
      return data.importType == 'bad'?'不良':'荣誉'
      }
    },
    {
      label: '导入状态',
      prop: 'statusDesc',
      width:170

    },
     {
      label: '完成时间',
      prop: 'completeTime',
       width:190
    }, {
      label: '操作',
        fixed:'right',
        width:260,
      render: (data) => {
        return <>{data.status == '1' || data.status == '2'||data.status == '3'||data.status == '5' ?null:
          <Button type="text" size="small" onClick={() => this.downloadFailData(data)}>下载</Button>}
          {data.status == '0' || data.status == '2'||data.status == '3'||data.status == '5'||data.status=='9'?null:<Button type="text" size="small" onClick={() => this.goSyn(data,true)}>全覆盖同步</Button>}
          {data.status == '0' || data.status == '2'||data.status == '3'||data.status == '5'||data.status=='9'?null:<Button type="text" size="small" onClick={() => this.goSyn(data,true)}>未发布数据同步</Button>}
          <Button type="text" size="small" onClick={() => this.editData(data)}>编辑</Button>
          </>
      }
    }]
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
    Http.post(`/behavior/download/failData/${data.id}`)
      .then(res => {
        var result = res.data
        if(result) {
          var blob = new Blob([result], {type: 'application/vnd.ms-excel,charset=utf-8'})
          var download = document.createElement('a')
          download.setAttribute('download', `${data.id}.xls`)
          download.setAttribute('href', window.URL.createObjectURL(blob))
          document.body.appendChild(download)
          download.click()
          download.remove()
        }
      })
  }

  fetchBehaviorTask = (p = 1) => {
    var {page, size} = this.state
    Http.post('/behavior/upload/select', {
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
  handlePreview=(file)=>{

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
        <div style={{marginTop:'15px'}}>
        <Radio style={{marginRight:'30px'}} value="bad" checked={this.state.type === 'bad'} onChange={this.onChange.bind(this)}>不良</Radio>
        <Radio value="honor" checked={this.state.type === 'honor'} onChange={this.onChange.bind(this)}>荣誉</Radio>
        </div>
        <div style={{width:'40%', paddingBottom: '30px'}}>
          <Upload
            className="upload-demo"
            multiple={true}
            action={this.state.type =='honor'?BASEURL+'/behavior/honorUpload':BASEURL+'/behavior/badUpload'}
            headers={{token: localStorage.getItem('token')}}
            onChange ={file => this.handleFileChange(file)}
            onPreview={file => this.handlePreview(file)}
            data={{type: this.state.type}}
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
      </React.Fragment>
    )
  }
}

export default BehaviorUploadList
