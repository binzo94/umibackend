import React from 'react'
import _ from 'lodash'
export function findPathName(list) {
  var result = []
  for (var i = 0, len = list.length; i < len; i++) {
    list[i].path && result.push({
      parentId: list[i].parentId,
      path: list[i].path
    })
    if (list[i].children && list[i].children.length) {
      result = result.concat(findPathName(list[i].children))
    }
  }
  return result
}

export function findIndexRouteById(list) {
  return list.filter(item => !('path' in item))[0].id
}

export function accessblePage(props, id) {
  return props.some(item => item.id === id)
}

export function camelize(str) {
  return str.replace(/^./, function(m) {
    return m.toUpperCase()
  }).replace(/-(.)/g, function(m, m1) {
    return m1.toUpperCase()
  })
}

// export function dynamicRouteMap(pathList, dir) {
//   var routes = []
//     var pathList = findPathName(pathList)
//     var path
//     var split = ''
//     if(pathList.length) {
//       for (var i = 0; i < pathList.length; i++) {
//         path = pathList[i].path
//         split = path.split('/')[2]
//         routes.push({
//           path
//         })
//       }
//     }
//     return routes
// }

export function isEmptyObject(o) {
  return !Object.keys(o).length
}

export function indexOfWithProps(array, props, value) {
  for (var i = 0; i < array.length; i += 1) {
    if (array[i][props] === value) {
      return i
    }
  }
  return -1
}
export function handleEmpty(data) {
  var newdata = {}
  for(var key in data) {
    if(typeof  data[key] !='string'){
      newdata[key] = data[key]
    }else{
      if(!!_.trim(data[key]) && !!data[key]) {
        newdata[key] = data[key]
      }
    }

  }
  return newdata
}
export function formatDate(date, integral = true) {
  var pad = (str) => ('0' + str.toString()).slice(-2)
  var d = new Date(date),
    year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    hour = '' + d.getHours(),
    minute = '' + d.getMinutes(),
    second = '' + d.getSeconds()
  if(integral)
    return `${[year, pad(month), pad(day)].join('-')} ${[pad(hour), pad(minute), pad(second)].join(':')}`
  return [year, pad(month), pad(day)].join('-')
}

export function setStateWrap (state, mounted, callback) {
  let newState = typeof state === 'function' ?
    state(Object.assign({}, this.state)) : state
  if(mounted) {
    this.setState(newState,
      () => callback && callback(this.state))
  }
}

