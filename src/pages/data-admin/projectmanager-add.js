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
import Autocomplete from 'react-autocomplete'

class ProjectmanagerAdd extends React.Component {
  state = {
    loading: false,
    labelPosition: 'right',
    isAdd: false,
    suggestList:[],
    companyId:'',
    form: {

    },
    rules:{}
  }
  fetchCompanyInfoById = () => {
    let { location, match, history } = this.props
    return Http.get(`/bid/pm/get/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let {content} = res.data
          let {form} = this.state
          this.setState({
            form: {
              ...content
            }
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
        form: {
          [state]: state === 'bidCount' ? form[state] : ''
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

          this.props.history.push('/data-admin/projectmanager-list')
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
          this.submit('/bid/pm/update')
        else
          this.submit('/bid/pm/add')
      } else {
        console.log(this.state.form.areaCode)
        return false
      }
    })
  }
  componentWillMount () {

  }

  componentDidMount () {

    if (this.props.isUpdatePage){
      this.fetchCompanyInfoById()
    }
  }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      form:{
        ...this.state.form,
        companyName:e.target.value
      }
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.form.companyName}`)
            .then(res => {
              this.setState({
                suggestList: res.data.content
              })
            })
        }, 300)
      else {
        this.setState({
          suggestList: []
        })
      }
    })
  }
  componentWillUpdate (prevProps, prevState) {
  }
  render () {
    let { form, rules, isAdd } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">项目经理信息{this.props.isUpdatePage ? '修改' : '新增'}</h3>
        <div className="form-ct" style={{ padding: '20px 0 20px 0' }}>
          <Form ref="form" model={form} rules={rules} labelWidth={100}>
            <Form.Item label="项目经理姓名" prop="personName" >
              <Input value={form.personName} size="small" onChange={this.handleChange('personName')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="注册号" prop="personRegisterNum" >
              <Input value={form.personRegisterNum} size="small" onChange={this.handleChange('personRegisterNum')} style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item label="所属企业" prop="companyName" >
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.companyName}
                value={this.state.form.companyName}
                onChange={this.handleQueryChange}
                inputProps={{
                  disabled:true,
                  style:{
                    backgroundColor:'#ececec'
                  }
                }}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
                onSelect={(value,data) => this.setState({
                  form:{
                    ...this.state.form,
                    companyName:value,
                    companyId:data.companyId
                  }
                })}
                wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'300px', zIndex:'500'}}
              />
            </Form.Item>
            <Form.Item label="中标数" prop="bidCount" >
              {form.bidCount}
               </Form.Item>
            <Form.Item>
              <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                {this.props.isUpdatePage ? '确认修改' : '确认新增'}
              </Button>
              <Button onClick={this.reset}>重置</Button>
              <Button onClick={() => this.props.history.push('/data-admin/projectmanager-list')}>取消</Button>
            </Form.Item>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(ProjectmanagerAdd)
