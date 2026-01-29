const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    isLogin: true,
    username: '',
    password: '',
    loading: false,
    theme: 'light'
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
  },

  toggleMode() {
    this.setData({
      isLogin: !this.data.isLogin,
      username: '',
      password: ''
    });
  },

  handleSubmit() {
    const { username, password, isLogin } = this.data;
    
    if (!username || !password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    // Simulate network delay for UX
    setTimeout(() => {
      let result;
      if (isLogin) {
        result = storage.login(username, password);
      } else {
        result = storage.register(username, password);
      }

      this.setData({ loading: false });

      if (result.success) {
        wx.showToast({
          title: isLogin ? '登录成功' : '注册成功',
          icon: 'success'
        });
        
        if (isLogin) {
            app.globalData.userInfo = result.user;
             wx.reLaunch({
                url: '/pages/index/index'
             });
        } else {
            // 注册成功后切换到登录模式
            this.toggleMode();
        }
      } else {
        wx.showToast({
          title: result.message || '操作失败',
          icon: 'none'
        });
      }
    }, 500);
  }
});
