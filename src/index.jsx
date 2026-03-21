// React 前端入口 - 应用入口文件
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';  // 初始化 i18next 国际化配置

// 挂载根组件
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
