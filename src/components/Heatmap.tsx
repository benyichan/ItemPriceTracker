import { useState, useMemo, useCallback } from 'react';
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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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

  // 生成特定月份的每日数据
  const generateDaysInMonth = (month: string, items: Item[]): HeatmapData[] => {
    const [year, monthNum] = month.split('-').map(Number);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const days: HeatmapData[] = [];
    const dayMap = new Map<string, number>();
    
    // 初始化所有日期的金额为0
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dayMap.set(dateStr, 0);
    }
    
    // 聚合物品数据
    items.forEach(item => {
      const purchaseDate = item.purchaseDate.split('T')[0];
      if (purchaseDate.startsWith(month)) {
        dayMap.set(purchaseDate, (dayMap.get(purchaseDate) || 0) + item.totalCost);
      }
    });
    
    // 转换为数组格式
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        amount: dayMap.get(dateStr) || 0,
        formattedDate: `${day}`
      });
    }
    
    return days;
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

  // 获取选中月份的每日数据
  const selectedMonthDays = useMemo(() => {
    if (!selectedMonth) return [];
    return generateDaysInMonth(selectedMonth, items);
  }, [selectedMonth, items]);

  // 计算金额范围
  const amountRange = useMemo(() => {
    const amounts = currentData.map(item => item.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    return { min, max };
  }, [currentData]);

  // 计算选中月份每日数据的金额范围
  const selectedMonthAmountRange = useMemo(() => {
    if (!selectedMonthDays.length) return { min: 0, max: 0 };
    const amounts = selectedMonthDays.map(item => item.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    return { min, max };
  }, [selectedMonthDays]);

  // 辅助函数：将十六进制颜色转换为RGB
  const hexToRgb = useCallback((hex: string): string => {
    // 移除#号
    hex = hex.replace('#', '');
    
    // 解析RGB值
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }, []);

  // 颜色映射函数
  const getColorIntensity = useCallback((amount: number, range: { min: number; max: number }): number => {
    if (range.max === range.min) return 0;
    return (amount - range.min) / (range.max - range.min);
  }, []);

  // 获取单元格颜色
  const getCellColor = useCallback((amount: number, range?: { min: number; max: number }): string => {
    const targetRange = range || amountRange;
    const intensity = getColorIntensity(amount, targetRange);
    const alpha = 0.1 + (intensity * 0.9); // 从0.1到1.0的透明度范围
    
    // 根据主题模式调整颜色
    if (resolvedTheme === 'dark') {
      // 深色模式：使用更亮的主色调
      return `rgba(${hexToRgb(primaryColor)}, ${alpha})`;
    } else {
      // 浅色模式：使用标准主色调
      return `rgba(${hexToRgb(primaryColor)}, ${alpha})`;
    }
  }, [amountRange, primaryColor, resolvedTheme, getColorIntensity, hexToRgb]);

  // 格式化金额显示
  const formatAmount = (amount: number): string => {
    if (!amount) return '';
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(2)}万`;
    }
    return amount.toFixed(0);
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
  }, [amountRange, getCellColor]);

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
                  onClick={() => {
                    if (viewMode === 'monthly') {
                      // 切换选中的月份：如果点击的是当前选中的月份，则取消选中；否则选中新月份
                      setSelectedMonth(selectedMonth === item.date ? null : item.date);
                    }
                  }}
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

        {/* 选中月份的每日热力图 */}
        <AnimatePresence>
          {selectedMonth && viewMode === 'monthly' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <h4 className="text-sm font-medium mb-3">
                {monthlyData.find(m => m.date === selectedMonth)?.formattedDate} 每日消费
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {selectedMonthDays.map((item, index) => (
                  <motion.div
                    key={item.date}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className="relative"
                  >
                    <motion.div
                      className="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer"
                      style={{ backgroundColor: getCellColor(item.amount, selectedMonthAmountRange) }}
                      whileHover={{ scale: 1.05 }}
                      title={`${item.formattedDate}日: ¥${item.amount.toFixed(2)}`}
                    >
                      <div className="text-xs font-medium">
                        {item.formattedDate}
                      </div>
                      <div className="text-xs mt-1">
                        {formatAmount(item.amount)}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
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
