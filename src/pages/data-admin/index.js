import React from 'react'
import { withContext } from '../withContext'

class Main extends React.Component {
  constructor(props){
    super(props)
    this.state={
      height:600
    }
  }
  componentDidMount() {
    let height = window.innerHeight
    this.setState({
      height:height-120
    })
  }

  render () {
    let {user} = this.props
    return (
      <div style={{height:this.state.height+'px',textAlign:'center'}}>
        <div style={{height:'200px',lineHeight:'200px',fontSize:'32px',color:'#3569e9'}}>欢迎!{user}使用数据管理后台</div>
        <div className={'hello-cnt'}>
          <div className={'hello-cnt-img'}>

          </div>
        </div>
      </div>
    )
  }
}

export default withContext(Main)
