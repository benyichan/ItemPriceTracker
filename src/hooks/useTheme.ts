import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';

export type ThemeColor = 
  | '#2A5CAA' // 科技蓝
  | '#7C3AED' // 极光紫
  | '#059669' // 翡翠绿
  | '#EA580C' // 能量橙
  | '#DB2777' // 霓虹粉
  | '#0891B2'; // 电光青

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  primaryColor: ThemeColor;
}

const THEME_COLORS: Record<ThemeColor, { light: string; dark: string }> = {
  '#2A5CAA': { 
    light: '214 62% 41%', 
    dark: '214 70% 55%' 
  },
  '#7C3AED': { 
    light: '262 56% 58%', 
    dark: '262 70% 65%' 
  },
  '#059669': { 
    light: '158 76% 37%', 
    dark: '158 70% 50%' 
  },
  '#EA580C': { 
    light: '24 95% 53%', 
    dark: '24 90% 60%' 
  },
  '#DB2777': { 
    light: '330 70% 50%', 
    dark: '330 75% 60%' 
  },
  '#0891B2': { 
    light: '189 94% 43%', 
    dark: '189 85% 55%' 
  },
};

export function useTheme() {
  const [themeState, setThemeState] = useState<ThemeState>({
    theme: 'system',
    primaryColor: '#2A5CAA',
  });
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // 解析实际主题（处理 system 情况）
  useEffect(() => {
    const resolveTheme = () => {
      if (themeState.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(themeState.theme);
      }
    };

    resolveTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (themeState.theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeState.theme]);

  // 从 Preferences 加载主题
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { value } = await Preferences.get({
          key: 'item-manager-theme'
        });
        
        if (value) {
          try {
            const parsed = JSON.parse(value);
            setThemeState(parsed);
            console.log('Theme settings loaded successfully:', parsed);
          } catch (parseError) {
            console.error('Error parsing theme settings:', parseError);
            // 解析失败时使用默认值
          }
        } else {
          console.log('No saved theme settings found, using defaults');
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
        // 加载失败时使用默认值
      }
    };

    loadTheme();
  }, []);

  // 应用主题到 DOM
  useEffect(() => {
    const root = document.documentElement;
    const colorHsl = THEME_COLORS[themeState.primaryColor][resolvedTheme];
    
    // 设置主色调 - 正确包装hsl()函数
    root.style.setProperty('--primary', `hsl(${colorHsl})`);
    root.style.setProperty('--ring', `hsl(${colorHsl})`);
    
    // 设置深色/浅色模式
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 保存到 Preferences
    const saveTheme = async () => {
      try {
        await Preferences.set({
          key: 'item-manager-theme',
          value: JSON.stringify(themeState)
        });
        console.log('Theme settings saved successfully:', themeState);
      } catch (error) {
        console.error('Error saving theme settings:', error);
        // 保存失败时使用默认值，但应用仍能正常运行
      }
    };

    saveTheme();
  }, [themeState, resolvedTheme]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setThemeState(prev => ({ ...prev, theme }));
  }, []);

  const setPrimaryColor = useCallback((primaryColor: ThemeColor) => {
    setThemeState(prev => ({ ...prev, primaryColor }));
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeState>) => {
    setThemeState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    theme: themeState.theme,
    primaryColor: themeState.primaryColor,
    resolvedTheme,
    setTheme,
    setPrimaryColor,
    updateTheme,
  };
}
