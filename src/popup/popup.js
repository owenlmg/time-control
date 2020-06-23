import Vue from 'vue'
import App from './App'
import {
  Table,
  TableColumn,
  Image,
  Pagination,
  Tabs,
  TabPane,
  Button,
} from 'element-ui'

Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Image)
Vue.use(Pagination)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Button)

global.browser = require('webextension-polyfill')
Vue.prototype.$browser = global.browser

/* eslint-disable no-new */
new Vue({
  el: '#app',

  render: h => h(App)
})
