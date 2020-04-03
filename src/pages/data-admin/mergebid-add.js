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
    mergeType:'bid',
    visible: false,
    pageSize: 10,
    page: 0,
    mergeList:[{num:'A'},{num:'B'}],
    suggestList: [],
    columns: [{
      label: '编号',
     prop:'num',
      width:80
    }, {
      label: '中标名称',
      prop: 'projectName',
      width:200
    }, {
      label: '中标单位',
      prop: 'bidCompanyName',
      width:150
    }, {
      label: '省',
      prop: 'province',
      width:80
    }, {
      label: '市',
      prop: 'city',
      width:80
    }, {
      label: '中标金额',
      width:100,
      render:(data, colum, idx)=>{
        return <span>{!!data.bidFunds?data.bidFunds+''+'万':''}</span>
      }
    }, {
      label: '项目经理',
      prop: 'projectManager',
      width:100
    }, {
      label: '中标时间',
      prop: 'bidTime',
      width:180
    },{
      label:"信息来源",
      prop:'urlName',
      width:180
    },
      {
        label:"来源url",
        prop:'url', width:180

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
          Http.get(`/merge/bidFilter`,{
            name:`${this.state[name]}`
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
        message:"请选择中标!"
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
        this.props.history.push('/data-admin/mergebid-list')
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
        <Form inline >
          <div style={{display:'inline-block',width:'50%'}}>
            <div style={{paddingLeft:"70px",marginBottom:'20px'}}>被合并的中标A</div>
            <Form.Item label="" style={{width:'50%', margin: 0,}}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.projectName}
                value={this.state.mergedName}
                onChange={this.handleQueryChange('mergedName')}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.projectName}</p>}
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
                  Http.get(`/merge/bidDetail/${data.rowkey}`,{

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
            <div style={{paddingLeft:"70px",marginBottom:'20px'}}>合并到的企业B</div>
            <Form.Item label="" style={{textAlign:'right', width:'50%', margin:0}}>
              <Autocomplete
                items={this.state.suggestList}
                getItemValue={item => item.projectName}
                value={this.state.mergeTargetName}
                onChange={this.handleQueryChange('mergeTargetName')}
                renderItem={(item, isHighlighted) => <p key={item.id} style={{ paddingLeft:'10px', background: isHighlighted ? '#f0f0f0' : '#fff' }}>{item.projectName}</p>}
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
                  Http.get(`/merge/bidDetail/${data.rowkey}`,{

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
