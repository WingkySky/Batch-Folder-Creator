// 通用 Hooks - 提供日志和异步操作封装
import { useCallback } from 'react';
import { message } from 'antd';

// 日志 Hook - 方便组件内使用日志功能
export function useLogger() {
  const log = useCallback((level, message_text, data) => {
    const prefix = `[${new Date().toISOString()}] [${level.toUpperCase()}]`;
    const logMessage = data
      ? `${prefix} ${message_text} ${JSON.stringify(data)}`
      : `${prefix} ${message_text}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }, []);

  return {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
  };
}

// 异步操作 Hook - 统一处理加载状态和错误
export function useAsync(asyncFn, options = {}) {
  const { onSuccess, onError } = options;

  const execute = useCallback(
    async (...args) => {
      try {
        const result = await asyncFn(...args);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        message.error(errorMessage);
        onError?.(error);
        return null;
      }
    },
    [asyncFn, onSuccess, onError]
  );

  return { execute };
}
