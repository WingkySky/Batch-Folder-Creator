// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

// 树节点结构体
#[derive(Debug, Deserialize)]
struct TreeNode {
    title: String,
    children: Option<Vec<TreeNode>>,
}

// 创建结果结构体
#[derive(Debug, Serialize)]
struct CreateResult {
    success: bool,
    created_paths: Vec<String>,
    detail: Vec<CreateItem>,
}

// 创建项
#[derive(Debug, Serialize)]
#[serde(untagged)]
enum CreateItem {
    Path(String),
    Error { path: String, error: String },
}

// 递归创建文件夹
fn create_folders_recursively(
    root: &PathBuf,
    tree: &[TreeNode],
    created: &mut Vec<CreateItem>,
) {
    for node in tree {
        let dir_path = root.join(&node.title);
        match fs::create_dir(&dir_path) {
            Ok(_) => {
                created.push(CreateItem::Path(dir_path.to_string_lossy().to_string()));
            }
            Err(e) if e.kind() == std::io::ErrorKind::AlreadyExists => {}
            Err(e) => {
                created.push(CreateItem::Error {
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

// 逆序删除文件夹
fn delete_folders_recursively(paths: &[String]) {
    for path in paths.iter().rev() {
        let _ = fs::remove_dir_all(path);
    }
}

// Tauri 命令：选择目录
#[tauri::command]
async fn select_directory(_app: tauri::AppHandle) -> Result<String, String> {
    let result = tauri::api::dialog::blocking::FileDialogBuilder::new()
        .set_title("请选择目标根目录")
        .pick_folder();

    match result {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Ok(String::new()),
    }
}

// Tauri 命令：批量创建文件夹
#[tauri::command]
async fn create_folders(root: String, tree: Vec<TreeNode>) -> Result<CreateResult, String> {
    let root_path = PathBuf::from(root);
    let mut created = Vec::new();
    create_folders_recursively(&root_path, &tree, &mut created);

    let created_paths: Vec<String> = created
        .iter()
        .filter_map(|item| match item {
            CreateItem::Path(p) => Some(p.clone()),
            _ => None,
        })
        .collect();

    Ok(CreateResult {
        success: true,
        created_paths,
        detail: created,
    })
}

// Tauri 命令：撤销本次创建
#[tauri::command]
async fn undo_folders(created_paths: Vec<String>) -> Result<(), String> {
    delete_folders_recursively(&created_paths);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            select_directory,
            create_folders,
            undo_folders
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
