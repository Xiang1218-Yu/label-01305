const storage = require('../../utils/storage');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    tasks: [],
    filterStatus: 'all', // all, pending, completed
    filterType: 'all', // all, 工作, 个人, 学习, 其他
    sortType: 'time', // time, priority, status
    sortOptions: ['按时间', '按优先级', '按状态'],
    sortIndex: 0, // 对应 sortOptions 的索引
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
    this.initSortIndex();
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

  // 初始化排序索引
  initSortIndex() {
    const sortTypeMap = { 'time': 0, 'priority': 1, 'status': 2 };
    const sortIndex = sortTypeMap[this.data.sortType] || 0;
    this.setData({ sortIndex });
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

    // 获取所有任务用于统计
    const allTasks = storage.getTasks(this.data.userInfo.id, {});
    
    // 计算统计数据
    const stats = {
      pending: allTasks.filter(t => t.status !== 'completed').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      overdue: allTasks.filter(t => {
        const endDateTime = t.endDateTime || t.endDate;
        return t.status !== 'completed' && util.isOverdue(endDateTime);
      }).length
    };
    this.setData({ stats });

    let tasks = storage.getTasks(this.data.userInfo.id, filters);
    
    // 应用类型筛选
    if (this.data.filterType !== 'all') {
      tasks = tasks.filter(task => task.type === this.data.filterType);
    }
    
    // 添加逾期和即将到期标记
    tasks = tasks.map(task => {
      const endDateTime = task.endDateTime || task.endDate;
      return {
        ...task,
        isOverdue: util.isOverdue(endDateTime),
        isDueSoon: util.isDueSoon(endDateTime)
      };
    });
    
    // 应用排序
    tasks = this.applySort(tasks);
    
    this.setData({ tasks });
  },

  // 应用排序
  applySort(tasks) {
    const sortType = this.data.sortType || 'time'; // time, priority, status
    
    switch(sortType) {
      case 'priority':
        const priorityOrder = { '高': 3, '中': 2, '低': 1, 'High': 3, 'Medium': 2, 'Low': 1 };
        return tasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
      case 'status':
        return tasks.sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return 1;
          if (a.status !== 'completed' && b.status === 'completed') return -1;
          return 0;
        });
      case 'time':
      default:
        return tasks.sort((a, b) => {
          const aTime = new Date((a.endDateTime || a.endDate).replace(/-/g, '/')).getTime();
          const bTime = new Date((b.endDateTime || b.endDate).replace(/-/g, '/')).getTime();
          return aTime - bTime;
        });
    }
  },

  setFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ filterStatus: status }, () => {
      this.loadTasks();
    });
  },

  showTypeFilter() {
    const types = ['all', '工作', '个人', '学习', '其他'];
    wx.showActionSheet({
      itemList: ['全部', '工作', '个人', '学习', '其他'],
      success: (res) => {
        this.setData({ filterType: types[res.tapIndex] }, () => {
          this.loadTasks();
        });
      }
    });
  },

  bindSortChange(e) {
    const index = e.detail.value;
    const sortTypeMap = ['time', 'priority', 'status'];
    const sortType = sortTypeMap[index];
    
    this.setData({ 
      sortIndex: index,
      sortType: sortType 
    }, () => {
      this.loadTasks();
    });
  },

  handleSearchInput(e) {
      this.setData({ searchQuery: e.detail.value });
      this.loadTasks(); // Realtime search or wait for confirm
  },

  handleSearch(e) {
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
    const task = this.data.tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    storage.updateTask(id, { status: newStatus });
    
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
