import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Item, Settings, Reminder } from '@/types';

interface ItemManagerDB extends DBSchema {
  items: {
    key: string;
    value: Item;
    indexes: {
      'by-status': string;
      'by-category': string;
      'by-date': string;
    };
  };
  settings: {
    key: string;
    value: Settings;
  };
  reminders: {
    key: string;
    value: Reminder;
    indexes: {
      'by-item': string;
      'by-date': string;
    };
  };
}

const DB_NAME = 'ItemManagerDB';
const DB_VERSION = 1;

let db: IDBPDatabase<ItemManagerDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<ItemManagerDB>> {
  if (db) return db;
  
  db = await openDB<ItemManagerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建物品存储
      const itemStore = db.createObjectStore('items', { keyPath: 'id' });
      itemStore.createIndex('by-status', 'status');
      itemStore.createIndex('by-category', 'category');
      itemStore.createIndex('by-date', 'purchaseDate');
      
      // 创建设置存储
      db.createObjectStore('settings', { keyPath: 'theme' });
      
      // 创建提醒存储
      const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
      reminderStore.createIndex('by-item', 'itemId');
      reminderStore.createIndex('by-date', 'reminderDate');
    },
  });
  
  return db;
}

// 物品相关操作
export async function getAllItems(): Promise<Item[]> {
  const database = await initDB();
  return database.getAll('items');
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const database = await initDB();
  return database.get('items', id);
}

export async function addItem(item: Item): Promise<void> {
  const database = await initDB();
  await database.put('items', item);
}

export async function updateItem(item: Item): Promise<void> {
  const database = await initDB();
  item.updatedAt = new Date().toISOString();
  await database.put('items', item);
}

export async function deleteItem(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('items', id);
}

export async function getItemsByStatus(status: string): Promise<Item[]> {
  const database = await initDB();
  return database.getAllFromIndex('items', 'by-status', status);
}

export async function getItemsByCategory(category: string): Promise<Item[]> {
  const database = await initDB();
  return database.getAllFromIndex('items', 'by-category', category);
}

// 设置相关操作
export async function getSettings(): Promise<Settings | undefined> {
  const database = await initDB();
  const allSettings = await database.getAll('settings');
  return allSettings[0] || getDefaultSettings();
}

export async function saveSettings(settings: Settings): Promise<void> {
  const database = await initDB();
  await database.put('settings', settings);
}

export function getDefaultSettings(): Settings {
  return {
    theme: 'system',
    primaryColor: '#2A5CAA',
    currency: '¥',
    quantityUnit: '件',
    reminderEnabled: true,
    reminderTime: '09:00',
    reminderDaysBefore: 3,
    autoBackup: false,
    backupFrequency: 'weekly',
    defaultCategory: '日用品',
    defaultCalculationType: 'perUse',
  };
}

// 提醒相关操作
export async function getAllReminders(): Promise<Reminder[]> {
  const database = await initDB();
  return database.getAll('reminders');
}

export async function addReminder(reminder: Reminder): Promise<void> {
  const database = await initDB();
  await database.put('reminders', reminder);
}

export async function deleteReminder(id: string): Promise<void> {
  const database = await initDB();
  await database.delete('reminders', id);
}

export async function markReminderAsRead(id: string): Promise<void> {
  const database = await initDB();
  const reminder = await database.get('reminders', id);
  if (reminder) {
    reminder.read = true;
    await database.put('reminders', reminder);
  }
}

// 数据导出
export async function exportData(): Promise<{ items: Item[]; settings: Settings | null; reminders: Reminder[]; backupInfo: { date: string; version: string } }> {
  const database = await initDB();
  const items = await database.getAll('items');
  const settingsList = await database.getAll('settings');
  const reminders = await database.getAll('reminders');
  
  return {
    items,
    settings: settingsList[0] || null,
    reminders,
    backupInfo: {
      date: new Date().toISOString(),
      version: '2.0.0'
    }
  };
}

// 数据导入
export async function importData(data: { items?: Item[]; settings?: Settings; reminders?: Reminder[]; backupInfo?: any }): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(['items', 'settings', 'reminders'], 'readwrite');
  
  if (data.items) {
    await Promise.all(data.items.map(item => tx.objectStore('items').put(item)));
  }
  
  if (data.settings) {
    await tx.objectStore('settings').put(data.settings);
  }
  
  if (data.reminders) {
    await Promise.all(data.reminders.map(reminder => tx.objectStore('reminders').put(reminder)));
  }
  
  await tx.done;
}

// 清空数据
export async function clearAllData(): Promise<void> {
  const database = await initDB();
  const tx = database.transaction(['items', 'reminders'], 'readwrite');
  await tx.objectStore('items').clear();
  await tx.objectStore('reminders').clear();
  await tx.done;
}

// 自动备份
export async function createAutoBackup(): Promise<string | null> {
  try {
    const data = await exportData();
    const backupContent = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `item-manager-backup-${timestamp}.json`;
    
    // 检查是否支持localStorage
    if (typeof localStorage !== 'undefined') {
      // 存储备份信息
      const backups = JSON.parse(localStorage.getItem('item-manager-backups') || '[]');
      
      // 限制备份数量为10个
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

// 获取备份列表
export async function getBackupList(): Promise<Array<{ id: string; filename: string; date: string; size: number }>> {
  if (typeof localStorage !== 'undefined') {
    const backups = JSON.parse(localStorage.getItem('item-manager-backups') || '[]');
    return backups.map((backup: any) => ({
      id: backup.id,
      filename: backup.filename,
      date: backup.date,
      size: backup.size
    }));
  }
  return [];
}

// 从备份恢复
export async function restoreFromBackup(backupId: string): Promise<boolean> {
  try {
    if (typeof localStorage !== 'undefined') {
      const backups = JSON.parse(localStorage.getItem('item-manager-backups') || '[]');
      const backup = backups.find((b: any) => b.id === backupId);
      
      if (backup) {
        const data = JSON.parse(backup.content);
        await importData(data);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('从备份恢复失败:', error);
    return false;
  }
}

// 删除备份
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    if (typeof localStorage !== 'undefined') {
      const backups = JSON.parse(localStorage.getItem('item-manager-backups') || '[]');
      const filteredBackups = backups.filter((b: any) => b.id !== backupId);
      localStorage.setItem('item-manager-backups', JSON.stringify(filteredBackups));
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除备份失败:', error);
    return false;
  }
}

// 检查是否需要自动备份
export function shouldRunAutoBackup(lastBackupDate: string | null, frequency: 'daily' | 'weekly' | 'monthly'): boolean {
  if (!lastBackupDate) return true;
  
  const lastBackup = new Date(lastBackupDate);
  const now = new Date();
  const diffTime = now.getTime() - lastBackup.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case 'daily':
      return diffDays >= 1;
    case 'weekly':
      return diffDays >= 7;
    case 'monthly':
      return diffDays >= 30;
    default:
      return false;
  }
}
