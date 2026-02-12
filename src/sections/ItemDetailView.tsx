import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit2, 
  Check, 
  Share2, 
  Archive, 
  Trash2,
  Package,
  Calendar,
  DollarSign,
  Hash,
  Clock,
  FileText
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
import type { Item } from '@/types';
import { formatCurrency, calculateUnitPrice, calculateEndDate, getRemainingDays } from '@/lib/utils';

interface ItemDetailViewProps {
  item: Item;
  currency: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkFinished: () => void;
  onShare: () => void;
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

export function ItemDetailView({
  item,
  currency,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onMarkFinished,
  onShare,
}: ItemDetailViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  // 计算单价 - 购买数量不参与
  const unitPrice = calculateUnitPrice(
    item.totalCost,
    item.quantity,
    item.calculationType,
    item.totalUses,
    item.usageDays
  );

  const endDate = calculateEndDate(item.purchaseDate, item.usageDays);
  const remainingDays = endDate ? getRemainingDays(endDate) : null;

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const handleFinish = () => {
    onMarkFinished();
    setShowFinishDialog(false);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 glass border-b">
        <div className="flex items-center justify-between p-4">
          <motion.button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={onShare}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={onEdit}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 图片区域 */}
        <motion.div variants={itemVariants}>
          {item.image ? (
            <div className="w-full aspect-video">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Package className="w-24 h-24 text-muted-foreground/30" />
            </div>
          )}
        </motion.div>

        {/* 基本信息 */}
        <motion.div variants={itemVariants} className="px-4">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="text-muted-foreground mt-1">
            添加于 {new Date(item.createdAt).toLocaleDateString('zh-CN')}
          </p>
          <div className="flex gap-2 mt-3">
            {item.status === 'finished' && (
              <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full font-medium">
                已用完
              </span>
            )}
            {item.status === 'archived' && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                已归档
              </span>
            )}
            {item.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                {item.category}
              </span>
            )}
          </div>
        </motion.div>

        {/* 成本信息 */}
        <motion.div variants={itemVariants} className="px-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            成本信息
          </h2>
          <Card className="overflow-hidden border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span>总花费</span>
                </div>
                <span className="font-medium">{formatCurrency(item.totalCost, currency)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span>购买数量</span>
                </div>
                <span className="font-medium">{item.quantity} 件</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>计算方式</span>
                </div>
                <span className="font-medium">
                  {item.calculationType === 'perUse' ? '按次使用' : '按天使用'}
                </span>
              </div>
              
              {item.calculationType === 'perUse' && item.totalUses && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>总使用次数</span>
                  </div>
                  <span className="font-medium">{item.totalUses} 次</span>
                </div>
              )}
              
              {item.calculationType === 'perDay' && item.usageDays && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>预计使用天数</span>
                  </div>
                  <span className="font-medium">{item.usageDays} 天</span>
                </div>
              )}
              
              <div className="border-t border-primary/20 pt-3 mt-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {item.calculationType === 'perUse' ? '单次单价' : '每日单价'}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(unitPrice, currency)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  计算公式: 总花费 ÷ {item.calculationType === 'perUse' ? '总使用次数' : '预计使用天数'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 时间信息 */}
        <motion.div variants={itemVariants} className="px-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            时间信息
          </h2>
          <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>购买日期</span>
                </div>
                <span className="font-medium">
                  {new Date(item.purchaseDate).toLocaleDateString('zh-CN')}
                </span>
              </div>
              
              {endDate && (
                <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent rounded-lg p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>预计结束日期</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">
                      {new Date(endDate).toLocaleDateString('zh-CN')}
                    </span>
                    {remainingDays !== null && (
                      <p className={`text-xs font-medium ${
                        remainingDays <= 0 ? 'text-red-500' : 
                        remainingDays <= 3 ? 'text-amber-500' : 'text-muted-foreground'
                      }`}>
                        {remainingDays <= 0 ? '已过期' : `还剩 ${remainingDays} 天`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 备注 */}
        {item.notes && (
          <motion.div variants={itemVariants} className="px-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              备注
            </h2>
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all">
              <CardContent className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{item.notes}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 使用记录 */}
        {item.usageRecords && item.usageRecords.length > 0 && (
          <motion.div variants={itemVariants} className="px-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              使用记录
            </h2>
            <Card className="overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all">
              <CardContent className="p-4 space-y-2 bg-gradient-to-r from-primary/5 to-transparent rounded-lg">
                {item.usageRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm">
                        {new Date(record.date).toLocaleDateString('zh-CN')}
                      </p>
                      {record.note && (
                        <p className="text-xs text-muted-foreground">{record.note}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium">+{record.count} 次</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* 底部操作栏 */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t p-4"
      >
        <div className="flex items-center gap-3">
          {item.status !== 'finished' && (
            <Button
              variant="default"
              className="flex-1 rounded-xl gradient-tech text-white"
              onClick={() => setShowFinishDialog(true)}
            >
              <Check className="w-4 h-4 mr-2" />
              标记已用完
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onArchive}
            className="rounded-xl"
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{item.name}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 rounded-xl">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 标记完成确认对话框 */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>标记为已用完</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将「{item.name}」标记为已用完吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinish} className="rounded-xl">
              确认
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
