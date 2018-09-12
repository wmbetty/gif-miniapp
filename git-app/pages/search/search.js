const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    isSearchText: false,
    searchText: '',
    focus: true,
    winHeight: 0,
    imgList: [],
    tagList: [],
    showTags: true,
    isX: false
  },
  onLoad: function (options) {
    var that = this;
    let tname = options.tname;
    //  高度自适应
    wx.getSystemInfo( {
      success: function( res ) {
        var clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight
        });
        if (res.model.indexOf('iPhone X') != -1) {
          that.setData({isX: true})
        }
      }
    });
    let tagListApi = backApi.tagListApi;
    Api.wxRequest(tagListApi,'GET',{},(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>=0) {
          that.setData({tagList: res.data.data})
        }
      } else {
        Api.wxShowToast('标签获取失败~', 'none', 2000);
      }
    })
    if (tname) {
      that.setData({
        searchText: tname,isSearchText: true,showTags: false,focus: false
      });
      let sApi = backApi.searchApi;
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      Api.wxRequest(sApi,'GET',{keywords: tname, page: 1},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data,page: 1,keywords: tname})
          } else {
            Api.wxShowToast('暂未搜到结果~', 'none', 2000);
            that.setData({imgList: [],page: 1})
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('搜索失败~', 'none', 2000);
        }
      })
    }
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onReachBottom: function () {

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
  inputPut (e) {
    let that = this;
    let text = e.detail.value;
    if (text !== '') {
      that.setData({
        searchText: text,
        isSearchText: true
      })
    } else {
      that.setData({
        searchText: '',imgList: [],
        isSearchText: false,
        page: 1,keywords: '',showTags: true
      })
    }
  },
  clearText () {
    let that = this;
    that.setData({
      searchText: '',
      isSearchText: false,
      focus: true,page: 1,keywords: ''
    })
  },
  inputBlur () {
    let that = this;
    let text = that.data.searchText;
    if (text!=='') {
      let sApi = backApi.searchApi;
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      Api.wxRequest(sApi,'GET',{keywords: text, page: 1},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data,page: 1,keywords: text,showTags: false})
          } else {
            Api.wxShowToast('暂未搜到结果~', 'none', 2000);
            that.setData({imgList: [],page: 1})
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('搜索失败~', 'none', 2000);
        }
      })
    }
  },
  scrolltolower: function () {
    let that = this;
    let page = that.data.page*1+1;
    let keyord = that.data.keywords;
    let imgList = that.data.imgList;
    let sApi = backApi.searchApi;
    Api.wxRequest(sApi,'GET',{page: page,keywords:keyord},(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>0) {
          imgList = imgList.concat(res.data.data);
          that.setData({imgList: imgList,page: page})
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
    wx.navigateTo({
      url: `/pages/details/details?imgid=${imgid}`
    })
  },
  gosearch (e) {
    let sApi = backApi.searchApi;
    let word = e.currentTarget.dataset.word;
    let that = this;
    that.setData({
      page: 1,keywords: word,searchText: word
    });
    Api.wxRequest(sApi,'GET',{page: 1,keywords:word},(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>0) {
          that.setData({imgList: res.data.data, showTags: false})
        } else {
          Api.wxShowToast('该标签暂无数据~', 'none', 2000);
        }
      } else {
        Api.wxShowToast('图片获取失败~', 'none', 2000);
      }
    })
  },
  goDetail (e) {
    let imgid = e.currentTarget.dataset.imgid;
    wx.navigateTo({
      url: `/pages/details/details?imgid=${imgid}`
    })
  },
  gotoSearch (e) {
    let that = this;
    let tname = e.currentTarget.dataset.tname;
    let sApi = backApi.searchApi;
    that.setData({
      page: 1,keywords: tname,searchText: tname
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    setTimeout(()=>{
      Api.wxRequest(sApi,'GET',{page: 1,keywords:tname},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data, showTags: false})
          } else {
            Api.wxShowToast('该标签暂无数据~', 'none', 2000);
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('图片获取失败~', 'none', 2000);
        }
      })
    },200)
  },
  inputFocus () {
    let that = this;
    let text = that.data.searchText;
    if (text!=='') {
      that.setData({isSearchText: true})
    }
  }
})