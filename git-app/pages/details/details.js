const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    winHeight: 0,
    imgid: '',
    imgList: [],
    isX: false
  },
  onLoad: function (options) {
    var that = this;
    that.setData({imgid: options.imgid})
    //  高度自适应
    wx.getSystemInfo( {
      success: function( res ) {
        var clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight,
        });
        if (res.model.indexOf('iPhone X') != -1) {
          that.setData({isX: true})
        }
      }
    })
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
            wx.hideLoading();
            that.setData({imgList: res.data.data});
            if (res.data.data.length>1) {
              Api.wxShowToast('左右滑动看更多动图~', 'none', 2300);
            }
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
  },
  onReady: function () {},
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
      prevList = prevList.concat(item.img_url);
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
  }
})