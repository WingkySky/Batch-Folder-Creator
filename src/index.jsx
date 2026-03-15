// React 前端入口，挂载 App 组件到页面
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 挂载根组件
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 