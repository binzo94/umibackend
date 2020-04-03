import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input, Table, Pagination,MessageBox,Message} from 'element-react'
import { parse } from 'query-string'
import { Redirect } from 'react-router-dom'
import 'element-theme-default'
import './role-add.css'
import ResourceAdd from './resource-add'
import {handleEmpty} from "../../utils";


class Resourcelist extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      name: '',
      whetherCount:'',
      hasHide:'',
      limit:'',
      parentName:'',
      superior: [],
      data:[],
      system: [],
      columns: [
        {
          label: '编号',
          prop: 'rn',
          width: 150
        },
        {
          label: '名称',
          prop: 'name',
          width: 160
        },
        {
          label: '排序',
          prop: 'sort',
          width: 160
        },

        {
          label: '是否计数',
          width: 160,
          render: (data, column) => {
            return (<>{data.whetherCount=='0'?'否':'是'}</>
            )
          }
        },
        {
          label: '请求路径',
          prop: 'url',
          width: 160
        },
        {
          label: '真实路径',
          prop: 'realUrl',
          width: 160
        },
        {
          label:'是否有字段隐藏',
          width:100,
          render:(d,c)=>{
            return <span>{d.hasHide=='1'?'有':'无'}</span>
          }
        },
        {
          label:'限制次数',
          width:100,
          render:(d,c)=>{
            return <span>{d.limit}</span>
          }
        },
        {
          label: '操作',
          fixed:"right",
          width:100,
          render: (data, column) => {
            return (
              <span>
                <Button type="text" size="small" onClick={() => this.tableUpdate(data)}>修改</Button>
              </span>
            )
          }
        }
      ]
    }
  }

  resetSearch=()=>{
    this.setState({
      page:1,
      name: '',
      whetherCount:'',
      parentName:'',
      hasHide:'',
      limit:''
    },()=>{
      this.queryTableList(1)
    })
  }

  queryTableList = (page = 1) => {
    let { columns, data, superior, system, ...state } = this.state
    state=handleEmpty(state)
    Http.get('/cic/resource/list', { ...state, page })
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
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=resource-modify&id=${data.id}`
    })
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


  getSubmit = () => {
    this.queryTableList()
  }

  changePage = (page) => {
    this.queryTableList(page)
  }

  inputChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
  }

  chooseHandle = (value) => {
    this.setState({
      ...this.state,
      parent_id: value
    })
  }

  chooseSelect = (value) => {
    this.setState({
      ...this.state,
      sys_id: value
    })
  }
  goResourceAdd=()=>{
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=resource-add`
    })
  }
  componentDidMount () {
    this.querySuperior()
    this.queryTableList()
  }

  componentDidUpdate (nextProps) {
    if (this.props.location !== nextProps.location) {
      this.queryTableList()
    }
  }

  render () {
    let { ...state } = this.state
    let { location, match, history } = this.props
    let Parse = parse(location.search)
    if ('id' in Parse && 'page' in Parse) {
      if (Parse.page === 'resource-modify' && Parse.id)
        return <ResourceAdd isModifyPage={true} />
      return <Redirect to={this.props.match.url} />
    }else{
      if(Parse.page === 'resource-add')
        return <ResourceAdd />
    }
    return (
      <React.Fragment>

        <Form inline>
          <Form.Item label="权限节点名称：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('name')} value={this.state.name} />
          </Form.Item>
          <Form.Item label="是否计数：">
            <Select value={this.state.whetherCount} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('whetherCount')}>
              {
                [{label:'是',value:'1'},{label: '否',value:'0'}].map(el => {
                  return <Select.Option key={el.value} label={el.label} value={el.value} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="父级权限：">
            <Select value={this.state.parentName} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('parentName')}>
              {
                this.state.superior.map(el => {
                  return <Select.Option key={el.id} label={el.name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="有无字段隐藏：">
            <Select value={this.state.hasHide} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('hasHide')}>
              {
                [{label:'有',value:'1'},{label: '否',value:'0'}].map(el => {
                  return <Select.Option key={el.value} label={el.label} value={el.value} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item label="有无次数限制：">
            <Select value={this.state.limit} style={{width:'150px'}} placeholder="请选择" onChange={this.inputChange('limit')}>
              {
                [{label:'有',value:'1'},{label: '否',value:'0'}].map(el => {
                  return <Select.Option key={el.value} label={el.label} value={el.value} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon="search" className="b-size" onClick={this.getSubmit} >搜索</Button>
            <Button type="text"
                    style={{border:'1px solid', paddingLeft:'5px', paddingRight:'5PX'}}
                    nativeType="button"
                    onClick={() => this.resetSearch()}>
              重置搜索</Button>
            <Button type="success" className="b-size" onClick={this.goResourceAdd}>新增</Button>
          </Form.Item>
        </Form>

        <Table
          className="t-style"
          columns={this.state.columns}
          data={state.data.content}
          border={true}
          onSelectChange={(selection) => { console.log(selection) }}
          onSelectAll={(selection) => { console.log(selection) }}
        />
        <div className="page-style">
          <Pagination total={state.data.totalCount} pageSize={state.pageSize} currentPage={state.page} onCurrentChange={this.changePage} />
        </div>
      </React.Fragment>
    )
  }
}

export default Resourcelist
