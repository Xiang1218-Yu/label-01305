// 格式化数字，补零
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${[year, month, day].map(formatNumber).join('-')}`
}

const formatDateTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDateOnly = date => {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.split(' ')[0];
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${[year, month, day].map(formatNumber).join('-')}`;
}

const formatTimeOnly = date => {
  if (typeof date === 'string') {
    const parts = date.split(' ');
    if (parts.length > 1) {
      const timeParts = parts[1].split(':');
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return '';
  }
  const hour = date.getHours();
  const minute = date.getMinutes();
  return `${formatNumber(hour)}:${formatNumber(minute)}`;
}

// 判断任务是否逾期
const isOverdue = (endDateTime) => {
  if (!endDateTime) return false;
  const end = new Date(endDateTime.replace(/-/g, '/'));
  const now = new Date();
  return end < now;
}

// 判断任务是否即将到期（24小时内）
const isDueSoon = (endDateTime) => {
  if (!endDateTime) return false;
  const end = new Date(endDateTime.replace(/-/g, '/'));
  const now = new Date();
  const diff = end - now;
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

// 比较两个日期时间，返回 endDateTime 是否大于 startDateTime
const compareDateTime = (startDateTime, endDateTime) => {
  if (!startDateTime || !endDateTime) return true; // 如果任一为空，不校验
  const start = new Date(startDateTime.replace(/-/g, '/'));
  const end = new Date(endDateTime.replace(/-/g, '/'));
  return end > start;
}

module.exports = {
  formatTime,
  formatDate,
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  isOverdue,
  isDueSoon,
  formatNumber,
  compareDateTime
}
