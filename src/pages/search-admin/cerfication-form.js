import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  Layout, Dialog,
  Message, MessageBox
} from 'element-react'
import { Http } from '../../services'
import { formatDate, isEmptyObject } from '../../utils'
import { parse } from 'query-string'
import './project-form.less'
import _ from 'lodash'
import moment from 'moment'
class CerficationForm extends React.Component {
  myRef = React.createRef();
  state = {
    currentgrade:'',
    form:{
      certName:'',
      certCategory:'',
      companyName:'',
      endTime: null
    },
    categoryMap:[],
    // rules: {
    //   userName: [
    //     {required: true, message: '请输入姓名', trigger: 'change'}
    //   ],
    //   tel: [
    //     {required: true, message: '请输入电话号码', trigger: ['blur','change']},
    //     { validator: (rule, value, callback) => {
    //       var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/
    //       if (value === '') {
    //         callback(new Error('请输入电话号码'))
    //       } else {
    //         if(reg.test(value)) {
    //           callback()
    //         }else{
    //           callback(new Error('电话号码格式错误') )
    //         }

    //       }
    //     } }
    //   ],
    //   userAccount: [
    //     {required: true, message: '请输入账号', trigger: 'change'},
    //     { validator: (rule, value, callback) => {
    //       var reg = /^[a-zA-Z0-9]{1,11}$/
    //       if (value === '') {
    //         callback(new Error('请输入账号'))
    //       } else {
    //         if(reg.test(value)) {
    //           callback()
    //         }else{
    //           callback(new Error('账号只能数字和大小写字母,最多11位'))
    //         }

    //       }
    //     } }
    //   ]
    //   ,
    //   nickName:[
    //     {required: true, message: '请输入昵称', trigger: 'change'},
    //     { validator: (rule, value, callback) => {
    //         if (value === '') {
    //           callback(new Error('请输入昵称'))
    //         } else {
    //           if(value.length<=10) {
    //             callback()
    //           }else{
    //             callback(new Error('昵称最多10位'))
    //           }

    //         }
    //       } }],
    //   email:[
    //     {required: false, message: '', trigger: 'blur'},
    //     { validator: (rule, value, callback) => {
    //       var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/
    //       if (value.length==0) {
    //         callback()
    //       } else {
    //         if(reg.test(value)) {
    //           callback()
    //         }else{
    //           callback(new Error('邮箱格式不对!'))
    //         }

    //       }
    //     } }
    //   ],
    //   grade:[
    //     {required: true, message: '', trigger: 'change'}],
    //   endTime:[
    //     {required: true, message: '请选择到期时间', trigger: 'change', type:'object'}]

    // }
  }

  fetchCategoryType=()=>{
    Http.post(`/dict/select`,{
      dictType:'project_type',
      isNeed:false,
    }).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            categoryMap:res.data.content
          })
        }
      }
    })
  }
  handleSubmit=() => {
    console.log('提交数据')
    const resetrule = this.state.rules
    let data
    let {...rules} = this.state.rules
    let {certName,certCategory,endTime,companyName} = this.state.form
    let { location } = this.props
    let workId = parse(location.search).id
    let tempEndTime = ''
    if( this.state.form.endTime !== null && this.state.form.endTime !== ''){
      tempEndTime = formatDate(this.state.form.endTime,false)
    }
    if(this.props.isupdate) {
      // 编辑
      let {otherrules} = rules
      rules = otherrules
      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })


            Http.post('/chrRecruit/worker/addOrUpdateCertificates', {
              id:this.props.currentData.id,
              workerId:workId,
              certName:certName,
              certCategory:certCategory,
              endTime:tempEndTime,
              companyName:companyName
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '修改成功!'
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()
                // 关闭弹框
                this.props.onCancel && this.props.onCancel()
              }else{
                Message({
                  type:'error',
                  message: '修改失败!'+res.data.message
                })
              }
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      })
    }
    else {
      // 新增

      this.setState({
        rules
      }, () => {
        this.myRef.current.validate((valid) => {
          if (valid) {
            this.setState({
              rules:resetrule
            })
            Http.post('/chrRecruit/worker/addOrUpdateCertificates', {
              workerId:workId,
              certName:certName,
              certCategory:certCategory,
              endTime:tempEndTime,
              companyName:companyName
            }).then(res => {
              if(res.data.code == 0) {
                Message({
                  type:'success',
                  message: '新增成功!'
                })
                this.props.resetSearch()
                // 清理表单，重置验证
                this.myRef.current.resetFields()

                this.props.onCancel && this.props.onCancel()
              }else{
                Message({
                  type:'error',
                  message: `新增失败!${res.data.message}`
                })
              }
            })
          } else {
            console.log('error submit!!')
            return false
          }
        })
      })
    }

  }
  componentWillMount () {

  }
  fetchTypeDict=(id)=>{
    Http.get(`/chrRecruit/worker/selectCertificateById/${id}`).then((res)=>{
      if(res.data.code == '0'){
        if(res.data.content){
          this.setState({
            form:{
              certName:res.data.content.certName,
              certCategory:res.data.content.certCategory,
              endTime:!!res.data.content.endTime ? moment(res.data.content.endTime, 'YYYY-MM-DD HH:mm:ss').toDate() : '',
              companyName:res.data.content.companyName,
            }
          })
        }
      }
    })
  }
  componentDidMount () {
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps)
    console.log(this.props)
    this.fetchCategoryType()
    if(nextProps.isupdate) {
      const {currentData:data} = nextProps
      let {...rest} = this.state.rules
      this.setState({
        rules: rest
      })
      this.fetchTypeDict(data.id)
    }else{
      this.myRef.current.resetFields()
      let rules = this.state.rules
      this.setState({
        currentgrade:'',
        rules: {...rules} })
    }

  }
  componentWillUpdate (prevProps, prevState) {

  }
  onChange(key, value) {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
  }
  render () {
    let { form, rules } = this.state
    return (
      <React.Fragment>
        <Dialog
          title={this.props.isupdate ? '人员资格修改' : '人员资格新增'}
          size="small"
          className={'user-list-dialog'}
          visible={this.props.dialogVisible }
          onCancel={ () => this.props.onCancel() && this.myRef.current.resetFields() }
          lockScroll={ false }
        >
          <Dialog.Body style={{paddingTop:'10px', height:'170px'}}>
            <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
              <Form ref={this.myRef} model={form} rules={rules} labelWidth={84} labelPosition={'right'} className={'form-user-auth'}>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="资格证书:" prop="certName">
                      <Input value={form.certName} size="small" onChange={this.onChange.bind(this, 'certName')}/>
                  </Form.Item>
                  <Form.Item label="专业:" prop="certCategory">
                    <Select value={form.certCategory} placeholder="请选择专业" onChange={this.onChange.bind(this, 'certCategory')}>
                      {
                        this.state.categoryMap.map(el => {
                          return <Select.Option key={el.dictName} label={el.dictName} value={el.dictName} />
                        })
                      }
                    </Select>
                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={11} offset={1}>
                  <Form.Item label="有效期:" prop="endTime">
                    <DatePicker
                      value={form.endTime}
                      isShowTime={true}
                      onChange={this.onChange.bind(this, 'endTime')}
                      placeholder="选择有效期"
                    />
                  </Form.Item>
                  <Form.Item label="注册公司:" prop="companyName">
                    <Input value={form.companyName} size="small" onChange={this.onChange.bind(this, 'companyName')}/>
                  </Form.Item>

                </Layout.Col>
              </Form>
            </div>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer" style={{textAlign:'center'}}>
            <Button onClick={this.props.onCancel }>取消</Button>
            <Button type="primary" onClick={ this.handleSubmit } style={{marginLeft:'30px'}}>确定</Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default withRouter(CerficationForm)
