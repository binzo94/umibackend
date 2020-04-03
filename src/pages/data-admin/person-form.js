import React from 'react'
import {Form, Button, Select, Input,Message} from 'element-react'
import {withRouter} from 'react-router-dom'
import Autocomplete from 'react-autocomplete'
import {Http} from '../../services'
import {setStateWrap} from '../../utils'
import {parse} from 'query-string'

class PersonForm extends React.Component {
  _isMounted = false
  state ={
    loading: false,
    companyName: '',
    suggestList: [],
    form: {
      name: '',
      companyId: '',
      sex: '',
      identificationType: '',
      identificationId: ''
    },
    rules: {
      name: [{
        required: true,
        message: '姓名不能为空',
        trigger: 'submit'
      }],
      companyId: [{
        required: true,
        message: '所属企业不能为空',
        trigger: 'submit'
      }]
    }
  }
  handleChange = (key) => (value) => {
    this.setState({
      form: {
        ...this.state.form,
        [key]: value
      }
    })
  }
  fetchPersonInfoById = () => {
    let {location, match, history} = this.props
    return Http.get(`/personInfo/findById/${parse(location.search).id}`)
      .then(res => {

        let content = res.data.content
        let {form} = this.state
        for (let state in content) {
          if(state in form) {
            setStateWrap.call(this, {
              personId: content.personId || '',
              companyName: content.companyName || '',
              form: {
                ...this.state.form,
                [state]: content[state].toString()
              }
            }, this._isMounted)
          }
        }

      })
  }
  submit = (url) => {
    this.setState({
      ...this.state,
      loading: true
    })
    let str = this.props.isUpdatePage?'修改':'新增'
    Http.post(url, {
      ...this.state.form,
      id: this.props.isUpdatePage ? parse(this.props.location.search).id : null,
      personId: this.state.personId
    }).then(res => {
      this.setState({
        ...this.state,
        loading: false
      })
      if (res.data.code == '0') {
        Message({
          type:'success',
          message:`${str}人员成功！`
        })
        setTimeout(()=>{

          this.props.history.push('/data-admin/person-list')
        },1000)
      }
      else {
        Message({
          type:'error',
          message:`${str}人员失败！${res.data.message}`
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
           this.submit('/personInfo/update')
         else
           this.submit('/personInfo/add')
       } else {
         return false
       }
     })
   }
  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    this.setState({
      ...this.state,
      companyName: e.target.value
    }, () => {
      if(this.state.companyName)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.companyName}`)
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
          companyName: ''
        })

    })
  }
  reset = () => {
    let { form } = this.state
    for (let state in form) {
      this.setState({
        ...this.state,
        companyName: '',
        form: {
          [state]: ''
        }
      })
    }
    this.refs.form.resetFields()
  }
  componentDidMount() {
    this._isMounted = true
    if(this.props.isUpdatePage) {
      Promise.all([
        this.fetchPersonInfoById()
      ]).then(() => {

      })
    }
  }

  componentWillUnmount () {
    this._isMounted = false
  }
  render() {
    return (
      <React.Fragment>
        <h3 className="page-title">人员{this.props.isUpdatePage ? '修改' : '新增'}
          { this.props.isUpdatePage?<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>:''}
        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth={120}>
          <Form.Item prop="name" label="姓名">
            <Input value={this.state.form.name} onChange={this.handleChange('name')} size="small" style={{width:'300px'}} autoComplete="off" />
          </Form.Item>
          <Form.Item prop="companyId" label="所属企业">
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.companyName}
              onChange={this.handleQueryChange}
              renderItem={(item, isHighlighted) =>
                <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                  {item.companyName}
                </p>
              }
              onSelect={(value, data) => {
                this.setState({
                  ...this.state,
                  companyName: value,
                  form:{
                    ...this.state.form,
                    companyId: data.companyId
                  }
                })}}
              wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'500'}}
            />
          </Form.Item>
          <Form.Item prop="sex" label="性别">
            <Select size="small" style={{width:'300px'}} onChange={this.handleChange('sex')} value={this.state.form.sex}>
              <Select.Option label="男" value="男" />
              <Select.Option label="女" value="女" />
            </Select>
          </Form.Item>
          <Form.Item prop="identificationType" label="证件类型">
            <Select
              size="small"
              style={{width:'300px'}}
              value={this.state.form.identificationType}
              onChange={this.handleChange('identificationType')}>
              <Select.Option label="身份证" value="身份证" />
              <Select.Option label="军官证" value="军官证" />
              <Select.Option label="护照" value="护照" />
              <Select.Option label="台湾居民身份证" value="台湾居民身份证" />
              <Select.Option label="香港永久性居民身份证" value="香港永久性居民身份证" />
              <Select.Option label="警官证" value="警官证" />
              <Select.Option label="其他" value="其他" />
            </Select>
          </Form.Item>
          <Form.Item prop="identificationId" label="证件号">
            <Input value={this.state.form.identificationId} onChange={this.handleChange('identificationId')} size="small" style={{width:'300px'}} autoComplete="off" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
              {this.props.isUpdatePage ? '确认修改' : '确认新增'}
            </Button>
            <Button onClick={this.reset}>重置</Button>
            <Button onClick={() => this.props.history.push('/data-admin/person-list')}>取消</Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(PersonForm)
