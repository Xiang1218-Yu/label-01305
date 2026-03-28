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
    this.setData({
      theme: app.globalData.theme,
      filterType: options.type || '',
      filterLabel: this.getFilterLabel(options.type || '')
    });
    this.loadTasks();
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
    this.loadTasks();
  },

  getFilterLabel(type) {
    const labels = {
      'total': '全部任务',
      'completed': '已完成',
      'pending': '待办',
      'overdue': '已逾期',
      'dueSoon': '即将到期'
    };
    return labels[type] || '任务列表';
  },

  loadTasks() {
    const user = storage.getCurrentUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }

    let tasks = storage.getTasks(user.id, {});
    
    tasks = tasks.map(task => {
      const endDateTime = task.endDateTime || task.endDate;
      return {
        ...task,
        isOverdue: util.isOverdue(endDateTime),
        isDueSoon: util.isDueSoon(endDateTime)
      };
    });

    tasks = this.filterTasks(tasks);

    tasks.sort((a, b) => {
      const aTime = new Date((a.endDateTime || a.endDate).replace(/-/g, '/')).getTime();
      const bTime = new Date((b.endDateTime || b.endDate).replace(/-/g, '/')).getTime();
      return aTime - bTime;
    });

    this.setData({ tasks });
  },

  filterTasks(tasks) {
    const type = this.data.filterType;
    
    switch (type) {
      case 'total':
        return tasks;
      case 'completed':
        return tasks.filter(t => t.status === 'completed');
      case 'pending':
        return tasks.filter(t => t.status === 'pending' || !t.status);
      case 'overdue':
        return tasks.filter(t => {
          const endDateTime = t.endDateTime || t.endDate;
          return (t.status === 'pending' || !t.status) && endDateTime && util.isOverdue(endDateTime);
        });
      case 'dueSoon':
        return tasks.filter(t => {
          const endDateTime = t.endDateTime || t.endDate;
          return (t.status === 'pending' || !t.status) && endDateTime && util.isDueSoon(endDateTime);
        });
      default:
        return tasks;
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  toggleTaskStatus(e) {
    const id = e.currentTarget.dataset.id;
    const task = this.data.tasks.find(t => String(t.id) === String(id));
    if (!task) {
      wx.showToast({ title: '任务不存在', icon: 'none' });
      return;
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const success = storage.updateTask(id, { status: newStatus });
    
    if (!success) {
      wx.showToast({ title: '更新失败', icon: 'none' });
      return;
    }
    
    wx.showToast({
      title: newStatus === 'completed' ? '已完成！' : '已重新打开',
      icon: 'success',
      duration: 1000
    });

    this.loadTasks();
  },

  showActionSheet(e) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['删除任务'],
      itemColor: '#d93025',
      success: (res) => {
        if (res.tapIndex === 0) {
          this.deleteTask(id);
        }
      }
    });
  },

  deleteTask(id) {
    wx.showModal({
      title: '删除任务？',
      content: '此操作无法撤销。',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTask(id);
          this.loadTasks();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  }
});
