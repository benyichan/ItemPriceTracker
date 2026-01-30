# 物品单价追踪应用 (ItemPriceTracker)

一个功能强大的物品单价追踪移动应用，支持 Android 平台，帮助用户记录、分析和比较物品的单价，实现更明智的消费决策。

## 功能特点

### 核心功能
- 📝 记录物品购买信息（名称、价格、数量、购买日期等）
- 💰 智能计算物品单价（支持按使用次数或使用期限计算）
- 📊 统计分析功能（总成本、物品总数、平均单价等）
- 🎨 主题颜色切换（多种预设主题颜色，支持深色/浅色模式）--调试中
- 💾 数据备份和恢复（本地存储，数据安全可靠）-调试中

### 高级功能
- 📅 即将到期物品提醒
- 📈 月度消费对比分析
- 🔍 物品搜索和筛选
- 📱 响应式设计，适配不同屏幕尺寸
- 🎯 直观的用户界面和流畅的动画效果

## 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **样式**: Tailwind CSS v3
- **动画**: Framer Motion
- **图表**: Recharts
- **UI 组件**: Radix UI
- **状态管理**: React Hooks

### 后端/存储
- **本地存储**: IndexedDB
- **构建工具**: Vite

### 移动平台
- **跨平台框架**: Capacitor 8
- **原生集成**: Android

### 开发工具
- **代码质量**: ESLint
- **类型检查**: TypeScript
- **版本控制**: Git

## 如何运行

### 开发环境

1. **克隆仓库**
   ```bash
   git clone https://github.com/benyichan/ItemPriceTracker.git
   cd ItemPriceTracker
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **在浏览器中访问**
   服务器启动后，会在终端显示访问 URL，通常是 `http://localhost:5173/`

### 构建和打包

1. **构建项目**
   ```bash
   npm run build
   ```

2. **同步到 Android 平台**
   ```bash
   npx cap sync android
   ```

3. **在 Android Studio 中打开并构建 APK**
   ```bash
   npx cap open android
   ```

4. **运行 Android 应用**
   在 Android Studio 中，点击 "Run" 按钮或使用快捷键 `Shift+F10` 运行应用

## 项目结构

```
├── android/            # Android 平台代码
├── dist/               # 构建输出目录
├── src/                # 源代码
│   ├── components/     # UI 组件
│   ├── hooks/          # 自定义 Hooks
│   ├── lib/            # 工具库
│   ├── sections/       # 页面组件
│   ├── types/          # TypeScript 类型定义
│   ├── App.tsx         # 应用主组件
│   └── main.tsx        # 应用入口
├── .gitignore          # Git 忽略文件
├── capacitor.config.ts # Capacitor 配置
├── package.json        # 项目配置和依赖
├── README.md           # 项目文档
└── LICENSE             # 开源许可证
```

## 许可证

本项目采用 **MIT 许可证** - 详见 [LICENSE](LICENSE) 文件

## 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

### 贡献步骤
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 代码规范
- 遵循 TypeScript 编码规范
- 使用 ESLint 检查代码质量
- 确保所有测试通过
- 保持代码风格一致

## 联系方式

如果您有任何问题或建议，请通过以下方式联系：

- GitHub Issues: [项目 Issues 页面](https://github.com/benyichan/ItemPriceTracker/issues)

---

**感谢使用物品单价追踪应用！** 🎉

希望这个应用能够帮助您更好地管理个人消费，做出更明智的购买决策。
