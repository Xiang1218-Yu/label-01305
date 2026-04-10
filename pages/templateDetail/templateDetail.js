const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    isEdit: false,
    templateId: null,
    title: '',
    desc: '',
    priority: 'medium',
    type: 'personal',
    reminder: false,
    priorities: ['高', '中', '低'],
    priorityIndex: 1,
    types: ['工作', '个人', '学习', '其他'],
    typeIndex: 1
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, templateId: options.id });
      this.loadTemplate(options.id);
    }
  },

  loadTemplate(id) {
    const template = storage.getTaskTemplateById(id);
    if (template) {
      const priorityMap = { 'high': '高', 'medium': '中', 'low': '低', '高': '高', '中': '中', '低': '低' };
      const typeMap = { 'work': '工作', 'personal': '个人', 'study': '学习', 'other': '其他', '工作': '工作', '个人': '个人', '学习': '学习', '其他': '其他' };

      const priority = priorityMap[template.priority] || '中';
      const type = typeMap[template.type] || '个人';

      this.setData({
        title: template.title,
        desc: template.desc || '',
        reminder: template.reminder || false,
        priorityIndex: this.data.priorities.indexOf(priority) >= 0 ? this.data.priorities.indexOf(priority) : 1,
        typeIndex: this.data.types.indexOf(type) >= 0 ? this.data.types.indexOf(type) : 1
      });
    }
  },

  bindTitleInput(e) {
    this.setData({ title: e.detail.value });
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

  bindReminderChange(e) {
    this.setData({ reminder: e.detail.value });
  },

  saveTemplate() {
    const { title, desc, priorityIndex, priorities, typeIndex, types, reminder, isEdit, templateId } = this.data;
    const currentUser = app.globalData.userInfo || storage.getCurrentUser();

    if (!currentUser) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!title) {
      wx.showToast({ title: '请输入模板标题', icon: 'none' });
      return;
    }

    const priorityMap = { '高': 'high', '中': 'medium', '低': 'low' };
    const typeMap = { '工作': 'work', '个人': 'personal', '学习': 'study', '其他': 'other' };
    const templateData = {
      title,
      desc,
      priority: priorityMap[priorities[priorityIndex]] || 'medium',
      type: typeMap[types[typeIndex]] || 'personal',
      reminder,
      userId: currentUser.id
    };

    if (isEdit) {
      storage.updateTaskTemplate(templateId, templateData);
      wx.showToast({ title: '更新成功', icon: 'success' });
    } else {
      storage.addTaskTemplate(templateData);
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
      content: '确定要删除这个任务模板吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTaskTemplate(templateId);
          wx.navigateBack();
        }
      }
    });
  }
});
