const app = getApp();
const storage = require('../../utils/storage');

Page({
  data: {
    theme: 'light',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    showOldPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    loading: false,
    passwordStrengthLevel: 'weak',
    passwordStrengthText: '弱'
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme
    });

    const user = storage.getCurrentUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/login' });
    }
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
    const password = e.detail.value;
    this.setData({
      newPassword: password
    });
    this.checkPasswordStrength(password);
  },

  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  checkPasswordStrength(password) {
    if (!password) {
      this.setData({
        passwordStrengthLevel: 'weak',
        passwordStrengthText: '弱'
      });
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    const conditions = [hasUpperCase, hasLowerCase, hasSpecialChar, hasMinLength];
    const passedCount = conditions.filter(Boolean).length;

    let level, text;
    if (passedCount <= 2) {
      level = 'weak';
      text = '弱';
    } else if (passedCount === 3) {
      level = 'medium';
      text = '中';
    } else {
      level = 'strong';
      text = '强';
    }

    this.setData({
      passwordStrengthLevel: level,
      passwordStrengthText: text
    });
  },

  validatePassword(password) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const hasMinLength = password.length >= 8;

    if (!hasMinLength) {
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
        title: '两次输入的密码不一致',
        icon: 'none'
      });
      return;
    }

    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      wx.showToast({
        title: validation.message,
        icon: 'none'
      });
      return;
    }

    const user = storage.getCurrentUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    this.setData({ loading: true });

    setTimeout(() => {
      const result = storage.changePassword(user.id, oldPassword, newPassword);

      this.setData({ loading: false });

      if (result.success) {
        wx.showModal({
          title: '密码修改成功',
          content: '为了您的账号安全，请重新登录',
          showCancel: false,
          confirmText: '去登录',
          success: () => {
            storage.logout();
            app.globalData.userInfo = null;
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }
        });
      } else {
        wx.showToast({
          title: result.message || '密码修改失败',
          icon: 'none'
        });
      }
    }, 500);
  }
});
