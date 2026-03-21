// Tauri API 服务层 - 封装与 Rust 后端的 IPC 通信
import { invoke } from '@tauri-apps/api/core';

/**
 * 选择目录命令
 * @returns 选择的目录路径，空字符串表示取消选择
 */
export async function selectDirectory() {
  try {
    const result = await invoke('select_directory');
    return result;
  } catch (error) {
    console.error('目录选择失败:', error);
    throw error;
  }
}

/**
 * 批量创建文件夹命令
 * @param {string} root - 目标根目录
 * @param {Array} tree - 文件夹树结构
 * @returns 创建结果
 */
export async function createFolders(root, tree) {
  try {
    const result = await invoke('create_folders', { root, tree });
    return result;
  } catch (error) {
    console.error('创建文件夹失败:', error);
    throw error;
  }
}

/**
 * 撤销创建命令
 * @param {Array} createdPaths - 本次创建的文件夹路径列表
 */
export async function undoFolders(createdPaths) {
  try {
    await invoke('undo_folders', { createdPaths });
  } catch (error) {
    console.error('撤销失败:', error);
    throw error;
  }
}
