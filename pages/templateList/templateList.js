const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    templates: [],
    userInfo: null,
    showCreateModal: false
  },

  onShow() {
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
    const templates = storage.getTaskTemplates(this.data.userInfo.id);
    this.setData({ templates });
  },

  goToAdd() {
    this.setData({ showCreateModal: false });
    wx.navigateTo({
      url: '/pages/templateDetail/templateDetail'
    });
  },

  goToEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/templateDetail/templateDetail?id=${id}`
    });
  },

  showCreateModal() {
    this.setData({ showCreateModal: true });
  },

  hideCreateModal() {
    this.setData({ showCreateModal: false });
  },

  createTaskFromTemplate(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?templateId=${id}`
    });
  },

  showActionSheet(e) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['编辑模板', '删除模板'],
      itemColor: '#0052d9',
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
          storage.deleteTaskTemplate(id);
          this.loadTemplates();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  }
});
