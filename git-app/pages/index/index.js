//index.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();

Page({
  data: {
    winHeight:"",//窗口高度
    currentTab:0, //预设当前项的值
    scrollLeft:0, //tab标题的滚动条位置
    token: '',
    cateList: [],
    imgList: [],
    isX: false,
    isIphoneLiuhai: false,
    isAnDrLiuhai: false,
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    shareGifUrl: '',
    indexTags: [],
    tid: '',
    height: '',
    arr: [],
    arrHeight: [],
    itemHeight: 0
  },
  cancelDialog () {
    this.setData({showDialog:false})
  },
  confirmDialog () {
    this.setData({showDialog:false})
    wx.openSetting({
      success(settingdata) {
        if (settingdata.authSetting["scope.writePhotosAlbum"]) {
          Api.wxShowToast("获取权限成功，再次点击保存到相册",'none',2000)
        } else {
          Api.wxShowToast("获取权限失败",'none',2000)
        }
      }
    })
  },
  onLoad: function (options) {
    let imgid= options.imgid;
    var that = this;
    backApi.getToken().then(function (res) {
      if (res.data.status*1===200) {
        let token = res.data.data.access_token;
        that.setData({token: token});
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        setTimeout(()=>{
          let imgListApi = backApi.imgListApi+token;
          let recommendTagApi = backApi.recommendTagApi+token;
          Api.wxRequest(recommendTagApi,'GET',{},(res)=>{
            if (res.data.status*1===200) {
              let indexTags = res.data.data
              that.setData({indexTags: indexTags})
            } else {
              Api.wxShowToast('标签获取失败~', 'none', 2000);
            }
          })
          Api.wxRequest(imgListApi,'GET',{page: 1},(res)=>{
            if (res.data.status*1===200) {
              setTimeout(()=> {
                wx.hideLoading();
                that.setData({imgList: res.data.data,page: 1})
                let arr = that.data.arr;
                for (let i=0;i<res.data.data.length;i++) {
                  arr[i] = false;
                  that.setData({arr: arr})
                }
                that.getRect();
              }, 1000)
            } else {
              wx.hideLoading();
              Api.wxShowToast('图片获取失败~', 'none', 2000);
            }
          })
        },500)
        let imgShareApi = backApi.imgShareApi+token;
        Api.wxRequest(imgShareApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            that.setData({share_img: res.data.data.share_img})
          } else {
            console.log('分享图片获取失败')
          }
        })
      } else {
        wx.hideLoading();
        Api.wxShowToast('token获取失败~', 'none', 2000);
      }
    })
    if (imgid) {
      wx.navigateTo({
        url: `/pages/details/details?imgid=${imgid}`
      })
    }
  },
  getRect () {
    let that = this;
    wx.createSelectorQuery().select('.img-container').boundingClientRect(function (ret) {
      if (ret.height) {
        that.setData({itemHeight: ret.height})
        that.init(ret.height)
      }
    }).exec()
  },
  init (itemHeight) {
    let that = this;
    let index = parseFloat(that.data.winHeight / itemHeight);
    for (let i=0;i<index;i++) {
      that.data.arr[i] = true;
    }
    that.setData({arr: that.data.arr})
    for (let i=0;i<that.data.arr.length;i++) {
      that.data.arrHeight[i] = Math.floor(i / 2) * (itemHeight + 10);
    }
  },
  onPageScroll(e) {
    let that = this;
    that.getRect();
    for (let i=0;i<that.data.arrHeight.length;i++) {
      if (that.data.arrHeight[i] < e.scrollTop + that.data.winHeight) {
          setTimeout(()=>{
            that.data.arr[i] = true;
          }, 2000)
      }
    }
    that.setData({arr: that.data.arr})
  },
  goSearch () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  onReady () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight, height: res.screenHeight
        })
        let statusBarHeight = res.statusBarHeight
        if (statusBarHeight * 1 > 20 && statusBarHeight * 1 < 30) {
          app.globalData.isAnDrLiuhai = true;
          that.setData({isAnDrLiuhai: true})
        }
        if (statusBarHeight * 1 > 30) {
          app.globalData.isIphoneLiuhai = true;
          that.setData({isIphoneLiuhai: true})
        }
      }
    })
  },
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let imgList = that.data.imgList;
    let imgListApi = backApi.imgListApi+that.data.token;
    let tid = that.data.tid;
    let arr = that.data.arr;
    let moreArr = [];
    app.aldstat.sendEvent(`首页页查看更多`,{
      play : ""
    });
    Api.wxRequest(imgListApi,'GET',{page: page, tag_id: tid},(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>0) {
          imgList = imgList.concat(res.data.data);
          that.setData({imgList: imgList,page: page})
          for (let i=0;i<res.data.data.length;i++) {
            moreArr[i] = false;
            that.setData({arr: arr.concat(moreArr)})
          }
        } else {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      } else {
        Api.wxShowToast('图片获取失败~', 'none', 2000);
      }
    })
  },
  goDetail (e) {
    let imgid = e.currentTarget.dataset.imgid;
    app.aldstat.sendEvent(`查看详情`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/details/details?imgid=${imgid}`
    })
  },
  goReward () {
    wx.navigateTo({
      url: `/pages/applist/applist`
    })
  },
  gotoSearch (e) {
    let tname = e.currentTarget.dataset.tname;
    wx.navigateTo({
      url: '/pages/search/search?tname='+tname
    })
  },
  onShareAppMessage: function () {
    let that = this;
    return {
      path: `/pages/index/index`,
      imageUrl: that.data.share_img,
      success() {
        Api.wxShowToast('分享成功~', 'none', 2000);
        app.aldstat.sendEvent(`首页分享小程序`,{
          play : ""
        });
      },
      fail() {},
      complete() {}
    }
  },
  downloadGif (e) {
    let that = this;
    let url = e.currentTarget.dataset.img;
    if (url) {
      wx.downloadFile({
          url: url,
          success:function(res){
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                Api.wxShowToast('已保存到相册', 'none', 2000);
                app.aldstat.sendEvent(`下载动图`,{
                  play : ""
                });
              },
              fail: function (err) {
                console.log(err, 'err')
                that.setData({showDialog:true})
              }
            })
          },
          fail:function(res){
            console.log(res, 'save err')
            Api.wxShowToast('出错了', 'none', 2000);
          }
        })
    } else {
      Api.wxShowToast('该图无效~', 'none', 2000);
    }
  },
  shareGif (e) {
    let that = this;
    let url = e.currentTarget.dataset.img;
    if (url) {
      Api.wxShowToast('长按转发给好友', 'none', 2000);
      setTimeout(()=>{
        wx.previewImage({
          current: url, // 当前显示图片的http链接
          urls: [url]
        })
      },1000)
    } else {
      Api.wxShowToast('该图无效~', 'none', 2000);
    }
  },
  getList (e) {
    let tname = e.currentTarget.dataset.tname;
    app.aldstat.sendEvent(`查看${tname}-标签下的动图`,{
      play : ""
    });
    wx.navigateTo({
      url: '/pages/search/search?tname='+tname
    })
  }
})
