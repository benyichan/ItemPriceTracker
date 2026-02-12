import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { HomeView } from '@/sections/HomeView';
import { AddItemView } from '@/sections/AddItemView';
import { ItemListView } from '@/sections/ItemListView';
import { ItemDetailView } from '@/sections/ItemDetailView';
import { StatisticsView } from '@/sections/StatisticsView';
import { SettingsView } from '@/sections/SettingsView';
import { BottomNav } from '@/components/BottomNav';
import { useItems } from '@/hooks/useItems';
import { useSettings } from '@/hooks/useSettings';
import { useStatistics } from '@/hooks/useStatistics';
import { useTheme, type ThemeColor } from '@/hooks/useTheme';
import type { Item } from '@/types';
import { initDB } from '@/lib/db';
import { checkStoragePermission, getPermissionDeniedMessage } from '@/lib/backupManager';
import { calculateUnitPrice } from '@/lib/utils';
import './App.css';

type ViewType = 'home' | 'items' | 'statistics' | 'settings' | 'add' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { items, fetchItems, createItem, editItem, removeItem } = useItems();
  const { settings, updateSettings } = useSettings();
  const { statistics, monthlyComparison } = useStatistics(items);
  const { theme, primaryColor, resolvedTheme, setTheme, setPrimaryColor } = useTheme();

  // 初始化数据库和检查存储权限
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 初始化数据库
        await initDB();
        
        // 检查存储权限
        const hasPermission = await checkStoragePermission();
        if (!hasPermission) {
          const permissionMessage = getPermissionDeniedMessage();
          toast.warning(permissionMessage, {
            duration: 10000,
            action: {
              label: '知道了',
              onClick: () => {}
            }
          });
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('初始化应用失败:', error);
        toast.error('初始化失败，请重试');
        setIsReady(true);
      }
    };
    
    initializeApp();
  }, []);

  // 处理添加物品
  const handleAddItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createItem(itemData);
      toast.success('物品添加成功！');
      setCurrentView('home');
    } catch {
      toast.error('添加失败，请重试');
    }
  }, [createItem]);

  // 处理编辑物品
  const handleEditItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingItem) return;
    
    try {
      await editItem(editingItem.id, itemData);
      toast.success('物品更新成功！');
      setEditingItem(null);
      setCurrentView('detail');
    } catch {
      toast.error('更新失败，请重试');
    }
  }, [editingItem, editItem]);

  // 处理删除物品
  const handleDeleteItem = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await removeItem(selectedItem.id);
      toast.success('物品已删除');
      setSelectedItem(null);
      setCurrentView('items');
    } catch {
      toast.error('删除失败，请重试');
    }
  }, [selectedItem, removeItem]);

  // 处理归档物品
  const handleArchiveItem = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await editItem(selectedItem.id, { status: 'archived' });
      toast.success('物品已归档');
      setSelectedItem(null);
      setCurrentView('items');
    } catch {
      toast.error('操作失败，请重试');
    }
  }, [selectedItem, editItem]);

  // 处理标记完成
  const handleMarkFinished = useCallback(async () => {
    if (!selectedItem) return;
    
    try {
      await editItem(selectedItem.id, { status: 'finished' });
      toast.success('已标记为已用完');
      setSelectedItem(null);
      setCurrentView('items');
    } catch {
      toast.error('操作失败，请重试');
    }
  }, [selectedItem, editItem]);

  // 处理分享
  const handleShare = useCallback(() => {
    if (!selectedItem) return;
    
    const unitPrice = calculateUnitPrice(
      selectedItem.totalCost,
      selectedItem.quantity,
      selectedItem.calculationType,
      selectedItem.totalUses,
      selectedItem.usageDays
    );
    
    const shareText = `【${selectedItem.name}】\n总花费：${settings.currency}${selectedItem.totalCost.toFixed(2)}\n${selectedItem.calculationType === 'perUse' ? '单次' : '每日'}单价：${settings.currency}${unitPrice.toFixed(2)}\n\n来自物品单价记录应用`;
    
    if (navigator.share) {
      navigator.share({
        title: selectedItem.name,
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('已复制到剪贴板');
    }
  }, [selectedItem, settings.currency]);

  // 查看物品详情
  const handleViewItem = useCallback((item: Item) => {
    setSelectedItem(item);
    setCurrentView('detail');
  }, []);

  // 编辑物品
  const handleEdit = useCallback(() => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setCurrentView('add');
    }
  }, [selectedItem]);

  // 取消编辑
  const handleCancelEdit = useCallback(() => {
    setEditingItem(null);
    setCurrentView(editingItem ? 'detail' : 'home');
  }, [editingItem]);

  // 处理主题颜色切换
  const handleColorChange = useCallback((color: ThemeColor) => {
    setPrimaryColor(color);
    // 同时更新设置中的颜色
    updateSettings({ primaryColor: color });
  }, [setPrimaryColor, updateSettings]);

  // 渲染当前视图
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView
            items={items}
            currency={settings.currency}
            monthlyComparison={monthlyComparison}
            onAddItem={() => {
              setEditingItem(null);
              setCurrentView('add');
            }}
            onViewItem={handleViewItem}
            onViewAllItems={() => setCurrentView('items')}
            onViewStatistics={() => setCurrentView('statistics')}
          />
        );

      case 'add':
        return (
          <AddItemView
            currency={settings.currency}
            defaultCategory={settings.defaultCategory}
            editingItem={editingItem}
            onSave={editingItem ? handleEditItem : handleAddItem}
            onCancel={handleCancelEdit}
          />
        );

      case 'items':
        return (
          <ItemListView
            items={items}
            currency={settings.currency}
            onBack={() => setCurrentView('home')}
            onViewItem={handleViewItem}
          />
        );

      case 'detail':
        if (!selectedItem) return null;
        return (
          <ItemDetailView
            item={selectedItem}
            currency={settings.currency}
            onBack={() => setCurrentView('items')}
            onEdit={handleEdit}
            onDelete={handleDeleteItem}
            onArchive={handleArchiveItem}
            onMarkFinished={handleMarkFinished}
            onShare={handleShare}
          />
        );

      case 'statistics':
        return (
          <StatisticsView
            items={items}
            statistics={statistics}
            onBack={() => setCurrentView('home')}
          />
        );

      case 'settings':
        return (
          <SettingsView
            settings={settings}
            theme={theme}
            primaryColor={primaryColor}
            resolvedTheme={resolvedTheme}
            onBack={() => setCurrentView('home')}
            onUpdateSettings={updateSettings}
            onDataChanged={fetchItems}
            onThemeChange={setTheme}
            onColorChange={handleColorChange}
          />
        );

      default:
        return null;
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-bg">
        <motion.div 
          className="relative"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--card-foreground))',
          },
        }}
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          className="min-h-screen"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      {/* 底部导航 - 只在主页、物品列表、统计、设置页面显示 */}
      {['home', 'items', 'statistics', 'settings'].includes(currentView) && (
        <BottomNav
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view as ViewType)}
        />
      )}
    </div>
  );
}

export default App;
