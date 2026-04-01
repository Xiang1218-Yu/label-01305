const app = getApp();
const storage = require('../../utils/storage');
const crypto = require('../../utils/crypto');

Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    loading: false,
    theme: 'light'
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme
    });
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
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < 8) {
      return { valid: false, message: '密码长度不能少于8位' };
    }
    if (!hasUpperCase) {
      return { valid: false, message: '密码必须包含大写字母' };
    }
    if (!hasLowerCase) {
      return { valid: false, message: '密码必须包含小写字母' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: '密码必须包含特殊字符' };
    }
    return { valid: true };
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

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次输入的新密码不一致',
        icon: 'none'
      });
      return;
    }

    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      wx.showToast({
        title: passwordValidation.message,
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    setTimeout(() => {
      const currentUser = storage.getCurrentUser();
      const users = wx.getStorageSync('users') || [];
      const userIndex = users.findIndex(u => u.id === currentUser.id);

      if (userIndex === -1) {
        this.setData({ loading: false });
        wx.showToast({
          title: '用户不存在',
          icon: 'none'
        });
        return;
      }

      const user = users[userIndex];
      const oldPasswordMatch = crypto.verifyPassword(oldPassword, user.password);

      if (!oldPasswordMatch) {
        this.setData({ loading: false });
        wx.showToast({
          title: '原密码错误',
          icon: 'none'
        });
        return;
      }

      users[userIndex].password = crypto.hashPassword(newPassword);
      wx.setStorageSync('users', users);

      wx.showToast({
        title: '密码修改成功',
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
    }, 500);
  }
});
