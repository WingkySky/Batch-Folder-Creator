// React 主界面组件，集成侧边栏和各功能模块骨架
import React, { useState } from 'react';
import { Typography, Layout, Menu } from 'antd';
import {
  FolderOpenOutlined,
  FileExcelOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import ExcelImport from './components/ExcelImport';
import DirectorySelector from './components/DirectorySelector';
import FolderTreePreview from './components/FolderTreePreview';
import BatchCreateActions from './components/BatchCreateActions';

const { Header, Content, Sider } = Layout;

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
        // 传递 onTreeData 回调，解析后更新 treeData
        return <ExcelImport onTreeData={setTreeData} />;
      case 'dir':
        // 传递 onDirectorySelected 回调，选择后更新 rootDir
        return <DirectorySelector onDirectorySelected={setRootDir} />;
      case 'preview':
        // 传递 treeData 给结构预览
        return <FolderTreePreview treeData={treeData} />;
      case 'action':
        // 传递 root、treeData、onCreatedPaths 给批量创建操作
        return (
          <BatchCreateActions
            root={rootDir}
            treeData={treeData}
            onCreatedPaths={setCreatedPaths}
          />
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