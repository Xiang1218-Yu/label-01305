// 简单的密码加密工具
// 使用哈希算法存储密码（不可逆，更安全）

/**
 * 哈希密码（用于存储，不可逆）
 * @param {string} password - 原始密码
 * @returns {string} 哈希后的密码
 */
const hashPassword = (password) => {
  if (!password) return '';
  
  // 简单的哈希算法（实际生产环境应使用更安全的算法如bcrypt）
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 转换为正数并添加盐值
  const salt = 'tasknotepad2024';
  const hashStr = Math.abs(hash).toString(36);
  return hashStr + salt.substring(0, 8);
};

/**
 * 验证密码
 * @param {string} password - 输入的密码
 * @param {string} storedHash - 存储的哈希值
 * @returns {boolean} 密码是否匹配
 */
const verifyPassword = (password, storedHash) => {
  if (!password || !storedHash) return false;
  const passwordHash = hashPassword(password);
  return passwordHash === storedHash;
};

module.exports = {
  hashPassword,
  verifyPassword
};
