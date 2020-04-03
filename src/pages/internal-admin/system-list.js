import React from 'react'
import { Http } from '../../services'
import { Button, Form, Select, Input, Table, Pagination,Message,MessageBox} from 'element-react'
import 'element-theme-default'
import './role-add.css'


class systemList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pageSize: 10,
      // name:'',
      // status:'',
      data: {},
      options: [
        {
          id: '1',
          name: '可用'
        },
        {
          id: '0',
          name: '冻结'

        }
      ],
      columns: [
        {
          label: '编号',
          prop: 'rn',
          width: 150
        },
        {
          label: '系统名称',
          prop: 'sys_name',
          width: 160
        },
        {
          label: '系统描述',
          prop: 'sys_desc'
        },
        {
          label: '状态',
          prop: 'status',
          render:function (data) {
            let obj= {'0':'冻结','1':'可用'}
            return obj[data.status]?obj[data.status]:''
          }
        },
        {
          label: '更新员工',
          prop: 'modifier'
        },
        {
          label: '更新时间',
          prop: 'updated_at'
        }
      ]
    }
  }


  queryTableList = (page = 1) => {
    let { columns, data, options, ...state } = this.state
    Http.get('/system/info/select', { ...state, page })
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

  tableDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/system/info/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          this.queryTableList()
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

  componentDidMount () {
    this.queryTableList()
  }

  render () {
    let { ...state } = this.state
    return (
      <React.Fragment>
        <Form inline>
          <Form.Item label="权限系统名称：">
            <Input className="i-size" placeholder="请输入内容" onChange={this.inputChange('name')} value={this.state.name} />
          </Form.Item>
          <Form.Item label="状态：">
            <Select value={this.state.status} placeholder="请选择状态" style={{ width: '300px' }} onChange={this.inputChange('status')}>
              {
                this.state.options.map(el => {
                  return <Select.Option key={el.id} label={el.name} value={el.id} />
                })
              }
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon="search" className="b-size" onClick={this.getSubmit} >搜索</Button>
          </Form.Item>
        </Form>
        <Table
          className="t-style"
          columns={this.state.columns}
          data={state.data.PageInfo}
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

export default systemList
