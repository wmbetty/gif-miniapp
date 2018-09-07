const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    winHeight: 0,
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://pic.58pic.com/58pic/13/66/58/20258PICpDh_1024.png'
    ],
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
        if (res.model==='iPhone X') {
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
            that.setData({imgList: res.data.data})
          } else {
            wx.hideLoading();
            wx.showToast({ title: '获取数据失败', icon: 'none' })
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
    let imgid = that.data.imgid
    return {
      title: '抖图搞笑动态图撩人表情包',
      path: `/pages/index/index?imgid=${imgid}`,
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