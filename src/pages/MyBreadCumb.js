import React from 'react'
import {withContext} from './withContext'
import {withRouter} from 'react-router-dom'

function findPathByLeafPath(p, nodes, path) {
  if (path === undefined) {
    path = [];
  }
  for (var i = 0; i < nodes.length; i++) {
    var tmpPath = path.concat();
    tmpPath.push(nodes[i].name);
    if (p == nodes[i].path) {
      return tmpPath;
    }
    if (nodes[i].children) {
      var findResult = findPathByLeafPath(p, nodes[i].children, tmpPath);
      if (findResult) {
        return findResult;
      }
    }
  }
}
class MyBreadCumb extends React.Component {
  state = {
    data: this.props.data
  }

  render() {
    let {data} = this.props;
    let {location: {pathname}} = this.props
    let strarr = findPathByLeafPath(pathname, data);
    if (!strarr)
      return null
    return  <div className="main-breadcumb">{strarr && strarr.map((d , i) => {
      if(i == strarr.length - 1) {
        return <span className="mybreadcumb-item mybreadcumb-item-last">{d}</span>
      } else {
        return <><span className="mybreadcumb-item">{d}</span>/</>
      }
    })
    }
    <div className="mybreadcumb-current">{strarr && strarr[strarr.length - 1]}</div></div>
  }
}

export default withRouter(withContext(MyBreadCumb))
