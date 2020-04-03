import React from 'react'
import _ from 'lodash'

import { Upload, Icon, Modal, message } from 'antd'
import 'antd/dist/antd.css'
import _AliyunTools from './_AliyunTools'

import './ImageUpload.css'

export default class extends React.Component {
  constructor(props) {
    super(props)
    let images = this.props.value || []
    images = _.map(images, (imageData) => {
      return this.exchangeResponseToFile(imageData)
    })

    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: this.props.fileList,
      imgData:''
    }
  }

  componentWillReceiveProps(nextProps, curProps) {
    var file = _.get(nextProps, 'fileList')
    if(file != '') {
      this.setState({
        fileList: _.get(nextProps, 'fileList')
      })
    }

  }
    handleCancel=() => {
      this.setState({ previewVisible: false })
    };

    handlePreview = (file) => {
      this.setState({
        previewImage: file.url || file.thumbUrl,
        previewVisible: true
      })
    };

    handleChange = ({ fileList }) => {
      let list = fileList
      if(list&&list.length==0){
        return;
      }
      var pic = list[0]
      var size = pic.size / 1024 / 1024

      console.log(pic, size, 'base')
      if(size > 5) {
        message.info('图片过大，请选择5M以下的图片')
        return
      }
      if(this.props.size > 0 && fileList.length > this.props.size) {
        list = fileList.slice(fileList.length - this.props.size, fileList.length)
      }
      this.setState({fileList: list}, () => {
        if(this.props.onChange) {
          let results = _.filter(list, {status: 'done'})
          results = _.map(results, (tempFile) => {
            return this.exchangeResponseToFile(tempFile)
          })
          this.props.onChange(results)
        }
      })
    };

    exchangeResponseToFile = (file) => {
      if(_.get(file, 'response')) {
        return _.extend(_.get(file, 'response'), {
          uid: _.get(file, 'key'),
          name: _.get(file, 'name'),
          status: 'done',
          url: _.get(file, 'response.url')
        })
      }
      return _.extend(file, {
        uid: _.get(file, 'key'),
        name: _.get(file, 'name'),
        status: 'done',
        url: _.get(file, 'url')
      })


    };

    uploadImage = ({file, onProgress, onSuccess, onError}) => {
      var that = this
      _AliyunTools.generateUpToken({type:'images'}, res => {
        var token = _.get(res, 'data.content')
        _AliyunTools.uploadImageToAliyun(
          file,
          token,
          (progress) => {
            onProgress({
              percent: progress
            })
          },
          (success) => {

            that.setState({
              imgData:success
            })
            onSuccess(success)
          },
          (error) => {
            onError(error)
          }
        )
      })
    };

    returnData=() => {
      return _.get(this.state, 'imgData')
    }

    remove=() => {
      this.setState({
        imgData:'',
        fileList:[]
      })
      this.props.delete()
    }

    download=() => {
      const {fileList} = this.state
      console.log('22222',fileList)
      window.open(`${_.get(fileList, '[0].response.data[0].resourceUrl') || _.get(fileList, '[0].thumbUrl')}`)
    }

    render() {
      const { previewVisible, previewImage, fileList } = this.state
      // var a=_.get(this.props,"fileList")||fileList
      return (
        <div className="clearfix">
          <Upload
            listType="picture-card"
            fileList={fileList}
            showUploadList={true}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
            customRequest={this.uploadImage}
            multiple={true}
            onRemove={this.remove}
            accept='image/*'
            onDownload={this.download}
          >
            {fileList.length >= 1 ? null : (
              <>
                <Icon type="plus" />
                <div className="ant-upload-text">{_.get(this.props, 'phd')}</div>
              </>
            )}
          </Upload>

          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>
      )
    }
}
