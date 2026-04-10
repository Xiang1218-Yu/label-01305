const storage = require('../../utils/storage');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    templateId: null,
    template: null,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    theme: 'light',
    timeError: ''
  },

  onShow() {
    this.setData({ theme: app.globalData.theme });
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ templateId: options.id });
      this.loadTemplate(options.id);
      this.initDefaultTime();
    }
  },

  loadTemplate(id) {
    const template = storage.getTemplateById(id);
    if (template) {
      this.setData({ template });
    } else {
      wx.showToast({ title: '模板不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  initDefaultTime() {
    const now = new Date();
    const startDate = util.formatDateOnly(now);
    const startTime = util.formatTimeOnly(now);
    this.setData({
      startDate,
      startTime,
      endDate: startDate,
      endTime: this.calculateEndTime(startTime, 1)
    });
  },

  calculateEndTime(startTimeStr, durationHours) {
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${util.formatNumber(endHours)}:${util.formatNumber(endMinutes)}`;
  },

  bindStartDateChange(e) {
    const startDate = e.detail.value;
    this.setData({ startDate });
    this.validateAndUpdateEndTime(startDate, this.data.startTime);
  },

  bindStartTimeChange(e) {
    const startTime = e.detail.value;
    this.setData({ startTime });
    this.validateAndUpdateEndTime(this.data.startDate, startTime);
  },

  bindEndDateChange(e) {
    const endDate = e.detail.value;
    this.setData({ endDate });
    this.validateTime(this.data.startDate, this.data.startTime, endDate, this.data.endTime);
  },

  bindEndTimeChange(e) {
    const endTime = e.detail.value;
    this.setData({ endTime });
    this.validateTime(this.data.startDate, this.data.startTime, this.data.endDate, endTime);
  },

  validateAndUpdateEndTime(startDate, startTime) {
    const template = this.data.template;
    if (template && template.defaultDuration) {
      const endTime = this.calculateEndTime(startTime, template.defaultDuration);
      this.setData({ endTime });
    }
    this.validateTime(startDate, startTime, this.data.endDate, this.data.endTime);
  },

  validateTime(startDate, startTime, endDate, endTime) {
    const startDateTime = `${startDate} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;
    let timeError = '';
    if (!util.compareDateTime(startDateTime, endDateTime)) {
      timeError = '结束时间必须大于开始时间';
    }
    this.setData({ timeError });
    return !timeError;
  },

  createTask() {
    const { template, startDate, startTime, endDate, endTime } = this.data;
    const currentUser = app.globalData.userInfo || storage.getCurrentUser();

    if (!currentUser) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const startDateTime = `${startDate} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;

    if (!this.validateTime(startDate, startTime, endDate, endTime)) {
      wx.showToast({ title: '结束时间必须大于开始时间', icon: 'none' });
      return;
    }

    const taskData = {
      title: template.name,
      desc: template.desc,
      priority: template.priority,
      type: template.type,
      startDateTime,
      endDateTime,
      startDate: util.formatDateOnly(new Date(startDateTime.replace(/-/g, '/'))),
      endDate: util.formatDateOnly(new Date(endDateTime.replace(/-/g, '/'))),
      userId: currentUser.id
    };

    storage.addTask(taskData);
    wx.showToast({ title: '任务创建成功', icon: 'success' });

    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 1000);
  }
});
