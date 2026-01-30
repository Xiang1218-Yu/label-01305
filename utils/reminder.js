// 任务提醒工具

const util = require('./util');

/**
 * 检查任务是否需要提醒
 * @param {string} endDateTime - 任务截止时间
 * @param {number} hoursBefore - 提前多少小时提醒（默认24小时）
 * @returns {boolean} 是否需要提醒
 */
const shouldRemind = (endDateTime, hoursBefore = 24) => {
  if (!endDateTime) return false;
  
  const now = new Date();
  const endTime = new Date(endDateTime.replace(/-/g, '/'));
  const diffMs = endTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // 如果任务已过期，不提醒
  if (diffHours < 0) return false;
  
  // 如果任务在指定小时内到期，需要提醒
  return diffHours <= hoursBefore && diffHours > 0;
};

/**
 * 获取需要提醒的任务列表
 * @param {Array} tasks - 所有任务
 * @param {number} hoursBefore - 提前多少小时提醒
 * @returns {Array} 需要提醒的任务列表
 */
const getTasksToRemind = (tasks, hoursBefore = 24) => {
  return tasks.filter(task => {
    // 只提醒未完成的任务
    if (task.status === 'completed') return false;
    
    const endDateTime = task.endDateTime || task.endDate;
    return shouldRemind(endDateTime, hoursBefore);
  });
};

/**
 * 显示任务提醒通知
 * @param {Array} tasks - 需要提醒的任务列表
 * @param {Function} onConfirm - 确认回调函数
 */
const showReminder = (tasks, onConfirm) => {
  if (tasks.length === 0) return;
  
  const taskTitles = tasks.slice(0, 3).map(t => t.title).join('、');
  const moreText = tasks.length > 3 ? `等${tasks.length}个任务` : '';
  
  wx.showModal({
    title: '任务提醒',
    content: `${taskTitles}${moreText}即将到期，请及时处理！`,
    showCancel: true,
    confirmText: '查看',
    cancelText: '稍后',
    success: (res) => {
      if (res.confirm && onConfirm) {
        onConfirm();
      }
    }
  });
};

/**
 * 检查并显示任务提醒
 * @param {Array} tasks - 所有任务
 * @param {number} hoursBefore - 提前多少小时提醒
 * @param {Function} onConfirm - 确认回调函数（可选）
 */
const checkAndShowReminder = (tasks, hoursBefore = 24, onConfirm) => {
  const tasksToRemind = getTasksToRemind(tasks, hoursBefore);
  if (tasksToRemind.length > 0) {
    showReminder(tasksToRemind, onConfirm);
  }
};

module.exports = {
  shouldRemind,
  getTasksToRemind,
  showReminder,
  checkAndShowReminder
};
