const storage = require('./utils/storage');

App({
  globalData: {
    userInfo: null,
    theme: 'light' // 'light' or 'eye-protect'
  },
  onLaunch() {
    // 初始化默认admin账号
    this.initDefaultUser();
    
    // Load theme from storage
    const theme = wx.getStorageSync('theme') || 'light';
    this.globalData.theme = theme;
    
    // Check login status
    const userInfo = wx.getStorageSync('currentUser');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },
  
  initDefaultUser() {
    const crypto = require('./utils/crypto');
    const users = wx.getStorageSync('users') || [];
    const adminExists = users.find(u => u.username === 'admin');
    if (!adminExists) {
      // 创建默认admin账号（使用加密密码）
      const passwordHash = crypto.hashPassword('123456');
      const adminUser = { username: 'admin', password: passwordHash, id: 1000000 };
      users.push(adminUser);
      wx.setStorageSync('users', users);
    }
  }
})
