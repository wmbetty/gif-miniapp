// pages/applist/applist.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    winHeight: 0,
    isX: false,
    isAnDrLiuhai: false,
    isIphoneLiuhai: false,
    list: [],
    dialogShow: false,
    appid: '',
    path: '',
    appname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.setData({
      isAnDrLiuhai: app.globalData.isAnDrLiuhai,
      isIphoneLiuhai: app.globalData.isIphoneLiuhai
    })
    let miniprogramApi = backApi.miniprogramApi
    Api.wxRequest(miniprogramApi,'GET',{},(res)=>{
      if (res.data.status*1===200) {
        let data = res.data.data
        that.setData({list: data})
      } else {
        Api.wxShowToast('数据获取失败~', 'none', 2300);
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
  openApp (e) {
    let that = this
    let item = e.currentTarget.dataset.item
    that.setData({
      appid: item.appid,
      path: item.path,
      dialogShow: true,
      appname: item.name
    })

  },
  cancelDialog () {
    let that = this
    that.setData({dialogShow: false})
  }
})
