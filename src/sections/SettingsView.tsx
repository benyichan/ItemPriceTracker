import { useState, useCallback, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Moon, 
  Palette, 
  Info, 
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
import { clearAllData } from '@/lib/db';
import { BackupManager } from '@/components/BackupManager';
import { ReminderManager } from '@/components/ReminderManager';
import { CategoryManager } from '@/components/CategoryManager';

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

const THEME_COLORS: { name: string; value: ThemeColor }[] = [
  { name: '科技蓝', value: '#2A5CAA' },
  { name: '极光紫', value: '#7C3AED' },
  { name: '翡翠绿', value: '#059669' },
  { name: '能量橙', value: '#EA580C' },
  { name: '霓虹粉', value: '#DB2777' },
  { name: '电光青', value: '#0891B2' },
  { name: '阳光黄', value: '#F59E0B' },
  { name: '深蓝灰', value: '#1E3A8A' },
  { name: '薄荷绿', value: '#10B981' },
  { name: '珊瑚粉', value: '#F97316' },
  { name: '靛蓝色', value: '#6366F1' },
  { name: '琥珀色', value: '#FBBF24' },
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
  settings,
  theme,
  primaryColor,
  resolvedTheme,
  onBack,
  onUpdateSettings,
  onDataChanged,
  onThemeChange,
  onColorChange,
}: SettingsViewProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleClearData = async () => {
    await clearAllData();
    onDataChanged();
    setShowClearDialog(false);
    alert('所有数据已清除！');
  };

  const handleVersionClick = useCallback(() => {
    const currentTime = Date.now();
    
    // 检查是否在3秒内的点击
    if (currentTime - lastClickTimeRef.current > 3000) {
      // 超过3秒，重置计数
      clickCountRef.current = 1;
      lastClickTimeRef.current = currentTime;
    } else {
      // 在3秒内，增加计数
      clickCountRef.current += 1;
      
      // 检查是否达到3次点击
      if (clickCountRef.current >= 3) {
        // 显示作者信息
        setShowAuthorInfo(true);
        // 重置计数
        clickCountRef.current = 0;
        lastClickTimeRef.current = 0;
        
        // 3秒后自动隐藏
        setTimeout(() => {
          setShowAuthorInfo(false);
        }, 3000);
      }
    }
  }, []);

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
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {THEME_COLORS.map((color) => (
                    <motion.button
                      key={color.value}
                      onClick={() => onColorChange(color.value)}
                      className={`relative w-12 h-12 rounded-xl shadow-md transition-all ${
                        primaryColor === color.value 
                          ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-lg' 
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${color.value}, ${color.value}80)`
                      }}
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
                  <Label htmlFor="dark-mode" className="font-medium">主题</Label>
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
          <BackupManager onDataChanged={onDataChanged} />
        </motion.section>

        {/* 提醒设置 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            提醒设置
          </h2>
          <ReminderManager 
            items={[]} 
            settings={settings} 
            onUpdateSettings={onUpdateSettings}
          />
        </motion.section>

        {/* 类别管理 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            类别管理
          </h2>
          <CategoryManager onDataChanged={onDataChanged} />
        </motion.section>

        {/* 关于 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            关于
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <motion.div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleVersionClick}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">版本信息</span>
                </div>
                <span className="text-muted-foreground font-mono">v3.0.0</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 作者信息 */}
        {showAuthorInfo && (
          <motion.section 
            variants={itemVariants}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                  <p className="font-medium text-primary">本软件作者：本义</p>
                </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}

        {/* 隐私说明 */}
        <motion.div 
          variants={itemVariants}
          className="text-center text-xs text-muted-foreground py-4"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>所有数据仅存储在本地设备</span>
          </div>
          <p>无数据上传到任何服务器</p>
        </motion.div>
      </motion.div>

      {/* 清除数据确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除所有数据</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将清除所有数据，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData} className="bg-red-500 hover:bg-red-600 rounded-xl">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


    </div>
  );
}
