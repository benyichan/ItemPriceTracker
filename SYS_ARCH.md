# 项目架构与功能实现文档

## 项目概览

ItemPriceTracker3.0 是一个物品价格追踪系统，用于帮助用户记录和分析购买物品的价格、使用情况和生命周期。系统支持多平台运行，包括桌面端和移动端。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **样式解决方案**: Tailwind CSS
- **状态管理**: React Hooks
- **动画效果**: Framer Motion
- **移动平台支持**: Capacitor
- **本地数据存储**: IDB (IndexedDB)
- **UI 组件库**: Radix UI
- **图标库**: Lucide React
- **通知系统**: Sonner
- **国际化支持**: i18next
- **测试框架**: Vitest

## 系统架构

### 1. 目录结构

```
app/
├── src/
│   ├── components/          # 通用组件
│   │   ├── ui/              # Radix UI 组件
│   │   ├── BackupManager.tsx    # 备份管理组件
│   │   ├── ReminderManager.tsx  # 提醒管理组件
│   │   └── BottomNav.tsx        # 底部导航组件
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useItems.ts          # 物品管理 Hook
│   │   ├── useSettings.ts       # 设置管理 Hook
│   │   ├── useStatistics.ts     # 统计分析 Hook
│   │   └── useTheme.ts          # 主题管理 Hook
│   ├── i18n/                # 国际化支持
│   │   ├── locales/         # 语言文件
│   │   └── index.ts         # i18n 配置
│   ├── lib/                 # 核心库
│   │   ├── db.ts             # 数据库操作
│   │   ├── helpers.ts        # 工具函数
│   │   └── utils.ts          # 兼容性工具
│   ├── sections/            # 页面组件
│   │   ├── HomeView.tsx       # 首页
│   │   ├── ItemListView.tsx   # 物品列表
│   │   ├── AddItemView.tsx    # 添加物品
│   │   ├── ItemDetailView.tsx # 物品详情
│   │   ├── StatisticsView.tsx # 统计分析
│   │   └── SettingsView.tsx   # 设置页面
│   ├── types/               # TypeScript 类型定义
│   ├── __tests__/           # 测试文件
│   ├── App.tsx              # 应用主组件
│   └── main.tsx             # 应用入口
└── public/                  # 静态资源
```

### 2. 数据模型

#### 物品 (Item)

```typescript
interface Item {
  id: string;              // 唯一标识
  name: string;            // 物品名称
  price: number;           // 价格
  quantity: number;        // 数量
  category: string;        // 类别
  purchaseDate: string;    // 购买日期
  expiryDate?: string;     // 过期日期
  usageDays?: number;      // 使用天数
  status: 'active' | 'used' | 'expired'; // 状态
  description?: string;    // 描述
  imageUrl?: string;       // 图片 URL
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
}
```

#### 提醒 (Reminder)

```typescript
interface Reminder {
  id: string;              // 唯一标识
  itemId: string;          // 物品 ID
  itemName: string;        // 物品名称
  reminderDate: string;    // 提醒日期
  type: 'expiring' | 'expired' | 'price-change' | 'stock-low'; // 提醒类型
  read: boolean;           // 是否已读
}
```

#### 设置 (Settings)

```typescript
interface Settings {
  theme: 'light' | 'dark' | 'system'; // 主题
  primaryColor: string;    // 主色调
  currency: string;        // 货币符号
  quantityUnit: string;    // 数量单位
  reminderEnabled: boolean; // 启用提醒
  reminderTime: string;    // 提醒时间
  reminderDaysBefore: number; // 提前提醒天数
  autoBackup: boolean;     // 自动备份
  backupFrequency: 'daily' | 'weekly' | 'monthly'; // 备份频率
  defaultCategory: string; // 默认类别
  defaultCalculationType: 'perUse' | 'perDay'; // 默认计算方式
}
```

### 3. 核心功能模块

#### 3.1 备份系统

**功能说明**：提供完整的备份和恢复功能，确保用户数据安全。

**实现细节**：

- **自动备份**：根据用户设置的频率自动创建备份
- **手动备份**：允许用户手动创建备份
- **备份管理**：查看、下载、上传和删除备份
- **从备份恢复**：支持从历史备份恢复数据

**核心文件**：

- `lib/db.ts`：包含备份相关的数据库操作
- `components/BackupManager.tsx`：备份管理界面
- `lib/helpers.ts`：包含文件下载和读取功能

#### 3.2 提醒系统

**功能说明**：监控物品状态，及时通知用户重要事件。

**实现细节**：

- **过期提醒**：在物品即将过期时提醒用户
- **库存提醒**：当物品库存不足时提醒用户
- **价格变动提醒**：当物品价格发生变化时提醒用户
- **提醒设置**：允许用户配置提醒时间和提醒方式

**核心文件**：

- `lib/db.ts`：包含提醒相关的数据库操作
- `components/ReminderManager.tsx`：提醒管理界面
- `lib/helpers.ts`：包含日期计算和提醒相关函数

#### 3.3 多语言支持

**功能说明**：提供多语言界面，支持中文和英文。

**实现细节**：

- **语言切换**：允许用户在中文和英文之间切换
- **翻译管理**：集中管理所有界面文本的翻译
- **动态加载**：根据用户选择的语言动态加载对应的翻译

**核心文件**：

- `i18n/index.ts`：i18n 配置
- `i18n/locales/zh-CN.ts`：中文翻译
- `i18n/locales/en-US.ts`：英文翻译

#### 3.4 统计分析

**功能说明**：提供物品使用情况和价格趋势的统计分析。

**实现细节**：

- **消费趋势**：分析用户的消费趋势
- **类别分析**：按类别分析消费情况
- **单价分析**：分析物品的单价变化
- **使用效率**：分析物品的使用效率

**核心文件**：

- `hooks/useStatistics.ts`：统计分析逻辑
- `sections/StatisticsView.tsx`：统计分析界面

### 4. 数据流

1. **用户操作** → **React 组件** → **自定义 Hook** → **数据库操作** → **状态更新** → **UI 更新**

2. **数据持久化**：使用 IndexedDB 存储数据，确保数据在刷新页面后仍然保留

3. **数据备份**：定期将数据备份到 localStorage，支持手动导出和导入

### 5. 性能优化

1. **组件懒加载**：使用 React.lazy 和 Suspense 实现组件懒加载
2. **记忆化计算**：使用 useMemo 和 useCallback 优化计算和回调函数
3. **批量更新**：使用 React 的批量更新机制减少渲染次数
4. **数据库索引**：为常用查询字段创建索引，提高查询性能
5. **防抖和节流**：对频繁操作应用防抖和节流，减少不必要的计算

### 6. 安全性

1. **数据加密**：敏感数据在存储时进行加密
2. **输入验证**：对用户输入进行严格验证，防止注入攻击
3. **备份安全**：备份文件使用 JSON 格式，易于验证和检查
4. **权限控制**：本地应用，所有操作都在用户设备上执行，无需网络权限

## 功能实现文档

### 1. 备份功能

#### 1.1 自动备份

**实现步骤**：

1. 在 `SettingsView.tsx` 中添加自动备份设置选项
2. 在 `lib/db.ts` 中实现 `createAutoBackup` 函数
3. 在应用启动时检查是否需要执行自动备份

**核心代码**：

```typescript
// lib/db.ts
export async function createAutoBackup(): Promise<string | null> {
  try {
    const data = await exportData();
    const backupContent = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `item-manager-backup-${timestamp}.json`;
    
    if (typeof localStorage !== 'undefined') {
      const backups = JSON.parse(localStorage.getItem('item-manager-backups') || '[]');
      const limitedBackups = backups.slice(-9);
      limitedBackups.push({
        id: Date.now().toString(),
        filename,
        date: new Date().toISOString(),
        size: backupContent.length,
        content: backupContent
      });
      
      localStorage.setItem('item-manager-backups', JSON.stringify(limitedBackups));
      return filename;
    }
    
    return null;
  } catch (error) {
    console.error('自动备份失败:', error);
    return null;
  }
}
```

#### 1.2 备份管理界面

**实现步骤**：

1. 创建 `BackupManager.tsx` 组件
2. 实现备份列表、创建备份、下载备份、上传备份和恢复备份功能
3. 在 `SettingsView.tsx` 中集成 BackupManager 组件

### 2. 提醒系统

#### 2.1 过期提醒

**实现步骤**：

1. 在 `lib/helpers.ts` 中实现 `isItemExpiring` 和 `isItemExpired` 函数
2. 在 `components/ReminderManager.tsx` 中实现提醒检查逻辑
3. 在应用启动时检查过期物品并创建提醒

**核心代码**：

```typescript
// lib/helpers.ts
export function isItemExpiring(item: Item, daysBefore: number = 3): boolean {
  if (!item.usageDays || item.status !== 'active') return false;
  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  if (!endDate) return false;
  const remaining = getRemainingDays(endDate);
  return remaining > 0 && remaining <= daysBefore;
}

export function isItemExpired(item: Item): boolean {
  if (!item.usageDays || item.status !== 'active') return false;
  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  if (!endDate) return false;
  const remaining = getRemainingDays(endDate);
  return remaining <= 0;
}
```

#### 2.2 提醒管理界面

**实现步骤**：

1. 创建 `ReminderManager.tsx` 组件
2. 实现提醒设置、提醒列表和提醒操作功能
3. 在 `SettingsView.tsx` 中集成 ReminderManager 组件

### 3. 多语言支持

#### 3.1 i18n 配置

**实现步骤**：

1. 安装 i18next 和 react-i18next 依赖
2. 创建 `i18n/index.ts` 配置文件
3. 创建中文和英文翻译文件

**核心代码**：

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN
      },
      'en-US': {
        translation: enUS
      }
    },
    lng: 'zh-CN',
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

#### 3.2 语言切换

**实现步骤**：

1. 在 `SettingsView.tsx` 中添加语言切换选项
2. 使用 i18n.changeLanguage() 切换语言
3. 确保所有界面文本都使用 t() 函数翻译

### 4. 测试实现

#### 4.1 单元测试

**实现步骤**：

1. 为每个核心功能创建测试文件
2. 使用 Vitest 编写测试用例
3. 模拟依赖项，确保测试的独立性

**测试文件**：

- `__tests__/backup.test.ts`：备份功能测试
- `__tests__/reminder.test.ts`：提醒功能测试
- `__tests__/i18n.test.ts`：国际化测试

#### 4.2 集成测试

**实现步骤**：

1. 测试组件之间的交互
2. 测试完整的用户流程
3. 确保系统在各种场景下都能正常工作

## 用户操作指南

### 1. 基本操作

#### 1.1 添加物品

1. 点击底部导航栏的 "添加" 按钮
2. 填写物品名称、价格、数量等信息
3. 选择类别和计算方式
4. 点击 "保存" 按钮

#### 1.2 查看物品列表

1. 点击底部导航栏的 "列表" 按钮
2. 浏览物品列表
3. 点击物品查看详情
4. 使用筛选和排序功能查找特定物品

#### 1.3 查看统计分析

1. 点击底部导航栏的 "统计" 按钮
2. 查看消费趋势、类别分析等统计数据
3. 使用时间范围选择器查看不同时期的数据

### 2. 高级功能

#### 2.1 备份管理

1. 进入 "设置" 页面
2. 找到 "备份管理" 部分
3. **创建备份**：点击 "创建备份" 按钮
4. **下载备份**：点击备份列表中的 "下载" 按钮
5. **上传备份**：点击 "上传备份" 按钮，选择备份文件
6. **恢复备份**：点击备份列表中的 "恢复" 按钮
7. **删除备份**：点击备份列表中的 "删除" 按钮

#### 2.2 提醒设置

1. 进入 "设置" 页面
2. 找到 "提醒管理" 部分
3. **启用提醒**：开启 "启用提醒" 开关
4. **设置提醒时间**：选择每天的提醒时间
5. **设置提前提醒天数**：选择物品过期前的提醒天数
6. **检查过期物品**：点击 "检查过期物品" 按钮
7. **管理提醒**：在提醒列表中查看和管理提醒

#### 2.3 语言切换

1. 进入 "设置" 页面
2. 找到 "语言" 选项
3. 选择 "中文" 或 "English"
4. 系统会自动切换到选择的语言

### 3. 常见问题

#### 3.1 数据丢失

**解决方案**：
- 定期创建备份
- 使用 "从备份恢复" 功能恢复数据
- 检查浏览器存储权限

#### 3.2 提醒不生效

**解决方案**：
- 确保启用了提醒功能
- 检查提醒时间设置
- 确保物品有设置使用天数或过期日期

#### 3.3 多语言切换失败

**解决方案**：
- 刷新页面
- 检查浏览器语言设置
- 重新启动应用

### 4. 性能优化建议

1. **定期清理数据**：删除不再需要的物品记录
2. **合理设置备份频率**：根据数据量大小调整备份频率
3. **优化图片大小**：为物品图片选择合适的尺寸
4. **减少同时打开的标签页**：避免过多标签页占用内存

## 未来规划

1. **云同步**：支持将数据同步到云端，实现多设备数据共享
2. **更多语言支持**：添加更多语言选项，如日语、韩语等
3. **高级统计分析**：提供更详细的数据分析和可视化
4. **导出报表**：支持导出统计报表为 PDF 或 Excel 格式
5. **批量操作**：支持批量添加、编辑和删除物品
6. **自定义主题**：允许用户自定义界面主题和颜色

## 技术支持

如果您在使用过程中遇到任何问题，请参考以下资源：

1. **用户操作指南**：本文档
2. **GitHub Issues**：提交问题和 bug 报告
3. **开发者文档**：查看代码注释和文档

---

*本文档由 ItemPriceTracker3.0 开发团队编写，如有更新，请参考最新版本。*