// 目标根目录选择模块，集成 Tauri API
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/tauri';

// 组件：目标根目录选择
export default function DirectorySelector({ onDirectorySelected }) {
  // 记录已选择的目录路径
  const [dirPath, setDirPath] = useState('');

  // 选择目录，调用 Tauri 命令
  const handleSelect = async () => {
    try {
      // 通过 Tauri 的 invoke 调用后端命令
      const path = await invoke('select_directory');
      if (path) {
        setDirPath(path);
        onDirectorySelected && onDirectorySelected(path);
      } else {
        message.info('未选择任何目录');
      }
    } catch (err) {
      message.error('目录选择失败：' + err);
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
