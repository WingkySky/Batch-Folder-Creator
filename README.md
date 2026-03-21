# Batch Folder Creator

A lightweight cross-platform desktop application that batch-creates hierarchical folder structures from Excel templates, with one-click undo support.

## Features

- 📊 **Excel Import** - Supports .xlsx/.xls format, auto-parses multi-level folder structures
- 📁 **Batch Creation** - Recursively creates multi-level folder hierarchies
- ↩️ **One-Click Undo** - Deletes all folders created in the current session
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🌍 **Bilingual** - Supports both Chinese and English interfaces

## Tech Stack

- **Framework**: Tauri 2.x (Rust + WebView)
- **Frontend**: React 18 + Ant Design 5.x
- **State Management**: Zustand
- **Build Tool**: Vite 5.x
- **Internationalization**: i18next + react-i18next

## System Requirements

- Windows 10/11 or macOS 10.15+
- No additional runtime required

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Build for Production

```bash
# Build production version
npm run build

# Build artifacts located at
# src-tauri/target/release/bundle/
```

## Usage Guide

### 1. Prepare Excel Template
- First row is header (ignored during parsing)
- Each column represents one folder level
- Example:

| Level 1 | Level 2 | Level 3 |
|---------|---------|---------|
| ProjectA | Documents | Contracts |
| ProjectA | Documents | Invoices |
| ProjectA | Images | Product Photos |

### 2. Import and Create
- Click "Select Excel File" to import the template
- Click "Select Target Directory" to choose the destination
- Click "Next" to preview the folder structure
- Click "Start Batch Create" to execute creation

### 3. Undo Operation
- After creation, click "Undo This Creation" to delete all newly created folders

## Project Structure

```
folder-batch-creator/
├── src/                      # React frontend source
│   ├── services/             # API service layer
│   ├── store/               # Zustand state management
│   ├── hooks/                # Common hooks
│   ├── types/                # Type definitions
│   ├── i18n/                 # Internationalization
│   │   ├── index.js         # i18n configuration
│   │   └── locales/         # Translation files
│   │       ├── zh.json      # Chinese translations
│   │       └── en.json      # English translations
│   ├── App.jsx              # Main application component
│   └── index.jsx            # Entry point
├── src-tauri/               # Rust backend source
│   ├── src/main.rs          # Tauri commands implementation
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri app configuration
└── public/
    └── template.xlsx         # Excel template example
```

## License

MIT License
