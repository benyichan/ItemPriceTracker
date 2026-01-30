import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowLeft, Camera, Image as ImageIcon, X, Check, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { Item } from '@/types';
import { formatCurrency, calculateUnitPrice } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

interface AddItemViewProps {
  currency: string;
  defaultCategory: string;
  editingItem?: Item | null;
  onSave: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CATEGORIES = ['食品', '日用品', '电子产品', '服装', '书籍', '其他'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

export function AddItemView({
  currency,
  defaultCategory,
  editingItem,
  onSave,
  onCancel,
}: AddItemViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(editingItem?.name || '');
  const [totalCost, setTotalCost] = useState(editingItem?.totalCost?.toString() || '');
  const [quantity, setQuantity] = useState(editingItem?.quantity?.toString() || '1');
  useTheme();
  const [purchaseDate, setPurchaseDate] = useState(
    editingItem?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [calculationType, setCalculationType] = useState<'perUse' | 'perDay'>(
    editingItem?.calculationType || 'perUse'
  );
  const [totalUses, setTotalUses] = useState(editingItem?.totalUses?.toString() || '');
  const [usageDays, setUsageDays] = useState(editingItem?.usageDays?.toString() || '');
  // 为按次使用的物品添加估计使用天数
  const [estimatedUsageDays, setEstimatedUsageDays] = useState(editingItem?.usageDays?.toString() || '');
  const [image, setImage] = useState(editingItem?.image || '');
  const [category, setCategory] = useState(editingItem?.category || defaultCategory);
  const [notes, setNotes] = useState(editingItem?.notes || '');

  // 实时计算单价 - 购买数量不参与计算
  const unitPrice = useMemo(() => calculateUnitPrice(
    parseFloat(totalCost) || 0,
    parseFloat(quantity) || 1,
    calculationType,
    parseInt(totalUses) || undefined,
    parseInt(calculationType === 'perUse' ? estimatedUsageDays : usageDays) || undefined
  ), [totalCost, quantity, calculationType, totalUses, estimatedUsageDays, usageDays]);

  // 计算下次购买日期
  const nextPurchaseDate = useMemo(() => {
    if (!purchaseDate) return '';
    const days = calculationType === 'perUse' ? parseInt(estimatedUsageDays) : parseInt(usageDays);
    if (!days || days <= 0) return '';
    const date = new Date(purchaseDate);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }, [purchaseDate, calculationType, estimatedUsageDays, usageDays]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !totalCost || parseFloat(totalCost) <= 0) return;
    
    const itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      totalCost: parseFloat(totalCost),
      quantity: parseFloat(quantity) || 1,
      purchaseDate,
      calculationType,
      totalUses: calculationType === 'perUse' ? (parseInt(totalUses) || 1) : undefined,
      usageDays: parseInt(calculationType === 'perUse' ? estimatedUsageDays : usageDays) || 1,
      image: image || undefined,
      category: category || undefined,
      notes: notes || undefined,
      status: editingItem?.status || 'active',
      usageRecords: editingItem?.usageRecords || [],
    };
    
    onSave(itemData);
  };

  const isValid = name.trim() && totalCost && parseFloat(totalCost) > 0 &&
    (calculationType === 'perUse' ? (totalUses && estimatedUsageDays) : usageDays);

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 glass border-b">
        <div className="flex items-center justify-between p-4">
          <motion.button
            onClick={onCancel}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </motion.button>
          <h1 className="text-lg font-semibold">
            {editingItem ? '编辑物品' : '添加物品'}
          </h1>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isValid}
            className="rounded-full"
          >
            保存
          </Button>
        </div>
      </div>

      <motion.div 
        className="p-6 space-y-5 pb-48"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 基本信息 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            基本信息 <span className="text-red-500">*</span>
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">物品名称</Label>
                <Input
                  id="name"
                  placeholder="例如：洗发水"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalCost" className="text-sm font-medium">总花费金额 ({currency})</Label>
                <Input
                  id="totalCost"
                  type="number"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">购买数量</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseDate" className="text-sm font-medium">购买日期</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* 计算方式 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            计算方式
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => setCalculationType('perUse')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                calculationType === 'perUse'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 mb-3 flex items-center justify-center ${
                calculationType === 'perUse' ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {calculationType === 'perUse' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-primary" 
                  />
                )}
              </div>
              <p className="font-semibold text-left">按次使用</p>
              <p className="text-xs text-muted-foreground text-left mt-1">
                记录总使用次数
              </p>
            </motion.button>
            
            <motion.button
              onClick={() => setCalculationType('perDay')}
              className={`p-4 rounded-2xl border-2 transition-all ${
                calculationType === 'perDay'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-card'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 mb-3 flex items-center justify-center ${
                calculationType === 'perDay' ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {calculationType === 'perDay' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2.5 h-2.5 rounded-full bg-primary" 
                  />
                )}
              </div>
              <p className="font-semibold text-left">按天使用</p>
              <p className="text-xs text-muted-foreground text-left mt-1">
                记录使用期限
              </p>
            </motion.button>
          </div>
          
          <Card className="mt-3 overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {calculationType === 'perUse' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="totalUses" className="text-sm font-medium">总使用次数</Label>
                    <Input
                      id="totalUses"
                      type="number"
                      placeholder="例如：30"
                      value={totalUses}
                      onChange={(e) => setTotalUses(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimatedUsageDays" className="text-sm font-medium">估计使用天数</Label>
                    <Input
                      id="estimatedUsageDays"
                      type="number"
                      placeholder="例如：30"
                      value={estimatedUsageDays}
                      onChange={(e) => setEstimatedUsageDays(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="usageDays" className="text-sm font-medium">预计使用天数</Label>
                  <Input
                    id="usageDays"
                    type="number"
                    placeholder="例如：30"
                    value={usageDays}
                    onChange={(e) => setUsageDays(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              )}
              
              {/* 下次购买日期 */}
              {nextPurchaseDate && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-sm font-medium">下次购买日期</Label>
                  <div className="p-3 bg-muted rounded-xl">
                    {nextPurchaseDate}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* 可选信息 */}
        <motion.section variants={itemVariants}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            可选信息
          </h2>
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-4">
              {/* 图片 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">物品图片</Label>
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Item"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <motion.button
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">从相册选择</span>
                    </motion.button>
                    <motion.button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">拍照</span>
                    </motion.button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              {/* 类别 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">物品类别</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* 备注 */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">备注信息</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="添加备注..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>

      {/* 实时计算预览 */}
      <AnimatePresence>
        {unitPrice > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t p-6 safe-area-pb"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {calculationType === 'perUse' ? '单次单价' : '每日单价'}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(unitPrice, currency)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={!isValid} 
                size="lg"
                className="rounded-xl px-8 py-3"
              >
                <Check className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
