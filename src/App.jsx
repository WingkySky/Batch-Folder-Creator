// React 主界面组件，集成侧边栏和各功能模块骨架
import React, { useState, Suspense } from 'react';
import { Typography, Layout, Menu, Spin } from 'antd';
import {
  FolderOpenOutlined,
  FileExcelOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

// 组件懒加载 - 按需加载，减少初始 bundle 大小
const ExcelImport = React.lazy(() => import('./components/ExcelImport'));
const DirectorySelector = React.lazy(() => import('./components/DirectorySelector'));
const FolderTreePreview = React.lazy(() => import('./components/FolderTreePreview'));
const CreateActions = React.lazy(() => import('./components/CreateActions'));

const { Header, Content, Sider } = Layout;

// 加载状态组件
const LoadingFallback = () => (
  <div style={{ padding: 48, textAlign: 'center' }}>
    <Spin size="large" />
  </div>
);

// 菜单项定义
const menuItems = [
  { key: 'import', icon: <FileExcelOutlined />, label: '导入Excel' },
  { key: 'dir', icon: <FolderOpenOutlined />, label: '选择根目录' },
  { key: 'preview', icon: <EyeOutlined />, label: '结构预览' },
  { key: 'action', icon: <PlayCircleOutlined />, label: '批量创建/撤销' },
];

// App 组件，集成各功能模块
export default function App() {
  // 当前选中菜单
  const [selectedKey, setSelectedKey] = useState('import');
  // Excel 解析后的树结构数据
  const [treeData, setTreeData] = useState([]);
  // 目标根目录路径
  const [rootDir, setRootDir] = useState('');
  // 记录本次创建的所有文件夹路径
  const [createdPaths, setCreatedPaths] = useState([]);

  // 渲染主内容区
  const renderContent = () => {
    switch (selectedKey) {
      case 'import':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ExcelImport onTreeData={setTreeData} />
          </Suspense>
        );
      case 'dir':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DirectorySelector onDirectorySelected={setRootDir} />
          </Suspense>
        );
      case 'preview':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <FolderTreePreview treeData={treeData} />
          </Suspense>
        );
      case 'action':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CreateActions
              root={rootDir}
              treeData={treeData}
              onCreatedPaths={setCreatedPaths}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Typography.Title style={{ color: '#fff', margin: 0 }} level={3}>
          文件夹批量创建工具
        </Typography.Title>
      </Header>
      <Layout>
        {/* 侧边栏导航 */}
        <Sider width={180} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={({ key }) => setSelectedKey(key)}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        {/* 主内容区 */}
        <Content style={{ padding: 24 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
}