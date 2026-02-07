// 简化的i18n实现，只支持中文
import zhCN from './locales/zh-CN';

const i18n = {
  // 简单的t函数，直接返回中文文本
  t: (key: string, _options?: any): string => {
    // 从zhCN中查找对应的文本
    const keys = key.split('.');
    let value: any = zhCN;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到对应的文本，返回key
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  },
  // 模拟i18n的其他方法
  language: 'zh-CN',
  changeLanguage: (lang: string) => Promise.resolve(lang)
};

export default i18n;