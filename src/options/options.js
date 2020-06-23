import Vue from 'vue'
import App from './App'
import {
  Table,
  TableColumn,
  Image,
  Pagination,
  Tabs,
  TabPane,
  Input,
  InputNumber,
  Radio,
  Button,
  Notification,
} from 'element-ui';

Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Image)
Vue.use(Pagination)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Radio)
Vue.use(Button)

Vue.prototype.$notify = Notification;

global.browser = require('webextension-polyfill')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
