import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllReminders, addReminder, deleteReminder, markReminderAsRead } from '@/lib/db';
import { isItemExpiring, isItemExpired, formatDateCN } from '@/lib/helpers';
import type { Item, Reminder } from '@/types';

// 模拟IDB数据库
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue({
    getAll: vi.fn().mockResolvedValue([]),
    put: vi.fn().mockResolvedValue('test-reminder-id'),
    delete: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    clear: vi.fn().mockResolvedValue(undefined),
    transaction: vi.fn().mockReturnValue({
      objectStore: vi.fn().mockReturnValue({
        getAll: vi.fn().mockResolvedValue([]),
        put: vi.fn().mockResolvedValue('test-reminder-id'),
        delete: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
        clear: vi.fn().mockResolvedValue(undefined)
      }),
      done: Promise.resolve()
    })
  })
}));

// 模拟日期
const mockDate = new Date('2026-02-07');
vi.setSystemTime(mockDate);

describe('提醒功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('数据库操作', () => {
    it('应该获取所有提醒', async () => {
      const reminders = await getAllReminders();
      expect(Array.isArray(reminders)).toBe(true);
    });

    it('应该添加提醒', async () => {
      const reminder: Reminder = {
        id: 'test-reminder-id',
        itemId: 'test-item-id',
        itemName: 'Test Item',
        reminderDate: new Date().toISOString(),
        type: 'expiring',
        read: false
      };

      const success = await addReminder(reminder);
      expect(typeof success).toBe('undefined');
    });

    it('应该删除提醒', async () => {
      const success = await deleteReminder('test-reminder-id');
      expect(typeof success).toBe('undefined');
    });

    it('应该标记提醒为已读', async () => {
      const success = await markReminderAsRead('test-reminder-id');
      expect(typeof success).toBe('undefined');
    });
  });

  describe('辅助函数', () => {
    it('应该检查物品是否即将过期', () => {
      const expiringItem: Item = {
        id: 'test-item-id',
        name: 'Test Item',
        totalCost: 10.99,
        quantity: 1,
        purchaseDate: new Date().toISOString(),
        calculationType: 'perDay',
        usageDays: 3, // 3天后过期
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = isItemExpiring(expiringItem, 3);
      expect(result).toBe(true);
    });

    it('应该检查物品是否已过期', () => {
      const expiredItem: Item = {
        id: 'test-item-id',
        name: 'Test Item',
        totalCost: 10.99,
        quantity: 1,
        purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前购买
        calculationType: 'perDay',
        usageDays: 1, // 1天后过期（即已过期）
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = isItemExpired(expiredItem);
      expect(result).toBe(true);
    });

    it('应该格式化日期', () => {
      const date = new Date('2026-02-07');
      const formattedDate = formatDateCN(date.toISOString());
      expect(typeof formattedDate).toBe('string');
    });
  });
});
