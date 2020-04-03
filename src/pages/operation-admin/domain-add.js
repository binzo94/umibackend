import React from 'react'
import { Http } from '../../services'
import { Button,Upload, Form, Select, Input, Radio,Message} from 'element-react'
import 'element-theme-default'
import './role-add.css'
import { isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import { withRouter } from 'react-router-dom'

class Domainform extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        status:'1',
        domainName:'',
        icon:'',
        sort:''
      },
      imgurl:'',
      rules: {

      }
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if (this.props.isModifyPage) {
          this.getModify()
        } else {
          this.getSure()
        }
      } else {
        return false
      }
    })
  }

  getSure = () => {
    Http.post('/cic/domain/add', { ...this.state.form })
      .then(res => {
        if (res.data.code == '0') {
          this.props.history.push('/operation-admin/domain-list')
          Message({
            type:'success',
            message:'新增成功!'
          })
        }else{
          Message({
            type:'error',
            message:'新增失败!'+res.data.message
          })
        }

      })
  }

  getModify = () => {
    let { location } = this.props
    Http.post(`/cic/domain/update`, { ...this.state.form })
      .then(res => {
        if (res.data.code == '0') {
          Message({
            type:'success',
            message:'修改成功!'
          })
          this.props.history.push('/operation-admin/domain-list')
        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }

      })
  }

  cancle = () => {
    this.props.history.push('/operation-admin/domain-list')
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    Http.get(`/cic/domain/get/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let { form } = this.state
          this.setState({
            form: {
              ...content,
              sort:content.sort.toString()
            }
          })


        }
      })
  }

  componentDidMount () {
    if (this.props.isModifyPage) {
      this.fetchPermissionsInfoById()
    }
  }
  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }
  previewFile=()=>{
    //获取显示图片对象
    var preview = document.getElementById("showImg");   // 通过元素节点查找： document.querySelector('img');
    //获取选中图片对象（包含文件的名称、大小、类型等，如file.size）
    var file = document.getElementById("chkFile").files[0];   //document.querySelector('input[type=file]').files[0];
    //声明js的文件流
    var reader = new FileReader();
    if(file){
      //判断文件格式
      console.log(file.type)
      console.log(file)
      if(file.type&&file.type.indexOf('image') == '-1'){
        Message({
          type:'warning',
          message:'请选择图片!'
        })
        return
      }else{
        if(file.size>1000000){
          Message({
            type:'warning',
            message:'请选择1M以内的图片!'
          })
          return
        }
      }

      //通过文件流将文件转换成Base64字符串
      reader.readAsDataURL(file);
      //转换成功后
      reader.onloadend = ()=>
      {
        //将转换结果赋值给img标签
        preview.src = reader.result;
        this.setState({
          form:{
            ...this.state.form,
            icon:reader.result
          },
          imgurl:reader.result
        })
      }
    }
    else{
      preview.src = "";
    }
  }
  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">域名{this.props.isModifyPage ? '修改' : '新增'}
          <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>
        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          <Form.Item label="域名名称：" prop="domainName">
            <Input value={this.state.form.domainName} placeholder="请填写域名名称" style={{ width: '300px' }} onChange={this.onChange('domainName')}></Input>
          </Form.Item>
          <Form.Item label="排序：" prop="sort">
            <Input value={this.state.form.sort} placeholder="请填写排序" style={{ width: '120px' }} onChange={this.onChange('sort')}></Input>
          </Form.Item>
          <Form.Item label="是否启用：" prop="status">
            <Radio.Group size={'small'} value={this.state.form.status} onChange={this.onChange('status')}>
              <Radio.Button value={'1'} >是</Radio.Button>
              <Radio.Button value={'0'} >否</Radio.Button>
            </Radio.Group>
            </Form.Item>
          <Form.Item label="域名图标：">
            <div>  <Button type="primary" size={'small'} onClick={()=>{document.getElementById("chkFile").click()}}>点击上传</Button>
              <input id="chkFile" type="file" style={{opacity:"0"}} onChange={this.previewFile} />
            </div>
            <div>
              <img id="showImg" src={this.state.form.icon}  width="200" height="200" alt="" />
            </div>

          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ marginRight: '180px' }} onClick={this.handleSubmit}>
              {this.props.isModifyPage ? '确认修改' : '确认新增'}
            </Button>
            <Button onClick={this.cancle}>取消</Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(Domainform)
