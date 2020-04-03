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
import { Http } from '../../services'
import { formatDate, isEmptyObject } from '../../utils'
import { parse } from 'query-string'


class CompanyForm extends React.Component {
  state = {
    loading: false,
    labelPosition: 'right',
    isAdd: false,
    provinceData: [],
    regionData: [],
    regionValue: '',
    provinceValue: '',
    repeatCompanyName: '',
    repeatsocialCreditCode: '',
    companyId:'',
    form: {
      companyName: '',
      socialCreditCode: '',
      lealPerson: '',
      contact: '',
      areaCode: '',
      address: '',
      registeredFunds: '',
      establishmentTime: null,
      describe: '',
      regisAddress:''
    },
    rules: {
      companyName: [{
        required: true,
        message: '公司名称不能为空',
        trigger: 'submit'
      },
      // {
      //   validator: (rule, value, callback) => {
      //     // Promise.all([
      //     //   this.validFieldValueRepeat('companyName', 'checkCompanyName')()
      //     // ]).then(() => {
      //     // console.log(value, this.state.repeatcompanyName)

      //     //   if (value === this.state.repeatcompanyName) {
      //     //     callback(new Error('企业名称重复,不可用'))
      //     //   }
      //     //   else {
      //     //     callback()
      //     //   }
      //     //})
      //   },
      //  trigger: 'submit'
      //}
      ],
      socialCreditCode: [{
        required: true,
        message: '统一社会信用代码不能为空',
        trigger: 'submit'
      },
      //{
        // validator: (rule, value, callback) => {
        //   let chineseReg = /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u{20000}-\u{2a6df}]|[\u{2a700}-\u{2b73f}]|[\u{2b740}-\u{2b81f}]|[\u{2b820}-\u{2ceaf}]|[\uf900-\ufaff]|[\u3300-\u33ff]|[\ufe30-\ufe4f]|[\uf900-\ufaff]|[\u{2f800}-\u{2fa1f}]/u
        //   // Promise.all([
        //   //   this.validFieldValueRepeat('socialCreditCode', 'checkCompanyCode')()
        //   // ]).then(() => {
        //     // if (value === this.state.repeatsocialCreditCode) {
        //     //   callback(new Error('统一社会信用代码重复,不可用'))
        //     // }
        //     // if (chineseReg.test(value)) {
        //     //   callback(new Error('统一社会信用代码格式错误，不允许有中文字符'))
        //     // }
        //     // else {
        //     //   callback()
        //     // }
        //   //})
        // },
      //  trigger: 'submit'
      //}
      ],
      lealPerson: [{

      }],
      contact: [{
        validator: (rule, value, callback) => {
          var phoneReg = /(^0\d{2,3}-\d{7,8}$)|(^1[3456789]\d{9}$)/
          if (!value.length) {
            callback()
          }
          else if (!phoneReg.test(value)) {
            callback(new Error('电话或手机号码格式有误'))
          } else {
            callback()
          }
        },
        trigger: 'submit'
      }],
      areaCode: [{
        required: true,
        message: '请选择地区',
        trigger: 'submit'
      }],
      address: [{
      }],
      registeredFunds: [{
        required: true,
        message: '注册资金不能为空',
        trigger: 'submit'
      }, {
        validator: (rule, value, callback) => {
          if (!/^\d+(\.\d+)?$/.test(value)) {
            callback(new Error('注册资金必须为纯数字格式'))
          }
          else {
            callback()
          }
        },
        trigger: 'submit'
      }],
      establishmentTime: [{
        type: 'date',
        required: true,
        message: '企业成立时间不能为空',
        trigger: 'submit'
      }],
      describe: [{}]

    }
  }
  isNeedNewContact = (status) => {
    this.setState({
      ...this.state,
      isAdd: status
    })
  }
  //第三个参数为true,根据已有的regionValue找到对应的areacode
  fetchRegionData = (level, id = 0,regionchecked) => {
    return Http.get(`/dict/area/${id}`)
      .then(res => {
        if (res.data.content) {
          if (level === 1) {
            this.setState({
              ...this.state,
              provinceData: res.data.content
            })
          }
        }
        if (level === 2) {
          this.setState({
            ...this.state,
            regionData: res.data.content
          })
          if(regionchecked){
            let matchCity= res.data.content.filter(item => {
              console.log(this.state.regionValue.indexOf(item.cityName)!=-1)
                return this.state.regionValue.indexOf(item.cityName) != -1
              }
            )
            if(matchCity.length) {
              this.setState({
                regionValue:matchCity[0].name,
                form:{
                  ...this.state.form,
                  regisAddress:matchCity[0].name
                }
              })

            }
          }

        }
      })
  }

  fetchCompanyInfoById = () => {
    let { location, match, history } = this.props
    return Http.get(`/company/findById/${parse(location.search).id}`)
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
                companyId:content.companyId || '',
                provinceValue: content.provinceName || '',
                regionValue: content.cityName || '',
                form: {
                  ...this.state.form,
                  [state]: state === 'establishmentTime' ? new Date(content[state]) : content[state].toString()
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
          areaCode: province.length ? province[0].name : ''
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
          this.fetchRegionData(2, province[0].id)
        }
      })
    }
    else {
      this.setState({
        regionValue: value,
        form: {
          ...this.state.form,
          regisAddress: region.length ? region[0].name: null
        }
      }, () => {
      })
    }

  }
  validFieldValueRepeat = (name, path, id = null) => e => {
    let searchid = this.props.isUpdatePage ? parse(this.props.location.search).id : null
    return Http.post(`/company/${path}`, {
      companyId:id||this.state.companyId,
      [name]: this.state.form[name]
    }).then(res => {
      if (!res.data.content) {
        Message({
          type:'success',
          message:'企业名称未重复,可用'
        })
      }
      else {
        Message({
          type:'error',
          message:'企业名称已重复,不可用'
        })
        this.setState({
          ...this.state,
          [`repeat${name}`]: this.state.form[name]
        })
      }
    })
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
          [state]: state === 'establishmentTime' ? null : ''
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
      companyId:this.state.companyId,
      establishmentTime: formatDate(this.state.form.establishmentTime, false),
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

          this.props.history.push('/data-admin/company-list')
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
          this.submit('/company/update')
        else
          this.submit('/company/add')
      } else {
        console.log(this.state.form.areaCode)
        return false
      }
    })
  }
  componentWillMount () {

  }

  componentDidMount () {
    this.fetchRegionData(1)
    if (this.props.isUpdatePage) {
      Promise.all([
        this.fetchRegionData(1),
        this.fetchCompanyInfoById()
      ]).then(() => {

        console.log(this.state.provinceValue)
        console.log(this.state.provinceData)
        let matchProvince = this.state.provinceData.filter(item =>{
          return this.state.provinceValue.indexOf(item.provinceName) != -1
        }
        )
        console.log(matchProvince)
        if(matchProvince.length) {
          this.setState({
            form:{
              ...this.state.form,
              areaCode:matchProvince[0].name||''
            }
          })
          this.fetchRegionData(2, matchProvince[0].id,true)

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
        <h3 className="page-title">企业{this.props.isUpdatePage ? '修改' : '新增'}</h3>
        <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
          <Form ref="form" model={form} rules={rules} labelWidth={150}>
            <Form.Item label="企业名称" prop="companyName">
              <Input value={form.companyName} onChange={this.handleChange('companyName', 'checkCompanyName')} size="small" style={{ width: '300px' }} autoComplete="off" />
              <Button type="primary" size="small" style={{ marginLeft: '20px' }}
                onClick={this.validFieldValueRepeat('companyName', 'checkCompanyName')}>重复验证</Button>
            </Form.Item>
            <Form.Item label="统一社会信用代码" prop="socialCreditCode">
              <Input value={form.socialCreditCode} onChange={this.handleChange('socialCreditCode', 'checkCompanyCode')} size="small" style={{ width: '300px' }} autoComplete="off" />
              <Button type="primary" size="small" style={{ marginLeft: '20px' }}
                onClick={this.validFieldValueRepeat('socialCreditCode', 'checkCompanyCode')}>重复验证</Button>
            </Form.Item>
            <Form.Item label="企业法人" prop="lealPerson" >
              <Input value={form.lealPerson} onChange={this.handleChange('lealPerson')} size="small" autoComplete="off" style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="联系方式" prop="contact" >
              <Input value={form.contact} size="small" onChange={this.handleChange('contact')} autoComplete="off" style={{ width: '300px' }} />
              </Form.Item>

            <Form.Item label="所属地区" prop="areaCode" >
              <Select
                clearable
                size="small"
                placeholder="请选择"
                style={{ marginRight: '10px' }}
                value={this.state.provinceValue}
                onChange={this.handleSelectChange(1)}
              >
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>
              <Select
                clearable
                size="small"
                placeholder="请选择"
                value={this.state.regionValue}
                onChange={this.handleSelectChange(2)}
              >
                {
                  this.state.regionData.map(data =>
                    <Select.Option key={data.id} value={data.name} label={data.name} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="详细地址" prop="address">
              <Input value={form.address} size="small" onChange={this.handleChange('address')}
                autoComplete="off" style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="注册资金" prop="registeredFunds" >
              <Input value={form.registeredFunds} size="small" onChange={this.handleChange('registeredFunds')} autoComplete="off" style={{ width: '300px' }} />
              <span style={{ marginLeft: '10px', color: '#48576a' }}>万</span>
            </Form.Item>
            <Form.Item label="成立时间" prop="establishmentTime">
              <DatePicker
                value={form.establishmentTime || null}
                className="el-input el-input--small"
                format="yyyy-MM-dd"
                placeholder="选择成立时间"
                onChange={this.handleChange('establishmentTime')}
              />
            </Form.Item>
            <Form.Item label="企业简介" prop="describe" style={{ width: '700px' }}>
              <Input type="textarea" value={form.describe}
                onChange={this.handleChange('describe')}
                autosize={{ minRows: 4 }} autoComplete="off"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                {this.props.isUpdatePage ? '确认修改' : '确认新增'}
              </Button>
              <Button onClick={this.reset}>重置</Button>
              <Button onClick={() => this.props.history.push('/data-admin/company-list')}>取消</Button>
            </Form.Item>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(CompanyForm)
