// 任务导出工具

const formatDate = (dateStr) => {
  if (!dateStr) return '未设置';
  return dateStr;
};

const formatTask = (task, index) => {
  const status = task.status === 'completed' ? '✓ 已完成' : '○ 待办';
  const priority = task.priority || '未设置';
  const type = task.type || '未设置';
  const startDate = formatDate(task.startDateTime || task.startDate);
  const endDate = formatDate(task.endDateTime || task.endDate);
  const desc = task.desc ? `\n  描述：${task.desc}` : '';
  
  return `${index}. ${task.title} [${status}]
  优先级：${priority} | 类型：${type}
  开始：${startDate} | 截止：${endDate}${desc}
`;
};

// 导出为文本格式
const exportToText = (tasks) => {
  const now = new Date();
  const dateStr = now.getFullYear() + '-' + 
                  String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(now.getDate()).padStart(2, '0');
  
  let text = `任务列表导出\n`;
  text += `导出时间：${dateStr} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}\n`;
  text += `总任务数：${tasks.length}\n`;
  text += `已完成：${tasks.filter(t => t.status === 'completed').length}\n`;
  text += `待办：${tasks.filter(t => t.status === 'pending').length}\n`;
  text += `\n${'='.repeat(40)}\n\n`;
  
  if (tasks.length === 0) {
    text += '暂无任务\n';
  } else {
    tasks.forEach((task, index) => {
      text += formatTask(task, index + 1);
      text += '\n';
    });
  }
  
  return text;
};

module.exports = {
  exportToText
};
