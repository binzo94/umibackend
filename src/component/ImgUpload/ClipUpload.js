import React from "react"
import './ClipUpload.css'
import {message,Icon,Modal,Progress} from 'antd'
import _AliyunTools from './_AliyunTools'
import { findDOMNode } from 'react-dom'
export default class extends React.Component {
  constructor(props){
    super(props)
    this.state={
     token:null,
      previewVisible:false,
     hasimg:false,
      imgurl:"",
      data:{},
      progress:0,
      showpro:false

  }}
  reset=()=>{
    this.setState({
      previewVisible:false,
      hasimg:false,
      imgurl:"",
      data:{},
      progress:0,
      showpro:false
    })
  }
  paste=(event)=>{
    let dom = findDOMNode(this.clip)
    if(dom){
      dom.blur()
    }
    var items = (event.clipboardData && event.clipboardData.items) || [];
    var file = null;
    console.log('粘贴',items,items.length)
    if (items && items.length) {
      for (var i = 0; i < items.length; i++) {

        console.log(items[i])
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
    }
    if(file){
      if(!this.state.token){
        message.warn({ content:"无法获取上传参数,稍后重试", duration:4,
          key:'unique'})
      }
      this.setState({
        showpro:true,
        progress:0
      })
      _AliyunTools.uploadImageToAliyun(file, this.state.token, (res)=>{
        this.setState({
          progress:res
        })
      }, (res)=>{
        console.log(res)
        if(res.data[0]){
          if(this.props.onChange){
            this.props.onChange(res)
          }
          this.setState({
            data:res,
            showpro:false,
            hasimg:true,
            imgurl:res.data[0]['resourceUrl']
          })
        }else{
          message.info({
            duration:4,
            content:'上传失败!稍后重试!',
            key:'unique'
          })
          this.reset()
        }

      }, (res)=>{
        this.setState({showpro:false
        })
      })
    }else{
      message.info({
        duration:4,
        content:'无法粘贴文字或者文件,请粘贴截图或者浏览器右键复制的图片!',
        key:'unique'
      })
    }
  }
  showImg=()=>{
this.setState({
  previewVisible:true
})
  }
  delete=()=>{
    this.setState({
      hasimg:false,
      imgurl:"",
      data:{}
    })
    if(this.props.onChange){
      this.props.onChange({})
    }
  }
  download=()=>{
    window.open(this.state.imgurl)
  }
  componentDidMount() {
    _AliyunTools.generateUpToken({
      type:'image'
    },(res)=>{
        console.log('toooooooken',res)
      let token = res.data.content
      this.setState({
        token
      })
    })
    let dom = findDOMNode(this.clip)
    dom.addEventListener('paste', this.paste);
  }
  componentWillUnmount() {
    let dom = findDOMNode(this.clip)
    dom.removeEventListener('paste',this.paste)
  }

  render() {
    return <div className={'clipupload-cnt'}>
      <textarea style={{display:this.state.hasimg||this.state.showpro?'none':'block'}} name="" id="" placeholder={'请点击此处进行粘贴'} ref={clip=>this.clip=clip}></textarea>
      <div className={'clipupload-progress'} style={{display:this.state.showpro?'block':'none'}}>
        <div className={'clipupload-progress-cn'}>
          <div className={'clipupload-progresss-text'}>上传中</div>
          <Progress percent={this.state.progress} />
        </div>
      </div>
      <div style={{display:this.state.hasimg?'block':'none'}} className={'clipupload-img'}>
        <img src={this.state.imgurl} alt=""/>
        <div className={'clipupload-mask'}>
          <div className={'clipupload-icon'}>
            <Icon type={'eye'} onClick={this.showImg}></Icon>
            <Icon type={'download'} onClick={this.download}></Icon>
            <Icon type={'delete'} onClick={this.delete}></Icon>
          </div>
        </div>
      </div>
      <Modal visible={this.state.previewVisible} footer={null} onCancel={()=>{this.setState({
        previewVisible:false
      })}}>
        <img alt="example" style={{ width: '100%' }} src={this.state.imgurl} />
      </Modal>
    </div>
  }
}
