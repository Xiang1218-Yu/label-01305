const storage = require('../../utils/storage');

Page({
  data: {
    templates: []
  },

  onShow() {
    this.loadTemplates();
  },

  loadTemplates() {
    const user = storage.getCurrentUser();
    if (!user) return;
    const templates = storage.getTaskTemplates(user.id);
    this.setData({ templates });
  },

  selectTemplate(e) {
    const template = JSON.stringify(e.currentTarget.dataset.template);
    wx.navigateTo({
      url: `/pages/detail/detail?template=${encodeURIComponent(template)}`
    });
  },

  goToManageTemplates() {
    wx.navigateTo({
      url: '/pages/taskTemplate/taskTemplate'
    });
  }
});
