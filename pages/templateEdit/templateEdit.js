const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    isEdit: false,
    templateId: null,
    name: '',
    desc: '',
    priorities: ['高', '中', '低'],
    priorityIndex: 1,
    types: ['工作', '个人', '学习', '其他'],
    typeIndex: 1,
    defaultDuration: '1',
    theme: 'light'
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, templateId: options.id });
      this.loadTemplate(options.id);
    }
  },

  loadTemplate(id) {
    const template = storage.getTemplateById(id);
    if (template) {
      this.setData({
        name: template.name,
        desc: template.desc || '',
        priorityIndex: this.data.priorities.indexOf(template.priority) >= 0 ? this.data.priorities.indexOf(template.priority) : 1,
        typeIndex: this.data.types.indexOf(template.type) >= 0 ? this.data.types.indexOf(template.type) : 1,
        defaultDuration: template.defaultDuration ? String(template.defaultDuration) : '1'
      });
    }
  },

  bindNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  bindDescInput(e) {
    this.setData({ desc: e.detail.value });
  },

  bindPriorityChange(e) {
    this.setData({ priorityIndex: e.detail.value });
  },

  bindTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  bindDurationInput(e) {
    this.setData({ defaultDuration: e.detail.value });
  },

  saveTemplate() {
    const { name, desc, priorityIndex, priorities, typeIndex, types, defaultDuration, isEdit, templateId } = this.data;
    const currentUser = app.globalData.userInfo || storage.getCurrentUser();

    if (!currentUser) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!name) {
      wx.showToast({ title: '请输入模板名称', icon: 'none' });
      return;
    }

    const durationNum = parseFloat(defaultDuration);
    if (isNaN(durationNum) || durationNum <= 0) {
      wx.showToast({ title: '请输入有效的时长', icon: 'none' });
      return;
    }

    const templateData = {
      name,
      desc,
      priority: priorities[priorityIndex],
      type: types[typeIndex],
      defaultDuration: durationNum,
      userId: currentUser.id
    };

    if (isEdit) {
      storage.updateTemplate(templateId, templateData);
      wx.showToast({ title: '更新成功', icon: 'success' });
    } else {
      storage.addTemplate(templateData);
      wx.showToast({ title: '创建成功', icon: 'success' });
    }

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  deleteTemplate() {
    const { templateId } = this.data;
    wx.showModal({
      title: '删除模板？',
      content: '确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTemplate(templateId);
          wx.navigateBack();
        }
      }
    });
  }
});
