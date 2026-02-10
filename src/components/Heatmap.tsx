import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/hooks/useTheme';
import type { Item } from '@/types';

interface HeatmapProps {
  items: Item[];
}

type ViewMode = 'daily' | 'monthly';

// 热力图数据接口
interface HeatmapData {
  date: string;
  amount: number;
  formattedDate: string;
}

export function Heatmap({ items }: HeatmapProps) {
  const { primaryColor, resolvedTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');

  // 生成最近30天的日期数组
  const generateLast30Days = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // 生成最近12个月的日期数组
  const generateLast12Months = (): string[] => {
    const months: string[] = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    
    return months;
  };

  // 聚合日数据
  const dailyData: HeatmapData[] = useMemo(() => {
    const last30Days = generateLast30Days();
    const dateMap = new Map<string, number>();
    
    // 初始化所有日期的金额为0
    last30Days.forEach(date => {
      dateMap.set(date, 0);
    });
    
    // 聚合物品数据
    items.forEach(item => {
      const purchaseDate = item.purchaseDate.split('T')[0];
      if (dateMap.has(purchaseDate)) {
        dateMap.set(purchaseDate, dateMap.get(purchaseDate)! + item.totalCost);
      }
    });
    
    // 转换为数组格式
    return last30Days.map(date => {
      const dateObj = new Date(date);
      return {
        date,
        amount: dateMap.get(date) || 0,
        formattedDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
      };
    });
  }, [items]);

  // 聚合月数据
  const monthlyData: HeatmapData[] = useMemo(() => {
    const last12Months = generateLast12Months();
    const monthMap = new Map<string, number>();
    
    // 初始化所有月份的金额为0
    last12Months.forEach(month => {
      monthMap.set(month, 0);
    });
    
    // 聚合物品数据
    items.forEach(item => {
      const purchaseMonth = item.purchaseDate.substring(0, 7); // YYYY-MM
      if (monthMap.has(purchaseMonth)) {
        monthMap.set(purchaseMonth, monthMap.get(purchaseMonth)! + item.totalCost);
      }
    });
    
    // 转换为数组格式
    return last12Months.map(month => {
      const [year, monthNum] = month.split('-');
      return {
        date: month,
        amount: monthMap.get(month) || 0,
        formattedDate: `${year}年${parseInt(monthNum)}月`
      };
    });
  }, [items]);

  // 获取当前视图数据
  const currentData = viewMode === 'daily' ? dailyData : monthlyData;

  // 计算金额范围
  const amountRange = useMemo(() => {
    const amounts = currentData.map(item => item.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    return { min, max };
  }, [currentData]);

  // 颜色映射函数
  const getColorIntensity = (amount: number): number => {
    if (amountRange.max === amountRange.min) return 0;
    return (amount - amountRange.min) / (amountRange.max - amountRange.min);
  };

  // 获取单元格颜色
  const getCellColor = (amount: number): string => {
    const intensity = getColorIntensity(amount);
    const alpha = 0.1 + (intensity * 0.9); // 从0.1到1.0的透明度范围
    
    // 根据主题模式调整颜色
    if (resolvedTheme === 'dark') {
      // 深色模式：使用更亮的主色调
      return `rgba(${hexToRgb(primaryColor)}, ${alpha})`;
    } else {
      // 浅色模式：使用标准主色调
      return `rgba(${hexToRgb(primaryColor)}, ${alpha})`;
    }
  };

  // 辅助函数：将十六进制颜色转换为RGB
  const hexToRgb = (hex: string): string => {
    // 移除#号
    hex = hex.replace('#', '');
    
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  };

  // 生成颜色图例
  const colorLegend = useMemo(() => {
    const steps = 5;
    const legend = [];
    
    for (let i = 0; i < steps; i++) {
      const intensity = i / (steps - 1);
      const amount = amountRange.min + (intensity * (amountRange.max - amountRange.min));
      legend.push({
        intensity,
        amount,
        color: getCellColor(amountRange.min + (intensity * (amountRange.max - amountRange.min)))
      });
    }
    
    return legend;
  }, [amountRange, primaryColor, resolvedTheme]);

  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="p-4">
        {/* 标题和模式切换 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-base font-semibold">消费热力图</h3>
          </div>
          
          <motion.button
            onClick={() => setViewMode(viewMode === 'daily' ? 'monthly' : 'daily')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {viewMode === 'daily' ? (
              <>
                <Clock className="w-4 h-4" />
                <span className="text-sm">月度视图</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span className="text-sm">日度视图</span>
              </>
            )}
          </motion.button>
        </div>

        {/* 热力图网格 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`grid gap-2 ${viewMode === 'daily' ? 'grid-cols-5' : 'grid-cols-4'}`}
          >
            {currentData.map((item, index) => (
              <motion.div
                key={item.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className="relative"
              >
                <motion.div
                  className="aspect-square rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: getCellColor(item.amount) }}
                  whileHover={{ scale: 1.05 }}
                  title={`${item.formattedDate}: ¥${item.amount.toFixed(2)}`}
                >
                  {/* 不显示具体金额，只通过颜色表示 */}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1 text-center truncate">
                  {item.formattedDate}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* 颜色图例 */}
        <div className="mt-6">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">金额范围</h4>
          <div className="flex items-center gap-2">
            {colorLegend.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="text-xs text-muted-foreground mt-1">
                  {index === 0 ? '低' : index === colorLegend.length - 1 ? '高' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
