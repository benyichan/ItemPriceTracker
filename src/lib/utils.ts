import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 计算单价 - 购买数量不参与计算
// 按次使用：单次单价 = 总花费 / 总使用次数
// 按天使用：每日单价 = 总花费 / 预计使用天数
export function calculateUnitPrice(
  totalCost: number,
  _quantity: number, // 保留参数以保持兼容性，但不参与计算
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
  
  // 默认返回总成本（当没有提供使用次数或天数时）
  return totalCost;
}

// 格式化金额 - 带币符，按规范显示
export function formatCurrency(amount: number, currency: string = '¥'): string {
  // 调用formatNumber函数，确保金额显示格式一致，然后添加币符
  return `${currency}${formatNumber(amount)}`;
}

// 格式化金额（仅数字，不带货币符号）- 按规范显示
export function formatNumber(amount: number): string {
  if (amount < 1000) {
    // 1000以内：显示阿拉伯数字，保留2位小数
    return amount.toFixed(2);
  } else if (amount < 10000) {
    // 1000~10000之间：显示带千分位符的阿拉伯数字，保留2位小数
    return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    // 10000以上(含10000)：以"万元"为单位显示，保留2位小数
    return (amount / 10000).toFixed(2) + '万';
  }
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 格式化短日期
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

// 格式化日期为 MM-DD
export function formatMDDate(dateString: string): string {
  const date = new Date(dateString);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// 格式化日期为 YYYY-MM
export function formatYMDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 计算预计结束日期
export function calculateEndDate(purchaseDate: string, usageDays?: number): string | null {
  if (!usageDays || usageDays <= 0) return null;
  
  const start = new Date(purchaseDate);
  const end = new Date(start.getTime() + usageDays * 24 * 60 * 60 * 1000);
  return end.toISOString().split('T')[0];
}

// 计算剩余天数
export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// 检查是否即将到期
export function isExpiringSoon(endDate: string, daysBefore: number = 3): boolean {
  const remaining = getRemainingDays(endDate);
  return remaining > 0 && remaining <= daysBefore;
}

// 检查是否已过期
export function isExpired(endDate: string): boolean {
  return getRemainingDays(endDate) <= 0;
}

// 获取月份范围
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// 获取日期范围的天数差
export function getDaysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
}

// 获取日期范围内的所有日期
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }
  
  return dates;
}

// 按日期分组
export function groupByDate<T extends { purchaseDate: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const date = item.purchaseDate.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// 按月份分组
export function groupByMonth<T extends { purchaseDate: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const month = item.purchaseDate.substring(0, 7); // YYYY-MM
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// 按类别分组
export function groupByCategory<T extends { category?: string }>(items: T[]): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const category = item.category || '未分类';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// 计算环比
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// 下载文件
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

// 读取文件
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
