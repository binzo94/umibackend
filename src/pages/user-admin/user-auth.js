import React from 'react'
import {Http} from '../../services'
import {Form, Input, Layout, Message, Button, AutoComplete} from 'element-react'
import {} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'
import {Redirect, Link, withRouter} from 'react-router-dom'
import './user-auth.less'
import ImageUpload from "../../component/ImgUpload/ImageUpload";
import _ from 'lodash'
class UserAuth extends React.Component {

  state = {
    form:{

    },
    companyName:'',
    CompanyFileList:[],
    PersonFileList:[],
    company:{
      companyName: '',
      companyId: ''
    },
    data:''
  }
  componentDidMount() {
    let { location } = this.props
    let id = parse(location.search).id
    if(id) {
      // 获取详情数据
      console.log('获取用户', id)
      Http.get(`/cic/user/get/${id}`, {

      }).then(res => {
        if(res.data.code == 0) {
          this.setState({
            data:res.data.content
          })
        }else{

        }
      })
    }else{
      this.props.history.push({
        pathname:this.props.match.url
      })
    }

  }
  querySearch=(str, cb) => {
    // 获取建议
    console.log(str)
    Http.post('/company/auth/search', {
      companyName:str
    }).then(res => {
      if(res.data.code == 0) {
        console.log(res.data.content)
        //遍历成想要的结构
        let data = res.data.content
        let suggestion = []
        for(let key in data){
          let {companyName,companyId}= data[key]
          suggestion.push({
            value:companyName,
            id:companyId
          })

        }
        cb(suggestion)
      }else{

      }
    })
  }
  handleSelect(item) {
    console.log(item)
    this.setState({
      companyName:item.value,
      company:{
        companyName:item.value,
        companyId:item.id
      }
    })
  }

  delete=(val)=>{
    console.log(val)
    if(val=="1"){
      this.setState({
        PicCUrl:'',
        CompanyFileList:[]
      })
    }else{
      this.setState({
        PicPUrl:'',
        PersonFileList:[]
      })
    }
  }
  submit=()=>{

    console.log('营业执照',this.refs.img1.returnData())
    var ImgCompany=_.get(this.refs.img1.returnData(),"id")
    var ImgPerson=_.get(this.refs.img2.returnData(),"id")
    if(!ImgCompany){
      Message({
        type:'warning',
        message:'请上传营业执照!'
      })
      return
    }
    if(!ImgPerson){
      Message({
        type:'warning',
        message:'请上传个人名片!'
      })
      return
    }
    //判断公司是否手动输入
    if(this.state.companyName!=this.state.company.companyName){
      Message({
        type:'warning',
        message:'请在下拉框中选择企业!'
      })
      return
    }
    //提交表单

    let { location } = this.props
    let {company:{companyId,companyName}}= this.state
    let id = parse(location.search).id
    Http.post('/company/auth/add',{
      userId:id,
      companyId,
      companyName,
      businessLicenseUrl:ImgCompany,
      idCardUrl:ImgPerson
    }).then(res => {
      if(res.data.code == 0) {
        Message({
          type:'success',
          message:'认证成功!'
        })
        this.props.history.goBack()
      }else{
        Message({
          type:'warning',
          message:res.data.message
        })
      }
    })
  }
  componentDidUpdate() {

  }
  componentWillUnmount() {

  }

  render() {
    const {data} = this.state
    return !!this.state.data ? <div className={'user-admin-auth'}>
      <h3 className="page-title">企业认证 <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span></h3>
      <div className={'user-auth-info clearfix'}>
        <div className="user-auth-infoitem">
          用户姓名：<span>{data.userName}</span>
        </div>
        <div className="user-auth-infoitem">
         账号: <span>{data.userAccount}</span>
        </div>
        <div className="user-auth-infoitem">
         手机号码: <span>{data.tel}</span>
        </div>
      </div>
      <Form labelPosition={'left'} labelWidth="80" model={this.state.form} className="user-auth-form">
        <Form.Item label="所属企业:" style={{marginBottom:'0px'}} className={'auth-required'}>
          <AutoComplete
            placeholder="请输入公司名称"
            value={this.state.companyName}
            fetchSuggestions={this.querySearch.bind(this)}
            onSelect={this.handleSelect.bind(this)}
            triggerOnFocus={false}
            style={{width:'100%'}}
          ></AutoComplete>
        </Form.Item>
        <Form.Item label="" style={{marginBottom:'40px'}}>
          <span style={{color:'#666666'}}>*公司只能从下拉列表选择</span>
        </Form.Item>
        <Form.Item label="资料上传:" style={{marginBottom:'50px'}} className={'auth-required'}>
          <Layout.Col span={12}>
            <ImageUpload  fileList={_.get(this.state,"CompanyFileList")} delete={()=>{this.delete("1")}} ref='img1' phd={'营业执照'}></ImageUpload>
          </Layout.Col>
          <Layout.Col span={8} offset={4}>
            <ImageUpload fileList={_.get(this.state,"PersonFileList")} delete={()=>{this.delete("2")}} ref='img2' phd={'个人名片'}></ImageUpload>
          </Layout.Col>
        </Form.Item>
        <Form.Item style={{textAlign:'center'}}>
          <Button type='primary' size={'small'} style={{padding:'10px 30px'}} onClick={()=>{this.submit()
          }}>确认</Button>
          <Button type='text' style={{marginLeft:'50px'}}>取消</Button>
        </Form.Item>
      </Form>
    </div> : null
  }
}

export default withRouter(UserAuth)
