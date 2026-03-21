// 主入口文件 - Tauri 2.x 应用
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use tracing::{info, error, warn};
use tracing_subscriber::{EnvFilter};

// 树节点结构体 - Excel 解析后的层级结构
#[derive(Debug, Deserialize)]
struct TreeNode {
    title: String,
    #[serde(default)]
    children: Option<Vec<TreeNode>>,
}

// 创建结果详情 - 支持成功路径或错误信息
#[derive(Debug, Serialize)]
#[serde(tag = "type", content = "data")]
enum CreateDetail {
    #[serde(rename = "path")]
    Path(String),
    #[serde(rename = "error")]
    Error { path: String, error: String },
}

// 创建结果结构体 - 返回给前端
#[derive(Debug, Serialize)]
struct CreateResult {
    success: bool,
    created_paths: Vec<String>,
    detail: Vec<CreateDetail>,
}

// 初始化日志系统 - 仅控制台输出
fn init_logger() {
    // 开发环境使用简单控制台日志
    tracing_subscriber::fmt()
        .with_target(true)
        .with_thread_ids(false)
        .with_file(true)
        .with_line_number(true)
        .with_env_filter(EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into()))
        .init();
}

// 递归创建文件夹 - 遍历树结构批量创建
fn create_folders_recursively(
    root: &PathBuf,
    tree: &[TreeNode],
    created: &mut Vec<CreateDetail>,
) {
    for node in tree {
        let dir_path = root.join(&node.title);
        match std::fs::create_dir(&dir_path) {
            Ok(_) => {
                created.push(CreateDetail::Path(dir_path.to_string_lossy().to_string()));
                info!(path = %dir_path.to_string_lossy(), "目录创建成功");
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {
                created.push(CreateDetail::Path(dir_path.to_string_lossy().to_string()));
                info!(path = %dir_path.to_string_lossy(), "目录已存在");
            }
            Err(e) => {
                error!(path = %dir_path.to_string_lossy(), error = %e, "目录创建失败");
                created.push(CreateDetail::Error {
                    path: dir_path.to_string_lossy().to_string(),
                    error: e.to_string(),
                });
            }
        }
        if let Some(children) = &node.children {
            create_folders_recursively(&dir_path, children, created);
        }
    }
}

// 逆序删除文件夹 - 用于撤销操作
fn delete_folders_recursively(paths: &[String]) {
    for path in paths.iter().rev() {
        match std::fs::remove_dir_all(path) {
            Ok(_) => {
                info!(path = %path, "目录删除成功");
            }
            Err(e) => {
                warn!(path = %path, error = %e, "目录删除失败（可能已被删除或非空）");
            }
        }
    }
}

// Tauri 命令：选择目录 - 使用系统对话框
#[tauri::command]
async fn select_directory(app: AppHandle) -> Result<String, String> {
    info!("执行目录选择命令");

    let (tx, rx) = std::sync::mpsc::channel();

    app.dialog()
        .file()
        .set_title("请选择目标根目录")
        .pick_folder(move |path| {
            let path_str = path.map(|p| p.to_string());
            let _ = tx.send(path_str);
        });

    match rx.recv().map_err(|e| e.to_string())? {
        Some(p) => {
            info!(path = %p, "目录选择成功");
            Ok(p)
        }
        None => {
            info!("用户取消目录选择");
            Ok(String::new())
        }
    }
}

// Tauri 命令：批量创建文件夹
#[tauri::command]
async fn create_folders(root: String, tree: Vec<TreeNode>) -> Result<CreateResult, String> {
    info!(root = %root, node_count = tree.len(), "执行批量创建文件夹");

    let root_path = PathBuf::from(&root);
    if !root_path.exists() {
        error!(path = %root, "目标目录不存在");
        return Err(format!("目标目录不存在: {}", root));
    }

    let mut created = Vec::new();
    create_folders_recursively(&root_path, &tree, &mut created);

    let created_paths: Vec<String> = created
        .iter()
        .filter_map(|item| match item {
            CreateDetail::Path(p) => Some(p.clone()),
            _ => None,
        })
        .collect();

    let success_count = created_paths.len();
    let error_count = created.len() - success_count;

    info!(
        total = created.len(),
        success_count = success_count,
        error_count = error_count,
        "批量创建完成"
    );

    Ok(CreateResult {
        success: error_count == 0,
        created_paths,
        detail: created,
    })
}

// Tauri 命令：撤销本次创建
#[tauri::command]
async fn undo_folders(created_paths: Vec<String>) -> Result<(), String> {
    info!(count = created_paths.len(), "执行撤销操作");
    delete_folders_recursively(&created_paths);
    info!("撤销操作完成");
    Ok(())
}

fn main() {
    // 初始化日志系统
    init_logger();

    info!("启动文件夹批量创建工具 v2.0.0");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            select_directory,
            create_folders,
            undo_folders
        ])
        .setup(|_app| {
            info!("Tauri 应用初始化完成");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用时发生错误");
}
