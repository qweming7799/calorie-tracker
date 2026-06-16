# 🍽️ 卡路里追踪器 (Calorie Tracker)

一个基于 Flask 的Web应用，帮助你记录和管理每日卡路里摄入。

## ✨ 功能特性

- 📝 **添加记录** - 记录每餐的卡路里摄入（早餐、午餐、晚餐、加餐、夜宵）
- 📊 **历史记录** - 查看所有历史记录，支持按日期筛选
- 📈 **统计分析** - 可视化图表展示每日趋势和餐次分布
- 🎯 **数据概览** - 首页快速查看总记录数、日均卡路里等统计信息
- 📱 **响应式设计** - 完美支持手机和电脑访问
- 🎨 **精美界面** - 渐变背景、动画效果、卡片式布局

## 🚀 快速开始

### 前置要求

- Python 3.7+
- pip (Python包管理器)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/你的用户名/calorie-tracker.git
cd calorie-tracker
```

2. 安装依赖
```bash
pip install flask
```

3. 运行应用
```bash
python calorie.py
```

4. 在浏览器中访问
```
http://localhost:5000
```

## 📁 项目结构

```
ka/
├── calorie.py          # Flask后端主程序
├── templates/
│   └── index.html      # 前端页面
├── static/
│   ├── style.css       # 样式文件
│   └── script.js       # 前端交互逻辑
├── .gitignore          # Git忽略文件配置
└── README.md           # 项目说明文档
```

## 🎯 使用说明

### 首页
- 查看统计数据概览（总记录数、日均卡路里、最高日摄入、记录天数）
- 查看最近3条记录
- 快速导航到其他页面

### 添加记录
1. 点击导航栏"添加记录"或首页"开始记录"按钮
2. 选择日期
3. 选择餐次（早餐/午餐/晚餐/加餐/夜宵）
4. 输入卡路里数值
5. 点击"保存记录"

### 历史记录
- 查看所有记录的完整列表
- 使用日期筛选器查找特定日期的记录
- 点击删除按钮移除不需要的记录

### 统计分析
- 查看总体统计数据
- 每日趋势折线图（最近7天）
- 餐次分布饼图

## 🛠️ 技术栈

- **后端**: Flask (Python Web框架)
- **前端**: HTML5, CSS3, JavaScript
- **图表**: Chart.js
- **图标**: Font Awesome
- **数据存储**: JSON文件

## 📸 界面预览

### 首页
![首页](screenshots/home.png)

### 添加记录
![添加记录](screenshots/add.png)

### 历史记录
![历史记录](screenshots/history.png)

### 统计分析
![统计分析](screenshots/stats.png)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

李韶明 - 合肥工业大学 电子科学与技术专业

## 🙏 致谢

- [Flask](https://flask.palletsprojects.com/)
- [Chart.js](https://www.chartjs.org/)
- [Font Awesome](https://fontawesome.com/)

---

⭐ 如果这个项目对你有帮助，请给个星！
