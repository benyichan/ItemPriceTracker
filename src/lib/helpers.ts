import type { Item, Settings, Reminder } from '@/types';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并Tailwind CSS类名
 * @param inputs 类名数组
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param date 日期字符串或Date对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 格式化日期为中文格式
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDateCN(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化短日期
 * @param dateString 日期字符串
 * @returns 格式化后的短日期字符串
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * 格式化日期为 MM-DD
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatMDDate(dateString: string): string {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

/**
 * 格式化日期为 YYYY-MM
 * @param dateString 日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatYMDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * 格式化货币
 * @param amount 金额
 * @param _currency 货币符号（已废弃，不再使用）
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, _currency: string): string {
  return formatNumber(amount);
}

/**
 * 格式化数字
 * @param amount 金额
 * @returns 格式化后的数字字符串
 */
export function formatNumber(amount: number): string {
  if (amount < 1000) {
    return amount.toFixed(2);
  } else if (amount < 10000) {
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    return (amount / 10000).toFixed(2) + '万';
  }
}

/**
 * 计算单价
 * @param totalCost 总花费
 * @param quantity 数量
 * @param calculationType 计算方式
 * @param totalUses 总使用次数
 * @param usageDays 使用天数
 * @returns 计算后的单价
 */
export function calculateUnitPrice(
  totalCost: number,
  _quantity: number,
  calculationType: 'perUse' | 'perDay',
  totalUses?: number,
  usageDays?: number
): number {
  if (totalCost <= 0) return 0;
  
  if (calculationType === 'perUse' && totalUses && totalUses > 0) {
    return totalCost / totalUses;
  }
  if (calculationType === 'perDay' && usageDays && usageDays > 0) {
    return totalCost / usageDays;
  }
  
  return totalCost;
}

/**
 * 计算结束日期
 * @param purchaseDate 购买日期
 * @param usageDays 使用天数
 * @returns 结束日期字符串
 */
export function calculateEndDate(purchaseDate: string, usageDays?: number): string | null {
  if (!usageDays || usageDays <= 0) return null;
  const date = new Date(purchaseDate);
  date.setDate(date.getDate() + usageDays);
  return formatDate(date);
}

/**
 * 获取剩余天数
 * @param endDate 结束日期
 * @returns 剩余天数
 */
export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取两个日期之间的天数差
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 天数差
 */
export function getDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取月份的开始和结束日期
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 包含开始和结束日期的对象
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

/**
 * 获取日期范围内的所有日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期数组
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d));
  }
  
  return dates;
}

/**
 * 下载文件
 * @param content 文件内容
 * @param filename 文件名
 * @param type 文件类型
 */
export function downloadFile(content: string, filename: string, type: string = 'application/json'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 * @param file File对象
 * @returns 文件内容字符串
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 验证设置对象
 * @param settings 设置对象
 * @returns 验证后的设置对象
 */
export function validateSettings(settings: Partial<Settings>): Partial<Settings> {
  const validSettings: Partial<Settings> = {};
  
  if (typeof settings.theme === 'string' && ['light', 'dark', 'system'].includes(settings.theme)) {
    validSettings.theme = settings.theme;
  }
  
  if (typeof settings.currency === 'string') {
    validSettings.currency = settings.currency;
  }
  
  if (typeof settings.reminderEnabled === 'boolean') {
    validSettings.reminderEnabled = settings.reminderEnabled;
  }
  
  if (typeof settings.autoBackup === 'boolean') {
    validSettings.autoBackup = settings.autoBackup;
  }
  
  if (typeof settings.backupFrequency === 'string' && ['daily', 'weekly', 'monthly'].includes(settings.backupFrequency)) {
    validSettings.backupFrequency = settings.backupFrequency;
  }
  
  return validSettings;
}

/**
 * 检查物品是否即将到期
 * @param item 物品对象
 * @param daysBefore 提前提醒天数
 * @returns 是否即将到期
 */
export function isItemExpiring(item: Item, daysBefore: number = 3): boolean {
  if (!item.usageDays || item.status !== 'active') return false;
  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  if (!endDate) return false;
  const remaining = getRemainingDays(endDate);
  return remaining > 0 && remaining <= daysBefore;
}

/**
 * 检查物品是否已过期
 * @param item 物品对象
 * @returns 是否已过期
 */
export function isItemExpired(item: Item): boolean {
  if (!item.usageDays || item.status !== 'active') return false;
  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  if (!endDate) return false;
  const remaining = getRemainingDays(endDate);
  return remaining <= 0;
}

/**
 * 生成提醒对象
 * @param item 物品对象
 * @param type 提醒类型
 * @returns 提醒对象
 */
export function generateReminder(item: Item, type: 'expiring' | 'expired'): Reminder {
  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  return {
    id: generateId(),
    itemId: item.id,
    itemName: item.name,
    reminderDate: endDate || formatDate(new Date()),
    type,
    read: false
  };
}

/**
 * 按日期分组
 * @param items 物品数组
 * @returns 按日期分组的对象
 */
export function groupByDate<T extends { purchaseDate: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const date = item.purchaseDate.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 按月份分组
 * @param items 物品数组
 * @returns 按月份分组的对象
 */
export function groupByMonth<T extends { purchaseDate: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const month = item.purchaseDate.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 按类别分组
 * @param items 物品数组
 * @returns 按类别分组的对象
 */
export function groupByCategory<T extends { category?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const category = item.category || '未分类';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 计算环比
 * @param current 当前值
 * @param previous 之前值
 * @returns 增长率
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * 检查是否为空值
 * @param value 要检查的值
 * @returns 是否为空值
 */
export function isEmpty(value: any): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param delay 延迟毫秒数
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let inProgress = false;
  return (...args: Parameters<T>) => {
    if (!inProgress) {
      func(...args);
      inProgress = true;
      setTimeout(() => {
        inProgress = false;
      }, delay);
    }
  };
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param delay 延迟毫秒数
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay) as unknown as number;
  };
}
