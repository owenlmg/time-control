<template>
    <div class="popup">
        <h1>{{title}}</h1>
        <!--<el-divider></el-divider>-->
        <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane :label="today" name="today">
                <el-table :data="domains" :cell-style="{padding:5+'px'}" :empty-text="emptyText">
                    <el-table-column prop="domain" :label="site" show-overflow-tooltip width="180">
                        <template slot-scope="scope">
                            <el-image fit="fill" :src="logo(scope.row.domain)">
                                <div slot="error" class="image-slot">
                                    <el-image fit="fill" src="/icons/space_page.png"></el-image>
                                </div>
                            </el-image>
                            <span style="margin-left: 5px">{{ scope.row.domain }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="time" :label="time" width="130" :formatter="formatTime"/>
                </el-table>
                <el-pagination
                        layout="prev, pager, next, ->, slot"
                        @current-change="changePage"
                        :current-page="pageIndex"
                        :page-size="pageSize"
                        :total="total">
                    <el-button @click="goSetting" size="small">{{setting}}</el-button>
                </el-pagination>
            </el-tab-pane>
            <el-tab-pane :label="all" name="all">
                <el-table :data="domains" :cell-style="{padding:5+'px'}" :empty-text="emptyText">
                    <el-table-column prop="domain" :label="site" show-overflow-tooltip width="180">
                        <template slot-scope="scope">
                            <el-image fit="fill" :src="logo(scope.row.domain)">
                                <div slot="error" class="image-slot">
                                    <el-image fit="fill" src="/icons/space_page.png"></el-image>
                                </div>
                            </el-image>
                            <span style="margin-left: 5px">{{ scope.row.domain }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="time" :label="time" width="130" :formatter="formatTime"/>
                </el-table>
                <el-pagination
                        layout="prev, pager, next, ->, slot"
                        @current-change="changePage"
                        :current-page="pageIndex"
                        :page-size="pageSize"
                        :total="total">
                    <el-button @click="goSetting" size="small">{{setting}}</el-button>
                </el-pagination>
            </el-tab-pane>
        </el-tabs>

        <!--<ol>-->
        <!--<li v-for="item in domains" :key="item.domain">-->
        <!--<span class="item-domain">{{item.domain}}</span>-->
        <!--<span class="item-time">{{item.time}}</span>-->

        <!--</li>-->
        <!--</ol>-->
    </div>

</template>

<script>

  export default {
    data () {
      return {
        domains: [],
        total: 0,
        pageSize: 10,
        pageIndex: 1,
        activeName: 'today',
        date: '',
        storageKey: '',
        title: chrome.i18n.getMessage("popupTitle"),
        today: chrome.i18n.getMessage("popupToday"),
        all: chrome.i18n.getMessage("popupAll"),
        site: chrome.i18n.getMessage("popupSite"),
        time: chrome.i18n.getMessage("popupTime"),
        setting: chrome.i18n.getMessage("popupSetting"),
        emptyText: chrome.i18n.getMessage("popupEmptyText"),
      }
    },
    methods: {
      logo(domain) {
        // return 'https://www.google.cn/s2/favicons?domain=' + domain;
        return 'http://' + domain + '/favicon.ico';
      },
      handleClick(tab) {
        if(tab.name === 'all') {
          this.storageKey = 'all_data';
          this.refreshData();
        } else {
          this.storageKey = this.date + '_daily_data';
          this.refreshData();
        }
      },
      changePage(index) {
        this.pageIndex = index;
        this.refreshData();
      },
      formatTime(row, column, cellValue, index) {

        let hours = Math.floor(cellValue / 3600);
        let minutes = Math.floor((cellValue % 3600)/60);
        let seconds = (cellValue % 3600) % 60;

        let result = '';
        if(hours > 0) {
          result += hours + chrome.i18n.getMessage("hour");
        }
        if(minutes > 0) {
          result += minutes + chrome.i18n.getMessage("minute");
        }
        if(seconds > 0) {
          result += seconds + chrome.i18n.getMessage("second");
        }
        return result;
      },
      getDateStr () {
        let dateStr = ''
        let d = new Date()
        dateStr += d.getFullYear()
        dateStr += (d.getMonth() + 1) >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)
        dateStr += d.getDate()
        return dateStr
      },
      refreshData() {
        let storageData = localStorage.getItem(this.storageKey)
        if (storageData) {
          let json = JSON.parse(storageData);
          if(json.data && json.data.length > 0) {
            this.total = json.data.length;
            console.log(this.total);
            this.domains = json.data.sort((item1, item2) => {
              let t1 = Number(item1.time)
              let t2 = Number(item2.time)
              return t1 === t2 ? 0 : (t1 < t2 ? 1 : -1)
            }).slice((this.pageIndex-1) * this.pageSize, this.pageIndex * this.pageSize);
          }
        }
      },
      goSetting() {
        chrome.runtime.openOptionsPage();
      }
    },
    mounted () {
      this.date = this.getDateStr();
      this.storageKey = this.date + '_daily_data';
      this.refreshData();
    }
  }
</script>

<style lang="scss" scoped>
    .popup {
        .el-image {
            vertical-align: middle;
            width: 28px;
            height: 28px;
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
</style>
