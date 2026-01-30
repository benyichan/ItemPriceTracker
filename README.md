# 物品单价追踪应用

一个用于追踪物品单价的移动应用，支持 Android 平台。

## 功能特点

- 记录物品购买信息
- 计算物品单价
- 统计分析功能
- 主题颜色切换
- 数据备份和恢复

## 技术栈

- React + TypeScript
- Tailwind CSS
- Capacitor
- IndexedDB

## 如何运行

### 开发环境

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```

### 构建和打包

1. 构建项目
   ```bash
   npm run build
   ```

2. 同步到 Android 平台
   ```bash
   npx cap sync android
   ```

3. 在 Android Studio 中打开并构建 APK
   ```bash
   npx cap open android
   ```