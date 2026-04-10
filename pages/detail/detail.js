const storage = require('../../utils/storage');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    isEdit: false,
    taskId: null,
    title: '',
    desc: '',
    
    priorities: ['高', '中', '低'],
    priorityIndex: 1, // Default Medium
    
    types: ['工作', '个人', '学习', '其他'],
    typeIndex: 1, // Default Personal

    startDateTime: '',
    endDateTime: '',
    startDateTimeRange: [[], [], [], [], [], []],
    endDateTimeRange: [[], [], [], [], [], []],
    startDateTimeIndex: [0, 0, 0, 0, 0, 0],
    endDateTimeIndex: [0, 0, 0, 0, 0, 0],
    theme: 'light',
    timeError: '' // 时间校验错误信息
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
  },

  onLoad(options) {
    // 初始化日期时间选择器数据
    this.initDateTimePicker();

    if (options.id) {
      this.setData({ isEdit: true, taskId: options.id });
      this.loadTask(options.id);
    } else if (options.templateId) {
      this.loadTemplateData(options.templateId);
    } else {
      // 设置默认时间为当前时间
      const now = new Date();
      const startDateTime = util.formatDateTime(now);
      const endDateTime = util.formatDateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // 默认截止时间为明天
      this.setData({
        startDateTime,
        endDateTime,
        timeError: '' // 初始化时清除错误
      });
      this.updateDateTimeIndex('start', startDateTime);
      this.updateDateTimeIndex('end', endDateTime);
    }
  },

  loadTemplateData(templateId) {
    const template = storage.getTaskTemplateById(templateId);
    if (template) {
      const priorityMap = { 'high': '高', 'medium': '中', 'low': '低', '高': '高', '中': '中', '低': '低' };
      const typeMap = { 'work': '工作', 'personal': '个人', 'study': '学习', 'other': '其他', '工作': '工作', '个人': '个人', '学习': '学习', '其他': '其他' };

      const priority = priorityMap[template.priority] || '中';
      const type = typeMap[template.type] || '个人';

      // 设置默认时间为当前时间
      const now = new Date();
      const startDateTime = util.formatDateTime(now);
      const endDateTime = util.formatDateTime(new Date(now.getTime() + 24 * 60 * 60 * 1000));

      this.setData({
        title: template.title,
        desc: template.desc || '',
        priorityIndex: this.data.priorities.indexOf(priority) >= 0 ? this.data.priorities.indexOf(priority) : 1,
        typeIndex: this.data.types.indexOf(type) >= 0 ? this.data.types.indexOf(type) : 1,
        startDateTime,
        endDateTime,
        timeError: ''
      });

      this.updateDateTimeIndex('start', startDateTime);
      this.updateDateTimeIndex('end', endDateTime);
    }
  },

  // 初始化日期时间选择器
  initDateTimePicker() {
    const now = new Date();
    const years = [];
    const months = [];
    const days = [];
    const hours = [];
    const minutes = [];
    const seconds = [];

    // 生成未来10年的年份
    for (let i = 0; i < 10; i++) {
      years.push((now.getFullYear() + i).toString());
    }

    // 生成月份
    for (let i = 1; i <= 12; i++) {
      months.push(util.formatNumber(i));
    }

    // 生成日期（1-31）
    for (let i = 1; i <= 31; i++) {
      days.push(util.formatNumber(i));
    }

    // 生成小时（0-23）
    for (let i = 0; i < 24; i++) {
      hours.push(util.formatNumber(i));
    }

    // 生成分钟（0-59）
    for (let i = 0; i < 60; i++) {
      minutes.push(util.formatNumber(i));
    }

    // 生成秒（0-59）
    for (let i = 0; i < 60; i++) {
      seconds.push(util.formatNumber(i));
    }

    this.setData({
      startDateTimeRange: [years, months, days, hours, minutes, seconds],
      endDateTimeRange: [years, months, days, hours, minutes, seconds]
    });
  },

  // 更新日期时间索引
  updateDateTimeIndex(type, dateTimeStr) {
    if (!dateTimeStr) return;
    
    const dateTime = new Date(dateTimeStr.replace(/-/g, '/'));
    const year = dateTime.getFullYear().toString();
    const month = util.formatNumber(dateTime.getMonth() + 1);
    const day = util.formatNumber(dateTime.getDate());
    const hour = util.formatNumber(dateTime.getHours());
    const minute = util.formatNumber(dateTime.getMinutes());
    const second = util.formatNumber(dateTime.getSeconds());

    const years = this.data[type + 'DateTimeRange'][0];
    const months = this.data[type + 'DateTimeRange'][1];
    const days = this.data[type + 'DateTimeRange'][2];
    const hours = this.data[type + 'DateTimeRange'][3];
    const minutes = this.data[type + 'DateTimeRange'][4];
    const seconds = this.data[type + 'DateTimeRange'][5];

    const index = [
      years.indexOf(year) >= 0 ? years.indexOf(year) : 0,
      months.indexOf(month) >= 0 ? months.indexOf(month) : 0,
      days.indexOf(day) >= 0 ? days.indexOf(day) : 0,
      hours.indexOf(hour) >= 0 ? hours.indexOf(hour) : 0,
      minutes.indexOf(minute) >= 0 ? minutes.indexOf(minute) : 0,
      seconds.indexOf(second) >= 0 ? seconds.indexOf(second) : 0
    ];

    this.setData({
      [type + 'DateTimeIndex']: index
    });
  },

  loadTask(id) {
    const task = storage.getTaskById(id);
    if (task) {
      // 兼容旧数据（英文）和新数据（中文）
      const priorityMap = { 'High': '高', 'Medium': '中', 'Low': '低', '高': '高', '中': '中', '低': '低' };
      const typeMap = { 'Work': '工作', 'Personal': '个人', 'Study': '学习', 'Others': '其他', '工作': '工作', '个人': '个人', '学习': '学习', '其他': '其他' };
      
      const priority = priorityMap[task.priority] || '中';
      const type = typeMap[task.type] || '个人';
      
      // 处理日期时间：如果是旧数据只有日期，补充默认时间
      let startDateTime = task.startDateTime || task.startDate;
      let endDateTime = task.endDateTime || task.endDate;
      
      if (startDateTime && !startDateTime.includes(':')) {
        startDateTime = startDateTime + ' 00:00:00';
      }
      if (endDateTime && !endDateTime.includes(':')) {
        endDateTime = endDateTime + ' 23:59:59';
      }
      
      // 校验加载的任务时间是否有效
      let timeError = '';
      if (startDateTime && endDateTime && !util.compareDateTime(startDateTime, endDateTime)) {
        timeError = '结束时间必须大于开始时间';
      }
      
      this.setData({
        title: task.title,
        desc: task.desc,
        priorityIndex: this.data.priorities.indexOf(priority) >= 0 ? this.data.priorities.indexOf(priority) : 1,
        typeIndex: this.data.types.indexOf(type) >= 0 ? this.data.types.indexOf(type) : 1,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        timeError: timeError
      });
      
      this.updateDateTimeIndex('start', startDateTime);
      this.updateDateTimeIndex('end', endDateTime);
    }
  },

  bindPriorityChange(e) {
    this.setData({ priorityIndex: e.detail.value });
  },

  bindTypeChange(e) {
    this.setData({ typeIndex: e.detail.value });
  },

  bindStartDateTimeChange(e) {
    const index = e.detail.value;
    const ranges = this.data.startDateTimeRange;
    const year = ranges[0][index[0]];
    const month = ranges[1][index[1]];
    const day = ranges[2][index[2]];
    const hour = ranges[3][index[3]];
    const minute = ranges[4][index[4]];
    const second = ranges[5][index[5]];
    
    const dateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    
    // 校验结束时间是否大于开始时间
    let timeError = '';
    if (this.data.endDateTime && !util.compareDateTime(dateTime, this.data.endDateTime)) {
      timeError = '开始时间不能大于结束时间';
    }
    
    this.setData({
      startDateTime: dateTime,
      startDateTimeIndex: index,
      timeError: timeError
    });
  },

  bindEndDateTimeChange(e) {
    const index = e.detail.value;
    const ranges = this.data.endDateTimeRange;
    const year = ranges[0][index[0]];
    const month = ranges[1][index[1]];
    const day = ranges[2][index[2]];
    const hour = ranges[3][index[3]];
    const minute = ranges[4][index[4]];
    const second = ranges[5][index[5]];
    
    const dateTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    
    // 校验结束时间是否大于开始时间
    let timeError = '';
    if (this.data.startDateTime && !util.compareDateTime(this.data.startDateTime, dateTime)) {
      timeError = '结束时间必须大于开始时间';
    }
    
    this.setData({
      endDateTime: dateTime,
      endDateTimeIndex: index,
      timeError: timeError
    });
  },

  saveTask() {
    const { title, desc, priorityIndex, priorities, typeIndex, types, startDateTime, endDateTime, isEdit, taskId } = this.data;
    const currentUser = app.globalData.userInfo || storage.getCurrentUser();

    if (!currentUser) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }

    if (!title) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }

    if (!startDateTime || !endDateTime) {
      wx.showToast({ title: '请选择开始和截止时间', icon: 'none' });
      return;
    }

    // 校验结束时间必须大于开始时间
    if (!util.compareDateTime(startDateTime, endDateTime)) {
      wx.showToast({ title: '结束时间必须大于开始时间', icon: 'none', duration: 2000 });
      this.setData({ timeError: '结束时间必须大于开始时间' });
      return;
    }

    const taskData = {
      title,
      desc,
      priority: priorities[priorityIndex],
      type: types[typeIndex],
      startDateTime,
      endDateTime,
      startDate: util.formatDateOnly(startDateTime), // 兼容旧字段
      endDate: util.formatDateOnly(endDateTime), // 兼容旧字段
      userId: currentUser.id
    };

    // 清除错误信息
    this.setData({ timeError: '' });

    if (isEdit) {
      storage.updateTask(taskId, taskData);
      wx.showToast({ title: '更新成功', icon: 'success' });
    } else {
      storage.addTask(taskData);
      wx.showToast({ title: '创建成功', icon: 'success' });
    }

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  deleteTask() {
      const { taskId } = this.data;
      wx.showModal({
          title: '删除任务？',
          content: '确定要删除吗？',
          success: (res) => {
              if (res.confirm) {
                  storage.deleteTask(taskId);
                  wx.navigateBack();
              }
          }
      })
  }
});
