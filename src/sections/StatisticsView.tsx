import { motion, type Variants } from 'framer-motion';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Package, DollarSign, Calendar 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface StatisticsViewProps {
  currency: string;
  statistics: {
    totalCost: number;
    itemCount: number;
    averageUnitPrice: number;
    activeItems: number;
    finishedItems: number;
    expiringItems: number;
  };
  monthlyComparison: {
    current: number;
    last: number;
    growthRate: number;
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
  currency,
  statistics,
  monthlyComparison,
  onBack,
}: StatisticsViewProps) {
  useTheme();

  return (
    <div className="min-h-screen bg-background pb-6">
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
          <h1 className="text-lg font-semibold flex-1">数据统计</h1>
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
            核心指标
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">总成本</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(statistics.totalCost, currency)}</p>
                {monthlyComparison.growthRate !== 0 && (
                  <div className={`flex items-center gap-1 text-xs mt-2 ${
                    monthlyComparison.growthRate > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {monthlyComparison.growthRate > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>较上月 {monthlyComparison.growthRate > 0 ? '+' : ''}{monthlyComparison.growthRate.toFixed(1)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">物品总数</span>
                </div>
                <p className="text-2xl font-bold">{statistics.itemCount}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {statistics.activeItems} 进行中 · {statistics.finishedItems} 已用完
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">平均单价</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(statistics.averageUnitPrice, currency)}</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">即将到期</span>
                </div>
                <p className="text-2xl font-bold">{statistics.expiringItems}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  3天内到期
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>


      </motion.div>
    </div>
  );
}
