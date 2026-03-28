const app = getApp();
const storage = require('../../utils/storage');
const util = require('../../utils/util');

Page({
  data: {
    tasks: [],
    filterType: '',
    filterLabel: '',
    theme: 'light'
  },

  onLoad(options) {
    const { type, label } = options;
    this.setData({
      filterType: type,
      filterLabel: label || this.getDefaultLabel(type),
      theme: app.globalData.theme
    });
    
    this.loadFilteredTasks();
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme
    });
    this.loadFilteredTasks();
  },

  getDefaultLabel(type) {
    const labels = {
      total: '全部任务',
      completed: '已完成任务',
      pending: '待办任务',
      overdue: '已逾期任务',
      dueSoon: '即将到期任务'
    };
    return labels[type] || '任务列表';
  },

  loadFilteredTasks() {
    const user = storage.getCurrentUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    let tasks = storage.getTasks(user.id);
    
    // 根据filterType筛选任务
    switch (this.data.filterType) {
      case 'completed':
        tasks = tasks.filter(t => t.status === 'completed');
        break;
      case 'pending':
        tasks = tasks.filter(t => t.status === 'pending' || !t.status);
        break;
      case 'overdue':
        tasks = tasks.filter(t => {
          const endDateTime = t.endDateTime || t.endDate;
          return (t.status === 'pending' || !t.status) && endDateTime && util.isOverdue(endDateTime);
        });
        break;
      case 'dueSoon':
        tasks = tasks.filter(t => {
          const endDateTime = t.endDateTime || t.endDate;
          return (t.status === 'pending' || !t.status) && endDateTime && util.isDueSoon(endDateTime);
        });
        break;
      // 'total' 不筛选，显示全部
    }

    // 预处理任务状态
    tasks = tasks.map(task => {
      const endDateTime = task.endDateTime || task.endDate;
      return {
        ...task,
        isOverdue: (task.status === 'pending' || !task.status) && endDateTime && util.isOverdue(endDateTime),
        isDueSoon: (task.status === 'pending' || !task.status) && endDateTime && util.isDueSoon(endDateTime)
      };
    });

    this.setData({ tasks });
  },

  formatDate(timestamp) {
    return util.formatDate(timestamp);
  },

  toggleTaskStatus(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => t.id == taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    storage.updateTask(taskId, { status: newStatus });
    
    this.loadFilteredTasks();
    wx.showToast({
      title: newStatus === 'completed' ? '已完成' : '已标记为待办',
      icon: 'success'
    });
  },

  goToDetail(e) {
    const taskId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${taskId}`
    });
  },

  goBack() {
    wx.navigateBack();
  }
});