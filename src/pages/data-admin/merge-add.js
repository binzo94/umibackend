import React from 'react'
import {Http} from '../../services'
import {Form, Dialog, Button, Table, Pagination,Message, MessageBox} from 'element-react'
import {setStateWrap} from '../../utils'
import Autocomplete from 'react-autocomplete'
import {withRouter} from 'react-router-dom'

class MergeAdd extends React.Component {

  _isMounted = false
  state = {
    mergedName:'',
    mergedId: '',
    mergeTargetName: '',
    mergeTargetId: '',
    mergeType:'company',
    visible: false,
    pageSize: 10,
    page: 0,
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
    let {page, pageSize} = this.state
    return (idx + 1) + (page * pageSize)
  }
  fetchMergeCompany = (page = 0) => (e) => {
    let {columns, columns1, visible, suggestList, data, mergedData, ...state} = this.state
    Http.post('/merge/select', {
      ...state,
      page
    }).then(res => {
      setStateWrap.call(this, {
        ...this.state,
        data: res.data.content
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
    this.fetchMergeCompany(page - 1)
  }

  handleChange = (value) => {
     
  }

  handleQueryChange = (name, id) => (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      ...this.state,
      [name]: e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state[name]}`)
            .then(res => {
              this.setState({
                ...this.state,
                suggestList: res.data.content
              }, () => {
              })
            })
        }, 300)
      else {
        this.setState({
          suggestList: [],
          [name]: ''
        })
      }
    })
  }
  merge = () => {
    if(!this.state.mergedName || !this.state.mergeTargetName) {
      Message({
        type:'info',
        message:"请选择企业!"
      })
    }
    else {
      MessageBox.confirm('确定将这A合并到B吗?, 是否继续?', '提示', {
        type: 'warning'
      }).then(() => {
        this.mergeCompany()
      }).catch(() => {
        Message({
          type: 'info',
          message: '已取消操作'
        });
      });
    }

    return
  }
  mergeCompany =() => {

    let {
      mergeType,
      mergedName,
      mergedId,
      mergeTargetName,
      mergeTargetId} = this.state
    Http.post('/merge/add', {
      mergeType,
      mergedName,
      mergedId,
      mergeTargetName,
      mergeTargetId
    }).then(res => {
      if(res.data.code == '0') {
        Message({
          type:'success',
          message:"操作成功!"
        })
        if(this.props.fetchData){
          this.props.fetchData()
        }
        this.props.history.push('/data-admin/merge-list')
      }
      else {
        Message({
          type:'error',
          message:"操作失败!"+res.data.message
        })
      }
    })
  }
  reset = () => {
    this.setState({
      ...this.state,
      mergedId: '',
      mergeTargetId: '',
      mergedName: '',
      mergeTargetName: ''
    })
  }

  render() {
    return (
      <React.Fragment>
        <h3 className="page-title">合并新增</h3>
        <Form inline>
          <Form.Item label="被合并的企业A" style={{width:'50%', margin: 0}}>
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.mergedName}
              onChange={this.handleQueryChange('mergedName')}
              renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
              onSelect={(value, data) => {
                this.setState({
                  ...this.state,
                  mergedName: value,
                  mergedId: data.companyId
                }, () => {

                })
              }}
              wrapperStyle={{position:'relative',
                display:'inline-block', marginRight:'15px', width:'260px', zIndex:'500'}}
            />
          </Form.Item>
          <Form.Item label="合并到的企业B" style={{textAlign:'right', width:'50%', margin:0}}>
            <Autocomplete
              items={this.state.suggestList}
              getItemValue={item => item.companyName}
              value={this.state.mergeTargetName}
              onChange={this.handleQueryChange('mergeTargetName')}
              renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.companyName}</p>}
              onSelect={(value, data) => {
                this.setState({
                  ...this.state,
                  mergeTargetName: value,
                  mergeTargetId: data.companyId
                }, () => {

                })
              }}
              wrapperStyle={{position:'relative', textAlign:'left', display:'inline-block', marginRight:'15px', width:'260px', zIndex:'500'}}
            />

          </Form.Item>
          <div style={{paddingTop:'50px', textAlign:'center'}}>
            <Button type="primary" onClick={this.merge}>确认</Button>
            <Button onClick={this.reset}>重置</Button>
          </div>
        </Form>
      </React.Fragment>
    )
  }
}

export default withRouter(MergeAdd)
