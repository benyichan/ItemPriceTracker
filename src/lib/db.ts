import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Item, Settings, Reminder } from '@/types';
import { BackupLocationManager, BackupFileManager } from './backupManager';

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
  categories: {
    key: string;
    value: {
      id: string;
      name: string;
      isDefault: boolean;
      createdAt: string;
      updatedAt: string;
    };
    indexes: {
      'by-name': string;
    };
  };
}

const DB_NAME = 'ItemManagerDB';
const DB_VERSION = 2;

let db: IDBPDatabase<ItemManagerDB> | null = null;

// 默认类别
const DEFAULT_CATEGORIES = [
  { id: 'default-1', name: '视频', isDefault: true },
  { id: 'default-2', name: '书籍', isDefault: true },
  { id: 'default-3', name: '电子产品', isDefault: true },
  { id: 'default-4', name: '服装', isDefault: true },
  { id: 'default-5', name: '其他', isDefault: true },
];

export async function initDB(): Promise<IDBPDatabase<ItemManagerDB>> {
  if (db) return db;
  
  db = await openDB<ItemManagerDB>(DB_NAME, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion) {
      // 创建物品存储
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' });
        itemStore.createIndex('by-status', 'status');
        itemStore.createIndex('by-category', 'category');
        itemStore.createIndex('by-date', 'purchaseDate');
      }
      
      // 创建设置存储
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'theme' });
      }
      
      // 创建提醒存储
      if (!db.objectStoreNames.contains('reminders')) {
        const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
        reminderStore.createIndex('by-item', 'itemId');
        reminderStore.createIndex('by-date', 'reminderDate');
      }
      
      // 创建类别存储
      if (!db.objectStoreNames.contains('categories')) {
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoryStore.createIndex('by-name', 'name');
        
        // 添加默认类别
        const now = new Date().toISOString();
        DEFAULT_CATEGORIES.forEach(category => {
          categoryStore.put({
            ...category,
            createdAt: now,
            updatedAt: now,
          });
        });
      }
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
    
    // 确保备份目录存在
    const { path: backupDir, directory } = await BackupLocationManager.ensureBackupDirectory();
    
    // 创建备份文件
    const backupFileInfo = await BackupFileManager.createBackupFile(data, backupDir, directory);
    
    return backupFileInfo.filename;
  } catch (error) {
    console.error('自动备份失败:', error);
    return null;
  }
}

// 获取备份列表
export async function getBackupList(): Promise<Array<{ id: string; filename: string; date: string; size: number }>> {
  try {
    // 确保备份目录存在
    const { path: backupDir } = await BackupLocationManager.ensureBackupDirectory();
    
    // 列出备份文件
    const backupFiles = await BackupFileManager.listBackupFiles(backupDir);
    
    return backupFiles;
  } catch (error) {
    console.error('获取备份列表失败:', error);
    return [];
  }
}

// 从备份恢复
export async function restoreFromBackup(backupId: string): Promise<boolean> {
  try {
    // 确保备份目录存在
    const { path: backupDir } = await BackupLocationManager.ensureBackupDirectory();
    
    // 构建备份文件路径
    const filePath = `${backupDir}/${backupId}`;
    
    // 检查文件是否存在
    const exists = await BackupFileManager.exists(filePath);
    if (!exists) {
      return false;
    }
    
    // 读取备份文件
    const data = await BackupFileManager.readBackupFile(filePath);
    
    // 导入数据
    await importData(data);
    
    return true;
  } catch (error) {
    console.error('从备份恢复失败:', error);
    return false;
  }
}

// 删除备份
export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    // 确保备份目录存在
    const { path: backupDir } = await BackupLocationManager.ensureBackupDirectory();
    
    // 构建备份文件路径
    const filePath = `${backupDir}/${backupId}`;
    
    // 删除备份文件
    await BackupFileManager.deleteBackupFile(filePath);
    
    return true;
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

// 类别相关操作
export async function getAllCategories(): Promise<Array<{
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}>> {
  const database = await initDB();
  return database.getAll('categories');
}

export async function addCategory(name: string): Promise<{
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} | null> {
  try {
    const database = await initDB();
    
    // 检查类别名称是否已存在
    const existingCategories = await database.getAll('categories');
    if (existingCategories.some(cat => cat.name === name)) {
      throw new Error('类别名称已存在');
    }
    
    // 检查类别总数是否达到上限
    if (existingCategories.length >= 10) {
      throw new Error('类别总数已达到上限（10个）');
    }
    
    // 创建新类别
    const newCategory = {
      id: `category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await database.put('categories', newCategory);
    return newCategory;
  } catch (error) {
    console.error('添加类别失败:', error);
    return null;
  }
}

export async function updateCategory(id: string, name: string): Promise<boolean> {
  try {
    const database = await initDB();
    
    // 获取类别
    const category = await database.get('categories', id);
    if (!category) {
      throw new Error('类别不存在');
    }
    
    // 检查是否为默认类别
    if (category.isDefault) {
      throw new Error('默认类别名称不允许修改');
    }
    
    // 检查新名称是否与其他类别重复
    const existingCategories = await database.getAll('categories');
    if (existingCategories.some(cat => cat.name === name && cat.id !== id)) {
      throw new Error('类别名称已存在');
    }
    
    // 更新类别
    const updatedCategory = {
      ...category,
      name,
      updatedAt: new Date().toISOString(),
    };
    
    await database.put('categories', updatedCategory);
    return true;
  } catch (error) {
    console.error('更新类别失败:', error);
    return false;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const database = await initDB();
    
    // 获取类别
    const category = await database.get('categories', id);
    if (!category) {
      throw new Error('类别不存在');
    }
    
    // 检查是否为默认类别
    if (category.isDefault) {
      throw new Error('默认类别不允许删除');
    }
    
    // 检查该类别下是否存在物品
    const itemsInCategory = await database.getAllFromIndex('items', 'by-category', category.name);
    if (itemsInCategory.length > 0) {
      throw new Error('该类别下存在物品，无法删除');
    }
    
    // 删除类别
    await database.delete('categories', id);
    return true;
  } catch (error) {
    console.error('删除类别失败:', error);
    return false;
  }
}

export async function getCategoryById(id: string): Promise<{
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} | undefined> {
  const database = await initDB();
  return database.get('categories', id);
}

export async function getCategoryByName(name: string): Promise<{
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
} | undefined> {
  const database = await initDB();
  const categories = await database.getAll('categories');
  return categories.find(cat => cat.name === name);
}
