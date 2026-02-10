import { motion, type Variants } from 'framer-motion';
import { 
  ArrowLeft, Package, DollarSign, Calendar, Clock, TrendingUp, Tag 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Heatmap } from '@/components/Heatmap';
import { useTheme } from '@/hooks/useTheme';
import type { Item } from '@/types';

interface StatisticsViewProps {
  items: Item[];
  statistics: {
    totalCost: number;
    itemCount: number;
    averageUnitPrice: number;
    activeItems: number;
    finishedItems: number;
    expiringItems: number;
  };
  onBack: () => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function StatisticsView({
  items,
  statistics,
  onBack,
}: StatisticsViewProps) {
  useTheme();

  // 计算新增统计维度
  // 1. 使用年限最长的物品
  const oldestItem = items.reduce((oldest, item) => {
    if (!oldest) return item;
    const oldestDate = new Date(oldest.purchaseDate);
    const currentDate = new Date(item.purchaseDate);
    return currentDate < oldestDate ? item : oldest;
  }, null as Item | null);

  // 2. 价格最高的物品
  const mostExpensiveItem = items.reduce((mostExpensive, item) => {
    if (!mostExpensive) return item;
    return item.totalCost > mostExpensive.totalCost ? item : mostExpensive;
  }, null as Item | null);

  // 3. 最近一次购买物品
  const latestPurchaseItem = items.reduce((latest, item) => {
    if (!latest) return item;
    const latestDate = new Date(latest.purchaseDate);
    const currentDate = new Date(item.purchaseDate);
    return currentDate > latestDate ? item : latest;
  }, null as Item | null);

  // 4. 金额合计最高的物品类别
  const categoryCosts = items.reduce((acc, item) => {
    const category = item.category || '未分类';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += item.totalCost;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCosts).reduce((top, [category, cost]) => {
    if (!top) return { category, cost };
    return cost > top.cost ? { category, cost } : top;
  }, null as { category: string; cost: number } | null);

  // 格式化数字，保留2位小数
  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
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
          <h1 className="text-lg font-semibold flex-1">统计分析</h1>
        </div>
      </div>

      <motion.div 
        className="p-4 space-y-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 核心指标 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            统计分析
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">总花费</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatNumber(statistics.totalCost)}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">总物品数</span>
                </div>
                <p className="text-2xl font-bold">{statistics.itemCount}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {statistics.activeItems} 件进行中 · {statistics.finishedItems} 件已用完
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">平均单价</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatNumber(statistics.averageUnitPrice)}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">即将过期</span>
                </div>
                <p className="text-2xl font-bold">{statistics.expiringItems}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  3天内到期
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* 新增统计维度 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            详细分析
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {/* 使用年限最长的物品 */}
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">使用年限最长</span>
                </div>
                <p className="text-lg font-bold">{oldestItem?.name || '无'}</p>
                {oldestItem && (
                  <p className="text-sm text-primary mt-1">购买价格: {formatNumber(oldestItem.totalCost)}</p>
                )}
              </CardContent>
            </Card>

            {/* 价格最高的物品 */}
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">价格最高</span>
                </div>
                <p className="text-lg font-bold">{mostExpensiveItem?.name || '无'}</p>
                {mostExpensiveItem && (
                  <p className="text-sm text-primary mt-1">购买价格: {formatNumber(mostExpensiveItem.totalCost)}</p>
                )}
              </CardContent>
            </Card>

            {/* 最近一次购买物品的日期 */}
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">最近购买</span>
                </div>
                {latestPurchaseItem ? (
                  <div className="space-y-2">
                    <p className="text-lg font-bold">{latestPurchaseItem.name}</p>
                    <p className="text-sm">购买日期: {formatDate(latestPurchaseItem.purchaseDate)}</p>
                    <p className="text-sm text-primary">购买价格: {formatNumber(latestPurchaseItem.totalCost)}</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold">无</p>
                )}
              </CardContent>
            </Card>

            {/* 金额合计最高的类别 */}
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">金额最高类别</span>
                </div>
                <p className="text-lg font-bold break-words">{topCategory?.category || '无'}</p>
                {topCategory && (
                  <p className="text-sm text-primary mt-1">购买价格: {formatNumber(topCategory.cost)}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* 消费热力图 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            消费趋势
          </h2>
          <Heatmap items={items} />
        </motion.section>
      </motion.div>
    </div>
  );
}
