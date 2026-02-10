import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  Package,
  Calendar,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { Item, FilterStatus, SortType, ViewType } from '@/types';
import { formatCurrency, calculateUnitPrice, calculateEndDate, getRemainingDays } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface ItemListViewProps {
  items: Item[];
  currency: string;
  onBack: () => void;
  onViewItem: (item: Item) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function ItemListView({
  items,
  currency,
  onBack,
  onViewItem,
}: ItemListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortType, setSortType] = useState<SortType>('dateAdded');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState<'day' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  useTheme();

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 过滤和排序物品
  const filteredItems = useMemo(() => {
    let result = [...items];
    
    // 搜索过滤
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(item => {
        // 扩展搜索范围：名称、类别、备注
        const nameMatch = item.name.toLowerCase().includes(query);
        const categoryMatch = item.category?.toLowerCase().includes(query);
        const notesMatch = item.notes?.toLowerCase().includes(query);
        
        // 模糊匹配：如果搜索词是多个词，只要匹配其中一个即可
        const queryWords = query.split(/\s+/);
        const partialMatch = queryWords.some(word => 
          item.name.toLowerCase().includes(word) ||
          item.category?.toLowerCase().includes(word) ||
          item.notes?.toLowerCase().includes(word)
        );
        
        return nameMatch || categoryMatch || notesMatch || partialMatch;
      });
    }
    
    // 状态过滤
    if (filterStatus !== 'all') {
      result = result.filter(item => item.status === filterStatus);
    }
    
    // 日期过滤
    if (dateFilterMode === 'day' && selectedDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.purchaseDate).toLocaleDateString();
        const filterDate = new Date(selectedDate).toLocaleDateString();
        return itemDate === filterDate;
      });
    } else if (dateFilterMode === 'month' && selectedMonth) {
      result = result.filter(item => {
        const itemMonth = item.purchaseDate.substring(0, 7); // YYYY-MM
        return itemMonth === selectedMonth;
      });
    }
    
    // 排序
    result.sort((a, b) => {
      switch (sortType) {
        case 'dateAdded':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'purchaseDate':
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        case 'expiryDate':
          const endA = calculateEndDate(a.purchaseDate, a.usageDays);
          const endB = calculateEndDate(b.purchaseDate, b.usageDays);
          if (!endA) return 1;
          if (!endB) return -1;
          return new Date(endA).getTime() - new Date(endB).getTime();
        case 'unitPrice':
          const priceA = calculateUnitPrice(a.totalCost, a.quantity, a.calculationType, a.totalUses, a.usageDays);
          const priceB = calculateUnitPrice(b.totalCost, b.quantity, b.calculationType, b.totalUses, b.usageDays);
          return priceB - priceA;
        default:
          return 0;
      }
    });
    
    return result;
  }, [items, debouncedSearchQuery, filterStatus, sortType, dateFilterMode, selectedDate, selectedMonth]);

  const getStatusBadge = (item: Item) => {
    if (item.status === 'finished') {
      return (
        <span className="px-2.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
          已用完
        </span>
      );
    }
    if (item.status === 'archived') {
      return (
        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
          已归档
        </span>
      );
    }
    if (item.usageDays) {
      const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
      if (endDate) {
        const remaining = getRemainingDays(endDate);
        if (remaining <= 0) {
          return (
            <span className="px-2.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
              已过期
            </span>
          );
        }
        if (remaining <= 3) {
          return (
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-600 text-xs rounded-full font-medium">
              即将过期
            </span>
          );
        }
      }
    }
    return (
      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
        进行中
      </span>
    );
  };

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
          <h1 className="text-lg font-semibold flex-1">我的物品</h1>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewType === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索物品"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        {/* 筛选标签 */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {(['all', 'active', 'finished', 'archived'] as FilterStatus[]).map((status) => (
            <motion.button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
                filterStatus === status
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'bg-muted hover:bg-muted/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status === 'all' && '全部'}
              {status === 'active' && '进行中'}
              {status === 'finished' && '已用完'}
              {status === 'archived' && '已归档'}
            </motion.button>
          ))}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-full transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={`p-1.5 rounded-full transition-colors ${
              showDateFilter || (selectedDate || selectedMonth)
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="w-4 h-4" />
          </motion.button>
        </div>

        {/* 日期筛选器 */}
        <AnimatePresence>
          {showDateFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-sm font-medium">日期筛选</h3>
                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <motion.button
                      onClick={() => setDateFilterMode('day')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        dateFilterMode === 'day' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      按日
                    </motion.button>
                    <motion.button
                      onClick={() => setDateFilterMode('month')}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        dateFilterMode === 'month' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      按月
                    </motion.button>
                  </div>
                </div>
                
                {dateFilterMode === 'day' ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-muted-foreground">选择日期</label>
                    <Input
                      type="date"
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value || null)}
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-medium text-muted-foreground">选择月份</label>
                    <Input
                      type="month"
                      value={selectedMonth || ''}
                      onChange={(e) => setSelectedMonth(e.target.value || null)}
                      className="rounded-xl"
                    />
                  </div>
                )}
                
                {(selectedDate || selectedMonth) && (
                  <motion.button
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedMonth(null);
                    }}
                    className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    whileHover={{ x: 2 }}
                  >
                    <X className="w-3 h-3" />
                    清除筛选
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 排序选项 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t overflow-hidden"
            >
              <div className="p-4 flex items-center gap-2 overflow-x-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">排序：</span>
                {([
                  { key: 'dateAdded', label: '添加时间' },
                  { key: 'purchaseDate', label: '购买日期' },
                  { key: 'expiryDate', label: '到期时间' },
                  { key: 'unitPrice', label: '单价高低' },
                ] as { key: SortType; label: string }[]).map(({ key, label }) => (
                  <motion.button
                    key={key}
                    onClick={() => setSortType(key)}
                    className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition-all ${
                      sortType === key
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 物品列表 */}
      <div className="p-4 pb-24">
        {filteredItems.length > 0 ? (
          <motion.div 
            className={viewType === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => {
                const unitPrice = calculateUnitPrice(
                  item.totalCost,
                  item.quantity,
                  item.calculationType,
                  item.totalUses,
                  item.usageDays
                );

                if (viewType === 'grid') {
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      variants={itemVariants}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all overflow-hidden border-border hover:border-primary/30"
                        onClick={() => onViewItem(item)}
                      >
                        {item.image ? (
                          <div className="aspect-square">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Package className="w-12 h-12 text-muted-foreground/50" />
                          </div>
                        )}
                        <CardContent className="p-3">
                          <p className="font-medium truncate">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-primary font-semibold">
                              {formatCurrency(item.totalCost, currency)}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              总花费
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(unitPrice, currency)}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {item.calculationType === 'perUse' ? '/次' : '/天'}
                            </span>
                          </div>
                          <div className="mt-2">{getStatusBadge(item)}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.id}
                    layout
                    variants={itemVariants}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-lg hover:shadow-primary/5 transition-all border-border hover:border-primary/30"
                      onClick={() => onViewItem(item)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate flex-1">{item.name}</p>
                            <div className="flex-shrink-0">
                              {getStatusBadge(item)}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.category || '未分类'} · {item.quantity} 件
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.purchaseDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary text-lg">
                            {formatCurrency(item.totalCost, currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">总花费</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatCurrency(unitPrice, currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.calculationType === 'perUse' ? '/次' : '/天'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">
              {(selectedDate || selectedMonth) ? '当前日期未采购任何物品' : (searchQuery ? '没有找到匹配的物品' : '暂无物品')}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
