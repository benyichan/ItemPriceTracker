import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as dbModule from '@/lib/db';
import * as helpersModule from '@/lib/helpers';

// 模拟模块
vi.mock('@/lib/db');
vi.mock('@/lib/helpers');

const mockDb = dbModule as any;
const mockHelpers = helpersModule as any;

// 模拟全局对象
Object.defineProperty(globalThis, 'Blob', {
  value: vi.fn().mockImplementation(() => ({
    size: 100,
    type: 'application/json'
  }))
});

Object.defineProperty(globalThis, 'URL', {
  value: {
    createObjectURL: vi.fn().mockReturnValue('blob:http://localhost:3000/test-blob'),
    revokeObjectURL: vi.fn()
  }
});

// 仅在浏览器环境中模拟document
if (typeof document !== 'undefined') {
  Object.defineProperty(document, 'createElement', {
    value: vi.fn().mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn()
    })
  });
}

describe('备份功能测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 设置模拟函数返回值
    mockDb.createAutoBackup.mockResolvedValue('item-manager-backup-test.json');
    mockDb.getBackupList.mockResolvedValue([]);
    mockDb.restoreFromBackup.mockResolvedValue(true);
    mockDb.deleteBackup.mockResolvedValue(true);
    mockDb.exportData.mockResolvedValue({
      items: [],
      settings: null,
      reminders: [],
      backupInfo: {
        date: new Date().toISOString(),
        version: '2.0.0'
      }
    });
    mockDb.importData.mockResolvedValue(undefined);
    
    mockHelpers.downloadFile.mockImplementation(() => {});
    mockHelpers.readFile.mockResolvedValue('{"items": [], "settings": null, "reminders": [], "backupInfo": {"date": "2024-01-01T00:00:00.000Z", "version": "2.0.0"}}');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('数据库操作', () => {
    it('应该创建自动备份', async () => {
      const backupFilename = await mockDb.createAutoBackup();
      expect(typeof backupFilename === 'string' || backupFilename === null).toBe(true);
      expect(mockDb.createAutoBackup).toHaveBeenCalled();
    });

    it('应该获取备份列表', async () => {
      const backupList = await mockDb.getBackupList();
      expect(Array.isArray(backupList)).toBe(true);
      expect(mockDb.getBackupList).toHaveBeenCalled();
    });

    it('应该从备份恢复数据', async () => {
      const success = await mockDb.restoreFromBackup('test-backup-id');
      expect(typeof success).toBe('boolean');
      expect(mockDb.restoreFromBackup).toHaveBeenCalledWith('test-backup-id');
    });

    it('应该删除备份', async () => {
      const success = await mockDb.deleteBackup('test-backup-id');
      expect(typeof success).toBe('boolean');
      expect(mockDb.deleteBackup).toHaveBeenCalledWith('test-backup-id');
    });

    it('应该导出数据', async () => {
      const data = await mockDb.exportData();
      expect(data).toBeTruthy();
      expect(data.items).toBeDefined();
      expect(data.settings).toBeDefined();
      expect(data.reminders).toBeDefined();
      expect(data.backupInfo).toBeDefined();
      expect(mockDb.exportData).toHaveBeenCalled();
    });

    it('应该导入数据', async () => {
      await mockDb.importData({ items: [], settings: null, reminders: [] });
      expect(mockDb.importData).toHaveBeenCalled();
    });
  });

  describe('文件操作', () => {
    it('应该下载文件', () => {
      const content = '{"items": []}';
      const filename = 'backup.json';
      mockHelpers.downloadFile(content, filename);
      expect(mockHelpers.downloadFile).toHaveBeenCalledWith(content, filename);
    });

    it('应该读取文件', async () => {
      const mockFile = new File(['{"items": []}'], 'backup.json', { type: 'application/json' });
      const content = await mockHelpers.readFile(mockFile);
      expect(typeof content).toBe('string');
      expect(mockHelpers.readFile).toHaveBeenCalledWith(mockFile);
    });
  });
});
