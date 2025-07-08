// 目标根目录选择模块，集成主进程通信
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';

// 组件：目标根目录选择
export default function DirectorySelector({ onDirectorySelected }) {
  // 记录已选择的目录路径
  const [dirPath, setDirPath] = useState('');

  // 选择目录，调用主进程方法
  const handleSelect = async () => {
    try {
      // 通过 Electron 的 ipcRenderer 调用主进程
      const { ipcRenderer } = window.require('electron');
      const path = await ipcRenderer.invoke('select-directory');
      if (path) {
        setDirPath(path);
        onDirectorySelected && onDirectorySelected(path);
      } else {
        message.info('未选择任何目录');
      }
    } catch (err) {
      message.error('目录选择失败：' + err.message);
    }
  };

  return (
    <div>
      <Button icon={<FolderOpenOutlined />} onClick={handleSelect}>
        选择目标根目录
      </Button>
      {/* 显示已选择目录路径 */}
      {dirPath && <div style={{ marginTop: 8 }}>已选择：{dirPath}</div>}
    </div>
  );
} 