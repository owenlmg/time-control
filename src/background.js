global.browser = require('webextension-polyfill')
let interval = 1;
let global_forbidUrls = getForbid();

window.setInterval(function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tab) {
    if (tab && tab.length > 0) {
      for (let win of tab) {
        let domain = getDomain(win.url)
        if (domain !== '') {
          // notification();

          addDomain(domain);
        }
      }
    }
  });
}, interval*1000);

if(global_forbidUrls.length > 0) {
  // chrome.webRequest.onBeforeRequest.addListener(
  //   function(details) {
  //     console.log(details);
  //     return {cancel: global_forbidUrls.filter(item => details.initiator.indexOf(item) !== -1).length > 0}
  //   }, {urls: ["<all_urls>"]}, ['blocking']);
}

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   console.log(changeInfo);
//   console.log(tab);
// });


function getDomain (url) {
  if (url && url.startsWith('http')) {
    url = url.substr(url.indexOf('//') + 2)
    url = url.substr(0, url.indexOf('/'))
    if (url.startsWith('www.')) {
      url = url.substr(4)
    }
    return url
  }
  return ''
}

function getForbid() {
  let forbids = localStorage.getItem(getDateStr() + '_forbid');
  if(forbids) {
    forbids = JSON.parse(forbids);
    return forbids.map(item => item.domain);
  }
  return [];
}

function getDateStr () {
  let dateStr = ''
  let d = new Date()
  dateStr += d.getFullYear()
  dateStr += (d.getMonth() + 1) >= 10 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)
  dateStr += d.getDate()
  return dateStr
}

/**
 * 增加时间
 * @param domain
 */
function addDomain(domain) {
  // 检查缓存中是否有数据，如果有，在此基础上增加时间，如果没有，新增一条
  let date = getDateStr();
  let storageData = localStorage.getItem(date + '_daily_data');
  if(storageData) {
    let json = JSON.parse(storageData);
    let r = addTime(domain, json.data);
    json.data = r[0];

    // 检测是否达到提醒时间
    let settings = getLimitSetting(domain);
    for(let setting of settings) {
      if(setting.limit === 'alert') {
        let seconds = Number(setting.timeHours)*3600 + Number(setting.timeMinutes) * 60;
        if(r[1] === seconds) {
          notification(domain, seconds);
        }
      }
      if(setting.limit === 'forbid') {
        let seconds = Number(setting.timeHours)*3600 + Number(setting.timeMinutes) * 60;
        if(r[1] >= seconds) {
          let forbidUrls = [];
          let forbids = localStorage.getItem(date + '_forbid');
          if(forbids) {
            forbidUrls = JSON.parse(forbids);
            let urls = forbidUrls.filter(item => item.domain === domain);
            if(urls.length === 0) {
              forbidUrls.push({
                domain: domain,
                forbid: true
              });
              global_forbidUrls.push(domain);
            }
          } else {
            forbidUrls.push({
              domain: domain,
              forbid: true
            });
            global_forbidUrls.push(domain);
          }
          localStorage.setItem(date + '_forbid', JSON.stringify(forbidUrls));
        }
      }

    }

    localStorage.setItem(date + '_daily_data', JSON.stringify(json))
  } else {
    let json = {
      date: date, // 日期
      expire: 0, // 过期时间 0表示永不过期
      data: [{
        domain: domain, // 网站
        time: interval, // 时间
      }]
    }
    localStorage.setItem(date + '_daily_data', JSON.stringify(json))
  }

  let allStorageData = localStorage.getItem('all_data');
  if(allStorageData) {
    let json = JSON.parse(allStorageData);
    let r = addTime(domain, json.data);
    json.data = r[0];
    localStorage.setItem('all_data', JSON.stringify(json))
  } else {
    let json = {
      expire: 0, // 过期时间 0表示永不过期
      data: [{
        domain: domain, // 网站
        time: interval, // 时间
      }]
    }
    localStorage.setItem('all_data', JSON.stringify(json))
  }
}

function addTime(domain, data) {
  let domainExists = false;
  let seconds = interval;
  for(let i = 0; i < data.length; i++) {
    if(domain === data[i].domain) {
      data[i].time += interval;
      seconds = data[i].time;
      domainExists = true;
      break;
    }
  }
  if(!domainExists) {
    data.push({domain: domain, time: interval});
  }
  return [data, seconds];
}

function getLimitSetting(domain) {
  let storageData = localStorage.getItem('time-setting')
  let json = []
  if (storageData) {
    json = JSON.parse(storageData);
    if(domain) {
      return json.filter(item => item.domain === domain);
    }
  }
  return json;
}

function notification (domain, seconds) {
  if (!Notification) {
    return
  }
  if (Notification.permission !== 'granted') {
    Notification.requestPermission()
  } else {
    let tipMessage = chrome.i18n.getMessage("notificationMsg", [domain, timeFormat(seconds)])
    // var tipMessage = chrome.i18n.getMessage("notificationMsg1") + domain + chrome.i18n.getMessage("notificationMsg2") + timeFormat(seconds);
    let topnotify = chrome.notifications.create(null, {
      type: 'basic',
      iconUrl: 'icons/icon_128.png',
      title: chrome.i18n.getMessage("notificationTitle"),
      message: tipMessage,
      // contextMessage: '你今天再该网站已经花费了',
      isClickable: true
    });
    chrome.notifications.onClicked.addListener(function callback() {

    });
  }
}

function timeFormat(time) {
  let hours = Math.floor(time / 3600);
  let minutes = Math.floor((time % 3600)/60);
  let seconds = (time % 3600) % 60;

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
}
