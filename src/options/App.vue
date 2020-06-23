<template>
    <div class="options">
        <h1>{{title}}</h1>
        <el-table :data="data">
            <el-table-column prop="domain" :label="site">
                <template slot-scope="scope">
                    <el-input :placeholder="sitePlace"
                              v-model="scope.row.domain"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="limit" :label="limit">
                <template slot-scope="scope">
                    <el-radio v-model="scope.row.limit" label="alert" title="">{{alert}}</el-radio>
                    <el-radio v-model="scope.row.limit" :disabled="true" label="forbid" :title="forbidTitle">{{forbid}}</el-radio>
                </template>
            </el-table-column>
            <el-table-column prop="time" :label="time">
                <template slot-scope="scope">
                    <el-input class="time-input" v-model="scope.row.timeHours">
                        <template slot="append">{{hour}}</template>
                    </el-input>

                    <el-input class="time-input" v-model="scope.row.timeMinutes">
                        <template slot="append">{{minute}}</template>
                    </el-input>
                </template>
            </el-table-column>
            <el-table-column :label="operate">
                <template slot-scope="scope">
                    <el-button type="primary" @click="save(scope.row)" size="small">{{saveText}}</el-button>
                    <el-button type="danger" @click="remove(scope.row)" size="small">{{removeText}}</el-button>
                    <el-button v-if="scope.$index == data.length-1" type="success" size="small" @click="addLine">{{addText}}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        data: [],
        date: '',
        storageKey: '',
        newDomain: '',
        newTime: '',
        radio: '',
        title: chrome.i18n.getMessage("optionsTitle"),
        site: chrome.i18n.getMessage("optionsSite"),
        limit: chrome.i18n.getMessage("optionsLimit"),
        time: chrome.i18n.getMessage("optionsTime"),
        operate: chrome.i18n.getMessage("popupOperate"),
        sitePlace: chrome.i18n.getMessage("optionsSitePlace"),
        alert: chrome.i18n.getMessage("optionsAlert"),
        forbid: chrome.i18n.getMessage("optionsForbid"),
        forbidTitle: chrome.i18n.getMessage("optionsForbidTitle"),
        saveText: chrome.i18n.getMessage("optionsSave"),
        removeText: chrome.i18n.getMessage("optionsRemove"),
        addText: chrome.i18n.getMessage("optionsAdd"),
        hour: chrome.i18n.getMessage("labelHour"),
        minute: chrome.i18n.getMessage("labelMinute"),
      }
    },
    methods: {
      logo (domain) {
        return 'https://www.google.cn/s2/favicons?domain=' + domain
      },
      formatTime (row, column, cellValue, index) {
        let seconds = cellValue % 60
        let minutes = (cellValue / 60).toFixed(0)
        let hours = 0
        if (minutes >= 60) {
          hours = (minutes / 60).toFixed(0)
          minutes = minutes % 60
        }
        let result = ''
        if (hours > 0) {
          result += hours + chrome.i18n.getMessage("hour")
        }
        if (minutes > 0) {
          result += minutes + chrome.i18n.getMessage("minute")
        }
        if (seconds > 0) {
          result += seconds + chrome.i18n.getMessage("second")
        }
        return result
      },
      getDateStr () {
        let dateStr = ''
        let d = new Date()
        dateStr += d.getFullYear()
        dateStr += (d.getMonth() + 1) >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)
        dateStr += d.getDate()
        return dateStr
      },
      getLimitSetting () {
        let storageData = localStorage.getItem('time-setting')
        let json = []
        if (storageData) {
          json = JSON.parse(storageData)
        }
        json.push({
          domain: '',
          timeHours: '',
          timeMinutes: '',
          limit: '',
          time: Date.parse(new Date())
        })

        this.data = json
      },
      addSetting (row) {
        let storageData = localStorage.getItem('time-setting')
        let json = []
        if (storageData) {
          json = JSON.parse(storageData)
          // 编辑
          let editFlag = false
          for (let i = 0; i < json.length; i++) {
            if (json[i].time === row.time) {
              editFlag = true
              json[i] = row
            }
          }
          if (!editFlag) {
            if (json.filter(item => item.time !== row.time && item.domain === row.domain && item.limit === row.limit).length > 0) {
              this.$notify.error({
                title: chrome.i18n.getMessage("error"),
                message: chrome.i18n.getMessage("msgSameErr")
              })
              return
            }
            json.push(row);
          }
        } else {
          json.push(row);
        }

        localStorage.setItem('time-setting', JSON.stringify(json))
        this.$notify.success({
          title: chrome.i18n.getMessage("info"),
          message: chrome.i18n.getMessage("saveSuccess")
        })
        this.addLine()
      },
      addLine () {
        this.data.push({
          domain: '',
          timeHours: '',
          timeMinutes: '',
          limit: '',
          time: Date.parse(new Date())
        })
      },
      save (row) {
        if (row.domain && row.limit && (row.timeHours || row.timeMinutes)) {
          // save
          if (row.timeHours && isNaN(row.timeHours)) {
            this.$notify.error({
              title: chrome.i18n.getMessage("error"),
              message: chrome.i18n.getMessage("msgHourErr"),
            })
            return
          }
          if (row.timeMinutes && isNaN(row.timeMinutes)) {
            this.$notify.error({
              title: chrome.i18n.getMessage("error"),
              message: chrome.i18n.getMessage("msgMinuteErr"),
            })
            return
          }
          this.addSetting(row)

        } else {
          this.$notify.error({
            title: chrome.i18n.getMessage("error"),
            message: chrome.i18n.getMessage("msgLostErr")
          })
        }
      },
      remove (row) {
        let storageData = localStorage.getItem('time-setting')
        let json = []
        if (storageData) {
          json = JSON.parse(storageData)

          json = json.filter(item => item.time !== row.time)
        }

        localStorage.setItem('time-setting', JSON.stringify(json))
        this.$notify.success({
          title: chrome.i18n.getMessage("info"),
          message: chrome.i18n.getMessage("deleteSuccess"),
        })

        this.data = this.data.filter(item => item.time !== row.time)
      },
      equals (x, y) {
        return x.domain === y.domain && x.limit === y.limit && x.timeHours === y.timeHours && x.timeMinutes === y.timeMinutes
      },
    },
    mounted () {
      this.getLimitSetting();
    }
  }
</script>

<style lang="scss" scoped>
    .options {
        .el-image {
            vertical-align: middle;
        }
        .time-input {
            width: 120px;
            float: left;

        }
        .btn {
            margin-top: 20px;
            text-align: center;
        }
    }

    .item-domain {
        height: 28px;
        width: 128px;
    }

    h1 {
        padding: 0;
        font-size: large;
        text-align: center;
        font-weight: bold;
    }

    hr {
        margin: 1px 0;
    }

    .el-input-group__append, .el-input-group__prepend {
        padding: 0 5px;
    }

</style>
