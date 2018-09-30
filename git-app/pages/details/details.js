const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();

Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    imgid: '',
    imgList: [],
    isX: false,
    isIphoneLiuhai: false,
    isAnDrLiuhai: false,
    showSwiper: false,
    item: {}
  },
  onLoad: function (options) {
    var that = this;
    that.setData({imgid: options.imgid})
    backApi.getToken().then(function (res) {
      if (res.data.status * 1 === 200) {
        let token = res.data.data.access_token;
        that.setData({token: token});
        let imageViewApi = backApi.imageViewApi;
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        Api.wxRequest(imageViewApi,'GET',{images_id: options.imgid},(res)=>{
          if (res.data.status*1===200) {
            that.setData({imgList: res.data.data, item: res.data.data[0]});
            if (res.data.data.length>1) {
              Api.wxShowToast('左右滑动看更多动图~', 'none', 2300);
            }
            setTimeout(()=>{
              wx.hideLoading();
              that.setData({showSwiper: true})
            }, 330)
          } else {
            wx.hideLoading();
            Api.wxShowToast('获取数据失败~', 'none', 2000);
          }
        })
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
    that.setData({
      isAnDrLiuhai: app.globalData.isAnDrLiuhai,
      isIphoneLiuhai: app.globalData.isIphoneLiuhai
    })
  },
  onReady: function () {
    let that = this;
    let res = wx.getSystemInfoSync();
    var clientHeight=res.windowHeight;
    // console.log(clientHeight, 'ttt')
    that.setData( {
      winHeight: clientHeight,
      winWidth: res.windowWidth
    });
    // if (res.model.indexOf('iPhone X') != -1) {
    //   that.setData({isX: true})
    // }
  },
  onShow: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let imgid = that.data.imgid;
    return {
      title: '抖图搞笑动态图撩人表情包',
      path: `/pages/index/index?imgid=${imgid}`,
      imageUrl: that.data.share_img,
      success() {
        Api.wxShowToast('分享成功~', 'none', 2000);
      },
      fail() {},
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
  previewImg (e) {
    let that = this;
    let img = e.currentTarget.dataset.img;
    let imgList = that.data.imgList;
    let prevList = [];
    for (let item of imgList) {
      prevList = prevList.concat(item.image);
    }
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: prevList
    })
  },
  gotoSearch (e) {
    let tname = e.currentTarget.dataset.tname;
    wx.navigateTo({
      url: '/pages/search/search?tname='+tname
    })
  },
  downloadGif (e) {
    let that = this;
    let url = e.currentTarget.dataset.img;
    if (url) {
      wx.downloadFile({
          url: url,
          success:function(res){
            wx.showLoading({
              title: '保存中'
            });
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                wx.hideLoading();
                Api.wxShowToast('已保存到相册', 'none', 2000);
              },
              fail: function (err) {
                console.log(err, 'err')
                wx.hideLoading();
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
    let imgList = that.data.imgList;
    let prevList = [];
    for (let item of imgList) {
      prevList = prevList.concat(item.image);
    }
    if (url) {
      Api.wxShowToast('长按转发给好友', 'none', 2000);
      setTimeout(()=>{
        wx.previewImage({
          current: url, // 当前显示图片的http链接
          urls: prevList
        })
      },1000)
    } else {
      Api.wxShowToast('该图无效~', 'none', 2000);
    }
  },
  change (e) {
    console.log(e, 'ee')
    let that = this;
    let current = e.detail.current;
    let imgList = that.data.imgList;
    for (let i=0; i<imgList.length; i++) {
      if (i === current) {
        that.setData({item: imgList[current]})
      }
    }
  }
})
