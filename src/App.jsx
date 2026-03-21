// 主应用组件 - 单页面工作流布局
import React, { useState } from 'react';
import {
  Layout,
  Steps,
  Button,
  Space,
  Card,
  Typography,
  Switch,
  theme,
  message,
  Upload,
  Tree,
  Spin,
  Alert,
  ConfigProvider,
} from 'antd';
import {
  FileExcelOutlined,
  FolderOpenOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import useAppStore from './store';
import { parseExcel } from './services/excelParser';
import { selectDirectory, createFolders, undoFolders } from './services/api';

const { Header, Content } = Layout;
const { Title } = Typography;

// Excel 导入组件
function ExcelImport() {
  const { fileName, isParsing, setFileName, setTreeData, setParsing } = useAppStore();

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      message.error('请上传 Excel 文件（.xlsx/.xls）');
      return false;
    }

    setFileName(file.name);
    setParsing(true);

    try {
      const result = await parseExcel(file);
      setTreeData(result.tree);
      message.success(`Excel 解析成功！共 ${result.rowCount} 行数据`);
    } catch (error) {
      message.error(`Excel 解析失败：${error.message}`);
      setTreeData([]);
    } finally {
      setParsing(false);
    }

    return false;
  };

  // 模板下载处理
  const downloadTemplate = async () => {
    try {
      message.loading({ content: '正在下载模板...', key: 'download', duration: 0 });
      const response = await fetch('/template.xlsx');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.xlsx';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      message.success({ content: '模板下载成功！', key: 'download' });
    } catch (error) {
      message.error({ content: '下载模板失败：' + error.message, key: 'download' });
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button type="link" onClick={downloadTemplate}>
        下载Excel模板
      </Button>
      <Upload
        beforeUpload={handleFileUpload}
        showUploadList={false}
        accept=".xlsx,.xls"
        style={{ display: 'inline-block' }}
      >
        <Button icon={<UploadOutlined />} loading={isParsing}>
          选择 Excel 文件
        </Button>
      </Upload>
      {fileName && <div style={{ marginTop: 8 }}>已选择：{fileName}</div>}
    </Space>
  );
}

// 目录选择组件
function DirectorySelector() {
  const { rootDir, setRootDir } = useAppStore();

  const handleSelectDirectory = async () => {
    try {
      const path = await selectDirectory();
      if (path) {
        setRootDir(path);
        message.success('目录选择成功');
      }
    } catch (error) {
      message.error('目录选择失败：' + error.message);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button icon={<FolderOpenOutlined />} onClick={handleSelectDirectory}>
        {rootDir ? '更换目录' : '选择目标根目录'}
      </Button>
      {rootDir && <div style={{ marginTop: 8, wordBreak: 'break-all' }}>当前目录：{rootDir}</div>}
    </Space>
  );
}

// 文件夹预览组件
function FolderPreview() {
  const { treeData } = useAppStore();

  if (!treeData || treeData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <div>暂无文件夹数据，请先导入Excel文件</div>
      </div>
    );
  }

  return (
    <div>
      <Tree treeData={treeData} defaultExpandAll showTreeLine />
    </div>
  );
}

// 创建结果组件
function ResultPanel() {
  const { lastResult, createdPaths, isCreating } = useAppStore();

  if (isCreating) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>正在创建文件夹...</div>
      </div>
    );
  }

  if (!lastResult && createdPaths.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <div>点击"开始批量创建"按钮开始创建文件夹</div>
      </div>
    );
  }

  const successCount = lastResult?.created_paths?.length || createdPaths.length;
  const errorDetails = lastResult?.detail?.filter((d) => d.type === 'error') || [];
  const successDetails = lastResult?.detail?.filter((d) => d.type === 'path') || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message={`创建完成！成功 ${successCount} 个`}
        description={
          errorDetails.length > 0 ? `失败 ${errorDetails.length} 个` : undefined
        }
        type={errorDetails.length > 0 ? 'warning' : 'success'}
        showIcon
      />
      {errorDetails.length > 0 && (
        <Card title="失败详情" size="small">
          {errorDetails.map((error, index) => (
            <div key={index} style={{ color: '#ff4d4f' }}>
              {error.path}: {error.error}
            </div>
          ))}
        </Card>
      )}
    </Space>
  );
}

// 主应用组件
export default function App() {
  const {
    currentStep,
    treeData,
    rootDir,
    createdPaths,
    isCreating,
    lastResult,
    setStep,
    nextStep,
    prevStep,
    setTreeData,
    setRootDir,
    setCreatedPaths,
    setCreating,
    setLastResult,
    reset,
  } = useAppStore();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const { token } = theme.useToken();

  // 步骤配置
  const stepItems = [
    { key: 'import', title: '导入Excel', icon: <FileExcelOutlined /> },
    { key: 'preview', title: '预览结构', icon: <EyeOutlined /> },
    { key: 'result', title: '创建结果', icon: <CheckCircleOutlined /> },
  ];

  // 执行批量创建
  const handleCreate = async () => {
    if (!rootDir) {
      message.warning('请先选择目标根目录');
      return;
    }
    if (!treeData || treeData.length === 0) {
      message.warning('请先导入 Excel 文件');
      return;
    }

    setCreating(true);
    try {
      const result = await createFolders(rootDir, treeData);
      setCreatedPaths(result.created_paths);
      setLastResult(result);
      message.success(`成功创建 ${result.created_paths.length} 个文件夹`);
      nextStep();
    } catch (error) {
      message.error('创建失败：' + error.message);
    } finally {
      setCreating(false);
    }
  };

  // 执行撤销
  const handleUndo = async () => {
    if (createdPaths.length === 0) {
      message.info('没有可撤销的操作');
      return;
    }

    try {
      await undoFolders(createdPaths);
      message.success('已撤销本次创建');
      setCreatedPaths([]);
      setLastResult(null);
    } catch (error) {
      message.error('撤销失败：' + error.message);
    }
  };

  // 重置
  const handleReset = () => {
    reset();
  };

  // 当前步骤组件
  const renderContent = () => {
    switch (currentStep) {
      case 'import':
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="步骤1：导入 Excel 文件">
              <ExcelImport />
            </Card>
            <Card title="步骤2：选择目标目录">
              <DirectorySelector />
            </Card>
          </Space>
        );
      case 'preview':
        return (
          <Card title="文件夹结构预览">
            <FolderPreview />
          </Card>
        );
      case 'result':
        return (
          <Card title="创建结果">
            <ResultPanel />
          </Card>
        );
      default:
        return null;
    }
  };

  // 判断是否可下一步
  const canGoNext =
    currentStep === 'import' && treeData.length > 0 && rootDir !== '';
  const canGoPrev = currentStep !== 'import';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff' },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* 顶部导航 */}
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <Title level={4} style={{ color: '#fff', margin: 0 }}>
            文件夹批量创建工具
          </Title>
          <Space>
            <span style={{ color: '#fff' }}>暗色模式</span>
            <Switch checked={isDarkMode} onChange={setIsDarkMode} />
          </Space>
        </Header>

        {/* 主内容 */}
        <Content style={{ padding: 24 }}>
          {/* 步骤指示器 */}
          <Card style={{ marginBottom: 24 }}>
            <Steps
              current={stepItems.findIndex((item) => item.key === currentStep)}
              items={stepItems}
            />
          </Card>

          {/* 内容区域 */}
          <Card style={{ marginBottom: 24 }}>{renderContent()}</Card>

          {/* 操作按钮栏 */}
          <Card>
            <Space>
              {canGoPrev && (
                <Button onClick={prevStep}>上一步</Button>
              )}
              {currentStep === 'import' && (
                <Button
                  type="primary"
                  onClick={nextStep}
                  disabled={!canGoNext}
                >
                  下一步
                </Button>
              )}
              {currentStep === 'preview' && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                >
                  开始批量创建
                </Button>
              )}
              {currentStep === 'result' && (
                <>
                  <Button
                    danger
                    icon={<RedoOutlined />}
                    onClick={handleUndo}
                    disabled={createdPaths.length === 0}
                  >
                    撤销本次创建
                  </Button>
                  <Button onClick={handleReset}>新建任务</Button>
                </>
              )}
            </Space>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
