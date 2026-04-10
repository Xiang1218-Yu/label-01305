const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    templates: [],
    showModal: false,
    editingTemplate: null,
    templateName: '',
    templateTitle: '',
    templateDesc: '',
    templatePriority: 'normal',
    templateCategory: 'work',
    isSaving: false
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

  showAddModal() {
    this.setData({
      showModal: true,
      editingTemplate: null,
      templateName: '',
      templateTitle: '',
      templateDesc: '',
      templatePriority: 'normal',
      templateCategory: 'work'
    });
  },

  showEditModal(e) {
    const template = e.currentTarget.dataset.template;
    this.setData({
      showModal: true,
      editingTemplate: template,
      templateName: template.name,
      templateTitle: template.title,
      templateDesc: template.desc,
      templatePriority: template.priority || 'normal',
      templateCategory: template.category || 'work'
    });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  onNameInput(e) {
    this.setData({ templateName: e.detail.value });
  },

  onTitleInput(e) {
    this.setData({ templateTitle: e.detail.value });
  },

  onDescInput(e) {
    this.setData({ templateDesc: e.detail.value });
  },

  onPriorityChange(e) {
    this.setData({ templatePriority: e.detail.value });
  },

  onCategoryChange(e) {
    this.setData({ templateCategory: e.detail.value });
  },

  saveTemplate() {
    if (this.data.isSaving) return;
    
    const { templateName, templateTitle, templateDesc, templatePriority, templateCategory, editingTemplate } = this.data;
    if (!templateName || !templateTitle) {
      wx.showToast({ title: '请填写模板名称和任务标题', icon: 'none' });
      return;
    }

    const user = storage.getCurrentUser();
    if (!user) return;

    this.setData({ isSaving: true });

    const templateData = {
      userId: user.id,
      name: templateName,
      title: templateTitle,
      desc: templateDesc,
      priority: templatePriority,
      category: templateCategory
    };

    if (editingTemplate) {
      storage.updateTaskTemplate(editingTemplate.id, templateData);
      wx.showToast({ title: '模板已更新', icon: 'success' });
    } else {
      storage.addTaskTemplate(templateData);
      wx.showToast({ title: '模板已创建', icon: 'success' });
    }

    this.closeModal();
    this.loadTemplates();
    this.setData({ isSaving: false });
  },

  deleteTemplate(e) {
    const templateId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除模板',
      content: '确定要删除这个模板吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTaskTemplate(templateId);
          this.loadTemplates();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  },

  useTemplate(e) {
    const template = JSON.stringify(e.currentTarget.dataset.template);
    wx.navigateTo({
      url: `/pages/detail/detail?template=${encodeURIComponent(template)}`
    });
  },

  goToSelectTemplate() {
    wx.navigateTo({
      url: '/pages/templateSelect/templateSelect'
    });
  }
});