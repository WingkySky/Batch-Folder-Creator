# 文件夹批量创建工具

一款轻量级的跨平台桌面应用，通过 Excel 模板批量、分层级创建文件夹，支持一键撤销操作。

## 功能特性

- 📊 **Excel 导入** - 支持 .xlsx/.xls 格式，自动解析多层级的文件夹结构
- 📁 **批量创建** - 递归创建多层文件夹结构
- ↩️ **一键撤销** - 删除本次创建的所有文件夹
- 🌙 **暗色模式** - 支持亮色/暗色主题切换
- 🌍 **中英双语** - 支持中文和英文界面

## 技术栈

- **框架**: Tauri 2.x (Rust + WebView)
- **前端**: React 18 + Ant Design 5.x
- **状态管理**: Zustand
- **构建工具**: Vite 5.x

## 系统要求

- Windows 10/11 或 macOS 10.15+
- 无需额外安装运行时

## 开发预览

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 构建发布

```bash
# 构建生产版本
npm run build

# 构建产物位于
# src-tauri/target/release/bundle/
```

## 使用说明

1. **准备 Excel 模板**
   - 第一行为表头（会被忽略）
   - 每列代表一层文件夹
   - 示例：

   | 第一级 | 第二级 | 第三级 |
   |--------|--------|--------|
   | 项目A | 文档 | 合同 |
   | 项目A | 文档 | 发票 |
   | 项目A | 图片 | 产品照 |

2. **导入并创建**
   - 点击"选择 Excel 文件"导入模板
   - 点击"选择目标根目录"选择创建位置
   - 点击"下一步"预览文件夹结构
   - 点击"开始批量创建"执行创建

3. **撤销操作**
   - 创建完成后可点击"撤销本次创建"删除所有新建文件夹

## 项目结构

```
folder-batch-creator/
├── src/                    # React 前端源码
│   ├── services/          # API 服务层
│   ├── store/             # Zustand 状态管理
│   ├── hooks/              # 通用 Hooks
│   ├── types/              # 类型定义
│   ├── App.jsx            # 主应用组件
│   └── index.jsx          # 入口文件
├── src-tauri/             # Rust 后端源码
│   ├── src/main.rs        # Tauri 命令实现
│   ├── Cargo.toml         # Rust 依赖配置
│   └── tauri.conf.json    # Tauri 应用配置
└── public/
    └── template.xlsx      # Excel 模板示例
```

## 许可证

MIT License
