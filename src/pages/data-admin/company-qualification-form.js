import React from 'react'
import {
  Form,
  DatePicker,
  Button,
  Input,
  Select,
  Layout,
  Message
} from 'element-react'
import {withRouter} from 'react-router-dom'
import {Http} from '../../services'
import {setStateWrap, formatDate} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {parse} from 'query-string'

class CompanyQualificationForm extends React.Component {
  _isMounted = false
  state = {
    loading: false,
    lastlevel:0,
    currentlevel:0,
    suggestList: [],
    aptitudeTypeList: [],
    aptitudeLargeList: [],
    aptitudeSmallList: [],
    aptitudeMajorList: [],
    levelList: [],
    companyName: '',
    aptitudeTypeName: '',
    aptitudeLargeName: '',
    aptitudeSmallName: '',
    aptitudeMajorName: '',
    levelName: '',
    form: {
      aptitudeTypeId: '',
      aptitudeLargeId: '',
      aptitudeSmallId: '',
      aptitudeMajorId: '',
      levelId: '',
      aptitudeId: '',
      companyId: '',
      aptitudeOrgan: '',
      aptitudeStarttime: null,
      aptitudeEndtime: null
    },
    rules: {
      aptitudeTypeId: [{
        required: true,
        message: '请选择资质类别',
        trigger: 'submit'
      }],
      aptitudeLargeId: [{
        required: true,
        message: '请选择资质大类',
        trigger: 'submit'
      }],
      companyId: [{
        required: true,
        message: '企业名称不能为空',
        trigger: 'submit'
      }]
    }
  }
  findListLevel = (list, level) => {
    if(!list.length) return false
    return list.every(item => item.level === level)
  }

  findByPidAndType = (pid = 0,isupdatelevel = true,level) => {
    return Http.get(`/qualification/getCQByPidNoRange/${pid}`).then(res => {
      if(res.data.content) {
        let {content} = res.data
        if(isupdatelevel){
          console.log('处理level')
          // 判断最后一级的level
          if(content[0]) {
            this.setState({
              lastlevel: parseInt(content[0].level) + 1
            })

          }else {
            //
            this.setState({
              lastlevel: level
            })
          }
        }

        if(this.findListLevel(content, '1')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeLargeList: content

          }, this._isMounted)
        }
        if(this.findListLevel(content, '2')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeSmallList: content

          }, this._isMounted)
        }
        if(this.findListLevel(content, '3')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeMajorList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '4')) {
          setStateWrap.call(this, {
            ...this.state,
            levelList: content
          }, this._isMounted)
        }
        if(this.findListLevel(content, '0')) {
          setStateWrap.call(this, {
            ...this.state,
            aptitudeTypeList: content
          }, this._isMounted)
        }
      }
    })
  }

  handleSelectChange = (level)=>(value) => {

    let  currentlevel = level
    this.setState({
      currentlevel
    })
    if(level == '0') {
      this.setState({
        aptitudeLargeList: [],
        aptitudeSmallList: [],
        aptitudeMajorList: [],
        levelList: [],
        form: {
          ...this.state.form,
          aptitudeTypeId: value,
          aptitudeLargeId: null,
          aptitudeSmallId: null,
          aptitudeMajorId: null,
          levelId: null
        }

      })
    }
    else if (level == '1') {
      this.setState({
        aptitudeSmallList: [],
        aptitudeMajorList: [],
        levelList: [],
        form: {
          ...this.state.form,
          aptitudeLargeId: value,
          aptitudeSmallId: null,
          aptitudeMajorId: null,
          levelId: null
        }

      })
    }
    else if (level == '2') {
      this.setState({
        aptitudeMajorList: [],
        levelList: [],
        form: {
          ...this.state.form,
          aptitudeSmallId: value,
          aptitudeMajorId: null,
          levelId: null
        }

      })
    }
    else if (level == '3') {
      this.setState({
        levelList: [],
        form: {
          ...this.state.form,
          aptitudeMajorId: value,
          levelId: null
        }

      })
    }
    else if (level == '4') {
      this.setState({
        form: {
          ...this.state.form,
          levelId: value
        }
      })
    }
    if(level !== '4') {

      this.findByPidAndType(value,true,level)
    }
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

   handleChange = key => value => {
     this.setState({
       ...this.state,
       form: {
         ...this.state.form,
         [key]: value
       }
     })
   }
   componentDidMount() {
     this._isMounted = true
     this.findByPidAndType(0,false)
     if(this.props.isUpdatePage) {
       Promise.all([
         this.fetchCompanyQualificationById()
       ]).then(() => {
         console.log(this.state.form)
         let lastlevel=0,currentlevel=0
         for (let state in this.state.form) {
           if(state === 'aptitudeTypeId') {
             this.findByPidAndType(this.state.form.aptitudeTypeId,false)
             lastlevel = 0
             currentlevel = 0

           }
           if(state === 'aptitudeLargeId') {
             this.findByPidAndType(this.state.form.aptitudeLargeId,false)
             lastlevel = 1
             currentlevel = 1
           }


           if(state === 'aptitudeSmallId') {
             this.findByPidAndType(this.state.form.aptitudeSmallId,false)
             lastlevel = 2
             currentlevel = 2
           }
           if(state === 'aptitudeMajorId') {
             this.findByPidAndType(this.state.form.aptitudeMajorId,false)
             lastlevel = 3
             currentlevel = 3
           }
           if(state === 'levelId') {
             lastlevel = 4
             currentlevel = 4
           }
         }
         this.setState({
           lastlevel,
           currentlevel
         })

       })
     }
   }
   componentDidUpdate(prevProps, prevState) {
     if(this.state.form !== prevState.form) {
     }
   }
   componentWillUnmount() {
     this._isMounted = false
   }

   fetchCompanyQualificationById = () => {
     return Http.get(`/companyQualification/findById/${parse(this.props.location.search).id}`)
       .then(res => {
         let { content} = res.data
         for (let state in content) {
           if(state in this.state.form) {
             setStateWrap.call(this, {
               companyName: parse(this.props.location.search).companyName,
               form: {
                 ...this.state.form,
                 [state]: content[state].toString(),
                 aptitudeStarttime: content.aptitudeStarttime ? new Date(content.aptitudeStarttime) : null,
                 aptitudeEndtime: content.aptitudeEndtime ? new Date(content.aptitudeEndtime) : null
               }
             }, this._isMounted, () => {
             })
           }
         }
       })
   }
   reset = () => {
     let { form } = this.state
     for (let state in form) {
       this.setState({
         ...this.state,
         companyName: '',
         aptitudeLargeList: [],
         aptitudeSmallList: [],
         aptitudeMajorList: [],
         levelList: [],
         form: {
           [state]: '',
           aptitudeStarttime: null,
           aptitudeEndtime: null
         }
       })
     }
     this.refs.form.resetFields()
   }

   submit = (url) => {
     this.setState({
       loading: true
     })
     const {
       currentlevel,
       lastlevel
     } = this.state
     if(lastlevel != currentlevel) {
       Message({
         type:'info',
         message:'请选择完所有的资格选项！'
       })
       return
     }
     Http.post(url, {
       ...this.state.form,
       companyName:this.state.companyName,
       aptitudeStarttime: this.state.form.aptitudeStarttime ? formatDate(this.state.form.aptitudeStarttime, false) : null,
       aptitudeEndtime: this.state.form.aptitudeEndtime ? formatDate(this.state.form.aptitudeEndtime, false) : null,
       id: this.props.isUpdatePage ? parse(this.props.location.search).id : null
     }).then(res => {
       this.setState({
         loading: false
       })
       if (res.data.code == '0') {
         Message({
           type:'success',
           message:"操作成功!"
         })
         setTimeout(()=>{
           this.props.history.push('/data-admin/company-qualification-list')
         },1000)

       }
       else {
         Message({
           type:'error',
           message:"操作失败!"+res.data.message
         })
       }
     }).catch(err => {
       setStateWrap.call(this, {
         ...this.state,
         loading: false
       }, this._isMounted)
     })
   }

   handleSubmit = (e) => {
     e.preventDefault()
     this.refs.form.validate((valid) => {
       if (valid) {
         if (this.props.isUpdatePage)
           this.submit('/companyQualification/update')
         else
           this.submit('/companyQualification/add')
       } else {
         return false
       }
     })
   }

   render() {
     return (
       <React.Fragment>
         <h3 className="page-title">{this.props.isUpdatePage ? '资质修改' : '资质新增'}
           { this.props.isUpdatePage?<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>:''}

         </h3>
         <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth={110}>

           <Form.Item label="资质类别" prop="aptitudeTypeId" style={{ verticalAlign:'top', display:'inline-block'}}>
             <Select
               size="small"
               value={this.state.form.aptitudeTypeId} onChange={this.handleSelectChange(0)}>
               {
                 this.state.aptitudeTypeList.map(item =>
                   <Select.Option key={item.id} label={item.name} value={item.id} />
                 )
               }
             </Select>

           </Form.Item>

           {
             this.state.aptitudeLargeList.length ?
               <Form.Item label="资质大类"
                 prop="aptitudeLargeId"
                 style={{ verticalAlign:'top', display:'inline-block'}}
               >
                 <Select
                   size="small" value={this.state.form.aptitudeLargeId} onChange={this.handleSelectChange(1)}>
                   {
                     this.state.aptitudeLargeList.map(item =>
                       <Select.Option key={item.id} label={item.name} value={item.id} />
                     )
                   }
                 </Select>
               </Form.Item>
               : null}
           {
             this.state.aptitudeSmallList.length ? <Form.Item label="资质小类"
               style={{ verticalAlign:'top', display:'inline-block'}}
             >
               <Select
                 size="small" value={this.state.form.aptitudeSmallId} onChange={this.handleSelectChange(2)}>
                 {
                   this.state.aptitudeSmallList.map(item =>
                     <Select.Option key={item.id} label={item.name} value={item.id} />
                   )
                 }
               </Select>
             </Form.Item> : null
           }
           {
             this.state.aptitudeMajorList.length ? <Form.Item label="专业"
               style={{ verticalAlign:'top', display:'inline-block'}}
             >
               <Select
                 size="small" value={this.state.form.aptitudeMajorId} onChange={this.handleSelectChange(3)}>
                 {
                   this.state.aptitudeMajorList.map(item =>
                     <Select.Option key={item.id} label={item.name} value={item.id} />
                   )
                 }
               </Select>
             </Form.Item> : null
           }
           {
             this.state.levelList.length ? <Form.Item label="等级"
               style={{ verticalAlign:'top', display:'inline-block'}}
             >
               <Select
                 size="small" value={this.state.form.levelId} onChange={this.handleSelectChange(4)}>
                 {
                   this.state.levelList.map(item =>
                     <Select.Option key={item.id} label={item.name} value={item.id} />
                   )
                 }
               </Select>
             </Form.Item> : null
           }
           <Form.Item label="所属企业" prop="companyId">
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
           <Form.Item label="资质证书号">
             <Input style={{width:'300px'}} size="small"
               value={this.state.form.aptitudeId}
               onChange={this.handleChange('aptitudeId')}
             />
           </Form.Item>
           <Form.Item label="发证有效期" style={{display:'inline'}}>
             <div style={{display:'inline-block', margin:' 0 15px 20px 0'}}>
               <DatePicker
                 value={this.state.form.aptitudeStarttime || null}
                 className="el-input el-input--small"
                 format="yyyy-MM-dd"
                 placeholder="发布时间"
                 onChange={this.handleChange('aptitudeStarttime')}/>
             </div>
             <div style={{display:'inline-block'}}>
               <DatePicker style={{marginRight:'15px'}}
                 value={this.state.form.aptitudeEndtime || null}
                 className="el-input el-input--small"
                 format="yyyy-MM-dd"
                 placeholder="截止时间"
                 onChange={this.handleChange('aptitudeEndtime')}/>
             </div>

           </Form.Item>

           <Form.Item label="发证机关">
             <Input size="small" style={{width:'300px'}} value={this.state.form.aptitudeOrgan} onChange={this.handleChange('aptitudeOrgan')} />
           </Form.Item>
           <Form.Item>
             <Button type="primary" onClick={this.handleSubmit}>
               {this.props.isUpdatePage ? '确认修改' : '确认新增'}
             </Button>
             <Button onClick={this.reset}>重置</Button>
             <Button onClick={() => this.props.history.push('/data-admin/company-qualification-list')}>取消</Button>
           </Form.Item>
         </Form>
       </React.Fragment>
     )
   }
}

export default withRouter(CompanyQualificationForm)
