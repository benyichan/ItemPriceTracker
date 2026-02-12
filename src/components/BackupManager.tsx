import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Calendar,
  FileText,
  Database,
  Folder,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { 
  createAutoBackup, 
  getBackupList, 
  restoreFromBackup, 
  deleteBackup, 
  exportData,
  importData
} from '@/lib/db';
import { BackupLocationManager } from '@/lib/backupManager';
import { downloadFile, readFile, formatDateCN } from '@/lib/helpers';
import { toast } from 'sonner';

interface BackupManagerProps {
  onDataChanged: () => void;
}

interface BackupItem {
  id: string;
  filename: string;
  date: string;
  size: number;
}

export function BackupManager({ onDataChanged }: BackupManagerProps) {
  const [backupList, setBackupList] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManualBackupDialog, setShowManualBackupDialog] = useState(false);
  const [backupPath, setBackupPath] = useState<string | null>(null);
  const [showPathDialog, setShowPathDialog] = useState(false);

  // 加载备份列表
  const loadBackupList = async () => {
    try {
      setLoading(true);
      const list = await getBackupList();
      setBackupList(list.reverse()); // 最新的备份在前面
    } catch (error) {
      console.error('加载备份列表失败:', error);
      toast.error('加载备份列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载备份路径
  const loadBackupPath = async () => {
    try {
      const path = await BackupLocationManager.getBackupLocation();
      setBackupPath(path);
    } catch (error) {
      console.error('加载备份路径失败:', error);
    }
  };

  // 设置备份路径（预留接口，暂时注释掉以避免未使用警告）
  // const _setBackupLocation = async (path: string) => {
  //   try {
  //     setLoading(true);
  //     await BackupLocationManager.saveBackupLocation(path);
  //     setBackupPath(path);
  //     toast.success('备份路径设置成功');
  //     setShowPathDialog(false);
  //     // 重新加载备份列表
  //     await loadBackupList();
  //   } catch (error) {
  //     console.error('设置备份路径失败:', error);
  //     toast.error('设置备份路径失败');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // 使用默认备份路径
  const useDefaultBackupPath = async () => {
    try {
      setLoading(true);
      const defaultPath = await BackupLocationManager.getDefaultBackupPath();
      await BackupLocationManager.saveBackupLocation(defaultPath);
      setBackupPath(defaultPath);
      toast.success('已使用默认备份路径');
      setShowPathDialog(false);
      // 重新加载备份列表
      await loadBackupList();
    } catch (error) {
      console.error('使用默认备份路径失败:', error);
      toast.error('使用默认备份路径失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackupList();
    loadBackupPath();
  }, []);

  // 创建手动备份
  const handleManualBackup = async () => {
    try {
      setLoading(true);
      const filename = await createAutoBackup();
      if (filename) {
        toast.success('备份创建成功');
        await loadBackupList();
        setShowManualBackupDialog(false);
      } else {
        toast.error('备份创建失败');
      }
    } catch (error) {
      console.error('创建备份失败:', error);
      toast.error('创建备份失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载备份
  const handleDownloadBackup = async () => {
    try {
      setLoading(true);
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `item-manager-backup-${timestamp}.json`;
      downloadFile(json, filename);
      toast.success('备份已下载');
    } catch (error) {
      console.error('下载备份失败:', error);
      toast.error('下载备份失败');
    } finally {
      setLoading(false);
    }
  };

  // 上传备份
  const handleUploadBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setLoading(true);
          const content = await readFile(file);
          const data = JSON.parse(content);
          await importData(data);
          toast.success('备份导入成功');
          onDataChanged();
          await loadBackupList();
        } catch (error) {
          console.error('导入备份失败:', error);
          toast.error('导入备份失败，请检查文件格式');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  // 从备份恢复
  const handleRestoreBackup = async () => {
    if (!selectedBackupId) return;
    
    try {
      setLoading(true);
      const success = await restoreFromBackup(selectedBackupId);
      if (success) {
        toast.success('从备份恢复成功');
        onDataChanged();
        setShowRestoreDialog(false);
      } else {
        toast.error('恢复失败');
      }
    } catch (error) {
      console.error('恢复备份失败:', error);
      toast.error('恢复备份失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除备份
  const handleDeleteBackup = async () => {
    if (!selectedBackupId) return;
    
    try {
      setLoading(true);
      const success = await deleteBackup(selectedBackupId);
      if (success) {
        toast.success('备份已删除');
        await loadBackupList();
        setShowDeleteDialog(false);
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      console.error('删除备份失败:', error);
      toast.error('删除备份失败');
    } finally {
      setLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="space-y-6">
      {/* 手动备份控制 */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">备份管理</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <motion.button
              onClick={handleManualBackup}
              disabled={loading}
              className="p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium">创建备份</span>
              <span className="text-xs text-muted-foreground">自动备份</span>
            </motion.button>

            <motion.button
              onClick={handleDownloadBackup}
              disabled={loading}
              className="p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium">下载备份</span>
              <span className="text-xs text-muted-foreground">自动备份</span>
            </motion.button>

            <motion.button
              onClick={handleUploadBackup}
              disabled={loading}
              className="p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium">上传备份</span>
              <span className="text-xs text-muted-foreground">自动备份</span>
            </motion.button>

            <motion.button
              onClick={() => setShowPathDialog(true)}
              disabled={loading}
              className="p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium">备份路径</span>
              <span className="text-xs text-muted-foreground">设置路径</span>
            </motion.button>
          </div>

          {/* 备份路径信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 mb-6">
            <Save className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">当前备份路径</p>
              <p className="text-xs text-blue-600 mt-1 font-mono break-all">
                {backupPath || '未设置，将使用默认路径'}
              </p>
            </div>
          </div>

          {/* 备份提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">备份提示</p>
              <p className="text-xs text-yellow-600 mt-1">
                恢复备份将覆盖当前所有数据，且无法撤销。请谨慎操作。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 备份列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            备份列表
          </h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadBackupList}
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
              刷新
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : backupList.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Database className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-4">备份列表为空</p>
              <Button onClick={handleManualBackup}>
                创建备份
              </Button>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {backupList.map((backup) => (
                <motion.div
                  key={backup.id}
                  variants={itemVariants}
                  layout
                >
                  <Card 
                    className="hover:shadow-lg hover:shadow-primary/5 transition-all border-border hover:border-primary/30"
                  >
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-start">
                        <div className="col-span-9">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium break-words overflow-wrap-anywhere">{backup.filename}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{formatDateCN(backup.date)}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{formatFileSize(backup.size)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedBackupId(backup.id);
                              setShowRestoreDialog(true);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <RefreshCw className="w-4 h-4 text-primary" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setSelectedBackupId(backup.id);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 恢复确认对话框 */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>恢复备份</AlertDialogTitle>
            <AlertDialogDescription>
              恢复备份将覆盖当前所有数据，且无法撤销。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestoreBackup}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 rounded-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  恢复中...
                </div>
              ) : (
                "确认"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>删除备份</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此备份吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBackup}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  删除中...
                </div>
              ) : (
                "确认"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 手动备份对话框 */}
      <Dialog open={showManualBackupDialog} onOpenChange={setShowManualBackupDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>创建备份</DialogTitle>
            <DialogDescription>
              创建备份中...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>

      {/* 备份路径设置对话框 */}
      <Dialog open={showPathDialog} onOpenChange={setShowPathDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>设置备份路径</DialogTitle>
            <DialogDescription>
              设置备份文件的存储位置，建议选择一个用户可见且便于管理的目录。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">默认备份路径</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {backupPath || '未设置'}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={useDefaultBackupPath}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 rounded-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    设置中...
                  </div>
                ) : (
                  <>
                    <Folder className="w-4 h-4 mr-2" />
                    使用默认备份路径
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  // 这里可以添加自定义路径设置逻辑
                  // 由于是Capacitor应用，实际的文件夹选择需要使用原生API
                  toast.info('在实际应用中，这里会打开文件夹选择器');
                  // 暂时使用默认路径
                  useDefaultBackupPath();
                }}
                disabled={loading}
                variant="outline"
                className="w-full rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                选择自定义路径
              </Button>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-600 ml-2">
                注意：在Android设备上，备份路径需要符合文件系统权限要求，建议使用应用默认路径。
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
