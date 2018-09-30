//index.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    winHeight:"",//窗口高度
    currentTab:0, //预设当前项的值
    scrollLeft:0, //tab标题的滚动条位置
    token: '',
    cateList: [],
    imgList: [],
    isX: false
  },
  // 滚动切换标签样式
  switchTab:function(e){
    let that = this;
    let cateList = that.data.cateList;
    let current = e.detail.current;
    that.setData({
      currentTab:current
    });
    that.checkCor();

    if(that.data.currentTaB==current){return false;}
    else {
      for (let i=0;i<cateList.length;i++) {
        if (i===current) {
          that.setData({cate_id: cateList[i].category_id})
        }
      }
      setTimeout(()=>{
        wx.showLoading({
          title: '加载中',
          mask: true
        });
        let imgListApi = backApi.imgListApi+that.data.token;
        Api.wxRequest(imgListApi,'GET',{page: 1,category_id: that.data.cate_id},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            if (res.data.data.length>0) {
              // let totalpage1 = res.header['X-Pagination-Page-Count'];
              that.setData({imgList: res.data.data,page: 1})
            } else {
              Api.wxShowToast('暂无数据~', 'none', 2000);
            }
          } else {
            wx.hideLoading();
            Api.wxShowToast('图片获取失败~', 'none', 2000);
          }
        })
      },200)
    }
  },
  // 点击标题切换当前页时改变样式
  swichNav:function(e){
    let that = this;
    var cur=e.target.dataset.current;
    let cid = e.currentTarget.dataset.cid;
    if(that.data.currentTaB==cur){return false;}
    else{
      that.setData({
        currentTab:cur,page: 1,cate_id: cid
      });
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let imgListApi = backApi.imgListApi+that.data.token;
      Api.wxRequest(imgListApi,'GET',{page: 1,category_id: cid},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            // let totalpage1 = res.header['X-Pagination-Page-Count'];
            that.setData({imgList: res.data.data,page: 1})
          } else {
            Api.wxShowToast('暂无数据~', 'none', 2000);
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('图片获取失败~', 'none', 2000);
        }
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor:function(){
    if (this.data.currentTab<=4){
      this.setData({
        scrollLeft:0
      })
    }
    if (this.data.currentTab>4){
      this.setData({
        scrollLeft:400
      })
    }
    if (this.data.currentTab>=6) {
      this.setData({
        scrollLeft:600
      })
    }
    if (this.data.currentTab>=8) {
      this.setData({
        scrollLeft:800
      })
    }
  },
  onLoad: function (options) {
    let imgid= options.imgid;
    var that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function( res ) {
        var clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight
        });
        let model = res.model;
        if (model.indexOf('iPhone') == -1) {
          that.setData({isAndrod: true})
        }
        if (model.indexOf('iPhone X') !=-1) {
          that.setData({isX: true})
        }
      }
    });
    let list = [{'category_name':'推荐','category_id': ''}];
    backApi.getToken().then(function (res) {
      if (res.data.status*1===200) {
        let token = res.data.data.access_token;
        that.setData({token: token});
        let cateApi = backApi.categoryApi+token;
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        Api.wxRequest(cateApi,'GET',{},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            list = list.concat(res.data.data)
            that.setData({cateList: list})
          } else {
            wx.hideLoading();
            Api.wxShowToast('分类获取失败~', 'none', 2000);
          }
        })
        setTimeout(()=>{
          let imgListApi = backApi.imgListApi+token;
          Api.wxRequest(imgListApi,'GET',{page: 1},(res)=>{
            if (res.data.status*1===200) {
              // let totalpage1 = res.header['X-Pagination-Page-Count'];
              that.setData({imgList: res.data.data,page: 1})
            } else {
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
            // Api.wxShowToast('图片获取失败~', 'none', 2000);
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
  goSearch () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  scrolltolower: function () {
    let that = this;
    let page = that.data.page*1+1;
    let imgList = that.data.imgList;
    let imgListApi = backApi.imgListApi+that.data.token;
    let cateId = that.data.cate_id;
    let datas = {page: page};
    if (cateId) {
      datas.category_id = cateId
    }
    Api.wxRequest(imgListApi,'GET',datas,(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>0) {
          imgList = imgList.concat(res.data.data);
          that.setData({imgList: imgList,page: page})
        } else {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      } else {
        Api.wxShowToast('图片n获取失败~', 'none', 2000);
      }
    })
  },
  goDetail (e) {
    let imgid = e.currentTarget.dataset.imgid;
    wx.navigateTo({
      url: `/pages/details/details?imgid=${imgid}`
    })
  },
  goReward () {
    wx.navigateTo({
      url: `/pages/getprize/getprize`
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
      },
      fail() {},
      complete() {}
    }
  }
})
