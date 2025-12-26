# MarkView - Idea Base

## Visión General

**MarkView** es un previsualizador y editor de Markdown moderno, open source, diseñado para desarrolladores y escritores técnicos. Ofrece una experiencia de edición en tiempo real con vista dividida, soporte para extensiones de Markdown avanzadas, y disponibilidad multiplataforma (Web, Desktop, Mobile).

## Problema que Resuelve

Los editores de Markdown existentes suelen tener una o más de estas limitaciones:

- **Falta de preview en tiempo real** con sincronización de scroll
- **Sin soporte para extensiones modernas** (Mermaid, KaTeX, callouts)
- **Experiencia fragmentada** entre plataformas
- **Sin integración con repositorios** de código
- **Configuración limitada** de temas y estilos
- **Sin persistencia local** del trabajo

MarkView resuelve todos estos problemas en una sola aplicación cohesiva.

## Usuarios Objetivo

### Primarios
- **Desarrolladores** que escriben documentación técnica, READMEs, y wikis
- **Escritores técnicos** que producen documentación de productos y APIs

### Secundarios
- **Estudiantes** que toman notas en formato Markdown
- **Bloggers técnicos** que escriben artículos para publicar

## Propuesta de Valor

> "El editor de Markdown que combina la simplicidad de una herramienta web con el poder de una aplicación de escritorio, todo sincronizado y disponible donde lo necesites."

### Diferenciadores Clave

1. **Multiplataforma real** - Web, Desktop (Tauri), y Mobile (PWA) con la misma experiencia
2. **Extensiones modernas** - Mermaid, KaTeX, callouts de GitHub/Obsidian out-of-the-box
3. **Integración GitHub nativa** - Navegar y abrir archivos directamente desde repositorios
4. **Temas de industria** - Previsualiza cómo se verá tu Markdown en GitHub, GitLab, etc.
5. **100% offline-capable** - Trabaja sin conexión, sincroniza cuando vuelvas online

## Alcance del MVP

### Incluido en MVP

#### Plataformas
- [x] Aplicación Web standalone
- [x] Aplicación Desktop (Tauri)
- [x] Integración con GitHub (lectura)

#### Core Features
- [x] Editor split vertical (código | preview)
- [x] Múltiples archivos en tabs
- [x] Temas dark/light con estilos de industria
- [x] Toolbar de formato con atajos de teclado
- [x] Persistencia en localStorage con auto-save
- [x] Preview sincronizado en nueva ventana
- [x] Scroll sync entre editor y preview

#### Markdown Extendido
- [x] Syntax highlighting (Shiki)
- [x] Diagramas Mermaid
- [x] Fórmulas KaTeX
- [x] Callouts (GitHub + Obsidian)
- [x] Frontmatter YAML
- [x] Footnotes
- [x] Checklists interactivos

#### Herramientas
- [x] Linting con markdownlint
- [x] Formateo con Prettier
- [x] Find & Replace con regex
- [x] Historial de versiones (10 por archivo)
- [x] Exportación: .md, .html, .pdf, .png

#### UX
- [x] Sidebar colapsable (explorador, TOC, búsqueda)
- [x] Barra de estado completa
- [x] Modo zen/focus
- [x] i18n (inglés, español)
- [x] Onboarding para nuevos usuarios

### Excluido del MVP (Futuro)

- [ ] Colaboración multi-usuario en tiempo real
- [ ] Versión mobile nativa
- [ ] Commits y PRs desde la app
- [ ] Integración con GitLab/Bitbucket
- [ ] Plugins/extensiones de terceros
- [ ] Sincronización en la nube

## Modelo de Negocio

**Open Source (MIT License)**

- Código fuente disponible en GitHub
- Contribuciones de la comunidad bienvenidas
- Sin planes de monetización inicial
- Posibilidad futura de versión "Pro" con features cloud

## Métricas de Éxito

### Técnicas
- Tiempo de carga inicial < 2 segundos
- Render del preview < 100ms para documentos típicos
- Tamaño del bundle web < 500KB gzipped
- Tamaño del instalador desktop < 20MB

### Adopción
- Stars en GitHub
- Descargas de la versión desktop
- Usuarios activos mensuales (analytics anónimos opt-in)

## Nombre y Branding

- **Nombre**: MarkView
- **Tagline**: "Markdown, visualized"
- **Dominio sugerido**: markview.app o markview.dev
- **Repositorio**: github.com/qazuor/markview

## Decisiones Clave Tomadas

| Decisión | Elección | Razón |
|----------|----------|-------|
| Framework | React + TypeScript | Familiaridad, ecosistema maduro |
| Editor | CodeMirror 6 | Liviano, buen soporte mobile |
| Desktop | Tauri | Más liviano que Electron (~15MB vs ~150MB) |
| Mobile | PWA | Mismo código que web, sin desarrollo adicional |
| State | Zustand | Simple, performante, sin boilerplate |
| Styling | Tailwind CSS | Desarrollo rápido, consistencia |
| Markdown | unified + remark | Extensible, plugins para todo |
| GitHub API | Octokit | SDK oficial |
| Imágenes D&D | Servicio externo | URLs permanentes, portable |
| Licencia | MIT | Máxima libertad para usuarios |

## Cronograma Estimado

| Fase | Descripción |
|------|-------------|
| 1 | Setup y estructura del proyecto |
| 2 | Core del editor (CodeMirror) |
| 3 | Preview y renderizado Markdown |
| 4 | Componentes UI (sidebar, toolbar, tabs) |
| 5 | Persistencia (localStorage, auto-save) |
| 6 | Integración GitHub |
| 7 | Exportaciones (PDF, HTML, PNG) |
| 8 | Features avanzados (Mermaid, KaTeX, callouts) |
| 9 | Versión Desktop (Tauri) |
| 10 | PWA y optimización mobile |
| 11 | Testing y QA |
| 12 | Documentación y lanzamiento |

---

*Documento generado durante sesión de definición de producto*
*Fecha: Diciembre 2024*
