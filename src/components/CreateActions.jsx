// 批量创建与撤销操作模块，集成 Tauri API
import React, { useState } from 'react';
import { Button, Space, message } from 'antd';
import { invoke } from '@tauri-apps/api/tauri';

// 组件：批量创建与撤销操作
export default function CreateActions({ root, treeData, onCreatedPaths }) {
  const [loading, setLoading] = useState(false);
  const [localCreatedPaths, setLocalCreatedPaths] = useState([]);

  // 批量创建文件夹
  const handleCreate = async () => {
    if (!root) {
      message.warning('请先选择目标根目录');
      return;
    }
    if (!treeData || treeData.length === 0) {
      message.warning('请先导入 Excel 文件');
      return;
    }

    setLoading(true);
    try {
      const result = await invoke('create_folders', { root, tree: treeData });
      if (result.success) {
        message.success(`成功创建 ${result.created_paths.length} 个文件夹`);
        setLocalCreatedPaths(result.created_paths);
        onCreatedPaths && onCreatedPaths(result.created_paths);
      }
    } catch (err) {
      message.error('创建失败：' + err);
    } finally {
      setLoading(false);
    }
  };

  // 撤销本次创建
  const handleUndo = async () => {
    if (localCreatedPaths.length === 0) {
      message.info('没有可撤销的操作');
      return;
    }

    try {
      await invoke('undo_folders', { createdPaths: localCreatedPaths });
      message.success('已撤销本次创建');
      setLocalCreatedPaths([]);
      onCreatedPaths && onCreatedPaths([]);
    } catch (err) {
      message.error('撤销失败：' + err);
    }
  };

  return (
    <Space style={{ marginTop: 24 }}>
      {/* 批量创建按钮 */}
      <Button type="primary" onClick={handleCreate} loading={loading}>
        开始批量创建
      </Button>
      {/* 撤销操作按钮 */}
      <Button
        danger
        onClick={handleUndo}
        disabled={loading || localCreatedPaths.length === 0}
      >
        撤销本次创建
      </Button>
    </Space>
  );
}
