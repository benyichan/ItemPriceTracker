import { useMemo } from 'react';
import type { Item, Statistics } from '@/types';
import { 
  calculateUnitPrice, 
  getMonthRange
} from '@/lib/utils';

export function useStatistics(items: Item[]) {
  const statistics = useMemo<Statistics>(() => {
    const activeItems = items.filter(i => i.status === 'active');
    const finishedItems = items.filter(i => i.status === 'finished');
    
    const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
    
    let totalUnitPrice = 0;
    let unitPriceCount = 0;
    
    items.forEach(item => {
      const unitPrice = calculateUnitPrice(
        item.totalCost,
        item.quantity,
        item.calculationType,
        item.totalUses,
        item.usageDays
      );
      if (unitPrice > 0) {
        totalUnitPrice += unitPrice;
        unitPriceCount++;
      }
    });
    
    const averageUnitPrice = unitPriceCount > 0 ? totalUnitPrice / unitPriceCount : 0;
    
    // 计算即将到期的物品
    const expiringItems = activeItems.filter(item => {
      if (!item.usageDays || item.usageDays <= 0) return false;
      const endDate = new Date(item.purchaseDate);
      endDate.setDate(endDate.getDate() + item.usageDays);
      const remaining = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return remaining > 0 && remaining <= 3;
    }).length;
    
    return {
      totalCost,
      itemCount: items.length,
      averageUnitPrice,
      activeItems: activeItems.length,
      finishedItems: finishedItems.length,
      expiringItems,
    };
  }, [items]);

  // 月度对比
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = getMonthRange(now.getFullYear(), now.getMonth() + 1);
    const lastMonth = getMonthRange(now.getFullYear(), now.getMonth());
    
    // 计算当前月份的累计分摊成本（从1号到今天）
    const calculateMonthlyAllocatedCost = (startDate: string, endDate: string, itemList: Item[]) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const dailyCosts: Record<string, number> = {};
      
      itemList.forEach(item => {
        if (!item.usageDays || item.usageDays <= 0) return;
        
        const itemStart = new Date(item.purchaseDate);
        const itemEnd = new Date(itemStart.getTime() + item.usageDays * 24 * 60 * 60 * 1000);
        
        // 计算每日分摊金额
        const dailyCost = item.totalCost / item.usageDays;
        
        // 将每日分摊金额分摊到购买日期至下次购买日期之间的每一天
        // 但只计算在指定范围内的日期
        for (let d = new Date(itemStart); d <= itemEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          // 只计算在指定范围内的日期
          if (d >= start && d <= end) {
            if (!dailyCosts[dateStr]) dailyCosts[dateStr] = 0;
            dailyCosts[dateStr] += dailyCost;
          }
        }
      });
      
      // 计算总分摊成本
      return Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0);
    };
    
    // 当前月份的结束日期是今天
    const today = now.toISOString().split('T')[0];
    const currentCost = calculateMonthlyAllocatedCost(currentMonth.start, today, items);
    
    // 上个月的结束日期是上个月的最后一天
    const lastMonthEnd = lastMonth.end;
    const lastCost = calculateMonthlyAllocatedCost(lastMonth.start, lastMonthEnd, items);
    
    const growthRate = lastCost > 0 ? ((currentCost - lastCost) / lastCost) * 100 : 0;
    
    return {
      current: currentCost,
      last: lastCost,
      growthRate,
    };
  }, [items]);

  return {
    statistics,
    monthlyComparison,
  };
}
