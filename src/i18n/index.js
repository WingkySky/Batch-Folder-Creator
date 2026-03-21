// i18n 国际化配置 - 支持中文和英文
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zh from './locales/zh.json';
import en from './locales/en.json';

// 国际化初始化配置
i18n
  .use(LanguageDetector)  // 自动检测浏览器语言
  .use(initReactI18next)  // 绑定 react-i18next
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    fallbackLng: 'zh',  // 默认语言
    supportedLngs: ['zh', 'en'],  // 支持的语言
    interpolation: {
      escapeValue: false,  // React 已经处理了 XSS
    },
    detection: {
      // 语言检测顺序
      order: ['localStorage', 'navigator'],
      // 缓存语言选择
      caches: ['localStorage'],
    },
  });

export default i18n;
