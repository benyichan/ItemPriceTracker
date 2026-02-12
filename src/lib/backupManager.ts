import { Preferences } from '@capacitor/preferences';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// 备份目录名称
const BACKUP_DIR_NAME = 'ItemPriceTracker/Backups';

/**
 * 检查并请求存储权限
 * @returns 是否获得了存储权限
 */
export async function checkStoragePermission(): Promise<boolean> {
  try {
    // 在 Web 环境下跳过权限检查
    if (Capacitor.getPlatform() === 'web') {
      console.warn('Web platform detected, proceeding without permission check');
      return true;
    }

    // Capacitor 8 中，存储权限检查已经集成到 Filesystem 插件中
    // 当执行文件操作时，系统会自动请求权限
    // 这里我们尝试一个简单的文件操作来触发权限请求
    try {
      await Filesystem.getUri({
        path: '',
        directory: Directory.Documents
      });
      return true;
    } catch (error) {
      console.error('Storage permission denied:', error);
      return false;
    }
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
}

/**
 * 获取权限申请失败的用户引导信息
 * @returns 权限申请失败的引导信息
 */
export function getPermissionDeniedMessage(): string {
  return '存储权限被拒绝，备份功能无法正常使用。请在设备设置中手动授予存储权限，路径：设置 > 应用 > ItemPriceTracker > 权限 > 存储。';
}

/**
 * 检查是否应该显示权限引导
 * @returns 是否应该显示权限引导
 */
export async function shouldShowPermissionGuide(): Promise<boolean> {
  const hasPermission = await checkStoragePermission();
  return !hasPermission;
}

/**
 * 备份位置管理器
 * 负责管理备份路径的选择和权限
 */
export class BackupLocationManager {
  private static readonly PREFS_KEY = 'backup_location';

  /**
   * 保存备份路径
   * @param path 备份路径
   */
  static async saveBackupLocation(path: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.PREFS_KEY,
        value: path
      });
    } catch (error) {
      console.error('保存备份路径失败:', error);
    }
  }

  /**
   * 获取备份路径
   * @returns 备份路径，如果未设置则返回null
   */
  static async getBackupLocation(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.PREFS_KEY });
      return value;
    } catch (error) {
      console.error('获取备份路径失败:', error);
      return null;
    }
  }

  /**
   * 清除备份路径
   */
  static async clearBackupLocation(): Promise<void> {
    try {
      await Preferences.remove({ key: this.PREFS_KEY });
    } catch (error) {
      console.error('清除备份路径失败:', error);
    }
  }

  /**
 * 确保备份目录存在
 * @returns 备份目录路径和使用的目录类型
 */
  static async ensureBackupDirectory(): Promise<{ path: string; directory: Directory }> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 尝试使用不同目录
      const directoryAttempts = [
        { dir: Directory.Documents, path: 'Backups' },
        { dir: Directory.External, path: 'ItemPriceTracker/Backups' },
        { dir: Directory.Data, path: 'Backups' },
      ];
      
      for (const attempt of directoryAttempts) {
        try {
          await Filesystem.mkdir({
            path: attempt.path,
            directory: attempt.dir,
            recursive: true
          });
          
          console.log(`备份目录创建成功: ${attempt.path} (${attempt.dir})`);
          return { path: attempt.path, directory: attempt.dir };
        } catch (error) {
          console.warn(`使用${attempt.dir}目录失败:`, error);
          // 继续尝试下一个目录
        }
      }
      
      throw new Error('无法创建备份目录，请检查存储权限');
    } catch (error) {
      console.error('确保备份目录存在失败:', error);
      throw new Error('无法创建备份目录，请检查存储权限');
    }
  }

  /**
   * 获取默认备份路径
   * @returns 默认备份路径
   */
  static async getDefaultBackupPath(): Promise<string> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      try {
        // 获取Documents目录
        const docsDir = await Filesystem.getUri({
          path: '',
          directory: Directory.Documents
        });
        
        return `${docsDir.uri}/${BACKUP_DIR_NAME}`;
      } catch (error) {
        console.error('获取Documents目录失败:', error);
        // 如果失败，返回相对路径
        return `Documents/${BACKUP_DIR_NAME}`;
      }
    } catch (error) {
      console.error('获取默认备份路径失败:', error);
      return `Documents/${BACKUP_DIR_NAME}`;
    }
  }
}

/**
 * 备份文件管理器
 * 负责备份文件的创建、读取、删除等操作
 */
export class BackupFileManager {
  /**
 * 尝试从多个目录读取文件
 * @param filePath 文件路径
 * @returns 读取结果
 */
  private static async tryReadFromMultipleDirectories(filePath: string): Promise<any> {
    // 尝试从不同目录读取文件
    const directories = [Directory.Documents, Directory.External, Directory.Data];
    
    for (const directory of directories) {
      try {
        // 尝试不同的路径组合
        const pathsToTry = [
          filePath,
          `Backups/${filePath}`,
          `ItemPriceTracker/Backups/${filePath}`
        ];
        
        for (const pathToTry of pathsToTry) {
          try {
            const { data } = await Filesystem.readFile({
              path: pathToTry,
              directory
            });
            return data;
          } catch (innerError) {
            console.warn(`从${directory}目录读取${pathToTry}失败:`, innerError);
            // 继续尝试下一个路径
          }
        }
      } catch (error) {
        console.warn(`从${directory}目录读取文件失败:`, error);
        // 继续尝试下一个目录
      }
    }
    
    throw new Error('无法从任何目录读取文件');
  }

  /**
   * 尝试从多个目录列出文件
   * @param backupDir 备份目录
   * @returns 文件列表
   */
  private static async tryListFromMultipleDirectories(backupDir: string): Promise<any[]> {
    // 尝试从不同目录列出文件
    const directories = [Directory.Documents, Directory.External, Directory.Data];
    
    for (const directory of directories) {
      try {
        // 尝试不同的路径组合
        const pathsToTry = [
          backupDir,
          'Backups',
          'ItemPriceTracker/Backups'
        ];
        
        for (const pathToTry of pathsToTry) {
          try {
            const { files } = await Filesystem.readdir({
              path: pathToTry,
              directory
            });
            return files;
          } catch (innerError) {
            console.warn(`从${directory}目录列出${pathToTry}失败:`, innerError);
            // 继续尝试下一个路径
          }
        }
      } catch (error) {
        console.warn(`从${directory}目录列出文件失败:`, error);
        // 继续尝试下一个目录
      }
    }
    
    return [];
  }

  /**
   * 尝试从多个目录检查文件是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  private static async tryExistsInMultipleDirectories(filePath: string): Promise<boolean> {
    // 尝试从不同目录检查文件是否存在
    const directories = [Directory.Documents, Directory.External, Directory.Data];
    
    for (const directory of directories) {
      try {
        // 尝试不同的路径组合
        const pathsToTry = [
          filePath,
          `Backups/${filePath}`,
          `ItemPriceTracker/Backups/${filePath}`
        ];
        
        for (const pathToTry of pathsToTry) {
          try {
            await Filesystem.stat({
              path: pathToTry,
              directory
            });
            return true;
          } catch (innerError) {
            console.warn(`从${directory}目录检查${pathToTry}失败:`, innerError);
            // 继续尝试下一个路径
          }
        }
      } catch (error) {
        console.warn(`从${directory}目录检查文件失败:`, error);
        // 继续尝试下一个目录
      }
    }
    
    return false;
  }

  /**
   * 尝试从多个目录删除文件
   * @param filePath 文件路径
   */
  private static async tryDeleteFromMultipleDirectories(filePath: string): Promise<void> {
    // 尝试从不同目录删除文件
    const directories = [Directory.Documents, Directory.External, Directory.Data];
    let deleted = false;
    
    for (const directory of directories) {
      try {
        // 尝试不同的路径组合
        const pathsToTry = [
          filePath,
          `Backups/${filePath}`,
          `ItemPriceTracker/Backups/${filePath}`
        ];
        
        for (const pathToTry of pathsToTry) {
          try {
            await Filesystem.deleteFile({
              path: pathToTry,
              directory
            });
            deleted = true;
            return;
          } catch (innerError) {
            console.warn(`从${directory}目录删除${pathToTry}失败:`, innerError);
            // 继续尝试下一个路径
          }
        }
      } catch (error) {
        console.warn(`从${directory}目录删除文件失败:`, error);
        // 继续尝试下一个目录
      }
    }
    
    if (!deleted) {
      throw new Error('无法从任何目录删除文件');
    }
  }

  /**
 * 创建备份文件
 * @param data 备份数据
 * @param backupDir 备份目录
 * @param directory 目录类型
 * @returns 备份文件信息
 */
  static async createBackupFile(data: any, backupDir: string, directory?: Directory): Promise<{ filename: string; path: string; directory: Directory }> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      
      // 转换数据为JSON字符串
      const jsonContent = JSON.stringify(data, null, 2);
      
      // 尝试写入文件
      let usedDirectory: Directory;
      let finalPath: string;
      
      if (directory) {
        // 如果指定了目录，直接使用
        try {
          const filePath = `${backupDir}/${filename}`;
          await Filesystem.writeFile({
            path: filePath,
            data: jsonContent,
            directory,
            recursive: true
          });
          console.log(`备份文件写入到${directory}目录成功:`, filePath);
          usedDirectory = directory;
          finalPath = filePath;
        } catch (error) {
          console.warn(`写入到指定目录${directory}失败:`, error);
          // 失败后尝试其他目录
          const result = await this.tryWriteToDirectories(filename, jsonContent);
          usedDirectory = result.directory;
          finalPath = result.path;
        }
      } else {
        // 尝试写入到不同目录
        const result = await this.tryWriteToDirectories(filename, jsonContent);
        usedDirectory = result.directory;
        finalPath = result.path;
      }
      
      return { filename, path: finalPath, directory: usedDirectory };
    } catch (error) {
      console.error('创建备份文件失败:', error);
      throw error;
    }
  }

  /**
 * 尝试写入文件到多个目录
 * @param filename 文件名
 * @param content 文件内容
 * @returns 使用的目录和路径
 */
  private static async tryWriteToDirectories(filename: string, content: string): Promise<{ directory: Directory; path: string }> {
    const directories = [Directory.Documents, Directory.External, Directory.Data];
    
    // 尝试不同的路径组合
    const pathTemplates = [
      `Backups/${filename}`,
      `ItemPriceTracker/Backups/${filename}`,
      filename
    ];
    
    for (const directory of directories) {
      for (const pathTemplate of pathTemplates) {
        try {
          await Filesystem.writeFile({
            path: pathTemplate,
            data: content,
            directory,
            recursive: true
          });
          console.log(`备份文件写入到${directory}目录成功:`, pathTemplate);
          return { directory, path: pathTemplate };
        } catch (error) {
          console.warn(`写入到${directory}目录${pathTemplate}失败:`, error);
          // 继续尝试下一个路径
        }
      }
    }
    
    throw new Error('无法写入备份文件到任何目录');
  }

  /**
   * 读取备份文件
   * @param filePath 文件路径
   * @returns 备份数据
   */
  static async readBackupFile(filePath: string): Promise<any> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 尝试从多个目录读取文件
      const data = await this.tryReadFromMultipleDirectories(filePath);
      
      // 解析JSON，确保data是string类型
      const dataString = typeof data === 'string' ? data : '';
      return JSON.parse(dataString);
    } catch (error) {
      console.error('读取备份文件失败:', error);
      throw error;
    }
  }

  /**
   * 删除备份文件
   * @param filePath 文件路径
   */
  static async deleteBackupFile(filePath: string): Promise<void> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 尝试从多个目录删除文件
      await this.tryDeleteFromMultipleDirectories(filePath);
    } catch (error) {
      console.error('删除备份文件失败:', error);
      throw error;
    }
  }

  /**
   * 列出备份目录中的所有备份文件
   * @param backupDir 备份目录
   * @returns 备份文件列表
   */
  static async listBackupFiles(backupDir: string): Promise<Array<{
    id: string;
    filename: string;
    path: string;
    date: string;
    size: number;
  }>> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 尝试从多个目录列出文件
      const files = await this.tryListFromMultipleDirectories(backupDir);
      
      // 过滤出备份文件并排序
      const backupFiles = files
        .filter((file: any) => file.name.endsWith('.json') && file.name.startsWith('backup-'))
        .map((file: any) => {
          // 从文件名中提取日期
          const dateStr = file.name.replace('backup-', '').replace('.json', '');
          const date = new Date(dateStr.replace(/-/g, ':'));
          
          return {
            id: file.name,
            filename: file.name,
            path: `${backupDir}/${file.name}`,
            date: date.toISOString(),
            size: file.size || 0
          };
        })
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return backupFiles;
    } catch (error) {
      console.error('列出备份文件失败:', error);
      return [];
    }
  }

  /**
   * 检查备份文件是否存在
   * @param filePath 文件路径
   * @returns 是否存在
   */
  static async exists(filePath: string): Promise<boolean> {
    try {
      // 检查存储权限
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('存储权限被拒绝');
      }

      // 尝试从多个目录检查文件是否存在
      return await this.tryExistsInMultipleDirectories(filePath);
    } catch (error) {
      console.error('检查文件存在性失败:', error);
      return false;
    }
  }
}
