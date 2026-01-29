// Mock Database Service using LocalStorage

const USERS_KEY = 'users';
const TASKS_KEY = 'tasks';

// --- User Service ---

const register = (username, password) => {
  const users = wx.getStorageSync(USERS_KEY) || [];
  if (users.find(u => u.username === username)) {
    return { success: false, message: '用户名已存在' };
  }
  const newUser = { username, password, id: Date.now() };
  users.push(newUser);
  wx.setStorageSync(USERS_KEY, users);
  return { success: true, user: newUser };
};

const login = (username, password) => {
  const users = wx.getStorageSync(USERS_KEY) || [];
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    wx.setStorageSync('currentUser', user);
    return { success: true, user };
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
    return tasks.find(t => t.id === taskId);
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
  const index = tasks.findIndex(t => t.id === taskId);
  if (index > -1) {
    tasks[index] = { ...tasks[index], ...updates };
    wx.setStorageSync(TASKS_KEY, tasks);
    return true;
  }
  return false;
};

const deleteTask = (taskId) => {
  let tasks = wx.getStorageSync(TASKS_KEY) || [];
  const newTasks = tasks.filter(t => t.id !== taskId);
  wx.setStorageSync(TASKS_KEY, newTasks);
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
  deleteTask
};
