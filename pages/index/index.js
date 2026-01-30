const storage = require('../../utils/storage');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    tasks: [],
    filterStatus: 'all',
    searchQuery: '',
    userInfo: null,
    theme: 'light',
    greeting: '',
    currentDate: '',
    stats: {
      pending: 0,
      completed: 0,
      overdue: 0
    }
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
    this.checkLogin();
    this.updateGreeting();
    this.updateDate();
    this.loadTasks();
  },

  // 更新问候语
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 6) {
      greeting = '夜深了';
    } else if (hour < 9) {
      greeting = '早上好';
    } else if (hour < 12) {
      greeting = '上午好';
    } else if (hour < 14) {
      greeting = '中午好';
    } else if (hour < 18) {
      greeting = '下午好';
    } else if (hour < 22) {
      greeting = '晚上好';
    } else {
      greeting = '夜深了';
    }
    this.setData({ greeting });
  },

  // 更新日期显示
  updateDate() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    const dateStr = `${month}月${date}日 星期${weekday}`;
    this.setData({ currentDate: dateStr });
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

  loadTasks() {
    if (!this.data.userInfo) return;
    
    const filters = {
      search: this.data.searchQuery
    };
    
    if (this.data.filterStatus !== 'all') {
      filters.status = this.data.filterStatus;
    }

    // 获取所有任务用于统计（不使用筛选，获取全部任务）
    const allTasks = storage.getTasks(this.data.userInfo.id, {});
    
    // 计算统计数据（与 profile.js 保持一致）
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const pendingTasks = allTasks.filter(t => t.status === 'pending' || !t.status);
    
    const stats = {
      pending: pendingTasks.length,
      completed: completedTasks.length,
      overdue: pendingTasks.filter(t => {
        const endDateTime = t.endDateTime || t.endDate;
        return endDateTime && util.isOverdue(endDateTime);
      }).length
    };
    this.setData({ stats });

    // 获取筛选后的任务列表
    let tasks = storage.getTasks(this.data.userInfo.id, filters);
    
    // 添加逾期和即将到期标记并按时间排序
    tasks = tasks.map(task => {
      const endDateTime = task.endDateTime || task.endDate;
      return {
        ...task,
        isOverdue: util.isOverdue(endDateTime),
        isDueSoon: util.isDueSoon(endDateTime)
      };
    }).sort((a, b) => {
      const aTime = new Date((a.endDateTime || a.endDate).replace(/-/g, '/')).getTime();
      const bTime = new Date((b.endDateTime || b.endDate).replace(/-/g, '/')).getTime();
      return aTime - bTime;
    });
    
    this.setData({ tasks });
  },

  setFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status }, () => {
      this.loadTasks();
    });
  },

  handleSearchInput(e) {
    this.setData({ searchQuery: e.detail.value });
    this.loadTasks();
  },

  goToAdd() {
    wx.navigateTo({
      url: '/pages/detail/detail'
    });
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

    // 立即更新数据，不等待toast完成
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
