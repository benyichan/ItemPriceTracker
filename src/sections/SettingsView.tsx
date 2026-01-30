import { useState, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Moon, 
  Palette, 
  Download, 
  Upload,
  Trash2,
  Info,
  ChevronRight,
  Sun,
  Monitor,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import type { Settings } from '@/types';
import type { ThemeColor } from '@/hooks/useTheme';
import { exportData, importData, clearAllData } from '@/lib/db';
import { downloadFile, readFile } from '@/lib/utils';

interface SettingsViewProps {
  settings: Settings;
  theme: 'light' | 'dark' | 'system';
  primaryColor: ThemeColor;
  resolvedTheme: 'light' | 'dark';
  onBack: () => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onDataChanged: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onColorChange: (color: ThemeColor) => void;
}

const THEME_COLORS: { name: string; value: ThemeColor; gradient: string }[] = [
  { name: '科技蓝', value: '#2A5CAA', gradient: 'from-blue-500 to-blue-600' },
  { name: '极光紫', value: '#7C3AED', gradient: 'from-violet-500 to-violet-600' },
  { name: '翡翠绿', value: '#059669', gradient: 'from-emerald-500 to-emerald-600' },
  { name: '能量橙', value: '#EA580C', gradient: 'from-orange-500 to-orange-600' },
  { name: '霓虹粉', value: '#DB2777', gradient: 'from-pink-500 to-pink-600' },
  { name: '电光青', value: '#0891B2', gradient: 'from-cyan-500 to-cyan-600' },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function SettingsView({
  theme,
  primaryColor,
  resolvedTheme,
  onBack,
  onDataChanged,
  onThemeChange,
  onColorChange,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importDataState, setImportDataState] = useState<unknown>(null);

  const handleExport = async () => {
    const data = await exportData();
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(json, `item-manager-backup-${timestamp}.json`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFile(file);
      const data = JSON.parse(content);
      setImportDataState(data);
      setShowImportDialog(true);
    } catch {
      alert('文件格式错误，请选择有效的备份文件');
    }
  };

  const handleImportConfirm = async () => {
    if (!importDataState) return;

    try {
      await importData(importDataState as { items?: []; settings?: Settings; reminders?: [] });
      onDataChanged();
      setShowImportDialog(false);
      setImportDataState(null);
      alert('数据导入成功！');
    } catch {
      alert('导入失败，请检查文件格式');
    }
  };

  const handleClearData = async () => {
    await clearAllData();
    onDataChanged();
    setShowClearDialog(false);
    alert('所有数据已清除！');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 glass border-b">
        <div className="flex items-center gap-3 p-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-lg font-semibold flex-1">设置</h1>
        </div>
      </div>

      <motion.div 
        className="p-4 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 外观设置 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            外观
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-5">
              {/* 主题颜色 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <Label className="font-medium">主题颜色</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {THEME_COLORS.map((color) => (
                    <motion.button
                      key={color.value}
                      onClick={() => onColorChange(color.value)}
                      className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${color.gradient} shadow-md transition-all ${
                        primaryColor === color.value 
                          ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      title={color.name}
                      whileHover={{ scale: primaryColor === color.value ? 1.1 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {primaryColor === color.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 深色模式 */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {resolvedTheme === 'dark' ? (
                    <Moon className="w-4 h-4 text-primary" />
                  ) : (
                    <Sun className="w-4 h-4 text-primary" />
                  )}
                  <Label htmlFor="dark-mode" className="font-medium">外观模式</Label>
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <motion.button
                      key={t}
                      onClick={() => onThemeChange(t)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        theme === t
                          ? 'bg-card text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {t === 'light' && <Sun className="w-4 h-4" />}
                      {t === 'dark' && <Moon className="w-4 h-4" />}
                      {t === 'system' && <Monitor className="w-4 h-4" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 数据管理 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            数据管理
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <motion.button
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                    <Download className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">手动备份</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              <div className="border-t mx-4" />

              <motion.button
                onClick={handleImportClick}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">导入数据</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="border-t mx-4" />

              <motion.button
                onClick={() => setShowClearDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-red-500"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-medium">清除所有数据</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </CardContent>
          </Card>
        </motion.section>



        {/* 关于 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            关于
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">版本信息</span>
                </div>
                <span className="text-muted-foreground font-mono">v2.0.0</span>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 隐私说明 */}
        <motion.div 
          variants={itemVariants}
          className="text-center text-xs text-muted-foreground py-4"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>所有数据仅存储在本地设备</span>
          </div>
          <p>不会上传到任何服务器</p>
        </motion.div>
      </motion.div>

      {/* 清除数据确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认清除所有数据</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有物品数据，且无法恢复。建议先导出备份。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-500 hover:bg-red-600 rounded-xl">
              确认清除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 导入确认对话框 */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认导入数据</AlertDialogTitle>
            <AlertDialogDescription>
              导入将覆盖现有数据，建议先导出当前数据备份。是否继续？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm} className="rounded-xl">
              确认导入
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
