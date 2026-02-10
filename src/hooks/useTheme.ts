import { useState, useEffect, useCallback, useRef } from 'react';
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

const THEME_KEY = 'item-manager-theme';
const DEFAULT_THEME: ThemeState = {
  theme: 'system',
  primaryColor: '#2A5CAA',
};

export function useTheme() {
  const [themeState, setThemeState] = useState<ThemeState>(DEFAULT_THEME);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const isMountedRef = useRef(true);

  // 解析实际主题（处理 system 情况）
  useEffect(() => {
    const resolveTheme = () => {
      if (themeState.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(prefersDark ? 'dark' : 'light');
        console.log('Theme resolved from system:', prefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(themeState.theme);
        console.log('Theme resolved from settings:', themeState.theme);
      }
    };

    resolveTheme();

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (themeState.theme === 'system' && isMountedRef.current) {
        setResolvedTheme(e.matches ? 'dark' : 'light');
        console.log('System theme changed to:', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
      isMountedRef.current = false;
    };
  }, [themeState.theme]);

  // 从 Preferences 加载主题
  useEffect(() => {
    const loadTheme = async () => {
      console.log('Starting to load theme settings...');
      
      // 尝试多次加载，提高可靠性
      let attempts = 0;
      const maxAttempts = 3;
      let loadedSuccessfully = false;

      while (attempts < maxAttempts && !loadedSuccessfully) {
        attempts++;
        console.log(`Theme load attempt ${attempts}/${maxAttempts}`);
        
        try {
          const { value } = await Preferences.get({
            key: THEME_KEY
          });
          
          console.log('Raw theme value retrieved:', value);
          
          if (value) {
            try {
              const parsed = JSON.parse(value);
              console.log('Parsed theme settings:', parsed);
              
              // 验证主题设置的有效性
              if (parsed.theme && parsed.primaryColor) {
                if (isMountedRef.current) {
                  setThemeState(parsed);
                  console.log('Theme settings loaded successfully on attempt', attempts);
                }
                loadedSuccessfully = true;
              } else {
                console.error('Invalid theme settings structure:', parsed);
              }
            } catch (parseError) {
              console.error('Error parsing theme settings (attempt', attempts, '):', parseError);
            }
          } else {
            console.log('No saved theme settings found (attempt', attempts, ')');
          }
        } catch (error) {
          console.error('Error loading theme settings (attempt', attempts, '):', error);
          // 等待一段时间后重试
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      if (!loadedSuccessfully) {
        console.log('All attempts failed, using default theme');
      }
      
      if (isMountedRef.current) {
        setIsThemeLoaded(true);
        console.log('Theme loading process completed');
      }
    };

    loadTheme();
  }, []);

  // 应用主题到 DOM
  useEffect(() => {
    if (!isThemeLoaded) return;
    
    console.log('Applying theme to DOM:', { themeState, resolvedTheme });
    
    const root = document.documentElement;
    const colorHsl = THEME_COLORS[themeState.primaryColor][resolvedTheme];
    
    // 设置主色调
    root.style.setProperty('--primary', colorHsl);
    root.style.setProperty('--ring', colorHsl);
    // 确保主色调文字颜色一致
    root.style.setProperty('--primary-foreground', resolvedTheme === 'dark' ? '0 0% 100%' : '0 0% 100%');
    
    // 设置深色/浅色模式
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    console.log('Theme applied successfully');
  }, [themeState, resolvedTheme, isThemeLoaded]);

  // 保存主题设置
  useEffect(() => {
    if (!isThemeLoaded) return;
    
    const saveTheme = async () => {
      console.log('Saving theme settings:', themeState);
      
      try {
        await Preferences.set({
          key: THEME_KEY,
          value: JSON.stringify(themeState)
        });
        console.log('Theme settings saved successfully');
      } catch (error) {
        console.error('Error saving theme settings:', error);
        // 保存失败时继续使用当前状态，不回退到默认值
      }
    };

    saveTheme();
  }, [themeState, isThemeLoaded]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    console.log('Setting theme to:', theme);
    setThemeState(prev => ({ ...prev, theme }));
  }, []);

  const setPrimaryColor = useCallback((primaryColor: ThemeColor) => {
    console.log('Setting primary color to:', primaryColor);
    setThemeState(prev => ({ ...prev, primaryColor }));
  }, []);

  const updateTheme = useCallback((updates: Partial<ThemeState>) => {
    console.log('Updating theme with:', updates);
    setThemeState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    theme: themeState.theme,
    primaryColor: themeState.primaryColor,
    resolvedTheme,
    isThemeLoaded,
    setTheme,
    setPrimaryColor,
    updateTheme,
  };
}
