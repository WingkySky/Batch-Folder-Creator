// 主应用组件 - 单页面工作流布局
import React, { useState, useEffect } from 'react';
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
  Select,
} from 'antd';
import {
  FileExcelOutlined,
  FolderOpenOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  RedoOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import useAppStore from './store';
import { parseExcel } from './services/excelParser';
import { selectDirectory, createFolders, undoFolders } from './services/api';
import './i18n';

const { Header, Content } = Layout;
const { Title } = Typography;

// Excel 导入组件
function ExcelImport() {
  const { t, i18n } = useTranslation();
  const { fileName, isParsing, setFileName, setTreeData, setParsing } = useAppStore();

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      message.error(t('validation.invalidFile'));
      return false;
    }

    setFileName(file.name);
    setParsing(true);

    try {
      const result = await parseExcel(file);
      setTreeData(result.tree);
      message.success(t('messages.excelSuccess', { count: result.rowCount }));
    } catch (error) {
      message.error(t('messages.excelError', { error: error.message }));
      setTreeData([]);
    } finally {
      setParsing(false);
    }

    return false;
  };

  // 模板下载处理 - 根据语言选择对应模板
  const downloadTemplate = async () => {
    const templateFile = i18n.language === 'en' ? '/template_en.xlsx' : '/template.xlsx';
    try {
      message.loading({ content: t('messages.downloading'), key: 'download', duration: 0 });
      const response = await fetch(templateFile);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = templateFile.replace('/', '');
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      message.success({ content: t('messages.downloadTemplate'), key: 'download' });
    } catch (error) {
      message.error({ content: t('messages.downloadTemplateError', { error: error.message }), key: 'download' });
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button type="link" onClick={downloadTemplate}>
        {t('import.downloadTemplate')}
      </Button>
      <Upload
        beforeUpload={handleFileUpload}
        showUploadList={false}
        accept=".xlsx,.xls"
        style={{ display: 'inline-block' }}
      >
        <Button icon={<UploadOutlined />} loading={isParsing}>
          {t('import.selectFile')}
        </Button>
      </Upload>
      {fileName && <div style={{ marginTop: 8 }}>{t('import.selected')}：{fileName}</div>}
    </Space>
  );
}

// 目录选择组件
function DirectorySelector() {
  const { t } = useTranslation();
  const { rootDir, setRootDir } = useAppStore();

  const handleSelectDirectory = async () => {
    try {
      const path = await selectDirectory();
      if (path) {
        setRootDir(path);
        message.success(t('messages.directorySelected'));
      }
    } catch (error) {
      message.error(t('messages.directoryError', { error: error.message }));
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button icon={<FolderOpenOutlined />} onClick={handleSelectDirectory}>
        {rootDir ? t('directory.change') : t('directory.select')}
      </Button>
      {rootDir && <div style={{ marginTop: 8, wordBreak: 'break-all' }}>{t('directory.current')}：{rootDir}</div>}
    </Space>
  );
}

// 文件夹预览组件
function FolderPreview() {
  const { t } = useTranslation();
  const { treeData } = useAppStore();

  if (!treeData || treeData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <div>{t('preview.empty')}</div>
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
  const { t } = useTranslation();
  const { lastResult, createdPaths, isCreating } = useAppStore();

  if (isCreating) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>{t('result.creating')}</div>
      </div>
    );
  }

  if (!lastResult && createdPaths.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
        <CheckCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
        <div>{t('result.ready')}</div>
      </div>
    );
  }

  const successCount = lastResult?.created_paths?.length || createdPaths.length;
  const errorDetails = lastResult?.detail?.filter((d) => d.type === 'error') || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Alert
        message={t('result.success', { count: successCount })}
        description={errorDetails.length > 0 ? t('result.failed', { count: errorDetails.length }) : undefined}
        type={errorDetails.length > 0 ? 'warning' : 'success'}
        showIcon
      />
      {errorDetails.length > 0 && (
        <Card title={t('result.details')} size="small">
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

// 语言切换组件
function LanguageSwitch() {
  const { i18n } = useTranslation();

  const handleChange = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Space>
      <GlobalOutlined style={{ color: '#fff' }} />
      <Select
        value={i18n.language}
        onChange={handleChange}
        style={{ width: 100 }}
        options={[
          { value: 'zh', label: '中文' },
          { value: 'en', label: 'English' },
        ]}
      />
    </Space>
  );
}

// 主应用组件
export default function App() {
  const { t, i18n } = useTranslation();
  const {
    currentStep,
    treeData,
    rootDir,
    createdPaths,
    isCreating,
    lastResult,
    nextStep,
    prevStep,
    setCreatedPaths,
    setCreating,
    setLastResult,
    reset,
  } = useAppStore();

  const [isDarkMode, setIsDarkMode] = useState(false);

  // 监听语言变化，更新窗口标题
  useEffect(() => {
    let isMounted = true;
    const updateWindowTitle = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();
        const title = t('app.title');
        if (isMounted) {
          await appWindow.setTitle(title);
        }
      } catch (error) {
        console.error('Failed to update window title:', error);
      }
    };
    updateWindowTitle();
    return () => { isMounted = false; };
  }, [i18n.language]);

  // 步骤配置
  const stepItems = [
    { key: 'import', title: t('steps.import'), icon: <FileExcelOutlined /> },
    { key: 'preview', title: t('steps.preview'), icon: <EyeOutlined /> },
    { key: 'result', title: t('steps.result'), icon: <CheckCircleOutlined /> },
  ];

  // 执行批量创建
  const handleCreate = async () => {
    if (!rootDir) {
      message.warning(t('messages.noDirectory'));
      return;
    }
    if (!treeData || treeData.length === 0) {
      message.warning(t('messages.noExcel'));
      return;
    }

    setCreating(true);
    try {
      const result = await createFolders(rootDir, treeData);
      setCreatedPaths(result.created_paths);
      setLastResult(result);
      message.success(t('messages.createSuccess', { count: result.created_paths.length }));
      nextStep();
    } catch (error) {
      message.error(t('messages.createError', { error: error.message }));
    } finally {
      setCreating(false);
    }
  };

  // 执行撤销
  const handleUndo = async () => {
    if (createdPaths.length === 0) {
      message.info(t('messages.noUndo'));
      return;
    }

    try {
      await undoFolders(createdPaths);
      message.success(t('messages.undoSuccess'));
      setCreatedPaths([]);
      setLastResult(null);
    } catch (error) {
      message.error(t('messages.undoError', { error: error.message }));
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
            <Card title={t('import.title')}>
              <ExcelImport />
            </Card>
            <Card title={t('directory.title')}>
              <DirectorySelector />
            </Card>
          </Space>
        );
      case 'preview':
        return (
          <Card title={t('preview.title')}>
            <FolderPreview />
          </Card>
        );
      case 'result':
        return (
          <Card title={t('result.title')}>
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
            {t('app.title')}
          </Title>
          <Space>
            <span style={{ color: '#fff' }}>{t('app.darkMode')}</span>
            <Switch checked={isDarkMode} onChange={setIsDarkMode} />
            <LanguageSwitch />
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
                <Button onClick={prevStep}>{t('actions.prev')}</Button>
              )}
              {currentStep === 'import' && (
                <Button
                  type="primary"
                  onClick={nextStep}
                  disabled={!canGoNext}
                >
                  {t('actions.next')}
                </Button>
              )}
              {currentStep === 'preview' && (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  loading={isCreating}
                >
                  {t('actions.create')}
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
                    {t('result.undo')}
                  </Button>
                  <Button onClick={handleReset}>{t('result.newTask')}</Button>
                </>
              )}
            </Space>
          </Card>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
