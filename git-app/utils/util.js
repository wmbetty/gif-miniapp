const Api = require('wxApi');

const http = "https://fabu.gif.604f.cn/"
// fabu.gif.79643.com
// const http = "https://gif.79643.com/"

const loginApi = `${http}v1/member/login`
const imgListApi = `${http}v1/images?access-token=`
const imgDetailApi = `${http}v1/images/`
const categoryApi = `${http}v1/category?access-token=`
const updateUserInfoApi = `${http}v1/member/user-info?access-token=`
const imageViewApi = `${http}v1/images/view`
const searchApi = `${http}v1/images/search`
const tagListApi = `${http}v1/tag`
const rewardItemApi = `${http}v1/reward?access-token=`
const lotteryApi = `${http}v1/reward/lottery?access-token=`
const rewardRecordApi = `${http}v1/reward/record?access-token=`
const imgShareApi = `${http}v1/images/share?access-token=`
const recommendTagApi = `${http}v1/tag/recommend?access-token=`
const miniprogramApi = `${http}v1/miniprogram`

function getToken(){
  return new Promise(function(resolve,reject){
    //ajax...
    wx.login({
      success: function(res) {
        let reqData = {};
        let code = res.code;
        if (code) {
          reqData.code = code;
          Api.wxRequest(loginApi,'POST',reqData,(res)=>{
            resolve(res)
          })
        } else {
          Api.wxShowToast('登录失败~', 'none', 2000);
        }
      }
    });
    //如果有错的话就reject
  })
}

module.exports = {
  imgListApi: imgListApi,
  imgDetailApi: imgDetailApi,
  categoryApi: categoryApi,
  getToken: getToken,
  updateUserInfoApi: updateUserInfoApi,
  imageViewApi: imageViewApi,
  searchApi: searchApi,
  tagListApi: tagListApi,
  rewardItemApi: rewardItemApi,
  lotteryApi: lotteryApi,
  rewardRecordApi: rewardRecordApi,
  imgShareApi: imgShareApi,
  recommendTagApi: recommendTagApi,
  miniprogramApi: miniprogramApi
}
