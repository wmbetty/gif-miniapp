const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    pindex: -1,    // 当前转动到哪个位置，起点位置
    count: 8,    // 总共有多少个位置
    timer: 0,    // 每次转动定时器
    speed: 200,   // 初始转动速度
    times: 0,    // 转动次数
    cycle: 50,   // 转动基本次数：即至少需要转动多少次再进入抽奖环节
    prize: -1,   // 中奖位置
    click: true,
    showToast: false,
    viewHeight: 0,
    token: '',
    prizeList: [],
    showContent: false,
    showDialog: false,
    showReward: false,
    isHighView: false,
    isX: false,
    recordList: [],
    nextTips: false,
    canReward: true,
    nextTime: ''
  },
  onLoad: function () {
    let that = this;
    backApi.getToken().then(function(response) {
      if (response.data.status * 1 === 200) {
        let token = response.data.data.access_token;
        that.setData({token: token})
        let rewardItemApi = backApi.rewardItemApi+token;
        Api.wxRequest(rewardItemApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            let last_time = res.data.data.last_time;
            that.setData({prizeList: res.data.data.reward,showContent: true})
            if (last_time!=='') {
              that.setData({canReward: false,nextTime:last_time})
            }
          } else {
            Api.wxShowToast('奖品数据获取失败','none',2000)
          }
        });
        let rewardRecordApi =backApi.rewardRecordApi+token;
        Api.wxRequest(rewardRecordApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            that.setData({recordList: res.data.data})
          } else {
            Api.wxShowToast('获奖记录获取失败','none',2000)
          }
        });
        let imgShareApi = backApi.imgShareApi+token;
        Api.wxRequest(imgShareApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            that.setData({share_img: res.data.data.share_img})
          } else {
            console.log('分享图片获取失败')
            // Api.wxShowToast('图片获取失败~', 'none', 2000);
          }
        })
      }
    })
    wx.getSystemInfo( {
      success: function( res ) {
        // iPhone X
        var clientHeight=res.windowHeight;
        if (clientHeight*1>=800) {
          that.setData({
            isHighView: true
          })
        }
        if (res.model.indexOf('iPhone X') != -1) {
          that.setData({isX: true})
        }
      }
    });
  },
  onShow () {
    let that = this;
    wx.getSystemInfo( {
      success: function( res ) {
        var clientHeight=res.windowHeight;
        that.setData({viewHeight: clientHeight});
      }
    });
  },
  // 开始抽奖
  startLottery () {
    let that = this;
    let click = that.data.click;
    if (!click) {
      return
    }
    that.setData({
      speed: 200,
      click: false
    });
    that.startRoll()
  },
  // 开始转动
  startRoll () {
    let that = this;
    let times = that.data.times;
    let speed = that.data.speed;
    let canReward = that.data.canReward;
    if (canReward) {
      setTimeout(()=>{
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo.id) {
          let listItem = that.data.prizeList;
          let tips = ''
          that.setData({
            times: times+=1 // 转动次数
          });
          that.oneRoll()  // 转动过程调用的每一次转动方法，这里是第一次调用初始化
          // 如果当前转动次数达到要求 && 目前转到的位置是中奖位置
          if (that.data.times > that.data.cycle + 10 && that.data.prize === that.data.pindex) {
            clearTimeout(that.data.timer)   // 清除转动定时器，停止转动
            that.setData({
              prize: -1,
              times: 0,
              click: true,
              showToast: true
            })
            console.log('你已经中奖了', '000')
          } else {
            if (that.data.times < that.data.cycle) {
              that.setData({
                speed: speed -= 10 // 加快转动速度
              })
            } else if (that.data.times === that.data.cycle) {    // 随机获得一个中奖位置
              let lotteryApi = backApi.lotteryApi+that.data.token;
              Api.wxRequest(lotteryApi,'GET',{}, (res)=>{
                if (res.data.status*1===200) {
                  let reward_code = res.data.data.prize.code;
                  if (res.data.data.prize.name==='谢谢参与') {
                    tips = '谢谢参与，下次抽奖时间为三小时后';
                    Api.wxShowToast(tips, 'none', 2000);
                    clearTimeout(that.data.timer)   // 清除转动定时器，停止转动
                    that.setData({
                      pindex: that.data.prizeList.length-1,nextTips: true
                    });
                  } else {
                    for (let i=0; i<listItem.length;i++) {
                      if (listItem[i].code===reward_code) {
                        that.setData({prize: i})
                      }
                    }
                    setTimeout(()=>{
                      that.setData({showReward: true,rewardText: res.data.data.prize.name});
                    },2800)
                  }
                } else {
                  setTimeout(()=>{
                    clearTimeout(that.data.timer);   // 清除转动定时器，停止转动
                    that.setData({
                      pindex: that.data.prizeList.length-1,nextTips: true
                    });
                    Api.wxShowToast(res.data.msg,'none',2000)
                  },2800)
                }
              })
            } else if (that.data.times > that.data.cycle + 10 &&
              ((that.data.prize === 0 && that.data.pindex === 7) || that.data.prize === that.data.pindex + 1)) {
              that.setData({speed: speed+=110})
            } else {
              that.setData({speed: speed+=20})
            }
            if (that.data.speed < 40) {
              that.setData({speed: 40})
            }
            that.setData({timer: setTimeout(that.startRoll, that.data.speed)})
          }
        } else {
          that.setData({
            showDialog: true
          })
        }
      },200)
    } else {
      Api.wxShowToast(`下次抽奖时间为${that.data.nextTime}`, 'none', 2000);
    }
  },
  // 每一次转动
  oneRoll () {
    let that = this;
    let index = that.data.pindex  // 当前转动到哪个位置
    const count = that.data.count  // 总共有多少个位置
    index += 1
    if (index > count - 1) {
      index = 0
    }
    that.setData({pindex: index})
  },
  onShareAppMessage: function () {
    return {
      title: '参与抽奖',
      path: `/pages/gcindex/gcindex`,
      imageUrl: this.data.share_img,
      success() {
        Api.wxShowToast('分享成功~', 'none', 2000);
      },
      fail() {
        Api.wxShowToast('分享失败~', 'none', 2000);
      },
      complete() {}
    }
  },
  goBack () {
    wx.navigateBack({
      delta: 1
    })
  },
  goHome () {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },
  confirmDialog (e) {
    let that = this;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code;
        wx.getUserInfo({
          success: (res) => {
            let userData = {
              encryptedData: res.encryptedData,
              iv: res.iv,
              code: code
            }
            backApi.getToken().then(function (response) {
              if (response.data.status * 1 === 200) {
                let token = response.data.data.access_token;
                that.setData({token:token});
                let userInfoApi = backApi.updateUserInfoApi + token;
                setTimeout(()=>{
                  Api.wxRequest(userInfoApi,'POST',userData,(res)=> {
                    if (res.data.status * 1 === 200) {
                      wx.setStorageSync('userInfo', res.data.data);
                      Api.wxShowToast('授权成功', 'none', 2000);
                      that.startRoll();
                    } else {
                      Api.wxShowToast('更新用户信息失败', 'none', 2000);
                    }
                  })
                },200)
              }
            })
          }
        })
      }
    })
  },
  closeDialog () {
    let that = this;
    that.setData({showReward: false})
  }
})