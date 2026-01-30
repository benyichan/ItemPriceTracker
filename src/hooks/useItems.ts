import { useState, useEffect, useCallback } from 'react';
import type { Item } from '@/types';
import { getAllItems, addItem, updateItem, deleteItem, getItemsByStatus } from '@/lib/db';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllItems();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = useCallback(async (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem: Item = {
        ...itemData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addItem(newItem);
      await fetchItems();
      return newItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [fetchItems]);

  const editItem = useCallback(async (id: string, updates: Partial<Item>) => {
    try {
      const existingItem = items.find(i => i.id === id);
      if (!existingItem) throw new Error('Item not found');
      
      const updatedItem = {
        ...existingItem,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateItem(updatedItem);
      await fetchItems();
      return updatedItem;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [items, fetchItems]);

  const removeItem = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
      await fetchItems();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [fetchItems]);

  const getActiveItems = useCallback(async () => {
    return getItemsByStatus('active');
  }, []);

  const getFinishedItems = useCallback(async () => {
    return getItemsByStatus('finished');
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    editItem,
    removeItem,
    getActiveItems,
    getFinishedItems,
  };
}
