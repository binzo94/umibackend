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
    mergedDetail:{},
    mergeTargetName: '',
    mergeTargetId: '',
    mergeTargetDetail:{},
    mergeType:'bidPm',
    visible: false,
    pageSize: 10,
    page: 0,
    companyName:'',
    companyId:'',
    mergeList:[{num:'A'},{num:'B'}],
    suggestList: [],
    suggestListC: [],
    columns: [{
      label: '编号',
      prop:'num',
      width:80
    }, {
      label: '项目经理名称',
      prop: 'personName',
      width:200
    }, {
      label: '注册号',
      prop: 'personRegisterNum',
      width:240
    }, {
      label: '中标数',
      prop: 'bidCount',
      width:100
    }, {
      label: '最近中标时间',
      prop: 'bidTime'
    }
    ]
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
          Http.get(`/merge/bidPmFilter`,{
            name:`${this.state[name]}`,
            companyId:this.state.companyId
          })
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
        message:"请选择项目经理!"
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
        this.props.history.push('/data-admin/mergemanager-list')
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
  handleQueryChangeC = (e) => {
    this.timer && clearTimeout(this.timer)
    let {value} = e.target
    this.setState({
      companyName:e.target.value
    }, () => {
      if(value.length)
        this.timer = setTimeout(() => {
          Http.post(`/company/selectByName?companyName=${this.state.companyName}`)
            .then(res => {
              this.setState({
                suggestListC: res.data.content
              })
            })
        }, 300)
      else {
        this.setState({
          suggestListC: []
        })
      }
    })
  }
  render() {
    return (
      <React.Fragment>
        <h3 className="page-title">合并新增</h3>
        <Form inline >
          <div style={{marginBottom:"20px"}}>
            <Form.Item label="所属公司:" style={{width:'50%', margin: 0,}}>
              <Autocomplete
                items={this.state.suggestListC}
                getItemValue={item => item.companyName}
                value={this.state.companyName}
                onChange={this.handleQueryChangeC}
                renderItem={(item, isHighlighted) =>
                  <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>
                    {item.companyName}
                  </p>
                }
                onSelect={(value, data) => {
                  this.setState({
                    companyId:data.companyId,
                    companyName:value
                  })}}
                wrapperStyle={{position:'relative', display:'inline-block', width:'300px', zIndex:'900'}}
              />
            </Form.Item>
          </div>
          <div style={{display:'inline-block',width:'50%'}}>
            <div style={{paddingLeft:"70px",marginBottom:'20px'}}>被合并的项目经理A</div>
            <Form.Item label="" style={{width:'50%', margin: 0,}}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.personName}
                value={this.state.mergedName}
                onChange={this.handleQueryChange('mergedName')}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.personName}</p>}
                onSelect={(value, data) => {
                  let tempMergeList=this.state.mergeList.concat([])
                  tempMergeList[0]={
                    ...data,
                    num:'A'
                  }
                  this.setState({
                    ...this.state,
                    mergeList:tempMergeList,
                    mergedName: value,
                    mergedId: data.rowkey
                  }, () => {

                  })
                  Http.get(`/merge/bidPmDetail/${data.rowkey}`,{

                  })
                    .then(res => {
                      let tempMergeList=this.state.mergeList.concat([])
                      tempMergeList[0]={
                        ...res.data.content,
                        num:'A'
                      }
                      this.setState({
                        mergeList:tempMergeList,
                        mergedDetail:res.data.content
                      }, () => {
                      })
                    })

                }}
                wrapperStyle={{position:'relative',
                  display:'inline-block', marginRight:'15px', width:'260px', zIndex:'500'}}
              />
            </Form.Item>
          </div>
          <div style={{display:'inline-block',width:'50%'}}>
            <div style={{paddingLeft:"70px",marginBottom:'20px'}}>合并到的项目经理B</div>
            <Form.Item label="" style={{textAlign:'right', width:'50%', margin:0}}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.personName}
                value={this.state.mergeTargetName}
                onChange={this.handleQueryChange('mergeTargetName')}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.personName}</p>}
                onSelect={(value, data) => {
                  let tempMergeList=this.state.mergeList.concat([])
                  tempMergeList[1]={
                    ...data,
                    num:'B'
                  }
                  this.setState({
                    ...this.state,
                    mergeList:tempMergeList,
                    mergeTargetName: value,
                    mergeTargetId: data.rowkey
                  }, () => {

                  })
                  Http.get(`/merge/bidPmDetail/${data.rowkey}`,{

                  })
                    .then(res => {
                      let tempMergeList=this.state.mergeList.concat([])
                      tempMergeList[1]={
                        ...res.data.content,
                        num:'B'
                      }
                      this.setState({
                        mergeList:tempMergeList,
                        mergeTargetDetail:res.data.content
                      }, () => {
                      })
                    })

                }}
                wrapperStyle={{position:'relative', textAlign:'left', display:'inline-block', marginRight:'15px', width:'260px', zIndex:'500'}}
              />

            </Form.Item>
          </div>
          <div style={{marginBottom:"20px"}}>

          </div>
          <Table
            columns={this.state.columns}
            data={this.state.mergeList}
            stripe
          />
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
