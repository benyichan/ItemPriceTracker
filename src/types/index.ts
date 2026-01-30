// 物品数据模型
export interface Item {
  id: string;
  name: string;
  totalCost: number;
  quantity: number;
  purchaseDate: string;
  
  // 计算方式
  calculationType: 'perUse' | 'perDay';
  totalUses?: number;
  usageDays?: number;
  
  // 可选字段
  image?: string;
  category?: string;
  notes?: string;
  
  // 状态管理
  status: 'active' | 'finished' | 'discarded' | 'archived';
  
  // 使用记录
  usageRecords?: UsageRecord[];
  
  // 元数据
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  date: string;
  count: number;
  note?: string;
}

// 设置数据模型
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  currency: string;
  quantityUnit: string;
  
  // 提醒设置
  reminderEnabled: boolean;
  reminderTime: string;
  reminderDaysBefore: number;
  
  // 自动备份
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  
  // 默认值
  defaultCategory: string;
  defaultCalculationType: 'perUse' | 'perDay';
}

// 统计相关类型
export interface Statistics {
  totalCost: number;
  itemCount: number;
  averageUnitPrice: number;
  activeItems: number;
  finishedItems: number;
  expiringItems: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  totalCost: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  cost: number;
  count: number;
}

// 提醒相关
export interface Reminder {
  id: string;
  itemId: string;
  itemName: string;
  reminderDate: string;
  type: 'expiring' | 'expired';
  read: boolean;
}

// 视图类型
export type ViewType = 'grid' | 'list';
export type SortType = 'dateAdded' | 'purchaseDate' | 'expiryDate' | 'unitPrice';
export type FilterStatus = 'all' | 'active' | 'finished' | 'archived';
