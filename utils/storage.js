// Mock Database Service using LocalStorage

const crypto = require('./crypto');

const USERS_KEY = 'users';
const TASKS_KEY = 'tasks';
const TEMPLATES_KEY = 'taskTemplates';

// --- User Service ---

const register = (username, password) => {
  const users = wx.getStorageSync(USERS_KEY) || [];
  if (users.find(u => u.username === username)) {
    return { success: false, message: '用户名已存在' };
  }
  // 使用哈希存储密码（不可逆）
  const passwordHash = crypto.hashPassword(password);
  const newUser = { 
    username, 
    password: passwordHash, // 存储哈希值而不是明文
    id: Date.now() 
  };
  users.push(newUser);
  wx.setStorageSync(USERS_KEY, users);
  // 返回用户信息时不包含密码
  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
};

const login = (username, password) => {
  const users = wx.getStorageSync(USERS_KEY) || [];
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return { success: false, message: '用户名或密码错误' };
  }
  
  // 兼容旧数据（未加密的密码）
  let passwordMatch = false;
  if (crypto.verifyPassword(password, user.password)) {
    // 新密码（哈希）
    passwordMatch = true;
  } else if (user.password === password) {
    // 旧密码（明文），迁移为哈希
    passwordMatch = true;
    user.password = crypto.hashPassword(password);
    wx.setStorageSync(USERS_KEY, users);
  }
  
  if (passwordMatch) {
    const { password: _, ...userWithoutPassword } = user;
    wx.setStorageSync('currentUser', userWithoutPassword);
    return { success: true, user: userWithoutPassword };
  }
  
  return { success: false, message: '用户名或密码错误' };
};

const logout = () => {
  wx.removeStorageSync('currentUser');
};

const getCurrentUser = () => {
  return wx.getStorageSync('currentUser');
};

// --- Task Service ---

const getTasks = (userId, filters = {}) => {
  const tasks = wx.getStorageSync(TASKS_KEY) || [];
  let userTasks = tasks.filter(t => t.userId === userId);

  // Apply filters
  if (filters.status) {
    userTasks = userTasks.filter(t => t.status === filters.status);
  }
  if (filters.search) {
    const lowerSearch = filters.search.toLowerCase();
    userTasks = userTasks.filter(t => t.title.toLowerCase().includes(lowerSearch) || t.desc.toLowerCase().includes(lowerSearch));
  }
  // Sort by created date desc
  return userTasks.sort((a, b) => b.createdAt - a.createdAt);
};

const getTaskById = (taskId) => {
    const tasks = wx.getStorageSync(TASKS_KEY) || [];
    const idStr = String(taskId);
    return tasks.find(t => String(t.id) === idStr);
}

const addTask = (task) => {
  const tasks = wx.getStorageSync(TASKS_KEY) || [];
  const newTask = {
    ...task,
    id: Date.now().toString(),
    createdAt: Date.now(),
    status: 'pending' // pending, completed
  };
  tasks.push(newTask);
  wx.setStorageSync(TASKS_KEY, tasks);
  return newTask;
};

const updateTask = (taskId, updates) => {
  let tasks = wx.getStorageSync(TASKS_KEY) || [];
  // 确保ID类型一致（都转为字符串进行比较）
  const idStr = String(taskId);
  const index = tasks.findIndex(t => String(t.id) === idStr);
  if (index > -1) {
    tasks[index] = { ...tasks[index], ...updates };
    wx.setStorageSync(TASKS_KEY, tasks);
    return true;
  }
  return false;
};

const deleteTask = (taskId) => {
  let tasks = wx.getStorageSync(TASKS_KEY) || [];
  const idStr = String(taskId);
  const newTasks = tasks.filter(t => String(t.id) !== idStr);
  wx.setStorageSync(TASKS_KEY, newTasks);
};

// --- Task Template Service ---

const getTemplates = (userId) => {
  const templates = wx.getStorageSync(TEMPLATES_KEY) || [];
  return templates.filter(t => t.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};

const getTemplateById = (templateId) => {
  const templates = wx.getStorageSync(TEMPLATES_KEY) || [];
  const idStr = String(templateId);
  return templates.find(t => String(t.id) === idStr);
};

const addTemplate = (template) => {
  const templates = wx.getStorageSync(TEMPLATES_KEY) || [];
  const newTemplate = {
    ...template,
    id: Date.now().toString(),
    createdAt: Date.now()
  };
  templates.push(newTemplate);
  wx.setStorageSync(TEMPLATES_KEY, templates);
  return newTemplate;
};

const updateTemplate = (templateId, updates) => {
  let templates = wx.getStorageSync(TEMPLATES_KEY) || [];
  const idStr = String(templateId);
  const index = templates.findIndex(t => String(t.id) === idStr);
  if (index > -1) {
    templates[index] = { ...templates[index], ...updates };
    wx.setStorageSync(TEMPLATES_KEY, templates);
    return true;
  }
  return false;
};

const deleteTemplate = (templateId) => {
  let templates = wx.getStorageSync(TEMPLATES_KEY) || [];
  const idStr = String(templateId);
  const newTemplates = templates.filter(t => String(t.id) !== idStr);
  wx.setStorageSync(TEMPLATES_KEY, newTemplates);
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask,
  getTemplates,
  getTemplateById,
  addTemplate,
  updateTemplate,
  deleteTemplate
};
