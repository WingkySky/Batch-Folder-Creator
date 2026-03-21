// 全局状态管理 - 使用 Zustand 进行状态管理
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 工作流程步骤
const STEPS = ['import', 'preview', 'result'];

// 全局应用状态 Store - 集中管理整个应用的状态
const useAppStore = create(
  devtools(
    (set, get) => ({
      // 当前工作流步骤
      currentStep: 'import',

      // Excel 导入相关状态
      fileName: null,
      treeData: [],
      isParsing: false,

      // 目录选择相关状态
      rootDir: '',

      // 创建操作相关状态
      createdPaths: [],
      isCreating: false,
      lastResult: null,

      // 切换工作流步骤
      setStep: (step) => set({ currentStep: step }),

      // 下一步
      nextStep: () => {
        const currentIndex = STEPS.indexOf(get().currentStep);
        if (currentIndex < STEPS.length - 1) {
          set({ currentStep: STEPS[currentIndex + 1] });
        }
      },

      // 上一步
      prevStep: () => {
        const currentIndex = STEPS.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEPS[currentIndex - 1] });
        }
      },

      // 设置 Excel 文件名
      setFileName: (name) => set({ fileName: name }),

      // 设置解析后的树数据
      setTreeData: (data) => set({ treeData: data }),

      // 设置解析状态
      setParsing: (parsing) => set({ isParsing: parsing }),

      // 清除 Excel 数据
      clearExcel: () => set({ fileName: null, treeData: [] }),

      // 设置目标根目录
      setRootDir: (dir) => set({ rootDir: dir }),

      // 清除根目录
      clearRootDir: () => set({ rootDir: '' }),

      // 设置创建的路径
      setCreatedPaths: (paths) => set({ createdPaths: paths }),

      // 添加创建的路径
      addCreatedPaths: (paths) =>
        set((state) => ({ createdPaths: [...state.createdPaths, ...paths] })),

      // 清除创建的路径
      clearCreatedPaths: () => set({ createdPaths: [], lastResult: null }),

      // 设置创建状态
      setCreating: (creating) => set({ isCreating: creating }),

      // 设置最后结果
      setLastResult: (result) => set({ lastResult: result }),

      // 重置所有状态
      reset: () =>
        set({
          currentStep: 'import',
          fileName: null,
          treeData: [],
          isParsing: false,
          rootDir: '',
          createdPaths: [],
          isCreating: false,
          lastResult: null,
        }),
    }),
    { name: 'AppStore' }
  )
);

export default useAppStore;
