// 全局类型定义 - 应用状态和数据结构

// 工作流程步骤类型
export const WORKFLOW_STEPS = {
  IMPORT: 'import',
  PREVIEW: 'preview',
  RESULT: 'result',
};

// 树节点类型 - Excel 解析后的文件夹层级结构
export const createTreeNode = (title, key, children = null) => ({
  title,
  key,
  children,
});

// 创建结果类型
export const createResultShape = () => ({
  success: false,
  created_paths: [],
  detail: [],
});
