// 批量创建与撤销操作按钮模块骨架
import React from 'react';
import { Button, Space } from 'antd';

// 组件：批量创建与撤销操作
export default function BatchCreateActions({ onCreate, onUndo, loading }) {
  return (
    <Space style={{ marginTop: 24 }}>
      {/* 批量创建按钮 */}
      <Button type="primary" onClick={onCreate} loading={loading}>
        开始批量创建
      </Button>
      {/* 撤销操作按钮 */}
      <Button danger onClick={onUndo} disabled={loading}>
        撤销本次创建
      </Button>
    </Space>
  );
} 