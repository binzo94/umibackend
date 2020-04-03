import React from 'react'
import { Http } from '../../services'
import { parse } from 'query-string'
import moment from 'moment'
import {DateRangePicker,Message, Radio,Input,Button, Table, Pagination} from 'element-react'
import 'element-theme-default'
import './index.less'
import _ from 'lodash'
import {formatDate, handleEmpty} from "../../utils";
class AnalyseTable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      size: 10,
      data:[],
      time:['',''],
      segment:'1',
      totalText:'',
      timearr:[moment().format('YYYY-MM-DD'),moment().format('YYYY-MM-DD')],
      columns1: [
        {
          label: '编号',
          width:100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },{
          label:'接口名称',
          prop:'name',
          width:200
        },
        {
          label:'请求次数',
          prop:'nums',
          width:100,
        },
        {
          label: '请求占比',
          render: (data) => {
            return <span>{this.computeBl(data.nums,data.sumNums)}</span>
          }
        }
      ],
      columns2: [
        {
          label: '编号',
          width:100,
          render: (data, column, idx) => {
            return <span>{this.tableNumber(idx)}</span>
          }
        },{
          label:'请求IP地址',
          prop:'ip',
          width:140
        },
        {
          label:'最后访问时间',
          prop:'requestLast'
        }
      ]
    }
  }
  computeBl=(num,total)=>{
    num = parseFloat(num);
    total = parseFloat(total);
    if (isNaN(num) || isNaN(total)) {
      return "-";
    }
    return total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00)+"%";
  }
  tableNumber = (idx) => {
    let {page, size} = this.state
    return (idx + 1) + ((page-1)* size)
  }
  queryTableList = (page = 1) => {
    let {
      timearr,size} = this.state
    let strobj={
      userId:this.props.userId
    }
    if(timearr && timearr.length > 0) {
      if(!!timearr[0]) {
        strobj.opTimeStart = timearr[0]
      }
      if(!!timearr[1]) {
        strobj.opTimeEnd = timearr[1]
      }
    }
    strobj=handleEmpty(strobj)
    Http.post(this.props.url, { ...strobj, page,size })
      .then(res => {
        if (res.data.content) {
          this.setState({
            ...this.state,
            data: res.data.content,
            page
          })
          if(this.props.type=='request'){
            if(res.data.content.content[0]){
              this.setState({
                totalText:res.data.content.content[0]['sumNums']
              })
            }
          }else {
            if(res.data.content.content[0]){
              this.setState({
                totalText:res.data.content.content[0]['ipNums']
              })
            }
          }
        }
      })
  }
  componentDidMount () {
this.queryTableList(1)
  }
  changePage = (page) => {
    this.queryTableList(page)
  }
  inputChange = (key) => (value) => {
    this.setState({
      ...this.state,
      [key]: value
    })
    if(key == 'segment'){
      let starttime,endtime
      switch (value) {
        case '1':
           starttime = moment().format('YYYY-MM-DD')
           endtime = moment().format('YYYY-MM-DD')

          break
        case '2':
          starttime = moment().subtract(7, 'days').format('YYYY-MM-DD')
          endtime = moment().format('YYYY-MM-DD')

          break
        case '3':
          starttime = moment().subtract(30, 'days').format('YYYY-MM-DD')
          endtime = moment().format('YYYY-MM-DD')

          break
      }
      this.setState({
        timearr:[starttime,endtime],
        time:['','']
      },()=>{this.queryTableList(1)})

    }
    if(key == 'time'){
      this.setState({
        segment:'4',
        timearr:value.map((v)=>{
          return moment(v).format('YYYY-MM-DD')
        })
      },()=>{this.queryTableList(1)})
    }

  }
  componentDidUpdate () {

  }
  render () {
    return (
      <React.Fragment>
        <div className={'analyse-table-segment'}>
          <div className={'analyse-table-segment-radio'}> <Radio.Group value={this.state.segment} onChange={this.inputChange('segment')}>
            <Radio.Button value="1" >今日</Radio.Button>
            <Radio.Button value="2" >近七天</Radio.Button>
            <Radio.Button value="3" >近三十天</Radio.Button>
          </Radio.Group></div>
          <div className={'analyse-table-segment-time'}>
            <DateRangePicker
              value={this.state.time}
              placeholder="选择日期范围"
              onChange={this.inputChange('time')}
            />
          </div>
        </div>
        <div style={{margin:'15px 0px'}}>{this.props.text}{this.state.totalText}</div>
        <div>
          <Table
            columns={this.props.type=='request'?this.state.columns1:this.state.columns2}
            data={this.state.data.content}
            border={true}
          />
          <div className="page-style">
            <Pagination total={this.state.data.totalCount} pageSize={this.state.pageSize} currentPage={this.state.page} onCurrentChange={this.changePage} />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default AnalyseTable
