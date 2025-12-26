# Phase 07: Export Features

## Overview

This phase implements export functionality for Markdown, HTML, PDF, and image formats, as well as clipboard operations.

**Prerequisites**: Phase 06 completed
**Estimated Tasks**: 20
**Dependencies**: html2pdf.js, html2canvas

---

## Tasks

### 7.1 Export Service Setup

#### TASK-178: Create export service structure
- **Description**: Set up export service folder
- **Acceptance Criteria**:
  - [ ] `src/services/export/` folder
  - [ ] `src/services/export/markdown.ts`
  - [ ] `src/services/export/html.ts`
  - [ ] `src/services/export/pdf.ts`
  - [ ] `src/services/export/image.ts`
  - [ ] `src/services/export/index.ts`
- **Files**: Multiple files in `src/services/export/`

#### TASK-179: Install export dependencies
- **Description**: Install required packages
- **Acceptance Criteria**:
  - [ ] html2pdf.js installed
  - [ ] html2canvas installed
  - [ ] file-saver installed (for downloads)
- **Files**: `package.json`

---

### 7.2 Markdown Export

#### TASK-180: Implement Markdown download
- **Description**: Download document as .md file
- **Acceptance Criteria**:
  - [ ] Get content from editor
  - [ ] Create blob with text/markdown type
  - [ ] Trigger download with file name
  - [ ] Preserve all content including frontmatter
- **Files**: `src/services/export/markdown.ts`

#### TASK-181: Create download button
- **Description**: Toolbar button for .md download
- **Acceptance Criteria**:
  - [ ] Download icon button
  - [ ] Tooltip: "Download Markdown"
  - [ ] Triggers markdown export
  - [ ] Uses document name as filename
- **Files**: `src/components/toolbar/buttons/DownloadButton.tsx`

---

### 7.3 HTML Export

#### TASK-182: Implement HTML export
- **Description**: Export rendered HTML
- **Acceptance Criteria**:
  - [ ] Get rendered HTML from preview
  - [ ] Include inline styles for portability
  - [ ] Include preview theme styles
  - [ ] Create standalone HTML file
- **Files**: `src/services/export/html.ts`

#### TASK-183: Implement HTML with embedded CSS
- **Description**: Bundle CSS into HTML
- **Acceptance Criteria**:
  - [ ] Extract computed styles
  - [ ] Inline critical CSS
  - [ ] Include syntax highlighting styles
  - [ ] Valid HTML5 document
- **Files**: `src/services/export/html.ts` (update)

#### TASK-184: Implement copy HTML to clipboard
- **Description**: Copy rendered HTML
- **Acceptance Criteria**:
  - [ ] Button to copy HTML
  - [ ] Copies to clipboard
  - [ ] Visual feedback on copy
  - [ ] Works in all browsers
- **Files**: `src/components/toolbar/buttons/CopyHtmlButton.tsx`

---

### 7.4 PDF Export

#### TASK-185: Implement PDF export (web)
- **Description**: Export document as PDF
- **Acceptance Criteria**:
  - [ ] Use html2pdf.js
  - [ ] Render preview HTML to PDF
  - [ ] A4 page size
  - [ ] Proper page breaks
  - [ ] Include theme styling
- **Files**: `src/services/export/pdf.ts`

#### TASK-186: Configure PDF options
- **Description**: Set PDF generation options
- **Acceptance Criteria**:
  - [ ] Margins configured
  - [ ] Image quality settings
  - [ ] Font embedding
  - [ ] Header/footer (optional, future)
- **Files**: `src/services/export/pdf.ts` (update)

#### TASK-187: Handle PDF generation errors
- **Description**: Error handling for PDF export
- **Acceptance Criteria**:
  - [ ] Catch generation errors
  - [ ] Show user-friendly message
  - [ ] Handle large documents
  - [ ] Handle missing fonts
- **Files**: `src/services/export/pdf.ts` (update)

#### TASK-188: Implement PDF progress indicator
- **Description**: Show progress during PDF generation
- **Acceptance Criteria**:
  - [ ] Loading overlay during generation
  - [ ] Progress percentage if possible
  - [ ] Cancel option for long operations
- **Files**: `src/components/modals/ExportProgressModal.tsx`

---

### 7.5 Image Export

#### TASK-189: Implement PNG export
- **Description**: Export preview as PNG image
- **Acceptance Criteria**:
  - [ ] Use html2canvas
  - [ ] Capture full preview (not just viewport)
  - [ ] High resolution (2x scale)
  - [ ] Download as .png
- **Files**: `src/services/export/image.ts`

#### TASK-190: Implement JPG export
- **Description**: Export preview as JPG image
- **Acceptance Criteria**:
  - [ ] Convert canvas to JPEG
  - [ ] Quality setting (0.95)
  - [ ] Download as .jpg
  - [ ] White background (for transparency)
- **Files**: `src/services/export/image.ts` (update)

#### TASK-191: Handle large document images
- **Description**: Handle very long documents
- **Acceptance Criteria**:
  - [ ] Warn for very large images
  - [ ] Option to export visible only
  - [ ] Memory management
  - [ ] Progress indicator
- **Files**: `src/services/export/image.ts` (update)

---

### 7.6 Export Menu

#### TASK-192: Create Export dropdown menu
- **Description**: Dropdown with all export options
- **Acceptance Criteria**:
  - [ ] Export button in toolbar
  - [ ] Dropdown with options
  - [ ] Options: Download MD, Export HTML, Export PDF, Export PNG, Export JPG
  - [ ] Icons for each option
- **Files**: `src/components/toolbar/ExportMenu.tsx`

#### TASK-193: Implement keyboard shortcuts for export
- **Description**: Shortcuts for common exports
- **Acceptance Criteria**:
  - [ ] Ctrl+S: Save (already done)
  - [ ] Ctrl+Shift+E: Open export menu
  - [ ] Add to shortcuts modal
- **Files**: `src/components/editor/extensions/keymap.ts` (update)

---

### 7.7 File Download Utility

#### TASK-194: Create download utility
- **Description**: Reusable file download function
- **Acceptance Criteria**:
  - [ ] `src/utils/download.ts`
  - [ ] Accept blob/content and filename
  - [ ] Handle different MIME types
  - [ ] Works in all browsers
  - [ ] Cleanup object URLs
- **Files**: `src/utils/download.ts`

#### TASK-195: Implement filename sanitization
- **Description**: Clean filenames for download
- **Acceptance Criteria**:
  - [ ] Remove invalid characters
  - [ ] Handle special characters
  - [ ] Truncate if too long
  - [ ] Add extension if missing
- **Files**: `src/utils/filename.ts` (update)

---

### 7.8 Export Settings

#### TASK-196: Add export settings
- **Description**: Configurable export options
- **Acceptance Criteria**:
  - [ ] Default export format preference
  - [ ] PDF page size option
  - [ ] Image quality setting
  - [ ] Include in settings modal
- **Files**: `src/stores/settingsStore.ts` (update)

#### TASK-197: Remember last export type
- **Description**: Remember user's preferred export
- **Acceptance Criteria**:
  - [ ] Track last used export type
  - [ ] Show as default in menu
  - [ ] Persist across sessions
- **Files**: `src/services/storage/settings.ts` (update)

---

## Completion Checklist

- [ ] All 20 tasks completed
- [ ] Markdown download works
- [ ] HTML export with styles works
- [ ] PDF export works correctly
- [ ] Image export (PNG/JPG) works
- [ ] Copy HTML to clipboard works
- [ ] Export menu functional
- [ ] Ready for Phase 08

---

## Testing Notes

- Test export with large documents
- Test PDF with Mermaid diagrams
- Test PDF with KaTeX formulas
- Test image export on mobile
- Test all themes in exports
- Verify file names are valid

---

*Phase 07 - Export Features*
*MarkView Development Plan*
