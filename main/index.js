// Electron 主进程入口，负责创建主窗口和加载前端页面
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// 保持主窗口对象，防止被垃圾回收
let mainWindow;

// 创建主窗口函数
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true, // 允许 Node.js 集成
      contextIsolation: false // 关闭上下文隔离，便于主/渲染进程通信
    }
  });

  // 加载前端页面（开发环境加载本地服务器，生产环境加载打包文件）
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 可选：打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 窗口关闭时清理引用
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron 初始化完成后创建窗口
app.whenReady().then(createWindow);

// 所有窗口关闭时退出应用（Mac 下除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Mac 下点击 Dock 图标重新创建窗口
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// 工具函数：递归创建文件夹
async function createFoldersRecursively(root, tree, created = []) {
  for (const node of tree) {
    const dirPath = require('path').join(root, node.title);
    try {
      if (!fs.existsSync(dirPath)) {
        await fs.mkdir(dirPath);
        created.push(dirPath);
      }
    } catch (err) {
      // 记录失败也继续
      created.push({ path: dirPath, error: err.message });
    }
    if (node.children && node.children.length > 0) {
      await createFoldersRecursively(dirPath, node.children, created);
    }
  }
  return created;
}

// 工具函数：逆序删除文件夹
async function deleteFoldersRecursively(paths) {
  // 逆序删除，防止父目录未空
  for (let i = paths.length - 1; i >= 0; i--) {
    const dirPath = typeof paths[i] === 'string' ? paths[i] : paths[i].path;
    try {
      await fs.remove(dirPath);
    } catch (err) {
      // 跳过删除失败
    }
  }
}

// 注册 IPC 事件：选择目录
ipcMain.handle('select-directory', async () => {
  // 打开系统目录选择对话框
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '请选择目标根目录'
  });
  // 返回所选路径（数组，取第一个）
  if (result.canceled || !result.filePaths.length) return '';
  return result.filePaths[0];
});

// 注册 IPC 事件：批量创建文件夹
ipcMain.handle('create-folders', async (event, { root, tree }) => {
  if (!root || !tree || !Array.isArray(tree)) return { success: false, msg: '参数错误' };
  const created = [];
  await createFoldersRecursively(root, tree, created);
  // 只返回成功创建的路径
  const createdPaths = created.filter(p => typeof p === 'string');
  return { success: true, createdPaths, detail: created };
});

// 注册 IPC 事件：撤销本次创建
ipcMain.handle('undo-folders', async (event, { createdPaths }) => {
  if (!createdPaths || !Array.isArray(createdPaths)) return { success: false, msg: '参数错误' };
  await deleteFoldersRecursively(createdPaths);
  return { success: true };
}); 