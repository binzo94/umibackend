import axios from 'axios'
import qs from 'qs'
import {MessageBox,Message
} from 'element-react'
import {BASEURL} from './config/config'
import {createHashHistory} from 'history'
const history = createHashHistory()

export function http(url, data, method = 'post') {
  return new Promise((resolve, reject) => {
    axios[method](url, data)
      .then(res => {
        res && resolve(res)
      })
      .catch(error => reject(error))
      .finally(() => resolve())
  })
}

axios.interceptors.request.use(function (config) {
  let token = localStorage.getItem('token')
  config.timeout = 20000
  config.baseURL = BASEURL
  config.withCredentials = true
  if(config.url.indexOf('/login') === -1) {
    config.headers.token = token
  }

  if(config.url.indexOf('/oss/get') !== -1){
    //修改oss获取图片的基本地址
  }
  if (config.url.indexOf('/company/selectByName') !== -1) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  if(config.url === '/behavior/upload') {
    config.headers['Content-Type'] = 'multipart/form-data'
  }
  if(config.url.indexOf('/behavior/download/failData') >=0) {
    config.responseType = 'blob'
  }
  if(config.url.indexOf('/export/task/fail') >=0) {
    config.responseType = 'blob'
  }
  return config

}, function (error) {
  return Promise.reject(error)
})
axios.interceptors.response.use(function (res) {
if(res&&res.data&&res.data.code == '3'){

    Message({
      type:'warning',
      message:`存在权限不足,请联系管理员!`
    })
  }
  return res
}, function (error) {
  console.log(error.response)
  console.log(error.response.status)
  console.log(error.response.data.code)
  //排除500错误
  if(error.response.status!=500&&(error.response.status === 401|| error.response.data.code==4)) {
    MessageBox.confirm('登录状态失效,请重新登录！', '提示',{
      type:'info',
      showCancelButton:false
    }).then(()=>{
      localStorage.clear()
      history.push({
        pathname:'/login'
      })


    })

  }
  return Promise.reject(error)
})

export const Http = {
  get: (url, params) => http(url, params ? {params: {...params}} : null, 'get'),
  post: (url, data) => http(url, {...data})
}

