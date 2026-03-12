import Vue from 'vue'
import App from './App'
import store from './store' // <--- 引入 store

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App,
  store // <--- 将 store 挂载到 Vue 实例
})
app.$mount()