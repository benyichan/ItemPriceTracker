import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { 
  getAllCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '@/lib/db';

interface CategoryManagerProps {
  onDataChanged: () => void;
}

interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

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

export function CategoryManager({ onDataChanged }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError('加载类别失败');
      console.error('加载类别失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('请输入类别名称');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const result = await addCategory(newCategoryName.trim());
      if (result) {
        setCategories(prev => [...prev, result]);
        setNewCategoryName('');
        setSuccess('添加类别成功');
        onDataChanged();
      } else {
        setError('添加类别失败');
      }
    } catch (err) {
      setError((err as Error).message || '添加类别失败');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      setError('请输入类别名称');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const result = await updateCategory(editingCategory.id, editCategoryName.trim());
      if (result) {
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, name: editCategoryName.trim(), updatedAt: new Date().toISOString() }
            : cat
        ));
        setEditingCategory(null);
        setEditCategoryName('');
        setSuccess('更新类别成功');
        onDataChanged();
      } else {
        setError('更新类别失败');
      }
    } catch (err) {
      setError((err as Error).message || '更新类别失败');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      setError(null);
      setSuccess(null);
      const result = await deleteCategory(category.id);
      if (result) {
        setCategories(prev => prev.filter(cat => cat.id !== category.id));
        setSuccess('删除类别成功');
        onDataChanged();
      } else {
        setError('删除类别失败');
      }
    } catch (err) {
      setError((err as Error).message || '删除类别失败');
    }
  };

  return (
    <motion.section 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-6">
          {/* 标题和添加类别 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="font-medium text-lg">物品类别管理</Label>
                <span className="text-sm text-muted-foreground">
                  ({categories.length}/10)
                </span>
              </div>
              {categories.length < 10 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      添加类别
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>添加新类别</DialogTitle>
                      <DialogDescription>
                        输入新类别的名称，类别总数不能超过10个。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="category-name">类别名称</Label>
                        <Input
                          id="category-name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="例如：日用品"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="default"
                        onClick={handleAddCategory}
                      >
                        添加
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* 错误和成功提示 */}
            {error && (
              <motion.div 
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg text-success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </div>

          {/* 类别列表 */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">暂无类别</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    className={`flex items-center justify-between p-3 rounded-lg border ${category.isDefault ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {category.isDefault ? (
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
                        )}
                        <span className={`font-medium ${category.isDefault ? 'text-primary' : ''}`}>
                          {category.name}
                        </span>
                        {category.isDefault && (
                          <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                            默认
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!category.isDefault && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>编辑类别</DialogTitle>
                                <DialogDescription>
                                  修改类别的名称，默认类别名称不允许修改。
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-category-name">类别名称</Label>
                                  <Input
                                    id="edit-category-name"
                                    value={editCategoryName}
                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                    placeholder="例如：日用品"
                                    maxLength={20}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="default"
                                  onClick={handleUpdateCategory}
                                >
                                  保存
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除类别</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除类别 "{category.name}" 吗？如果该类别下存在物品，将无法删除。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category)}
                                  className="bg-destructive hover:bg-destructive"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* 提示信息 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              系统默认类别不允许修改或删除，类别总数最多为10个。
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
