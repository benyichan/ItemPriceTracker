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

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-background pb-32">
      {/* 顶部成本概览 - 科技感渐变卡片 */}
      <motion.div 
        className="relative overflow-hidden rounded-b-3xl"
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 120,
          damping: 20
        }}
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)` }}
      >
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative p-8 pt-16 pb-16 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4"
          >
            <motion.div 
              className="flex items-center gap-3 mb-4"
              whileHover={{ x: 5 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-white/80" />
              </motion.div>
              <p className="text-white/80 text-sm font-medium tracking-wider uppercase">月度摊销成本</p>
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {formatCurrency(animatedCost, currency)}
            </motion.h1>
            <motion.div 
              className="flex items-center gap-3 text-sm text-white/90"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              {monthlyComparison.growthRate > 0 ? (
                <>
                  <motion.div 
                    className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">+{monthlyComparison.growthRate.toFixed(1)}%</span>
                  </motion.div>
                  <span className="text-white/70">较上月</span>
                </>
              ) : monthlyComparison.growthRate < 0 ? (
                <>
                  <motion.div 
                    className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span className="font-medium">{monthlyComparison.growthRate.toFixed(1)}%</span>
                  </motion.div>
                  <span className="text-white/70">较上月</span>
                </>
              ) : (
                <span className="text-white/70">与上月持平</span>
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* 成本统计卡片 */}
      <motion.div
        className="p-6 -mt-10 relative z-10 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.4,
          ease: "easeOut",
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 总花费 */}
          <motion.div
            whileHover={{
              y: -8,
              scale: 1.03,
              transition: {
                duration: 0.2
              }
            }}
          >
            <Card className="overflow-hidden border border-border bg-primary/10 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6">
                <motion.div 
                  className="flex items-center gap-3 text-muted-foreground mb-4"
                  whileHover={{ x: 8 }}
                >
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    <DollarSign className="w-6 h-6" />
                  </motion.div>
                  <span className="text-sm font-semibold uppercase tracking-wide">总花费</span>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {formatCurrency(totalCost, currency)}
                </motion.p>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  所有物品购买金额总和
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>

          {/* 今日分摊成本 */}
          <motion.div
            whileHover={{
              y: -8,
              scale: 1.03,
              transition: {
                duration: 0.2
              }
            }}
          >
            <Card className="overflow-hidden border border-border bg-primary/10 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300 rounded-2xl">
              <CardContent className="p-6">
                <motion.div 
                  className="flex items-center gap-3 text-muted-foreground mb-4"
                  whileHover={{ x: 8 }}
                >
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    <Clock className="w-6 h-6" />
                  </motion.div>
                  <span className="text-sm font-semibold uppercase tracking-wide">每日成本</span>
                </motion.div>
                <motion.p 
                  className="text-3xl font-bold mb-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {formatCurrency(todayDailyCost, currency)}
                </motion.p>
                <motion.p 
                  className="text-xs text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  下次购买日期前的物品每日摊销
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
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
          className="grid grid-cols-3 gap-4"
        >
          <motion.button
            onClick={onAddItem}
            className="group flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            whileHover={{
              y: -10,
              scale: 1.05,
              transition: {
                duration: 0.2
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                duration: 0.1
              }
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-primary/40 transition-all duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 6px 25px ${primaryColor}40`
              }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Plus className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-center">添加物品</span>
          </motion.button>
          
          <motion.button
            onClick={onViewAllItems}
            className="group flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            whileHover={{
              y: -10,
              scale: 1.05,
              transition: {
                duration: 0.2
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                duration: 0.1
              }
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-primary/40 transition-all duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 6px 25px ${primaryColor}40`
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Package className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-center">物品列表</span>
          </motion.button>
          
          <motion.button
            onClick={onViewStatistics}
            className="group flex flex-col items-center gap-3 p-5 bg-card rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
            whileHover={{
              y: -10,
              scale: 1.05,
              transition: {
                duration: 0.2
              }
            }}
            whileTap={{
              scale: 0.95,
              transition: {
                duration: 0.1
              }
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-primary/40 transition-all duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
                boxShadow: `0 6px 25px ${primaryColor}40`
              }}
              whileHover={{ rotate: -15 }}
              transition={{ duration: 0.2 }}
            >
              <FileText className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-sm font-semibold text-center">统计分析</span>
          </motion.button>
        </motion.div>

        {/* 即将到期提醒 */}
        {expiringItems.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold">即将到期</h2>
              <motion.span 
                className="bg-amber-100 text-amber-600 text-xs px-3 py-1 rounded-full font-medium"
                whileHover={{ scale: 1.1 }}
              >
                {expiringItems.length}
              </motion.span>
            </motion.div>
            <div className="space-y-3">
              {expiringItems.map((item, index) => {
                const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
                const remaining = endDate ? getRemainingDays(endDate) : 0;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    whileHover={{ x: 10 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-lg hover:shadow-amber-100 transition-all border-amber-200/50 bg-gradient-to-r from-amber-50/70 to-transparent hover:from-amber-50/90 rounded-xl"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <motion.img 
                              src={item.image} 
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover shadow-md"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-base">{item.name}</p>
                            <p className="text-sm text-amber-600 font-medium mt-1">
                              {remaining === 0 ? '今天到期' : `还有 ${remaining} 天`}
                            </p>
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ rotate: 90 }}
                        >
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 最近购买 */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-semibold">最近购买</h2>
            <motion.button 
              onClick={onViewAllItems}
              className="text-sm text-primary flex items-center gap-1 hover:underline font-medium"
              whileHover={{ x: 5, scale: 1.05 }}
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
          
          {recentPurchasedItems.length > 0 ? (
            <div className="space-y-4">
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all border-border hover:border-primary/30 rounded-xl"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-5 mb-4">
                          {item.image ? (
                            <motion.img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover shadow-md"
                              whileHover={{ scale: 1.1 }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shadow-sm">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-lg">{item.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.category || '未分类'} · {item.quantity} 件
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">购买日期</p>
                            <p className="font-semibold">{formatDate(item.purchaseDate)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">购买价格</p>
                            <p className="font-semibold text-primary">{formatCurrency(item.totalCost, currency)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.calculationType === 'perUse' ? '单次成本' : '每日成本'}</p>
                            <p className="font-semibold">{formatCurrency(unitPrice, currency)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">下次购买日期</p>
                            <p className="font-semibold">{endDate ? formatDate(endDate) : '无'}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              className="p-10 text-center border border-dashed rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-5">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-5 text-base">暂无物品</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onAddItem} 
                  className="rounded-full px-8 py-3"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  添加第一个物品
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* 价格最高 */}
        {topPriceItems.length > 0 && (
          <motion.div variants={itemVariants} className="mb-6">
            <motion.h2 
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              价值最高的物品
            </motion.h2>
            <div className="space-y-6">
              {topPriceItems.map((item, index) => {
                const unitPrice = calculateUnitPrice(
                  item.totalCost,
                  item.quantity,
                  item.calculationType,
                  item.totalUses,
                  item.usageDays
                );
                const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
                
                // 根据排名设置不同的样式
                let cardClassName = '';
                let badgeClassName = '';
                let badgeContent = '';
                let hoverEffect = {};
                
                switch (index) {
                  case 0: // 第1名
                    cardClassName = "cursor-pointer hover:shadow-2xl hover:shadow-primary/20 transition-all border-2 border-primary/70 bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 rounded-xl scale-105";
                    badgeClassName = "h-6 flex items-center justify-center text-lg font-bold flex-shrink-0";
                    badgeContent = "🥇";
                    hoverEffect = { x: -8, scale: 1.02 };
                    break;
                  case 1: // 第2名
                    cardClassName = "cursor-pointer hover:shadow-xl hover:shadow-primary/15 transition-all border-2 border-primary/50 bg-gradient-to-br from-primary/3 to-transparent hover:from-primary/8 rounded-xl scale-102";
                    badgeClassName = "h-6 flex items-center justify-center text-base font-bold flex-shrink-0";
                    badgeContent = "🥈";
                    hoverEffect = { x: -6, scale: 1.01 };
                    break;
                  case 2: // 第3名
                    cardClassName = "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all border-2 border-primary/30 bg-gradient-to-br from-primary/2 to-transparent hover:from-primary/5 rounded-xl";
                    badgeClassName = "h-6 flex items-center justify-center text-sm font-bold flex-shrink-0";
                    badgeContent = "🥉";
                    hoverEffect = { x: -5 };
                    break;
                  default:
                    cardClassName = "cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all border-border hover:border-primary/30 rounded-xl";
                    badgeClassName = "h-6 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0";
                    badgeContent = (index + 1).toString();
                    hoverEffect = { x: -5 };
                }
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.15 }}
                    whileHover={hoverEffect}
                  >
                    <Card 
                      className={cardClassName}
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center gap-6 mb-4">
                          <motion.span 
                            className={badgeClassName}
                            whileHover={{ scale: 1.2, rotate: 15 }}
                          >
                            {badgeContent}
                          </motion.span>
                          <div className="flex-1">
                            <p className={`font-bold text-xl ${index === 0 ? 'text-yellow-700 dark:text-yellow-400' : ''}`}>{item.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.category || '未分类'} · {item.quantity} 件
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">购买日期</p>
                            <p className="font-semibold">{formatDate(item.purchaseDate)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">购买价格</p>
                            <p className={`font-semibold ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-primary'}`}>{formatCurrency(item.totalCost, currency)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.calculationType === 'perUse' ? '单次成本' : '每日成本'}</p>
                            <p className="font-semibold">{formatCurrency(unitPrice, currency)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">下次购买日期</p>
                            <p className="font-semibold">{endDate ? formatDate(endDate) : '无'}</p>
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
        whileHover={{
          scale: 1.15,
          rotate: 90,
          boxShadow: `0 8px 30px ${primaryColor}60`
        }}
        whileTap={{
          scale: 0.9,
          transition: {
            duration: 0.1
          }
        }}
        onClick={onAddItem}
        className="fixed bottom-32 right-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center z-50"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}99 100%)`,
          boxShadow: `0 6px 25px ${primaryColor}40`
        }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          className="absolute inset-0"
        >
          <div className="w-full h-full border-2 border-white/30 rounded-2xl animate-ping" />
        </motion.div>
        <Plus className="w-7 h-7 text-white relative z-10" />
      </motion.button>
    </div>
  );
}
