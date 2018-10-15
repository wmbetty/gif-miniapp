const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();

Page({
  data: {
    isSearchText: false,
    searchText: '',
    focus: true,
    winHeight: 0,
    imgList: [],
    tagList: [],
    showTags: true,
    isX: false,
    isAnDrLiuhai: false,
    isIphoneLiuhai: false,
    arr: [],
    arrHeight: [],
    itemHeight: 0
  },
  onLoad: function (options) {
    var that = this;
    let tname = options.tname;
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
            setTimeout(()=> {
              wx.hideLoading();
              that.setData({imgList: res.data.data,page: 1,keywords: tname})
              let arr = that.data.arr;
              for (let i=0;i<res.data.data.length;i++) {
                arr[i] = false;
                that.setData({arr: arr})
              }
              that.getRect();
            }, 1000)
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
    that.setData({
      isAnDrLiuhai: app.globalData.isAnDrLiuhai,
      isIphoneLiuhai: app.globalData.isIphoneLiuhai
    })
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
  onReady: function () {
    let that = this;
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
  },
  onShow: function () {},
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let keyord = that.data.keywords;
    let imgList = that.data.imgList;
    let sApi = backApi.searchApi;
    let arr = that.data.arr;
    let moreArr = [];
    Api.wxRequest(sApi,'GET',{page: page,keywords:keyord},(res)=>{
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
      app.aldstat.sendEvent(`输入关键字-${text}-搜索`,{
        play : ""
      });
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
      focus: true,page: 1,keywords: '',
      arr:[], arrHeight: [], itemHeight: 0
    })
  },
  inputBlur () {
    let that = this;
    let text = that.data.searchText;
    if (text!=='') {
      let sApi = backApi.searchApi;
      that.setData({
        arr:[], arrHeight: [], itemHeight: 0
      })
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      Api.wxRequest(sApi,'GET',{keywords: text, page: 1},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data,page: 1,keywords: text,showTags: false})
            let arr = that.data.arr;
            for (let i=0;i<res.data.data.length;i++) {
              arr[i] = false;
              that.setData({arr: arr})
            }
            that.getRect();
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
    app.aldstat.sendEvent(`搜索页查看更多`,{
      play : ""
    });
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
    app.aldstat.sendEvent(`查看-${word}-标签下的动图`,{
      play : ""
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
  }
})
