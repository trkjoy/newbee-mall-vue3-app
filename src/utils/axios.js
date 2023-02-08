/**
 * 严肃声明：
 * 开源版本请务必保留此注释头信息，若删除我方将保留所有法律责任追究！
 * 本系统已申请软件著作权，受国家版权局知识产权以及国家计算机软件著作权保护！
 * 可正常分享和学习源码，不得用于违法犯罪活动，违者必究！
 * Copyright (c) 2020 陈尼克 all rights reserved.
 * 版权所有，侵权必究！
 */
 import axios from 'axios'
 import { showFailToast } from 'vant'
 import { getLocal,setLocal } from '@/common/js/utils'
 import router from '../router'

 axios.defaults.withCredentials = true
 axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
 axios.defaults.headers['Postman-Token'] = 'XMLHttpRequest'
 axios.defaults.headers.post['Content-Type'] = 'application/json'
    
 axios.interceptors.request.use(function (config) {
    config.headers.Authorization = getLocal('token') || ''
    return config;
  }, function (error) {
    return Promise.reject(error);
 });

 axios.interceptors.response.use(function(response){
  if (typeof response.data !== 'object') {
    showFailToast('服务端异常!')
    return Promise.reject(response)
  }
  const res = response.data
  if (res.code != 200) {
    if (res.msg){
      showFailToast(res.msg)
    } 
    if (res.code == 401) {
      router.push({ path: '/login' })
    }
    return Promise.reject(res)
  }
  if (window.location.hash == '#/login' && res.data.token) {
    setLocal('token', res.data.token)
    axios.defaults.headers['Authorization'] = getLocal('token') || ''
  }
  return res;
 },function(error){
    return Promise.reject(error);
 })
 
 export default axios
 