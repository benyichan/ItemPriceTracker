import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellOff,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Clock,
  Settings,
  RefreshCw
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { getAllReminders, addReminder, deleteReminder, markReminderAsRead } from '@/lib/db';
import { isItemExpiring, isItemExpired, formatDateCN } from '@/lib/helpers';
import type { Item, Reminder, Settings as AppSettings } from '@/types';
import { toast } from 'sonner';

interface ReminderManagerProps {
  items: Item[];
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export function ReminderManager({ items, settings, onUpdateSettings }: ReminderManagerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled);
  const [reminderTime, setReminderTime] = useState(settings.reminderTime);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(settings.reminderDaysBefore.toString());

  // 加载提醒列表
  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await getAllReminders();
      setReminders(data);
    } catch (error) {
      console.error('加载提醒列表失败:', error);
      toast.error('加载提醒列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  // 检查并创建提醒
  const checkAndCreateReminders = async () => {
    try {
      if (!reminderEnabled) return;

      const activeItems = items.filter(item => item.status === 'active');
      const newReminders: Reminder[] = [];

      activeItems.forEach(item => {
        if (isItemExpiring(item, parseInt(reminderDaysBefore))) {
          newReminders.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            itemId: item.id,
            itemName: item.name,
            reminderDate: new Date().toISOString(),
            type: 'expiring',
            read: false
          });
        } else if (isItemExpired(item)) {
          newReminders.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            itemId: item.id,
            itemName: item.name,
            reminderDate: new Date().toISOString(),
            type: 'expired',
            read: false
          });
        }
      });

      // 添加新提醒
      for (const reminder of newReminders) {
        await addReminder(reminder);
      }

      if (newReminders.length > 0) {
        await loadReminders();
        toast.success(`创建了 ${newReminders.length} 个新提醒`);
      }
    } catch (error) {
      console.error('检查提醒失败:', error);
    }
  };

  // 标记提醒为已读
  const handleMarkAsRead = async (id: string) => {
    try {
      await markReminderAsRead(id);
      await loadReminders();
    } catch (error) {
      console.error('标记提醒失败:', error);
      toast.error('标记提醒失败');
    }
  };

  // 删除提醒
  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
      await loadReminders();
      toast.success('提醒已删除');
    } catch (error) {
      console.error('删除提醒失败:', error);
      toast.error('删除提醒失败');
    }
  };

  // 清空所有提醒
  const handleClearAllReminders = async () => {
    try {
      for (const reminder of reminders) {
        await deleteReminder(reminder.id);
      }
      await loadReminders();
      setShowClearDialog(false);
      toast.success('所有提醒已清空');
    } catch (error) {
      console.error('清空提醒失败:', error);
      toast.error('清空提醒失败');
    }
  };

  // 更新提醒设置
  const handleUpdateReminderSettings = () => {
    onUpdateSettings({
      reminderEnabled,
      reminderTime,
      reminderDaysBefore: parseInt(reminderDaysBefore)
    });
    toast.success('提醒设置已更新');
  };

  // 计算未读提醒数量
  const unreadCount = reminders.filter(r => !r.read).length;

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
      {/* 提醒设置 */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">提醒设置</h3>
          </div>

          <div className="space-y-6">
            {/* 启用提醒 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {reminderEnabled ? (
                    <Bell className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <Label htmlFor="reminder-enabled" className="font-medium">启用提醒</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    启用物品到期提醒功能
                  </p>
                </div>
              </div>
              <Switch
                id="reminder-enabled"
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {/* 提醒时间 */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <Label htmlFor="reminder-time" className="font-medium">提醒时间</Label>
              </div>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                disabled={!reminderEnabled}
                className="max-w-xs"
              />
            </div>

            {/* 提前提醒天数 */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <Label htmlFor="reminder-days" className="font-medium">提前提醒天数</Label>
              </div>
              <Select
                value={reminderDaysBefore}
                onValueChange={setReminderDaysBefore}
                disabled={!reminderEnabled}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 天</SelectItem>
                  <SelectItem value="2">2 天</SelectItem>
                  <SelectItem value="3">3 天</SelectItem>
                  <SelectItem value="5">5 天</SelectItem>
                  <SelectItem value="7">7 天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleUpdateReminderSettings}
              disabled={!reminderEnabled}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              保存提醒设置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 提醒管理 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-muted-foreground" />
                提醒管理
              </h3>
            {unreadCount > 0 && (
              <motion.span 
                className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkAndCreateReminders}
              disabled={loading || !reminderEnabled}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              检查过期物品
            </Button>
            {reminders.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowClearDialog(true)}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
              删除
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : reminders.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-4">暂无提醒</p>
              <p className="text-xs text-muted-foreground mb-6">
                启用提醒功能后，系统会自动检测即将到期的物品
              </p>
              <Button 
                onClick={checkAndCreateReminders}
                disabled={!reminderEnabled}
              >
                检查过期物品
              </Button>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  variants={itemVariants}
                  layout
                >
                  <Card 
                    className={`hover:shadow-lg transition-all ${!reminder.read ? 'border-red-200 bg-red-50/50' : 'border-border hover:border-primary/30 hover:shadow-primary/5'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${reminder.type === 'expiring' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                          {reminder.type === 'expiring' ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Bell className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-medium ${!reminder.read ? 'text-red-600' : ''}`}>
                              {reminder.type === 'expiring' ? '即将过期' : '已过期'}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDateCN(reminder.reminderDate)}
                            </span>
                          </div>
                          <p className="text-sm mb-3">
                            物品 <strong>{reminder.itemName}</strong> {reminder.type === 'expiring' ? '即将过期' : '已过期'}
                          </p>
                          <div className="flex items-center gap-2">
                            {!reminder.read && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleMarkAsRead(reminder.id)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                标记为已读
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除提醒
                            </Button>
                          </div>
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

      {/* 清空提醒确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除所有提醒</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有提醒，且无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllReminders}
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
    </div>
  );
}
