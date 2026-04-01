const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    theme: 'light',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
  },

  toggleOldPassword() {
    this.setData({
      showOldPassword: !this.data.showOldPassword
    });
  },

  toggleNewPassword() {
    this.setData({
      showNewPassword: !this.data.showNewPassword
    });
  },

  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  onOldPasswordInput(e) {
    this.setData({
      oldPassword: e.detail.value
    });
  },

  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 6;
    
    return hasUpperCase && hasLowerCase && hasSpecialChar && hasMinLength;
  },

  handleSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (!this.validatePassword(newPassword)) {
      wx.showToast({
        title: '密码需包含大小写字母及特殊字符，至少6位',
        icon: 'none',
        duration: 2500
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    setTimeout(() => {
      const result = storage.changePassword(oldPassword, newPassword);

      this.setData({ loading: false });

      if (result.success) {
        wx.showToast({
          title: result.message,
          icon: 'success',
          duration: 1500
        });

        setTimeout(() => {
          storage.logout();
          app.globalData.userInfo = null;
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }, 1500);
      } else {
        wx.showToast({
          title: result.message || '修改失败',
          icon: 'none'
        });
      }
    }, 500);
  }
});
