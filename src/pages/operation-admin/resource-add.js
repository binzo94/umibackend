import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input, Radio,Message,Layout,MessageBox} from 'element-react'
import 'element-theme-default'
import './role-add.css'
import {handleEmpty, isEmptyObject} from '../../utils'
import { parse } from 'query-string'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

class Resourceform extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      form: {
        name: '',
        parentId:'',
        url:'',
        realUrl:'',
        sort:'',
        whetherCount:'1',
        limit:''
      },
      resourceExtendList:[],
      roleList:[],
      system: [],
      superior: [],
      superiorAll:[],
      rules: {
        name: [
          { required: true, message: '请填写权限节点名称', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请填写url', trigger: 'blur' }
        ],
        realUrl: [
          { required: true, message: '请填写realUrl', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '请填写排序', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if (!/^\d+(\.\d+)?$/.test(value)) {
                callback(new Error('排序必须为纯数字格式'))
              }
              else {
                callback()
              }
            }
          }
        ],
        limit: [

          { required: false, message: '请填写次数限制', trigger: 'change' },
          {
            validator: (rule, value, callback) => {
              if(value!=''){
                if (!/^\d+(\.\d+)?$/.test(value)) {
                  callback(new Error('排序必须为纯数字格式'))
                }
                else {
                  callback()
                }
              }else{
                callback()
              }
            }
          }
        ]
      }
    }
  }

  onChange = (key) => (value) => {
    this.setState({
      form: Object.assign({}, this.state.form, { [key]: value })
    })
    if(key == 'sysId'){
      let newsuperior=this.state.superiorAll.filter((item)=>{
        return  item.sys_id == value
      })
      this.setState({
        superior:newsuperior,
        form:{
          ...this.state.form,
          parentId:''
        }
      })
    }
  }

  querySuperior = () => {
    Http.get('/cic/resource/parent/list')
      .then(res => {
        if (res.data.content) {
          this.setState({
            superior: res.data.content
          })
        }
      })
  }

  querySystem = () => {
    Http.get('/system/resource/system/list')
      .then(res => {
        if (res.data.content) {
          this.setState({
            system: res.data.content
          })
          if(!this.props.isModifyPage){
            this.setState({
              form:{
                ...this.state.form,
                sysId:res.data.content[0]['id']
              }

            })
          }
        }
      })
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
  checkSameRole=()=>{
    let resourceExtendList = this.state.resourceExtendList.concat([])
    let roleNameList = resourceExtendList.map((item,index)=>{
        return item['roleName']
    })
    let newRoleNameList=_.uniq(roleNameList)
    if(newRoleNameList.length!=roleNameList.length){
      return false
    }else{
      return true
    }
  }
  getSure = () => {
    if(!this.checkSameRole()) {
      Message({
        type:'warning',
        message:'存在相同角色的数据配置,每个角色只能存在一个数据配置项!'
      })
      return
    }
    Http.post('/cic/resource/add', { ...this.state.form,resourceExtendList:this.state.resourceExtendList})
      .then(res => {
        this.setState({
          ...this.state
        })
        if (res.data.code == '0') {
          this.props.history.push('/operation-admin/resource-list')
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
    if(!this.checkSameRole()) {
      Message({
        type:'warning',
        message:'存在相同角色的数据配置,每个角色只能存在一个数据配置项!'
      })
      return
    }
    let { location } = this.props
    Http.post(`/cic/resource/update`, { ...this.state.form ,resourceExtendList:this.state.resourceExtendList})
      .then(res => {
        if (res.data.code == '0') {
          Message({
            type:'success',
            message:'修改成功!'
          })
          this.props.history.push('/operation-admin/resource-list')
        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }

      })
  }

  cancle = () => {
    this.props.history.push('/operation-admin/resource-list')
  }

  fetchPermissionsInfoById = () => {
    let { location, match, history } = this.props
    Http.get(`/cic/resource/get/${parse(location.search).id}`)
      .then(res => {
        if (isEmptyObject(res.data.content)) {
          history.replace(`${match.url}`)
        }
        else {
          let content = res.data.content
          let { form } = this.state
          let resourceExtendList =content.resourceExtendList||[]
          resourceExtendList = resourceExtendList.map((item)=>{
            item['hider']=item['hide']?'1':'0'
            return item
          })
          this.setState({
            form: {
              ...content,
              sort:content.sort.toString(),
              limit:content.limit.toString()
            },
            resourceExtendList:resourceExtendList
          })
          if(this.state.superiorAll&&this.state.superiorAll.length>0){
            let newsuperior=this.state.superiorAll.filter((item)=>{
              return  item.sys_id == res.data.content.sysId
            })
            this.setState({
              superior:newsuperior
            })
          }

        }
      })
  }
  queryRoleList = () => {
    Http.get('/cic/role/list', { page:1,size:1000 })
      .then(res => {
        if (res.data.code=='0') {
            this.setState({
              roleList:res.data.content.content
            })
        }
      })
  }
  componentDidMount () {
    if (this.props.isModifyPage) {
      this.fetchPermissionsInfoById()
    }
    this.queryRoleList()
    this.querySystem()
    this.querySuperior()
  }
  addExtendList=()=>{
    console.log(this.state.resourceExtendList)
    this.setState({
      resourceExtendList:[...this.state.resourceExtendList,{
        "roleId": '', // 角色id
        "page": '', // 能看几页
        "size": '', // 每页几条
        "roleName": "",// 角色标识
        "hide": false, // 是否有隐藏字段,如果为true,下面必填
        "hider":'0',
        "param": false,
        "resourceFieldList":[]}]
    })
  }
  addExtendListQuick=()=>{
    let temp=this.state.resourceExtendList.concat([])
    let lastitem = _.cloneDeep(temp[temp.length-1])
    lastitem['id']=''
    this.setState({
      resourceExtendList:[...this.state.resourceExtendList,lastitem]})
  }
  addFieldList=(index)=>()=>{
    let resourceExtendList = this.state.resourceExtendList.concat([])
    let temp = resourceExtendList[index]
    temp.resourceFieldList=[...temp.resourceFieldList,{
      "filed": "", // 需要隐藏的字段名称
      "replaceValue": "", // 替换值
      "expression": "", // 返回值表达式
      "module": "", // 模块名称
      "annotation": "", // 字段注释
      "showMe": "0", // 1=自己的企业不隐藏,0=隐藏
      "showMeCompareField": "" // 如果上面为1,必填,企业id 匹配字段
    }]
    resourceExtendList[index] = temp
    this.setState({
      resourceExtendList:resourceExtendList
    })
    this.forceUpdate()
  }
  /**
   *
   * @param index 父索引
   * @param filedIndex 子索引
   * @param filed 字段值
   * @returns {Function}
   */
  resourceFieldListChange=(index,filedIndex,filed)=>(value)=>{

    let resourceExtendList = this.state.resourceExtendList
    let temp = resourceExtendList[index]
    let tempResourceFieldList = temp['resourceFieldList']
    let temp1 = tempResourceFieldList[filedIndex]
    temp1[filed] = value
    tempResourceFieldList[filedIndex] = temp1

    temp['resourceFieldList'] = tempResourceFieldList
    resourceExtendList[index] = temp
    this.setState({
      resourceExtendList:resourceExtendList
    })
    this.forceUpdate()

  }
  resourceExtendListChange=(index,field)=>(value)=>{
    let resourceExtendList = this.state.resourceExtendList.concat([])
    let temp = resourceExtendList[index]
      if(field == 'roleId'){
        temp[field]=value
        let roleSign = ''
        this.state.roleList.filter((item)=>{
          if(item.id == value){
            roleSign=item.sign
          }
        })
        temp['roleName'] = roleSign
      }else if(field == 'hider'){
        temp[field]=value
        temp['hide']=value =='1'
        if(value != '1'){
          temp['resourceFieldList'] =[]
        }
      }else{

        temp[field]=value
      }
    resourceExtendList[index] = temp
      this.setState({
        resourceExtendList:resourceExtendList
      })
    this.forceUpdate()
  }
  deleteFieldListItem=(index,filedIndex)=>()=>{
    MessageBox.confirm('此操作将删除该字段配置, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      let resourceExtendList = this.state.resourceExtendList.concat([])
      let temp = resourceExtendList[index]
      let fieldList = temp['resourceFieldList']
      fieldList.splice(filedIndex, 1)
      temp['resourceFieldList']=fieldList
      resourceExtendList[index]=temp
      this.setState({
        resourceExtendList:resourceExtendList
      })
      this.forceUpdate()
    }).catch(() => {

    })
  }
  deleteExtendListItem=(index)=>()=>{
    MessageBox.confirm('此操作将删除该项数据配置, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      let resourceExtendList = this.state.resourceExtendList.concat([])
      resourceExtendList.splice(index, 1)
      this.setState({
        resourceExtendList:resourceExtendList
      })
      this.forceUpdate()
    }).catch(() => {

    })


  }
  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <h3 className="page-title">权限节点{this.props.isModifyPage ? '修改' : '新增'}
          <span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>
        </h3>
        <Form ref="form" model={this.state.form} rules={this.state.rules} className="demo-ruleForm" labelWidth="150">
          <Form.Item label="权限节点名称：" prop="name">
            <Input value={this.state.form.name} placeholder="请填写权限节点名称" style={{ width: '300px' }} onChange={this.onChange('name')}></Input>
          </Form.Item>
          <Form.Item label="上级名称：" prop="parentId">
            <Select value={this.state.form.parentId} placeholder="请选择上级名称" style={{ width: '300px' }} onChange={this.onChange('parentId')}>
              {
                this.state.superior.map(el => {
                  return <Select.Option key={el.id} label={el.name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="url：" prop="url">
            <Input value={this.state.form.url} placeholder="请填写url" style={{ width: '300px' }} onChange={this.onChange('url')}></Input>
          </Form.Item>
          <Form.Item label="realUrl：" prop="realUrl">
            <Input value={this.state.form.realUrl} placeholder="请填写realUrl" style={{ width: '300px' }} onChange={this.onChange('realUrl')}></Input>
          </Form.Item>
          <Form.Item label="排序：" prop="sort">
            <Input value={this.state.form.sort} placeholder="请填写排序" style={{ width: '100px' }} onChange={this.onChange('sort')}></Input>
          </Form.Item>
          <Form.Item label="是否计数：" prop="whetherCount">
            <Radio.Group value={this.state.form.whetherCount} onChange={this.onChange( 'whetherCount')}>
              <Radio.Button value="1" >是</Radio.Button>
              <Radio.Button value="0" >否</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="限制次数：" prop="limit">
            <Input value={this.state.form.limit} placeholder="请填写限制次数" style={{ width: '130px' }} onChange={this.onChange('limit')}></Input>
          </Form.Item>
          <Form.Item label="数据配置：" prop="">
            {this.state.resourceExtendList.map((item,index)=>{

                 return <div key={index} style={{marginBottom:'30px',borderRadius:'5px',position:'relative',border:'1px solid rgb(241, 241, 241)',backgroundColor:"#f0f5f3",padding:"50px 30px 30px 30px"}}>
                   <span style={{position:'absolute',left:"14px",top:"5px",color:'rgb(13, 41, 93)'}}>角色{index+1}</span>
                   <Button type="danger" size={'mini'} icon="delete" onClick={this.deleteExtendListItem(index)} style={{position:'absolute',right:'10px',top:'10px'}}>删除该角色数据配置</Button>
                   <Layout.Row gutter="20">
                     <Layout.Col span="12">
                       <Form.Item label="配置角色："  labelWidth="120" style={{marginBottom:"15px"}}>
                         <Select size={'small'} value={item.roleId} placeholder="请选择角色名称" style={{ width: '200px' }} onChange={this.resourceExtendListChange(index,'roleId')}>
                           {
                             this.state.roleList.map(el => {
                               return <Select.Option key={el.id} label={el.name} value={el.id} />
                             })
                           }
                         </Select>
                       </Form.Item>
                       <Form.Item label="页数："  labelWidth="120" style={{marginBottom:"15px"}}>
                         <Input value={item.page} size={'small'} placeholder="请填写数据查询的页数" style={{ width: '200px' }} onChange={this.resourceExtendListChange(index,'page')}></Input>
                       </Form.Item>
                     </Layout.Col>
                     <Layout.Col span="12">
                       <Form.Item label="条数："  labelWidth="120" style={{marginBottom:"15px"}}>
                         <Input value={item.size} size={'small'} placeholder="请填写每页数据查询的条数" style={{ width: '200px' }} onChange={this.resourceExtendListChange(index,'size')}></Input>
                       </Form.Item>
                       <Form.Item label="隐藏字段：" labelWidth="120">
                         <Radio.Group value={item.hider} size={'small'} onChange={this.resourceExtendListChange(index,'hider')}>
                           <Radio.Button value={'1'} >有</Radio.Button>
                           <Radio.Button value={'0'} >无</Radio.Button>
                         </Radio.Group>
                       </Form.Item>
                     </Layout.Col>
                   </Layout.Row>
                   {item.hide?<p style={{width:"120px",textAlign:'right',paddingRight:'12px',margin:'0'}}>字段隐藏配置：</p>:null}
                   <div>
                     {item.resourceFieldList.map((filedItem,filedIndex)=>{
                       return <div style={{marginBottom:'30px',borderRadius:'5px',backgroundColor:'rgb(222, 234, 234)',position:'relative',border:'1px solid rgb(241, 241, 241)',padding:"30px"}}>
                         <Button type="danger" size={'mini'} icon="delete" onClick={this.deleteFieldListItem(index,filedIndex)} style={{position:'absolute',right:'10px',top:'10px'}}>删除该字段配置</Button>
                         <span style={{position:'absolute',left:"14px",top:"5px",color:'rgb(13, 41, 93)'}}>字段{filedIndex+1}</span>
                         <Layout.Row>
                           <Layout.Col span="12">
                             <Form.Item label="字段名称："  labelWidth="130" style={{marginBottom:"15px"}}>
                               <Input value={filedItem.filed} size={'small'} placeholder="请填写需要隐藏字段名称" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'filed')}></Input>
                             </Form.Item>
                             <Form.Item label="替换值："  labelWidth="130" style={{marginBottom:"15px"}}>
                               <Input value={filedItem.replaceValue} size={'small'} placeholder="请填写需要字段替换值" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'replaceValue')}></Input>
                             </Form.Item>
                             <Form.Item label="返回值表达式："  labelWidth="130" style={{marginBottom:"15px"}}>
                               <Input value={filedItem.expression} size={'small'} placeholder="请填写返回值表达式" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'expression')}></Input>
                             </Form.Item>
                             <Form.Item label="模块名称："  labelWidth="130" style={{marginBottom:"15px"}}>
                               <Input value={filedItem.module} size={'small'} placeholder="请填写模块名称" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'module')}></Input>
                             </Form.Item>
                           </Layout.Col>
                           <Layout.Col span="12">
                             <Form.Item label="字段注释："  labelWidth="130" style={{marginBottom:"15px"}}>
                               <Input value={filedItem.annotation} size={'small'} placeholder="请填写字段注释" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'annotation')}></Input>
                             </Form.Item>
                             <Form.Item label="企业数据隐藏：" labelWidth="130" style={{marginBottom:"15px"}}>
                               <Radio.Group value={filedItem.showMe} size={'small'} onChange={this.resourceFieldListChange(index,filedIndex,'showMe')}>
                                 <Radio.Button value={'1'} >是</Radio.Button>
                                 <Radio.Button value={'0'} >否</Radio.Button>
                               </Radio.Group>
                             </Form.Item>
                             {filedItem.showMe=='1'?
                               <Form.Item label="公司Id字段："  labelWidth="130" style={{marginBottom:"15px"}}>
                                 <Input value={filedItem.showMeCompareField} size={'small'} placeholder="请填写公司Id字段" style={{ width: '200px' }} onChange={this.resourceFieldListChange(index,filedIndex,'showMeCompareField')}></Input>
                               </Form.Item>:null
                             }
                           </Layout.Col>
                         </Layout.Row>

                       </div>
                     })
                     }
                   </div>

                   {item.hide?<Button onClick={this.addFieldList(index)} size={'mini'} icon="plus">配置隐藏字段</Button>:null}

                 </div>
            })}
            <Button onClick={this.addExtendList} size={'small'} icon="plus">新增数据配置</Button>
            {this.state.resourceExtendList.length>0?<Button onClick={this.addExtendListQuick} size={'small'} icon="plus">快捷增加数据配置</Button>:null}
          </Form.Item>
          <Form.Item>
            <Button type="primary" style={{ marginRight: '180px' }} onClick={this.handleSubmit}>
              {this.props.isModifyPage ? '确认修改权限' : '确认新增权限'}
            </Button>
            <Button onClick={this.cancle}>取消</Button>
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(Resourceform)
