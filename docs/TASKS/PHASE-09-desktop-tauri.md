# Phase 09: Desktop Application (Tauri)

## Overview

This phase implements the desktop application using Tauri, including native file system access, system menu integration, file associations, and auto-updates.

**Prerequisites**: Phase 08 completed
**Estimated Tasks**: 26
**Dependencies**: Tauri CLI, Rust toolchain

---

## Tasks

### 9.1 Tauri Setup

#### TASK-230: Install Tauri CLI and dependencies
- **Description**: Set up Tauri development environment
- **Acceptance Criteria**:
  - [ ] Rust toolchain installed
  - [ ] @tauri-apps/cli installed
  - [ ] @tauri-apps/api installed
  - [ ] tauri init completed
- **Files**: `package.json`, `src-tauri/`

#### TASK-231: Configure Tauri project
- **Description**: Set up tauri.conf.json
- **Acceptance Criteria**:
  - [ ] App name and identifier set
  - [ ] Window configuration (size, title)
  - [ ] Build commands configured
  - [ ] Dev URL configured
- **Files**: `src-tauri/tauri.conf.json`

#### TASK-232: Set up Tauri project structure
- **Description**: Create Rust source structure
- **Acceptance Criteria**:
  - [ ] `src-tauri/src/main.rs` entry point
  - [ ] `src-tauri/src/lib.rs` library
  - [ ] `src-tauri/src/commands/` for Tauri commands
  - [ ] Cargo.toml with dependencies
- **Files**: `src-tauri/src/`, `src-tauri/Cargo.toml`

#### TASK-233: Verify Tauri development mode
- **Description**: Ensure dev mode works
- **Acceptance Criteria**:
  - [ ] `pnpm tauri dev` launches app
  - [ ] Hot reload works
  - [ ] Console/devtools accessible
  - [ ] No critical errors
- **Commands**: `pnpm tauri dev`

---

### 9.2 Native File System

#### TASK-234: Implement file read command
- **Description**: Rust command to read files
- **Acceptance Criteria**:
  - [ ] Read file by path
  - [ ] Return content as string
  - [ ] Handle encoding (UTF-8)
  - [ ] Error handling for missing files
- **Files**: `src-tauri/src/commands/file.rs`

#### TASK-235: Implement file write command
- **Description**: Rust command to write files
- **Acceptance Criteria**:
  - [ ] Write content to path
  - [ ] Create directories if needed
  - [ ] Handle write errors
  - [ ] Return success/failure
- **Files**: `src-tauri/src/commands/file.rs` (update)

#### TASK-236: Implement file dialog commands
- **Description**: Native open/save dialogs
- **Acceptance Criteria**:
  - [ ] Open file dialog (filter .md)
  - [ ] Save file dialog
  - [ ] Select folder dialog
  - [ ] Return selected path
- **Files**: `src-tauri/src/commands/dialog.rs`

#### TASK-237: Create file service for Tauri
- **Description**: TypeScript service for Tauri file ops
- **Acceptance Criteria**:
  - [ ] `src/services/storage/fileSystem.ts`
  - [ ] Wraps Tauri commands
  - [ ] Fallback for web (not available)
  - [ ] Type-safe interface
- **Files**: `src/services/storage/fileSystem.ts`

#### TASK-238: Implement Open File action
- **Description**: Open file from disk
- **Acceptance Criteria**:
  - [ ] Menu item "Open File"
  - [ ] Keyboard shortcut Ctrl+O
  - [ ] Opens file dialog
  - [ ] Loads file into editor
- **Files**: `src/services/storage/fileSystem.ts` (update)

#### TASK-239: Implement Save As action
- **Description**: Save file to new location
- **Acceptance Criteria**:
  - [ ] Menu item "Save As"
  - [ ] Keyboard shortcut Ctrl+Shift+S
  - [ ] Opens save dialog
  - [ ] Saves content to selected path
  - [ ] Updates document metadata
- **Files**: `src/services/storage/fileSystem.ts` (update)

#### TASK-240: Implement direct Save action
- **Description**: Save to known location
- **Acceptance Criteria**:
  - [ ] If file has path, save directly
  - [ ] If new file, trigger Save As
  - [ ] Keyboard shortcut Ctrl+S
  - [ ] Update modified state
- **Files**: `src/services/storage/fileSystem.ts` (update)

---

### 9.3 File Watcher

#### TASK-241: Implement file watcher in Rust
- **Description**: Watch files for external changes
- **Acceptance Criteria**:
  - [ ] Use notify crate
  - [ ] Watch open files
  - [ ] Emit events on change
  - [ ] Debounce rapid changes
- **Files**: `src-tauri/src/commands/watcher.rs`

#### TASK-242: Handle external file changes
- **Description**: UI for external changes
- **Acceptance Criteria**:
  - [ ] Detect file changed externally
  - [ ] Show notification/modal
  - [ ] Options: Reload, Keep current, View diff
  - [ ] Handle file deleted
- **Files**: `src/hooks/useFileWatcher.ts`, `src/components/modals/FileChangedModal.tsx`

---

### 9.4 System Menu

#### TASK-243: Configure native menu
- **Description**: Set up system menu bar
- **Acceptance Criteria**:
  - [ ] File menu (New, Open, Save, Save As, Exit)
  - [ ] Edit menu (Undo, Redo, Cut, Copy, Paste)
  - [ ] View menu (Zoom, Sidebar, Fullscreen)
  - [ ] Help menu (About, Shortcuts)
- **Files**: `src-tauri/src/menu.rs`, `src-tauri/tauri.conf.json`

#### TASK-244: Handle menu actions
- **Description**: Connect menu to app actions
- **Acceptance Criteria**:
  - [ ] Menu items trigger app functions
  - [ ] Use Tauri event system
  - [ ] Sync with web app actions
- **Files**: `src/hooks/useTauriMenu.ts`

---

### 9.5 Window Management

#### TASK-245: Configure window properties
- **Description**: Set up window behavior
- **Acceptance Criteria**:
  - [ ] Minimum size (800x600)
  - [ ] Remember window size/position
  - [ ] Fullscreen support
  - [ ] Title bar configuration
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-246: Implement window state persistence
- **Description**: Save/restore window state
- **Acceptance Criteria**:
  - [ ] Save window size on close
  - [ ] Save window position
  - [ ] Restore on next launch
  - [ ] Handle multi-monitor
- **Files**: `src-tauri/src/commands/window.rs`

---

### 9.6 File Associations

#### TASK-247: Configure file associations
- **Description**: Associate .md files with app
- **Acceptance Criteria**:
  - [ ] Register .md file type
  - [ ] Register .markdown file type
  - [ ] App icon for files
  - [ ] Double-click opens in app
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-248: Handle file open on launch
- **Description**: Open file passed as argument
- **Acceptance Criteria**:
  - [ ] Detect file argument on launch
  - [ ] Open file in editor
  - [ ] Handle multiple files
  - [ ] Handle invalid paths
- **Files**: `src-tauri/src/main.rs` (update)

---

### 9.7 Auto-Updates

#### TASK-249: Configure Tauri updater
- **Description**: Set up auto-update system
- **Acceptance Criteria**:
  - [ ] Tauri updater configured
  - [ ] Update endpoint URL
  - [ ] Signing configuration
  - [ ] Update check on startup
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-250: Implement update UI
- **Description**: UI for update notifications
- **Acceptance Criteria**:
  - [ ] Check for updates on startup
  - [ ] Notification when update available
  - [ ] Download progress
  - [ ] Install and restart option
- **Files**: `src/components/modals/UpdateModal.tsx`

---

### 9.8 Build and Distribution

#### TASK-251: Configure build for Windows
- **Description**: Windows build configuration
- **Acceptance Criteria**:
  - [ ] MSI installer configured
  - [ ] App icon set
  - [ ] Publisher info set
  - [ ] Code signing (if available)
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-252: Configure build for macOS
- **Description**: macOS build configuration
- **Acceptance Criteria**:
  - [ ] DMG and app bundle configured
  - [ ] App icon set
  - [ ] Info.plist configured
  - [ ] Code signing (if available)
  - [ ] Notarization (if available)
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-253: Configure build for Linux
- **Description**: Linux build configuration
- **Acceptance Criteria**:
  - [ ] AppImage configured
  - [ ] .deb package configured
  - [ ] Desktop file created
  - [ ] Icons for different sizes
- **Files**: `src-tauri/tauri.conf.json` (update)

#### TASK-254: Create release workflow
- **Description**: GitHub Actions for releases
- **Acceptance Criteria**:
  - [ ] Build on tag push
  - [ ] Build for all platforms
  - [ ] Create GitHub release
  - [ ] Upload artifacts
  - [ ] Update manifest for auto-updater
- **Files**: `.github/workflows/release.yml` (update)

#### TASK-255: Test installation on all platforms
- **Description**: Verify installers work
- **Acceptance Criteria**:
  - [ ] Windows installer tested
  - [ ] macOS installer tested
  - [ ] Linux packages tested
  - [ ] Uninstall tested
  - [ ] Update tested
- **Commands**: Manual testing

---

## Completion Checklist

- [ ] All 26 tasks completed
- [ ] Tauri app builds successfully
- [ ] File open/save works natively
- [ ] File associations work
- [ ] Menu bar functional
- [ ] Auto-update works
- [ ] Installers for all platforms
- [ ] Ready for Phase 10

---

## Testing Notes

- Test on Windows, macOS, and Linux
- Test file associations
- Test opening files via command line
- Test file watching with external editors
- Test window state persistence
- Test auto-update flow

---

## Build Notes

- Ensure Rust toolchain is up to date
- macOS requires Xcode command line tools
- Windows may require MSVC
- Linux requires various system libraries

---

*Phase 09 - Desktop Application*
*MarkView Development Plan*
