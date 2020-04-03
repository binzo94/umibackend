import React from 'react'
import { Http } from '../../services'
import { Button, Table, Pagination, Dialog, Form, Select, Input, DatePicker, Layout, Message,MessageBox } from 'element-react'
import { withRouter } from 'react-router-dom'
import { setStateWrap, formatDate } from '../../utils'
import { parse } from 'query-string'
import './person-qualification-list.css'
import 'element-theme-default'
import {message} from 'antd'
import moment from 'moment'
class PersonQualificationList extends React.Component {
  _isMounted = false
  constructor(props) {
    let { location } = props
    let {id, personName, type, number, sex} = parse(location.search)
    super(props)
    this.state = {
      data: [],
      id: '',
      dialogVisible: false,
      isModify: false,
      page: 1,
      size: 10,
      personId: id,
      roleName: personName,
      sex,
      type,
      number,
      certificateSealId: '',
      certificateUsefulTime: '',
      issueTime:'',
      aptitudeTypeId: null,
      aptitudeNameId: null,
      aptitudeMajorId: null,
      levelId: null,
      aptitudeLastId: null,
      aptitudeTypeList: [],
      aptitudeNameList: [],
      aptitudeMajorList: [],
      levelList: [],
      lastlevel:0,
      currentlevel:0,
      rules: {
        roleName: [
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ],
        certificateSealId: [
          { required: true, message: '请输入注册号（执业印章号）', trigger: 'blur' }
        ],
        aptitudeTypeId:[
          { required: true, message: '请选择资质类别', trigger: 'blur' }
        ],
        aptitudeNameId:[
          { required: true, message: '请输入资格名称', trigger: 'blur' }
        ],
        levelId:[
          { required: true, message: '请输入等级', trigger: 'blur' }
        ],
        aptitudeMajorId:[
          { required: true, message: '请输入专业', trigger: 'blur' }
        ]
      },
      columns: [
        {
          label: '序号',
          prop: 'rn',
          width: 100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },
        {
          label: '资格类别',
          prop: 'aptitudeTypeName',
          width:140
        },
        {
          label: '资格名称',
          prop: 'aptitudeName',
          width:180
        },
        {
          label: '等级',
          prop: 'levelName',
          width:180
        },
        {
          label: '专业',
          prop: 'aptitudeMajorName',
          width:140
        },
        {
          label: '注册号（执业印章号）',
          prop: 'certificateSealId',
          width:180
        },
        {
          label: '有效期',
          prop: 'certificateUsefulTime',
          width:160
        },
        {
          label: '发证时间',
          prop: 'issueTime',
          width:190
        },
        {
          label: '',
          prop: '',
        },
        {
          label: '操作',
          width: 130,
          fixed:'right',
          render: (data, column) => {
            return (
              <span>
                <Button type="text" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
                <Button type="text" size="small" onClick={() => this.tableDelete(data)}>删除</Button>
              </span>
            )
          }
        }
      ]
    }
  }

  queryTableList = (page = 1) => {
    let {personId, size} = this.state
    Http.post('/personQualification/select', {
      personId, page, size
    })
      .then(res => {
        if (res.data.content) {
          this.setState({
            ...this.state,
            data: res.data.content,
            page
          })
        }
      })
  }

  tableUpdate = (data) => {
    this.setState({
      id:data.id
    })
    Http.get(`/personQualification/findById/${data.id}`)
      .then(res => {
        if (res.data.code == '0') {
          if (res.data.content) {
            let { content } = res.data
            this.findByPidAndType(0,false)
            this.setState({
              certificateSealId: content.certificateSealId,
              certificateUsefulTime: content.certificateUsefulTime?moment(content.certificateUsefulTime,'YYYY-MM-DD').toDate():'',
              aptitudeTypeId: content.aptitudeTypeId,
              aptitudeNameId: content.aptitudeNameId,
              aptitudeMajorId: content.aptitudeMajorId,
              issueTime:content.issueTime?moment(content.issueTime,'YYYY-MM-DD').toDate():'',
              levelId: content.levelId,
              aptitudeLastId: content.aptitudeLastId,
              id: content.id,
              dialogVisible: true,
              isModify: true
            })
            let lastlevel=0,currentlevel=0
            if(!!content.aptitudeTypeId){
              lastlevel = 0
              currentlevel=0
              this.findByPidAndType(content.aptitudeTypeId,false)
            }
            if(!!content.aptitudeNameId){
              lastlevel = 1
              currentlevel=1
              this.findByPidAndType(content.aptitudeNameId,false)
            }
            if(!!content.levelId){
              lastlevel = 2
              currentlevel=2
              this.findByPidAndType(content.levelId,false)
            }
            if(!!content.aptitudeMajorId){
              lastlevel = 3
              currentlevel=3
            }
            this.setState({
              lastlevel,
              currentlevel
            })
          }
        }
      })
  }

  tableDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/personQualification/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.queryTableList()
          },1000)
        }else{
          Message({
            type:'error',
            message: '删除失败!'+res.data.message
          })
        }
      })
    }).catch(() => {
      Message({
        type: 'info',
        message: '已取消操作'
      })
    })

  }

  changePage = (page) => {
    this.queryTableList(page)
  }

  cancle = () => {
    this.setState({
      dialogVisible: false,
      aptitudeTypeList: [],
      aptitudeNameList: [],
      aptitudeMajorList: [],
      levelList: [],
      lastlevel:0,
      currentlevel:0,
      certificateSealId: '',
      certificateUsefulTime: '',
      aptitudeTypeId: null,
      aptitudeNameId: null,
      aptitudeMajorId: null,
      levelId: null,
      aptitudeLastId: null
      // form: Object.assign({}, this.state.form, { superDept: '', deptName: '' })
    })
  }

  addQualify = () => {
    this.findByPidAndType()
    this.setState({
      dialogVisible: true,
      isModify: false,
      lastlevel:0,
      currentlevel:0,
      certificateSealId: '',
      certificateUsefulTime: '',
      issueTime:'',
      aptitudeTypeId: null,
      aptitudeNameId: null,
      aptitudeMajorId: null,
      levelId: null,
      aptitudeLastId: null
    })
  }

  findListLevel = (list, level) => {
    if (!list.length) return false
    return list.every(item => item.level === level)
  }

  tableNumber = (idx) => {
    let { page, size } = this.state
    return (idx + 1) + ((page - 1) * size)
  }


  findByPidAndType = (pid = 0,isupdatelevel = true) => {
    Http.get(`/qualification/getPQByPid/${pid}`).then(res => {
      if (res.data.content) {
        let { content } = res.data
        if(isupdatelevel){
          console.log('处理level')
          // 判断最后一级的level
          if(content[0] && content[0].last == true) {
            this.setState({
              lastlevel: content[0].level
            })
          }else {
            //
           if(content[0]){
             this.setState({
               lastlevel: parseInt(content[0].level) + 1
             })
           }
          }
        }

        if (this.findListLevel(content, '1')) {
          setStateWrap.call(this, {
            aptitudeNameList: content
          }, this._isMounted)
        }
        if (this.findListLevel(content, '2')) {
          setStateWrap.call(this, {
            levelList: content
          }, this._isMounted)
        }
        if (this.findListLevel(content, '3')) {
          setStateWrap.call(this, {
            aptitudeMajorList: content
          }, this._isMounted)
        }
        if (this.findListLevel(content, '0')) {
          setStateWrap.call(this, {
            aptitudeTypeList: content
          }, this._isMounted)
        }
      }
    })
  }

  handleSelectChange = (level)=>(value) => {

    console.log('资格等级', level)
    this.setState({
      currentlevel:level
    })
    if (level == '0') {
      this.setState({
        aptitudeNameList: [],
        aptitudeMajorList: [],
        levelList: [],
        aptitudeTypeId: value,
        aptitudeLastId: value,
        aptitudeNameId: null,
        aptitudeMajorId: null,
        levelId: null
      })
    }
    else if (level == '1') {
      this.setState({
        aptitudeMajorList: [],
        levelList: [],
        aptitudeNameId: value,
        aptitudeLastId: value,
        aptitudeMajorId: null,
        levelId: null
      })
    }
    else if (level == '2') {
      this.setState({
        aptitudeMajorList: [],
        levelId: value,
        aptitudeLastId: value,
        aptitudeMajorId: null
      })
    }
    else if (level == '3') {
      this.setState({
        aptitudeMajorId: value,
        aptitudeLastId: value
      })
    }
    if (level !== '3') {
       this.findByPidAndType(value)
     }
  }

  onChange = (key) => (value) => {
    this.setState({
      [key]: value
    })
  }

  addSure = () => {
    const {
      certificateSealId,
      certificateUsefulTime,
      issueTime,
      aptitudeTypeId,
      aptitudeNameId,
      aptitudeMajorId,
      levelId,
      aptitudeLastId,
      personId,
      lastlevel,
      currentlevel
    } = this.state
    // 判断是否选择完选项
    if(lastlevel != currentlevel) {
      Message({
        type:'info',
        message:'请选择完所有的资格选项！'
      })
      return
    }
    if(!certificateSealId) {
      Message({
        type:'info',
        message:'请填写注册号！'
      })
      return
    }
    let strobj = {
      certificateSealId,
      aptitudeTypeId,
      aptitudeNameId,
      aptitudeMajorId,
      levelId,
      personId
    }
    Http.post('/personQualification/add', {
      ...strobj,
      issueTime:issueTime ? moment(issueTime).format('YYYY-MM-DD') : null,
      certificateUsefulTime:certificateUsefulTime ? moment(certificateUsefulTime).format('YYYY-MM-DD') : null
    })
      .then(res => {
        if(res.data.code == '0') {
          Message({
            type:'success',
            message:'新增成功!'
          })
          this.setState({
            aptitudeTypeList: [],
            aptitudeNameList: [],
            aptitudeMajorList: [],
            lastlevel:0,
            currentlevel:0,
            levelList: [],
            certificateSealId: '',
            certificateUsefulTime: '',
            issueTime:'',
            aptitudeTypeId: null,
            aptitudeNameId: null,
            aptitudeMajorId: null,
            levelId: null,
            aptitudeLastId: null,
            dialogVisible: false
          })
          setTimeout(()=>{

            this.queryTableList()
          },1000)

        }else{
          Message({
            type:'error',
            message:'修改失败!'+res.data.message
          })
        }
      })

  }

  modifySure = () => {
    const {
      certificateSealId,
      certificateUsefulTime,
      issueTime,
      aptitudeTypeId,
      aptitudeNameId,
      aptitudeMajorId,
      levelId,
      aptitudeLastId,
      personId,
      lastlevel,
      currentlevel
    } = this.state
    // 判断是否选择完选项
    if(lastlevel != currentlevel) {
      Message({
        type:'info',
        message:'请选择完所有的资格选项！'
      })
      return
    }
    if(!certificateSealId) {
      Message({
        type:'info',
        message:'请填写注册号！'
      })
      return
    }
    let strobj = {
      certificateSealId,
      aptitudeTypeId,
      aptitudeNameId,
      aptitudeMajorId,
      levelId,
      personId
    }
    // 判断是否选择完选项
    if(lastlevel != currentlevel) {
      Message({
        type:'info',
        message:'请选择完所有的资格选项！'
      })
      return
    }
    if(!certificateSealId) {
      Message({
        type:'info',
        message:'请填写注册号！'
      })
      return
    }
    Http.post('/personQualification/update', {
      ...strobj,
      id:this.state.id,
      issueTime:issueTime ? moment(issueTime).format('YYYY-MM-DD') : null,
      certificateUsefulTime:certificateUsefulTime ? moment(certificateUsefulTime).format('YYYY-MM-DD') : null

    })
      .then(res => {
       if(res.data.code==0){
         Message({
           type:'success',
           message:'修改成功!'
         })
         this.setState({
           aptitudeTypeList: [],
           aptitudeNameList: [],
           aptitudeMajorList: [],
           lastlevel:0,
           currentlevel:0,
           levelList: [],
           certificateSealId: '',
           certificateUsefulTime: '',
           issueTime:'',
           aptitudeTypeId: null,
           aptitudeNameId: null,
           aptitudeMajorId: null,
           levelId: null,
           aptitudeLastId: null,
           dialogVisible: false
         })
         this.queryTableList()
       }else{
         Message({
           type:'error',
           message:'修改失败!'+res.data.message
         })
       }
      })

  }

  componentDidMount () {
    this._isMounted = true
    this.queryTableList()
  }
  componentDidUpdate () {
    this._isMounted = true
  }
  componentWillUnmount () {
    this._isMounted = false
  }

  render () {
    return (
      <React.Fragment>
        <div className="b-wrap" >
          <h3 className="page-title">人员资格详情
<span className='common-tolist' onClick={() => {this.props.history.goBack()}}>&lt;&lt;返回列表</span>
          </h3>
          <Button type="primary" onClick={this.addQualify} size="small" >新增资格</Button>
        </div>
        <Form labelPosition={'left'} style={{color:'black'}}>
          <Form.Item label="姓名:" labelWidth="90" style={{marginBottom:'4px'}}>
            {this.state.roleName}
          </Form.Item>
          <Form.Item label="性别:" labelWidth="90" style={{marginBottom:'4px'}}>
            {this.state.sex=='undefined'?'':this.state.sex}
          </Form.Item>

          <Form.Item label={this.state.type!='undefined'?this.state.type + ':' :'证件类型:'} labelWidth="90" style={{marginBottom:'4px'}}>
            {this.state.number=='undefined'?'':this.state.number}
          </Form.Item>
        </Form>
        <Table
          className="t-style"
          columns={this.state.columns}
          data={this.state.data.content}
          onSelectChange={(selection) => { console.log(selection) }}
          onSelectAll={(selection) => { console.log(selection) }}
        />
        <div className="page-ct">
          <Pagination total={this.state.data.totalCount} pageSize={this.state.size} currentPage={this.state.page} onCurrentChange={this.changePage} />
        </div>
        <Dialog
          title={this.state.isModify ? '资格修改' : '资格新增'}
          visible={this.state.dialogVisible}
          onCancel={this.cancle}
          size="large"
        >
          <Dialog.Body>
            <Form model={this.state} rules={this.state.rules} labelWidth="200">
              <Layout.Row>
                <Layout.Col span={12}>
                  <Form.Item label="姓名:" prop="roleName" >
                    <Input value={this.state.roleName} placeholder="请输入姓名" disabled></Input>
                  </Form.Item>
                  <Form.Item label="注册号(执业印章号):" prop="certificateSealId" >
                    <Input value={this.state.certificateSealId} placeholder="请输入注册号（执业印章号）" onChange={this.onChange('certificateSealId')}></Input>
                  </Form.Item>
                  <Form.Item label="发证时间:" prop="ssueTime" >
                    <DatePicker
                      placeholder="请输入时间"
                      value={this.state.issueTime || null}
                      onChange={this.onChange('issueTime')} />
                  </Form.Item>
                  <Form.Item label="有效期:" prop="certificateUsefulTime" >
                    <DatePicker
                      placeholder="请输入时间"
                      value={this.state.certificateUsefulTime || null}
                      onChange={this.onChange('certificateUsefulTime')} />
                  </Form.Item>
                </Layout.Col>
                <Layout.Col span={12}>
                  <Form.Item label="资格类别:" style={{ marginRight: '30px' }} prop={'aptitudeTypeId'}>
                    <Select
                      size="small"
                      value={this.state.aptitudeTypeId} onChange={this.handleSelectChange(0)}>
                      {
                        this.state.aptitudeTypeList.map(item =>
                          <Select.Option key={item.id} label={item.name} value={item.id} />
                        )
                      }
                    </Select>
                  </Form.Item>
                  {
                    this.state.aptitudeNameList.length ?
                      <Form.Item label="资格名称:"
                        prop={'aptitudeNameId'}
                      >
                        <Select
                          size="small" value={this.state.aptitudeNameId} onChange={this.handleSelectChange(1)}>
                          {
                            this.state.aptitudeNameList.map(item =>
                              <Select.Option key={item.id} label={item.name} value={item.id} />
                            )
                          }
                        </Select>
                      </Form.Item> : null
                  }
                  {
                    this.state.levelList.length ?
                      <Form.Item label="等级:" prop={'levelId'}
                      >
                        <Select
                          size="small" value={this.state.levelId} onChange={this.handleSelectChange(2)}>
                          {
                            this.state.levelList.map(item =>
                              <Select.Option key={item.id} label={item.name} value={item.id} />
                            )
                          }
                        </Select>
                      </Form.Item> : null
                  }
                  {
                    this.state.aptitudeMajorList.length ?
                      <Form.Item label="专业:"
                        prop={'aptitudeMajorId'}
                      >
                        <Select
                          size="small" value={this.state.aptitudeMajorId} onChange={this.handleSelectChange(3)}>
                          {
                            this.state.aptitudeMajorList.map(item =>
                              <Select.Option key={item.id} label={item.name} value={item.id} />
                            )
                          }
                        </Select>
                      </Form.Item> : null
                  }
                </Layout.Col>
              </Layout.Row>

            </Form>
          </Dialog.Body>
          <Dialog.Footer className="dialog-footer">
            {this.state.isModify ?
              <Button type="primary" onClick={this.modifySure}>确认修改</Button> :
              <Button type="primary" onClick={this.addSure}>确认新增</Button>
            }
            <Button onClick={this.cancle}>取 消</Button>
          </Dialog.Footer>
        </Dialog>
      </React.Fragment >
    )
  }
}

export default withRouter(PersonQualificationList)
