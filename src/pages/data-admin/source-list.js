import React from 'react'
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Pagination,
  MessageBox,
  Message
} from 'element-react'
import {Redirect} from 'react-router-dom'
import {parse} from 'query-string'
import {Http} from '../../services'
import {setStateWrap, isEmptyObject} from '../../utils'
import SourceForm from './source-form'

class SourceList extends React.Component {
  _isMounted = false
  state = {
    data: [],
    sourceType: [],
    provinceData: [],
    regionData: [],
    columns: [{
      label: '编号',
      width: 70,
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    },
    {
      label: '名称',
      prop: 'name',
      width:220
    },
    {
      label: 'URL',
      prop: 'url',
      width:220,
      render: (data, column, idx) => {
        return <a href={data.url} target="_blank" style={{color:'#20a0ff'}}>{data.url}</a>
      }
    },
    {
      label: '省',
      prop: 'provinceName',
      width:80
    },
    {
      label: '类别',
      prop: 'typeName',
      width:80
    }, {
      label: '创建人',
      prop: 'creator',
      width:80
    }, {
      label: '更新时间',
      prop: 'updatedAt',
      width:150
    }, {
      label: '操作',
        fixed:'right',
        width:110,
      render:(data, columns) => {
        return (
          <span>
            <Button type="text" size="small" onClick={() => this.handleUpdate(data)}>修改</Button>
            <Button type="text" size="small" onClick={() => this.handleDelete(data)}>删除</Button>
          </span>
        )
      }
    }],
    page: 0,
    pageSize: 10,
    name: '',
    type: '',
    areaCode: '',
    url: ''
  }

  handleUpdate = (data) => {
    this.props.history.push({
      pathname: this.props.match.url,
      search: `page=source-update&id=${data.id}`
    })
  }

  fetchRegionData = (level, id = 0) => {
    Http.get(`/dict/area/${id}`)
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
  handleDelete = (data) => {
    MessageBox.confirm('此操作将删除该条数据, 是否继续?', '提示', {
      type: 'warning'
    }).then(() => {
      Http.get(`/sourceWeb/delete/${data.id}`).then(res => {
        if(res.data.code == 0) {
          Message({
            type:'success',
            message: '删除成功!'
          })
          setTimeout(()=>{

            this.fetchWebSource()
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

  tableNumber = (idx) => {
    let {page, pageSize} = this.state
    return (idx + 1) + (page * pageSize)
  }

  fetchWebSource = (page = 0) => {
    let {
      data,
      columns,
      sourceType,
      provinceData,
      regionData,
      ...state
    } = this.state
    Http.post('/sourceWeb/select', {...state, page})
      .then(res => {
        if(res.data.content.content) {
          setStateWrap.call(this, {
            data: res.data.content,
            page
          }, this._isMounted)
        }
      })
  }

  handleChange = (key) => (value) => {
    setStateWrap.call(this, {
      ...this.state,
      [key]:  value
    }, this._isMounted, () => {
    })
  }

  handleSelectChange = level => value => {

    this.setState({
      ...this.state,
      areaCode: value ? value : null
    }, () => {
      if(value === '') {
        this.setState({
          ...this.state,
          regionData: []
        })
      }
      if(level === 1 && this.state.areaCode !== null) {
        this.setState({
          ...this.state,
          regionData: []
        })
        this.fetchRegionData(2, this.state.areaCode)
      }
    })
  }

  handlePageChange = (page) => {
    this.fetchWebSource(page - 1)
  }

  componentDidUpdate(nextProps) {
    if(this.props.location !== nextProps.location) {
      this._isMounted = true
      this.fetchWebSource()
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.fetchRegionData(1)
    this.fetchSourceType()
    this.fetchWebSource()
  }

  componentWillUnmount() {
    this._isMounted = false
  }



  render() {
    let {columns, data} = this.state
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if(!isEmptyObject(Parse)) {
      if(!('page' in Parse) || !('id' in Parse)) {
        return <Redirect to={this.props.match.url} />
      }
      else if(Parse.page === 'source-update' && Parse.id)
        return <SourceForm isUpdatePage={true} />
      else
        return <Redirect to={this.props.match.url} />
    }


    return (
      <React.Fragment>

        <Form inline>
          <div>
            <Form.Item label="来源名称:" style={{marginRight:'30px'}}>
              <Input size="small" onChange={this.handleChange('name')} value={this.state.name} />
            </Form.Item>
            <Form.Item label="来源地点:" style={{marginRight:'30px'}} >
              <Select clearable size="small" style={{marginRight:'15px'}} onChange={this.handleSelectChange(1)}>
                {
                  this.state.provinceData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.id} />
                  )
                }
              </Select>
              <Select clearable size="small" value={this.state.areaCode} onChange={this.handleSelectChange(2)}>
                {
                  this.state.regionData.map(data =>
                    <Select.Option key={data.id} label={data.name} value={data.id} />
                  )
                }
              </Select>
            </Form.Item>
          </div>
          <div>
            <Form.Item label="来源URL:" style={{marginRight:'30px'}} >
              <Input size="small" onChange={this.handleChange('url')} value={this.state.url} />
            </Form.Item>
            <Form.Item label="来源类别:" style={{marginRight:'15px'}}>
              <Select size="small" clearable value={this.state.type} onChange={this.handleChange('type')} >
                {
                  this.state.sourceType.map(item =>
                    <Select.Option value={item.dictCode} label={item.dictName} key={item.id} />
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" size="small" onClick={() => this.fetchWebSource()}>搜索</Button>
            </Form.Item>
          </div>
        </Form>
        <Table
          columns={columns}
          data={data.content}
          style={{width:'100%'}}
          stripe
        />

        {
          data.content
            && data.content.length ?
            <div className="page-ct">
              <Pagination
                currentPage={this.state.page + 1}
                total={data.totalCount}
                pageSize={this.state.pageSize}
                onCurrentChange={this.handlePageChange}
              />
            </div> : null
        }

      </React.Fragment>
    )
  }
}

export default SourceList
