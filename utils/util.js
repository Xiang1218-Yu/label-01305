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

const formatDateOnly = dateStr => {
  if (!dateStr) return '';
  return dateStr.split(' ')[0];
}

const formatTimeOnly = dateStr => {
  if (!dateStr) return '';
  const parts = dateStr.split(' ');
  return parts.length > 1 ? parts[1] : '';
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

module.exports = {
  formatTime,
  formatDate,
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  isOverdue,
  isDueSoon,
  formatNumber
}
