import React from 'react'
import {Http} from '../../services'
import {Form, Dialog, Button, Table, Pagination} from 'element-react'
import {setStateWrap} from '../../utils'
import Autocomplete from 'react-autocomplete'
import MergeAdd from "./merge-add";
import {parse} from 'query-string'
import {Redirect} from 'react-router-dom'
class MergeList extends React.Component {

  _isMounted = false
  state = {
    mergedName:'',
    mergeType:'company',
    visible: false,
    size: 10,
    page: 1,
    data: [],
    mergedData: null,
    suggestList: [],
    columns: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    }, {
      label: '企业名称',
      prop: 'mergedName'
    }, {
      label: '操作',
      width: 80,
      render: (data, colum, idx) => {
        return (
          <span>
            <Button type="text" size="small" onClick={() => this.findMergedById(data.id)}>查看</Button>
          </span>
        )
      }
    }],
    columns1: [{
      label: '编号',
      render: (data, column, idx) => {
        return <span>{this.tableNumber(idx)}</span>
      }
    }, {
      label: '被合并的企业',
      prop: 'mergedName'
    }, {
      label: 'id',
      prop: 'mergedId'
    }, {
      label: '合并后的企业',
      prop: 'mergeTargetName'
    }, {
      label: 'id',
      prop: 'mergeTargetId'
    }]
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1) * size)
  }
  fetchMergeCompany = (page = 1) => {
    let {columns, columns1, visible,suggestList, data, mergedData, ...state} = this.state
    Http.post('/merge/select', {
      ...state,
      mergeType:"company",
      page
    }).then(res => {
      setStateWrap.call(this, {
        ...this.state,
        data: res.data.content,
        page
      }, this._isMounted, () => {
        console.log(this.state)
      })
    })
  }

  componentDidMount() {
    this._isMounted = true
    this.fetchMergeCompany()
  }
  componentWillUnmount() {
    this._isMounted = false
  }

  findMergedById = (id) => {
    this.setState({
      ...this.state,
      visible: true
    })
    Http.get(`/merge/select/${id}`)
      .then(res => {
        if(res.data.content) {
          setStateWrap.call(this, {
            ...this.state,
            mergedData: [res.data.content]
          }, this._isMounted, () => {
            console.log(this.state.mergedData)
          })
        }
      })
  }
  handlePageChange = (page) => {
    this.fetchMergeCompany(page )
  }

  handleChange = (value) => {
     
  }

  handleQueryChange = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      mergedName: e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.mergedName}`)
            .then(res => {
              setStateWrap.call(this,{
                suggestList: res.data.content
              }, this._isMounted, () => {
              })
            })
        }, 300)
      else {
        this.setState({
          suggestList: [],
          mergedName: ''
        })
      }
    })
  }

  render() {
    let {...state} = this.state
    let {location, match, history} = this.props
    let Parse = parse(location.search)
    if ('page' in Parse) {
      if(Parse.page === 'merge-add' )
        return <MergeAdd fetchData={this.fetchMergeCompany}/>
      else{
        return <Redirect to={this.props.match.url} />
      }
    }
    return (
      <React.Fragment>
        <Form inline>
          <Form.Item label="企业名称:">
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.mergedName}
              onChange={this.handleQueryChange}
              renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
              onSelect={value => this.setState({mergedName: value})}
              wrapperStyle={{position:'relative', display:'inline-block', marginRight:'15px', width:'260px', zIndex:'500'}}
            />

            <Button type="primary" size="small" onClick={() =>this.fetchMergeCompany()}>搜索</Button>

            <Button type="primary" size="small" onClick={()=>{this.props.history.push({pathname:'/data-admin/merge-list',search:'page=merge-add'})}}>新增合并</Button>

          </Form.Item>

        </Form>
        <Table
          columns={this.state.columns}
          data={this.state.data.content}
          stripe
        />
        {
          this.state.data.content
            && this.state.data.content.length ?
            <div className="page-ct">
              <Pagination
                currentPage={this.state.page}
                total={this.state.data.totalCount}
                pageSize={this.state.size}
                onCurrentChange={this.handlePageChange}
              />
            </div> : null
        }
        <Dialog
          style={{width:'70%'}}
          title="查看"
          visible={ this.state.visible }
          onCancel={() => this.setState({ visible: false }) }
        >
          <Dialog.Body>
            {
              this.state.mergedData &&
             <Table
               columns={this.state.columns1}
               data={this.state.mergedData}
               stripe
             />
            }
          </Dialog.Body>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default MergeList
