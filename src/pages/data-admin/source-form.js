import React from 'react'
import {withRouter} from 'react-router-dom'
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker
} from 'element-react'
import {Http} from '../../services'
import {formatDate, isEmptyObject, setStateWrap} from '../../utils'
import {parse} from 'query-string'

class SourceForm extends React.Component {

  _isMounted = false
  state = {
    loading: false,
    labelPosition: 'right',
    provinceValue: '',
    regionValue: '',
    provinceData: [],
    regionData: [],
    sourceType: [],
    form : {
      id: '',
      name: '',
      areaCode: '',
      url: '',
      type: '',
      describe: ''
    },
    rules: {
      name: [{
        required: true,
        message: '来源名称不能为空',
        trigger: 'submit'
      }],
      url: [{
        required: true,
        message: '来源url不能为空',
        trigger: 'submit'
      }, {
        validator: (rules, value, callback) => {
          var urlReg = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?$/
          if(!urlReg.test(value)) {
            callback(new Error('来源url格式错误,重新输入'))
          }
          else
            callback()
        },
        trigger: 'submit'
      }],
      areaCode: [{
        required: true,
        message: '请选择地区',
        trigger: 'submit'
      }],

      type: [{
        required: true,
        message: '请选择来源类别',
        trigger: 'submit'
      }]

    }
  }

  fetchRegionData = (level, id = 0) => {
    return Http.get(`/dict/area/${id}`)
      .then(res => {
        if(res.data.content) {
          if(level === 1) {
            setStateWrap.call(this, {
              ...this.state,
              provinceData: res.data.content
            }, this._isMounted)

          }
        }
        if (level === 2) {
          setStateWrap.call(this, {
            ...this.state,
            regionData: res.data.content
          }, this._isMounted)
        }
      })
  }
  fetchSourceType = () => {
    Http.get('/dict/sourceType')
      .then(res => {
        if(res.data.content)
          setStateWrap.call(this, {
            ...this.state,
            sourceType: res.data.content
          }, this._isMounted)

      })
  }
  fetchSourceInfoById = () => {
    let {location, match, history} = this.props
    return Http.get(`/sourceWeb/select/${parse(location.search).id}`)
      .then(res => {
        if(isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let {form} = this.state
          for (let state in content) {
            if(state in form) {
              setStateWrap.call(this, {
                ...this.state,
                provinceValue: content.provinceName || '',
                regionValue: content.cityName || '',
                form: {
                  ...this.state.form,
                  [state]: content[state].toString()
                }
              }, this._isMounted, () => {
              })
            }
          }
        }
      })
  }


   handleSelectChange = level => value => {
     let province = this.state.provinceData.filter(item => item.name === value)
     let region = this.state.regionData.filter(item => item.name === value)
     if(level === 1) {

       this.setState({
         ...this.state,
         provinceValue: value,
         form: {
           ...this.state.form,
           areaCode: province.length ? province[0].id : null
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
           this.fetchRegionData(2, this.state.form.areaCode)
         }
       })
     }
     else {
       this.setState({
         ...this.state,
         regionValue: value,
         form: {
           ...this.state.form,
           areaCode: region.length ? region[0].id : null
         }
       }, () => {
       })
     }

   }
  handleChange = (key) => (value) => {
    setStateWrap.call(this, {
      ...this.state,
      form: {
        ...this.state.form,
        [key]: value
      }
    }, this._isMounted)

  }
  reset = () => {
    let {form} = this.state
    for (let state in form) {
      setStateWrap.call(this, {
        ...this.state,
        form: {
          [state]: ''
        }
      }, this._isMounted)

    }
    this.refs.form.resetFields()
  }
  submit = (url) => {
    this.setState({
      ...this.state,
      loading: true
    })
    let {id, ...form} = this.state.form
    Http.post(url,
      this.props.isUpdatePage ? {
        ...form,
        id
      } : {...form}).then(res => {
      setStateWrap.call(this, {
        ...this.state,
        loading: false
      }, this._isMounted)

      if(res.data.code == '0') {
        alert(res.data.message)
        this.props.history.push('/data-admin/source-list')
      }
      else {
        alert(res.data.message)
      }
    }).catch(err => {
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.refs.form.validate((valid) => {
      if (valid) {
        if(this.props.isUpdatePage)
          this.submit(`/sourceWeb/update/${this.state.form.id}`)
        else
          this.submit('/sourceWeb/add')

      } else {
        return false
      }
    })
  }
  componentWillMount() {
  }
  componentDidMount() {
    this._isMounted = true
    this.fetchRegionData(1)
    this.fetchSourceType()
    if (this.props.isUpdatePage) {
      Promise.all([
        this.fetchRegionData(1),
        this.fetchSourceInfoById()
      ]).then(() => {
        let matchProvince = this.state.provinceData.filter(item =>
          item.provinceName === this.state.provinceValue
        )
        if(matchProvince.length) {
          this.fetchRegionData(2, matchProvince[0].id)
        }
      })
    }
  }
  componentWillUnmount() {
    this._isMounted = false
  }
  render() {
    let {form, rules} = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">来源{this.props.isUpdatePage ? '修改' : '新增'}</h3>
        <div className="form-ct" style={{padding:'20px 0 20px 0'}}>
          <Form ref="form" model={form} rules={rules} labelWidth={150}>
            <Form.Item label="来源名称" prop="name">
              <Input value={form.name}
                onChange={this.handleChange('name')} size="small" style={{width:'300px'}} autoComplete="off" />
            </Form.Item>
            <Form.Item label="来源URL" prop="url">
              <Input value={form.url} onChange={this.handleChange('url')} size="small" style={{width:'300px'}} autoComplete="off" />
            </Form.Item>

            <Form.Item label="来源地区" prop="areaCode" >
              <Select
                clearable
                size="small"
                placeholder="请选择"
                style={{marginRight:'10px'}}
                value={this.state.provinceValue}
                onChange={this.handleSelectChange(1)}
              >
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.name} />
                  )
                }
              </Select>
              <Select
                clearable
                size="small" v
                placeholder="请选择"
                value={this.state.regionValue}
                onChange={this.handleSelectChange(2)}
              >
                {
                  this.state.regionData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.name} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="来源类别" prop="type">
              <Select
                clearable
                size="small"
                placeholder="请选择"
                value={form.type}
                onChange={this.handleChange('type')}
              >
                {
                  this.state.sourceType.map(data =>
                    <Select.Option key={data.id} label={data.dictName} value={data.dictCode} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item label="来源简介" prop="describe" style={{width:'700px'}}>
              <Input type="textarea" value={form.describe}
                onChange={this.handleChange('describe')}
                autosize={{ minRows: 4}} autoComplete="off"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>
                {this.props.isUpdatePage ? '确认修改' : '确认新增'}
              </Button>
              <Button onClick={this.reset}>重置</Button>
              <Button onClick={() => this.props.history.push('/data-admin/source-list')}>取消</Button>
            </Form.Item>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}

export default withRouter(SourceForm)

