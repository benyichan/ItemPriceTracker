import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  ChevronRight, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Sparkles,
  DollarSign,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Item } from '@/types';
import { formatCurrency, calculateUnitPrice, calculateEndDate, getRemainingDays, getDaysDifference, formatDate } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface HomeViewProps {
  items: Item[];
  currency: string;
  monthlyComparison: {
    current: number;
    last: number;
    growthRate: number;
  };
  onAddItem: () => void;
  onViewItem: (item: Item) => void;
  onViewAllItems: () => void;
  onViewStatistics: () => void;
}

// 动画变体
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export function HomeView({
  items,
  currency,
  monthlyComparison,
  onAddItem,
  onViewItem,
  onViewAllItems,
  onViewStatistics,
}: HomeViewProps) {
  const [animatedCost, setAnimatedCost] = useState(0);
  const { primaryColor } = useTheme();
  
  // 动画显示金额
  useEffect(() => {
    const target = monthlyComparison.current;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedCost(target);
        clearInterval(timer);
      } else {
        setAnimatedCost(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [monthlyComparison.current]);

  // 计算总花费
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  // 计算今日分摊成本
  const calculateDailyCost = () => {
    const today = new Date().toISOString().split('T')[0];
    return items.reduce((sum, item) => {
      if (!item.usageDays) return sum;
      const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
      if (!endDate || endDate < today) return sum;
      
      const daysDifference = getDaysDifference(item.purchaseDate, endDate);
      if (daysDifference <= 0) return sum;
      
      const dailyCost = item.totalCost / daysDifference;
      return sum + dailyCost;
    }, 0);
  };

  const todayDailyCost = calculateDailyCost();

  // 获取即将到期的物品
  const expiringItems = items
    .filter(item => {
      if (item.status !== 'active' || !item.usageDays) return false;
      const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
      if (!endDate) return false;
      const remaining = getRemainingDays(endDate);
      return remaining > 0 && remaining <= 3;
    })
    .slice(0, 3);

  // 获取最近购买的3样物品（按购买时间降序）
  const recentPurchasedItems = [...items]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 3);

  // 获取价格最高的3样物品（按金额降序）
  const topPriceItems = [...items]
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 顶部成本概览 - 科技感渐变卡片 */}
      <motion.div 
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)` }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-6 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-white/70" />
              <p className="text-white/70 text-sm font-medium tracking-wide">本月累计分摊成本</p>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
              {formatCurrency(animatedCost, currency)}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/80">
              {monthlyComparison.growthRate > 0 ? (
                <>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{monthlyComparison.growthRate.toFixed(1)}%</span>
                  </div>
                  <span className="text-white/60">较上月</span>
                </>
              ) : monthlyComparison.growthRate < 0 ? (
                <>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" />
                    <span>{monthlyComparison.growthRate.toFixed(1)}%</span>
                  </div>
                  <span className="text-white/60">较上月</span>
                </>
              ) : (
                <span className="text-white/60">与上月持平</span>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 成本统计卡片 */}
      <motion.div
        className="p-4 -mt-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="grid grid-cols-2 gap-4">
          {/* 总花费 */}
          <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">总花费</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalCost, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                所有物品购买金额总和
              </p>
            </CardContent>
          </Card>

          {/* 今日分摊成本 */}
          <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow border border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">今日分摊成本</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(todayDailyCost, currency)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                今日在下次购买日期之前的物品分摊
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div 
        className="p-4 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 快捷功能入口 */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-3"
        >
          <motion.button
            onClick={onAddItem}
            className="group flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-shadow"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 4px 20px ${primaryColor}40`
              }}
            >
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">添加物品</span>
          </motion.button>
          
          <motion.button
            onClick={onViewAllItems}
            className="group flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-shadow"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 4px 20px ${primaryColor}40`
              }}
            >
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">物品列表</span>
          </motion.button>
          
          <motion.button
            onClick={onViewStatistics}
            className="group flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/40 transition-shadow"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 4px 20px ${primaryColor}40`
              }}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">数据统计</span>
          </motion.button>
        </motion.div>

        {/* 即将到期提醒 */}
        {expiringItems.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold">即将到期</h2>
              <span className="bg-amber-100 text-amber-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {expiringItems.length}
              </span>
            </div>
            <div className="space-y-2">
              {expiringItems.map((item, index) => {
                const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
                const remaining = endDate ? getRemainingDays(endDate) : 0;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-all border-amber-200/50 bg-gradient-to-r from-amber-50/50 to-transparent hover:from-amber-50/80"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-11 h-11 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-amber-600 font-medium">
                              {remaining === 0 ? '今天到期' : `还有 ${remaining} 天`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 最近购买 */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">最近购买</h2>
            <motion.button 
              onClick={onViewAllItems}
              className="text-sm text-primary flex items-center gap-1 hover:underline"
              whileHover={{ x: 2 }}
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {recentPurchasedItems.length > 0 ? (
            <div className="space-y-3">
              {recentPurchasedItems.map((item, index) => {
                const unitPrice = calculateUnitPrice(
                  item.totalCost,
                  item.quantity,
                  item.calculationType,
                  item.totalUses,
                  item.usageDays
                );
                const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all border-border hover:border-primary/30"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                              <Package className="w-7 h-7 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-base">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.category || '未分类'} · {item.quantity} 件
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">购买日期</p>
                            <p className="font-medium">{formatDate(item.purchaseDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">购买价格</p>
                            <p className="font-medium text-primary">{formatCurrency(item.totalCost, currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">每日成本</p>
                            <p className="font-medium">{formatCurrency(unitPrice, currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">下次购买日期</p>
                            <p className="font-medium">{endDate ? formatDate(endDate) : '无'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">还没有添加任何物品</p>
              <Button onClick={onAddItem} className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                添加第一个物品
              </Button>
            </Card>
          )}
        </motion.div>

        {/* 价格最高 */}
        {topPriceItems.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-lg font-semibold mb-3">价格最高</h2>
            <div className="space-y-3">
              {topPriceItems.map((item, index) => {
                const unitPrice = calculateUnitPrice(
                  item.totalCost,
                  item.quantity,
                  item.calculationType,
                  item.totalUses,
                  item.usageDays
                );
                const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all border-border hover:border-primary/30"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                            {index + 1}
                          </span>
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                              <Package className="w-7 h-7 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-base">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.category || '未分类'} · {item.quantity} 件
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">购买日期</p>
                            <p className="font-medium">{formatDate(item.purchaseDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">购买价格</p>
                            <p className="font-medium text-primary">{formatCurrency(item.totalCost, currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">每日成本</p>
                            <p className="font-medium">{formatCurrency(unitPrice, currency)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">下次购买日期</p>
                            <p className="font-medium">{endDate ? formatDate(endDate) : '无'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 浮动添加按钮 - 科技感 */}
      <motion.button
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddItem}
        className="fixed bottom-28 right-5 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center z-50"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
          boxShadow: `0 4px 20px ${primaryColor}40`
        }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}
