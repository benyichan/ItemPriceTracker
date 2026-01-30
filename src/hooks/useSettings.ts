import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '@/types';
import { getSettings, saveSettings, getDefaultSettings } from '@/lib/db';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(getDefaultSettings());
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      if (data) {
        setSettings(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
    setSettings(newSettings);
  }, [settings]);

  return {
    settings,
    loading,
    updateSettings,
    refresh: fetchSettings,
  };
}
