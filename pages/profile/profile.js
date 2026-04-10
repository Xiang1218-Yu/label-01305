const app = getApp();
const storage = require('../../utils/storage');
const util = require('../../utils/util');
const exportUtil = require('../../utils/export');
const reminder = require('../../utils/reminder');

Page({
  data: {
    username: '',
    theme: 'light',
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    completionRate: 0 // 完成率
  },

  onShow() {
    this.setData({
      theme: app.globalData.theme
    });
    
    const user = storage.getCurrentUser();
    if (user) {
      this.setData({ username: user.username });
      this.loadStats(user.id);
      // 检查任务提醒
      this.checkReminders(user.id);
    } else {
        wx.reLaunch({ url: '/pages/login/login' });
    }
  },

  // 检查任务提醒
  checkReminders(userId) {
    const tasks = storage.getTasks(userId);
    // 检查24小时内到期的任务
    reminder.checkAndShowReminder(tasks, 24, () => {
      // 跳转到任务列表页（使用 switchTab，因为都是 tabBar 页面）
      wx.switchTab({
        url: '/pages/index/index'
      });
    });
  },

  loadStats(userId) {
      const tasks = storage.getTasks(userId);
      // 统一处理：没有 status 或 status 不是 'completed' 的视为 'pending'
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const pendingTasks = tasks.filter(t => t.status === 'pending' || !t.status);
      
      // 计算逾期和即将到期的任务（只统计待办任务）
      let overdueTasks = 0;
      let dueSoonTasks = 0;
      
      pendingTasks.forEach(task => {
        const endDateTime = task.endDateTime || task.endDate;
        if (endDateTime) {
          if (util.isOverdue(endDateTime)) {
            overdueTasks++;
          } else if (util.isDueSoon(endDateTime)) {
            dueSoonTasks++;
          }
        }
      });
      
      // 计算统计数据
      const totalCount = tasks.length;
      const completedCount = completedTasks.length;
      const pendingCount = pendingTasks.length;
      
      // 计算完成率：已完成任务数 / 总任务数 * 100
      let completionRate = 0;
      if (totalCount > 0) {
        completionRate = Math.round((completedCount / totalCount) * 100);
        // 确保完成率在 0-100 之间
        completionRate = Math.max(0, Math.min(100, completionRate));
      }
      
      this.setData({
          totalTasks: totalCount,
          completedTasks: completedCount,
          pendingTasks: pendingCount,
          overdueTasks: overdueTasks,
          dueSoonTasks: dueSoonTasks,
          completionRate: completionRate
      });
  },

  toggleTheme(e) {
    const isEyeProtect = e.detail.value;
    const newTheme = isEyeProtect ? 'eye-protect' : 'light';
    
    app.globalData.theme = newTheme;
    wx.setStorageSync('theme', newTheme);
    
    this.setData({ theme: newTheme });
    
    // In a real app with tabbar, we might need to reload other pages or use a global state manager
    // Since we check onShow in other pages, it will update when we go back.
  },

  exportTasks() {
    const user = storage.getCurrentUser();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const tasks = storage.getTasks(user.id);
    if (tasks.length === 0) {
      wx.showToast({ title: '暂无任务可导出', icon: 'none' });
      return;
    }

    const text = exportUtil.exportToText(tasks);
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '任务列表已复制到剪贴板，您可以粘贴到其他应用中保存',
          showCancel: false
        });
      },
      fail: () => {
        wx.showToast({ title: '导出失败', icon: 'none' });
      }
    });
  },


  clearCompleted() {
    const user = storage.getCurrentUser();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const tasks = storage.getTasks(user.id);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    if (completedTasks.length === 0) {
      wx.showToast({ title: '没有已完成的任务', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '清理已完成任务',
      content: `确定要删除 ${completedTasks.length} 个已完成的任务吗？此操作无法撤销。`,
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#d93025',
      success: (res) => {
        if (res.confirm) {
          completedTasks.forEach(task => {
            storage.deleteTask(task.id);
          });
          
          this.loadStats(user.id);
          wx.showToast({ title: `已清理 ${completedTasks.length} 个任务`, icon: 'success', duration: 2000 });
        }
      }
    });
  },

  handleLogout() {
    storage.logout();
    app.globalData.userInfo = null;
    wx.reLaunch({
      url: '/pages/login/login'
    });
  },

  goToTemplateList() {
    wx.navigateTo({
      url: '/pages/templateList/templateList'
    });
  }
});
