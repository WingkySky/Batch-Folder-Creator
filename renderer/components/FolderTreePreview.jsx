// 文件夹结构预览模块骨架
import React from 'react';
import { Tree, Typography } from 'antd';

// 组件：文件夹结构预览
export default function FolderTreePreview({ treeData }) {
  return (
    <div style={{ marginTop: 16 }}>
      <Typography.Title level={5}>文件夹结构预览</Typography.Title>
      {/* 使用 Antd Tree 展示树结构 */}
      <Tree treeData={treeData} defaultExpandAll />
    </div>
  );
} 