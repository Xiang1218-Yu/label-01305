const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    templates: [],
    userInfo: null,
    theme: 'light'
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
    this.checkLogin();
    this.loadTemplates();
  },

  checkLogin() {
    const userInfo = app.globalData.userInfo || storage.getCurrentUser();
    if (!userInfo) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    } else {
      this.setData({ userInfo });
    }
  },

  loadTemplates() {
    if (!this.data.userInfo) return;
    const templates = storage.getTemplates(this.data.userInfo.id);
    this.setData({ templates });
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/templateEdit/templateEdit'
    });
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/templateEdit/templateEdit?id=${id}`
    });
  },

  useTemplate(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/templateUse/templateUse?id=${id}`
    });
  },

  showActionSheet(e) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.goToEdit({ currentTarget: { dataset: { id } } });
        } else if (res.tapIndex === 1) {
          this.deleteTemplate(id);
        }
      }
    });
  },

  deleteTemplate(id) {
    wx.showModal({
      title: '删除模板？',
      content: '此操作无法撤销。',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTemplate(id);
          this.loadTemplates();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  }
});
