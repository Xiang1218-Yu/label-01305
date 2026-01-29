# 个人任务记事本（微信小程序）

## 1 How to Run

1. 打开 **微信开发者工具**。
2. 点击 **导入项目**。
3. 选择项目目录
4. AppID 可以选择测试号或使用您自己的 AppID。
5. 点击 **编译** 按钮运行模拟器。

## 2 Services

本项目使用 **本地存储**（`wx.setStorageSync` / `wx.getStorageSync`）来模拟后端数据库。无需外部服务器或云开发环境。

包含的服务：
- **认证服务**：本地管理用户注册和登录。
- **任务服务**：任务的增删改查操作（Create, Read, Update, Delete）。
- **主题服务**：在默认模式和护眼模式（暖色调）之间切换。

## 3 测试账号

系统使用本地存储，您可以注册任意账号。为了方便测试，可以使用：

- **用户名**：`admin`
- **密码**：`123456`

（注意：首次使用时，系统会自动创建该账号，您可以直接使用此账号登录）。

## 4 题目内容
基于微信小程序的个人任务记事本的设计与实现，功能实现要求有注册登录，护眼模式，任务开始截止日期，任务优先级，任务类型，另外再多加几个功能，不使用云开发

基于微信小程序的个人任务记事本的设计与实现。

**功能列表：**
- **注册登录**：用户账户管理，支持注册新账号和登录。
- **护眼模式**：在个人中心可以切换应用主题颜色（默认模式/护眼模式）。
- **任务管理**：
    - 开始日期和截止日期设置（支持时分秒）
    - 任务优先级（高、中、低）
    - 任务类型（工作、个人、学习、其他）
    - 任务搜索功能
    - 任务完成状态切换
    - 任务删除功能
    - 任务排序（按时间、优先级、状态）
    - 任务筛选（按状态、类型）
    - 任务统计（总数、已完成、待办、逾期、即将到期）
- **任务导出**：
    - 导出任务列表为文本格式
    - 复制到剪贴板，方便备份和分享
- **任务完成率统计**：
    - 显示任务完成率百分比
    - 可视化进度条展示
    - 实时更新统计数据
- **清理已完成任务**：
    - 一键清理所有已完成的任务
    - 释放存储空间
- **UI/UX**：
    - 卡片式设计，通过阴影区分功能区
    - Flex/Grid 布局，统一间距（8px/16px/24px）
    - 交互反馈（Toast 提示、Loading 状态）
    - 按钮悬停效果和加载状态
    - 操作成功/失败提示

---

## 项目结构

```
├── pages/          # 页面文件
│   ├── login/      # 登录注册页面
│   ├── index/      # 任务列表页面
│   ├── detail/     # 任务详情/编辑页面
│   └── profile/    # 个人中心页面
├── assets/         # 资源文件
│   └── tabbar/     # Tab栏图标
│       ├── tasks.png          # 任务页图标（未选中）
│       ├── tasks-active.png   # 任务页图标（选中）
│       ├── profile.png         # 个人中心图标（未选中）
│       └── profile-active.png # 个人中心图标（选中）
├── utils/          # 工具函数
│   ├── storage.js  # 本地存储服务（模拟数据库）
│   └── util.js     # 日期格式化等工具函数
├── app.js          # 全局逻辑
├── app.json        # 全局配置
└── app.wxss        # 全局样式
```

## 修改 TabBar 图标

### 方法一：使用项目提供的 SVG 图标转换为 PNG（推荐）

项目已包含 SVG 格式的图标源文件，需要转换为 PNG 格式：

1. **SVG 文件位置**
   - `assets/tabbar/tasks.svg` - 任务页未选中图标（SVG）
   - `assets/tabbar/tasks-active.svg` - 任务页选中图标（SVG）
   - `assets/tabbar/profile.svg` - 个人中心未选中图标（SVG）
   - `assets/tabbar/profile-active.svg` - 个人中心选中图标（SVG）

2. **快速转换方法**

   **方法 A：使用在线工具（最简单）**
   - 访问：https://svgtopng.com/
   - 上传 SVG 文件，设置尺寸为 **81 × 81** 像素
   - 下载 PNG 文件并替换到 `assets/tabbar/` 目录

   **方法 B：使用转换脚本（自动化）**
   ```bash
   # macOS/Linux
   cd assets/tabbar
   chmod +x convert-icons.sh
   ./convert-icons.sh
   
   # Windows
   cd assets/tabbar
   convert-icons.bat
   ```
   > 注意：需要先安装 Inkscape（https://inkscape.org/）

   **方法 C：使用 Inkscape 命令行**
   ```bash
   cd assets/tabbar
   inkscape tasks.svg --export-filename=tasks.png --export-width=81 --export-height=81
   inkscape tasks-active.svg --export-filename=tasks-active.png --export-width=81 --export-height=81
   inkscape profile.svg --export-filename=profile.png --export-width=81 --export-height=81
   inkscape profile-active.svg --export-filename=profile-active.png --export-width=81 --export-height=81
   ```

3. **详细转换指南**
   - 查看：`assets/tabbar/转换PNG图标.md`

4. **重新编译**
   - 在微信开发者工具中点击"编译"，新图标会自动生效

### 方法二：替换现有图标文件

1. **准备图标文件**
   - 图标尺寸：**81px × 81px**（推荐）
   - 格式：PNG（支持透明背景）
   - 未选中状态：灰色 (#999999)
   - 选中状态：主题蓝色 (#0052d9)

2. **替换文件**
   - 将新图标文件替换到 `assets/tabbar/` 目录下

3. **重新编译**
   - 在微信开发者工具中点击"编译"，新图标会自动生效

### 方法三：修改图标路径

如果需要使用其他位置的图标，修改 `app.json` 中的 `iconPath` 和 `selectedIconPath` 配置。

### 方法四：仅使用文字（无图标）

如果暂时没有图标，可以移除 `app.json` 中的 `iconPath` 和 `selectedIconPath` 配置，仅显示文字标签。

### 图标设计说明

项目已提供 SVG 格式的图标源文件：

**任务图标**：
- 设计元素：任务列表 + 复选框
- 未选中：灰色线条绘制列表项和复选框
- 选中：蓝色填充列表项，复选框带选中标记（✓）

**个人中心图标**：
- 设计元素：圆形头像 + 人形轮廓
- 未选中：灰色线条绘制头像轮廓
- 选中：蓝色填充头像，白色人形轮廓

详细设计指南请参考：`assets/tabbar/图标设计指南.md`

### 注意事项

- 图标文件路径必须使用**相对路径**，从项目根目录开始
- 图标文件大小建议控制在 **40KB** 以内
- 图标建议使用 **PNG 格式**，支持透明背景
- SVG 转 PNG 时确保尺寸为 **81px × 81px**
- 修改后需要**重新编译**才能看到效果
