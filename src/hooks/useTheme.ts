import { useState, useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';

export type ThemeColor = 
  | '#2A5CAA' // 科技蓝
  | '#7C3AED' // 极光紫
  | '#059669' // 翡翠绿
  | '#EA580C' // 能量橙
  | '#DB2777' // 霓虹粉
  | '#0891B2' // 电光青
  | '#F59E0B' // 阳光黄
  | '#1E3A8A' // 深蓝灰
  | '#10B981' // 薄荷绿
  | '#F97316' // 珊瑚粉
  | '#6366F1' // 靛蓝色
  | '#FBBF24'; // 琥珀色

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
  '#F59E0B': { 
    light: '43 90% 52%', 
    dark: '43 85% 60%' 
  },
  '#1E3A8A': { 
    light: '220 63% 20%', 
    dark: '220 70% 35%' 
  },
  '#10B981': { 
    light: '160 83% 40%', 
    dark: '160 75% 50%' 
  },
  '#F97316': { 
    light: '21 92% 54%', 
    dark: '21 85% 65%' 
  },
  '#6366F1': { 
    light: '239 69% 66%', 
    dark: '239 75% 70%' 
  },
  '#FBBF24': { 
    light: '43 96% 59%', 
    dark: '43 90% 65%' 
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
    
    // 设置渐变色主题配色方案
    // 基于当前主色调生成渐变色彩
    const baseHue = parseInt(colorHsl.split(' ')[0]);
    const baseSaturation = parseInt(colorHsl.split(' ')[1]);
    const baseLightness = parseInt(colorHsl.split(' ')[2]);
    
    // 渐变起始色（稍暗）
    const gradientStartLightness = resolvedTheme === 'dark' ? baseLightness - 10 : baseLightness - 5;
    root.style.setProperty('--gradient-start', `${baseHue} ${baseSaturation}% ${gradientStartLightness}%`);
    
    // 渐变结束色（稍亮）
    const gradientEndLightness = resolvedTheme === 'dark' ? baseLightness + 15 : baseLightness + 10;
    root.style.setProperty('--gradient-end', `${baseHue} ${baseSaturation}% ${gradientEndLightness}%`);
    
    // 渐变辅助色1（相邻色调）
    const secondaryHue = (baseHue + 30) % 360;
    root.style.setProperty('--gradient-secondary', `${secondaryHue} ${baseSaturation}% ${baseLightness}%`);
    
    // 渐变辅助色2（对比色调）
    const tertiaryHue = (baseHue + 180) % 360;
    root.style.setProperty('--gradient-tertiary', `${tertiaryHue} ${baseSaturation}% ${baseLightness}%`);
    
    // 渐变辅助色3（互补色调）
    const complementaryHue = (baseHue + 120) % 360;
    root.style.setProperty('--gradient-complementary', `${complementaryHue} ${baseSaturation}% ${baseLightness}%`);
    
    // 渐变暗色（用于强调）
    const gradientDarkLightness = resolvedTheme === 'dark' ? baseLightness - 15 : baseLightness - 10;
    root.style.setProperty('--gradient-dark', `${baseHue} ${baseSaturation}% ${gradientDarkLightness}%`);
    
    // 渐变亮色（用于高光）
    const gradientLightLightness = resolvedTheme === 'dark' ? baseLightness + 20 : baseLightness + 15;
    root.style.setProperty('--gradient-light', `${baseHue} ${baseSaturation}% ${gradientLightLightness}%`);
    
    // 设置渐变方向（默认135度）
    root.style.setProperty('--gradient-direction', '135deg');
    
    // 设置渐变角度变体
    root.style.setProperty('--gradient-direction-45', '45deg');
    root.style.setProperty('--gradient-direction-90', '90deg');
    root.style.setProperty('--gradient-direction-180', '180deg');
    root.style.setProperty('--gradient-direction-270', '270deg');
    
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
