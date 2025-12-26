# MarkView - Product Design Requirements (PDR)

## 1. Resumen Ejecutivo

MarkView es un editor y previsualizador de Markdown multiplataforma diseñado para desarrolladores y escritores técnicos. Este documento define los requisitos funcionales, historias de usuario, y criterios de aceptación para el MVP.

---

## 2. Historias de Usuario

### 2.1 Editor Core

#### US-001: Editar Markdown con sintaxis resaltada
**Como** desarrollador
**Quiero** escribir Markdown con syntax highlighting
**Para** identificar fácilmente la estructura del documento

**Criterios de Aceptación:**
- [ ] El editor muestra colores diferentes para headings, bold, italic, links, code
- [ ] El highlighting se actualiza en tiempo real mientras escribo
- [ ] Soporta todos los elementos estándar de CommonMark
- [ ] Funciona correctamente con documentos de hasta 10,000 líneas

#### US-002: Ver preview en tiempo real
**Como** escritor técnico
**Quiero** ver el preview del Markdown mientras escribo
**Para** verificar cómo se verá el documento final

**Criterios de Aceptación:**
- [ ] El preview se actualiza automáticamente con debounce de 300ms
- [ ] La vista está dividida verticalmente (editor izquierda, preview derecha)
- [ ] El preview respeta el tema seleccionado (dark/light)
- [ ] El preview aplica el estilo seleccionado (GitHub, GitLab, etc.)

#### US-003: Sincronizar scroll entre editor y preview
**Como** usuario
**Quiero** que el scroll esté sincronizado entre editor y preview
**Para** ver siempre la misma sección en ambos paneles

**Criterios de Aceptación:**
- [ ] Al hacer scroll en el editor, el preview se posiciona en la sección correspondiente
- [ ] Al hacer scroll en el preview, el editor se posiciona en la línea correspondiente
- [ ] La sincronización puede activarse/desactivarse en settings
- [ ] La sincronización es suave, no abrupta

#### US-004: Usar atajos de teclado para formato
**Como** desarrollador
**Quiero** usar atajos de teclado para aplicar formato
**Para** escribir más rápido sin usar el mouse

**Criterios de Aceptación:**
- [ ] Ctrl+B aplica/quita negrita
- [ ] Ctrl+I aplica/quita itálica
- [ ] Ctrl+K inserta link
- [ ] Ctrl+1 a Ctrl+6 aplica headings
- [ ] Ctrl+` aplica code inline
- [ ] Ctrl+Shift+` inserta code block
- [ ] Todos los atajos funcionan con texto seleccionado
- [ ] Ctrl+/ muestra modal con lista de atajos

#### US-005: Usar toolbar para formato
**Como** usuario nuevo
**Quiero** una toolbar con botones de formato
**Para** aplicar formato sin memorizar atajos

**Criterios de Aceptación:**
- [ ] Toolbar visible en la parte superior del editor
- [ ] Botones para: Bold, Italic, Strikethrough, Headings, Link, Image, Code, Quote, Lists, Horizontal rule, Emoji, Mermaid
- [ ] Tooltips muestran el atajo de teclado correspondiente
- [ ] Botones tienen estado visual cuando el cursor está en texto formateado

---

### 2.2 Gestión de Archivos

#### US-006: Trabajar con múltiples archivos en tabs
**Como** desarrollador
**Quiero** tener múltiples archivos abiertos en tabs
**Para** trabajar en varios documentos simultáneamente

**Criterios de Aceptación:**
- [ ] Tabs visibles debajo de la toolbar
- [ ] Click en tab cambia al archivo
- [ ] Botón X para cerrar tab (con confirmación si hay cambios sin guardar)
- [ ] Indicador visual (punto) para archivos modificados
- [ ] Límite configurable de tabs abiertas
- [ ] Tab muestra nombre del archivo (truncado si es largo)

#### US-007: Nombrar archivo automáticamente
**Como** usuario
**Quiero** que el nombre del archivo se genere automáticamente del primer heading
**Para** no tener que nombrar manualmente cada documento

**Criterios de Aceptación:**
- [ ] Archivo nuevo inicia como "Untitled"
- [ ] Si el documento tiene un H1, el nombre se actualiza automáticamente
- [ ] El nombre auto-generado puede ser editado manualmente
- [ ] Una vez editado manualmente, no se auto-genera más
- [ ] El nombre se muestra en el tab y en la barra de título

#### US-008: Importar archivos con drag & drop
**Como** usuario
**Quiero** arrastrar un archivo .md para abrirlo
**Para** importar documentos rápidamente

**Criterios de Aceptación:**
- [ ] Arrastrar .md sobre la app lo abre en un nuevo tab
- [ ] Indicador visual cuando se está arrastrando un archivo válido
- [ ] Mensaje de error si el archivo no es .md
- [ ] Funciona tanto en web como en desktop

#### US-009: Arrastrar imágenes al editor
**Como** escritor
**Quiero** arrastrar imágenes al editor para insertarlas
**Para** agregar imágenes rápidamente

**Criterios de Aceptación:**
- [ ] Arrastrar imagen la sube a servicio externo (Imgur/Cloudinary)
- [ ] Se inserta automáticamente la sintaxis `![](url)`
- [ ] Indicador de progreso durante la subida
- [ ] Mensaje de error si falla la subida
- [ ] Soporta formatos: PNG, JPG, GIF, WebP

---

### 2.3 Persistencia y Guardado

#### US-010: Auto-guardar en localStorage
**Como** usuario
**Quiero** que mis cambios se guarden automáticamente
**Para** no perder trabajo si cierro el navegador

**Criterios de Aceptación:**
- [ ] Auto-save se ejecuta en cada cambio con debounce de 2 segundos
- [ ] Indicador visual "Guardando..." / "Guardado"
- [ ] Los archivos persisten entre sesiones del navegador
- [ ] Auto-save puede desactivarse en settings

#### US-011: Mantener estado entre sesiones
**Como** usuario
**Quiero** encontrar todo como lo dejé al volver
**Para** continuar mi trabajo sin fricciones

**Criterios de Aceptación:**
- [ ] Se restauran: archivos abiertos, posición del cursor, scroll, tab activo
- [ ] Se restauran: configuración de tema, idioma, y otras preferencias
- [ ] Se restaura: estado del sidebar (abierto/cerrado, sección activa)
- [ ] Se restaura: cuenta de GitHub conectada

#### US-012: Guardar versiones manuales
**Como** escritor
**Quiero** guardar versiones de mi documento
**Para** poder volver a estados anteriores

**Criterios de Aceptación:**
- [ ] Botón "Save version" guarda snapshot actual
- [ ] Se guardan hasta 10 versiones por archivo
- [ ] Lista de versiones con fecha/hora
- [ ] UI para comparar versiones (diff visual)
- [ ] Restaurar versión reemplaza el contenido actual

---

### 2.4 Temas y Estilos

#### US-013: Cambiar tema de la aplicación
**Como** usuario
**Quiero** elegir entre tema dark y light
**Para** trabajar cómodamente según mi preferencia

**Criterios de Aceptación:**
- [ ] Opciones: Dark, Light, System (sigue preferencia del SO)
- [ ] El tema afecta: editor, preview, sidebar, toolbar, modals
- [ ] El cambio es instantáneo, sin recarga
- [ ] La preferencia se persiste

#### US-014: Cambiar estilo del preview
**Como** desarrollador
**Quiero** ver cómo se verá mi Markdown en diferentes plataformas
**Para** asegurar que se vea bien donde lo publique

**Criterios de Aceptación:**
- [ ] Estilos disponibles: GitHub, GitLab, Notion, Obsidian, Stack Overflow, Dev.to
- [ ] Cada estilo replica fielmente los CSS de la plataforma
- [ ] El estilo se aplica solo al preview, no al editor
- [ ] La preferencia se persiste

---

### 2.5 Sidebar y Navegación

#### US-015: Explorar archivos locales y de GitHub
**Como** desarrollador
**Quiero** un explorador de archivos en el sidebar
**Para** navegar mis documentos fácilmente

**Criterios de Aceptación:**
- [ ] Sección "Local" muestra archivos en localStorage
- [ ] Sección "GitHub" muestra repos conectados
- [ ] Click en archivo lo abre en un tab
- [ ] Indicador visual para archivo actualmente abierto
- [ ] Búsqueda/filtro de archivos

#### US-016: Ver tabla de contenidos (TOC)
**Como** usuario
**Quiero** ver la estructura de headings del documento
**Para** navegar rápidamente a secciones específicas

**Criterios de Aceptación:**
- [ ] TOC se genera automáticamente de los headings (H1-H6)
- [ ] Muestra jerarquía con indentación
- [ ] Click en item navega a esa sección
- [ ] TOC se actualiza en tiempo real mientras escribo
- [ ] Heading actual resaltado mientras hago scroll

#### US-017: Buscar en el documento
**Como** usuario
**Quiero** buscar y reemplazar texto
**Para** encontrar y modificar contenido rápidamente

**Criterios de Aceptación:**
- [ ] Ctrl+F abre panel de búsqueda
- [ ] Búsqueda resalta todas las coincidencias
- [ ] Navegación con siguiente/anterior
- [ ] Opción de reemplazar (uno o todos)
- [ ] Soporte para búsqueda con regex
- [ ] Búsqueda case-sensitive opcional

#### US-018: Colapsar sidebar
**Como** usuario
**Quiero** ocultar el sidebar
**Para** tener más espacio para el editor

**Criterios de Aceptación:**
- [ ] Botón para colapsar/expandir sidebar
- [ ] Atajo de teclado (Ctrl+B o similar)
- [ ] Animación suave de colapso
- [ ] Estado se persiste entre sesiones

---

### 2.6 Integración GitHub

#### US-019: Conectar cuenta de GitHub
**Como** desarrollador
**Quiero** conectar mi cuenta de GitHub
**Para** acceder a mis repositorios desde la app

**Criterios de Aceptación:**
- [ ] Botón "Connect GitHub" inicia OAuth flow
- [ ] Se solicitan permisos mínimos necesarios (repo read)
- [ ] Indicador de cuenta conectada con avatar y username
- [ ] Opción de desconectar cuenta
- [ ] Token se almacena de forma segura

#### US-020: Listar y navegar repositorios
**Como** desarrollador
**Quiero** ver mis repositorios en el explorador
**Para** acceder a archivos Markdown de mis proyectos

**Criterios de Aceptación:**
- [ ] Lista de repositorios del usuario (públicos y privados)
- [ ] Búsqueda/filtro de repositorios
- [ ] Navegación por carpetas dentro del repo
- [ ] Solo muestra archivos .md (y carpetas que los contengan)
- [ ] Indicador de repo público vs privado

#### US-021: Abrir archivo de GitHub
**Como** desarrollador
**Quiero** abrir un archivo .md de un repositorio
**Para** visualizarlo y editarlo localmente

**Criterios de Aceptación:**
- [ ] Click en archivo .md lo abre en un nuevo tab
- [ ] El contenido se descarga y muestra en el editor
- [ ] Indicador visual de que es un archivo de GitHub
- [ ] El archivo se guarda localmente para trabajo offline
- [ ] Mensaje si hay error de conexión

---

### 2.7 Exportación

#### US-022: Descargar como Markdown
**Como** usuario
**Quiero** descargar mi documento como archivo .md
**Para** guardarlo en mi sistema de archivos

**Criterios de Aceptación:**
- [ ] Botón de descarga en toolbar
- [ ] El archivo se descarga con el nombre del documento
- [ ] El contenido es exactamente lo que está en el editor
- [ ] Funciona en web y desktop

#### US-023: Exportar como PDF
**Como** escritor técnico
**Quiero** exportar mi documento como PDF
**Para** compartirlo en formato universal

**Criterios de Aceptación:**
- [ ] Botón "Export PDF" en toolbar/menú
- [ ] El PDF respeta el tema y estilo del preview
- [ ] Diagramas Mermaid se renderizan correctamente
- [ ] Fórmulas KaTeX se renderizan correctamente
- [ ] Syntax highlighting se preserva
- [ ] Tamaño de página A4 por defecto

#### US-024: Exportar como HTML
**Como** desarrollador
**Quiero** exportar el HTML renderizado
**Para** usarlo en otras aplicaciones

**Criterios de Aceptación:**
- [ ] Botón "Export HTML" en toolbar/menú
- [ ] HTML incluye estilos inline o CSS embebido
- [ ] El HTML es standalone (no requiere assets externos)
- [ ] Opción de copiar HTML al clipboard

#### US-025: Exportar como imagen
**Como** usuario
**Quiero** exportar el preview como imagen
**Para** compartir en redes sociales o presentaciones

**Criterios de Aceptación:**
- [ ] Botón "Export Image" en toolbar/menú
- [ ] Formatos soportados: PNG, JPG
- [ ] La imagen captura todo el documento (no solo lo visible)
- [ ] Respeta el tema y estilo del preview

---

### 2.8 Preview en Nueva Ventana

#### US-026: Abrir preview en ventana separada
**Como** presentador
**Quiero** abrir el preview en una ventana separada
**Para** mostrarlo en otra pantalla mientras edito

**Criterios de Aceptación:**
- [ ] Botón para abrir preview en nueva ventana/tab
- [ ] El preview se sincroniza en tiempo real con el editor
- [ ] Sincronización usa debounce para eficiencia
- [ ] Preview separado es solo visualización (sin controles)
- [ ] Si el editor se cierra, preview muestra mensaje "Editor cerrado, reconectar"

---

### 2.9 Markdown Extendido

#### US-027: Renderizar diagramas Mermaid
**Como** documentador técnico
**Quiero** incluir diagramas Mermaid
**Para** visualizar flujos y arquitecturas

**Criterios de Aceptación:**
- [ ] Code blocks con lenguaje `mermaid` se renderizan como diagrama
- [ ] Soporta: flowchart, sequence, gantt, pie, mindmap, timeline
- [ ] Errores de sintaxis muestran mensaje útil
- [ ] Diagramas respetan el tema (dark/light)

#### US-028: Renderizar fórmulas matemáticas
**Como** escritor académico
**Quiero** incluir fórmulas matemáticas con LaTeX
**Para** documentar ecuaciones y expresiones

**Criterios de Aceptación:**
- [ ] Sintaxis inline: `$formula$`
- [ ] Sintaxis block: `$$formula$$`
- [ ] Renderizado con KaTeX
- [ ] Errores de sintaxis muestran el código fuente

#### US-029: Renderizar callouts
**Como** documentador
**Quiero** usar callouts estilo GitHub y Obsidian
**Para** resaltar notas, advertencias, y tips

**Criterios de Aceptación:**
- [ ] Soporta sintaxis GitHub: `> [!NOTE]`, `> [!WARNING]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!CAUTION]`
- [ ] Soporta sintaxis Obsidian: `> [!info]`, `> [!question]`, etc.
- [ ] Cada tipo tiene icono y color distintivo
- [ ] Respetan el tema (dark/light)

#### US-030: Checklists interactivos
**Como** usuario
**Quiero** marcar/desmarcar checkboxes en el preview
**Para** gestionar listas de tareas

**Criterios de Aceptación:**
- [ ] Checkboxes en el preview son clickeables
- [ ] Click actualiza el código fuente (`- [ ]` <-> `- [x]`)
- [ ] El cambio se refleja inmediatamente
- [ ] Funciona con auto-save

#### US-031: Syntax highlighting en code blocks
**Como** desarrollador
**Quiero** que los code blocks tengan syntax highlighting
**Para** leer código fácilmente

**Criterios de Aceptación:**
- [ ] Detecta lenguaje del code block (```javascript, ```python, etc.)
- [ ] Highlighting usa Shiki con temas que coinciden con el tema de la app
- [ ] Soporta los lenguajes más comunes (30+)
- [ ] Botón de copiar código en cada code block

#### US-032: Renderizar frontmatter YAML
**Como** blogger
**Quiero** que el frontmatter YAML se muestre como metadata
**Para** ver título, fecha, autor, etc.

**Criterios de Aceptación:**
- [ ] Frontmatter delimitado por `---` al inicio del documento
- [ ] Se parsea y muestra como panel de metadata
- [ ] No se muestra como código en el preview
- [ ] Campos comunes: title, date, author, tags

---

### 2.10 Herramientas

#### US-033: Validar Markdown con linter
**Como** escritor
**Quiero** que se valide mi Markdown mientras escribo
**Para** mantener un estilo consistente

**Criterios de Aceptación:**
- [ ] Usa markdownlint con reglas configurables
- [ ] Errores y warnings se muestran inline (subrayado)
- [ ] Contador de errores en barra de estado
- [ ] Hover sobre error muestra descripción
- [ ] Puede activarse/desactivarse en settings

#### US-034: Formatear documento automáticamente
**Como** desarrollador
**Quiero** formatear mi documento con un click
**Para** mantener estilo consistente sin esfuerzo

**Criterios de Aceptación:**
- [ ] Botón "Format" en toolbar
- [ ] Usa Prettier con plugin de Markdown
- [ ] Opción de formatear al guardar
- [ ] Configuración de Prettier accesible

#### US-035: Ver estadísticas del documento
**Como** escritor
**Quiero** ver estadísticas de mi documento
**Para** saber extensión y tiempo de lectura

**Criterios de Aceptación:**
- [ ] Muestra en barra de estado: palabras, caracteres, líneas
- [ ] Muestra tiempo de lectura estimado (~200 palabras/min)
- [ ] Se actualiza en tiempo real
- [ ] Click expande a vista detallada (opcional)

---

### 2.11 Modo Zen

#### US-036: Escribir sin distracciones
**Como** escritor
**Quiero** un modo sin distracciones
**Para** concentrarme en escribir

**Criterios de Aceptación:**
- [ ] Atajo de teclado para activar/desactivar (F11 o Ctrl+Shift+Z)
- [ ] Oculta: sidebar, toolbar, barra de estado, tabs
- [ ] Solo muestra: editor y opcionalmente preview
- [ ] ESC sale del modo zen
- [ ] Opción de mostrar solo editor o editor+preview

---

### 2.12 Configuración

#### US-037: Personalizar la experiencia
**Como** usuario
**Quiero** configurar la aplicación a mi gusto
**Para** adaptarla a mi flujo de trabajo

**Criterios de Aceptación:**
- [ ] Panel de settings accesible desde menú o atajo
- [ ] Configuraciones disponibles:
  - Tema (dark/light/system)
  - Estilo de preview
  - Idioma (EN/ES)
  - Tamaño de fuente (editor y preview)
  - Font family
  - Auto-save (on/off + intervalo)
  - Formatear al guardar
  - Lint al escribir
  - Word wrap
  - Números de línea
  - Minimap
  - Ancho del preview
  - Sync scroll
- [ ] Cambios se aplican inmediatamente
- [ ] Todas las configuraciones se persisten

#### US-038: Cambiar idioma de la interfaz
**Como** usuario hispanohablante
**Quiero** usar la app en español
**Para** entender mejor la interfaz

**Criterios de Aceptación:**
- [ ] Idiomas disponibles: Inglés, Español
- [ ] Detecta idioma del navegador por defecto
- [ ] Cambio manual en settings
- [ ] Todos los textos de UI están traducidos
- [ ] La preferencia se persiste

---

### 2.13 Onboarding

#### US-039: Aprender a usar la app
**Como** nuevo usuario
**Quiero** un tutorial de bienvenida
**Para** conocer las funcionalidades principales

**Criterios de Aceptación:**
- [ ] Primera visita muestra modal de bienvenida
- [ ] Tour guiado opcional que resalta features principales
- [ ] Documento de ejemplo con diferentes elementos Markdown
- [ ] Botón para volver a ver el onboarding
- [ ] El onboarding puede saltarse

---

### 2.14 Desktop (Tauri)

#### US-040: Usar como aplicación de escritorio
**Como** desarrollador
**Quiero** usar MarkView como app de escritorio
**Para** tener acceso directo a mi sistema de archivos

**Criterios de Aceptación:**
- [ ] Instalador disponible para Windows, macOS, Linux
- [ ] Acceso nativo al sistema de archivos (sin dialogs del browser)
- [ ] Menú nativo del sistema operativo
- [ ] Asociación con archivos .md (abrir con MarkView)
- [ ] Tamaño del instalador < 20MB
- [ ] Auto-updates

#### US-041: Detectar cambios externos en archivos
**Como** desarrollador
**Quiero** que la app detecte si un archivo cambia externamente
**Para** mantener sincronizado mi trabajo

**Criterios de Aceptación:**
- [ ] File watcher detecta cambios en archivos abiertos
- [ ] Notificación cuando un archivo cambia externamente
- [ ] Opciones: recargar, mantener versión actual, ver diff
- [ ] No sobrescribe cambios sin confirmación

---

### 2.15 PWA / Mobile

#### US-042: Instalar como PWA
**Como** usuario mobile
**Quiero** instalar la app en mi dispositivo
**Para** acceder rápidamente desde el home screen

**Criterios de Aceptación:**
- [ ] Prompt de instalación en navegadores compatibles
- [ ] Funciona offline después de instalada
- [ ] Ícono y splash screen personalizados
- [ ] Se actualiza automáticamente

#### US-043: Usar en pantallas pequeñas
**Como** usuario mobile
**Quiero** usar la app en mi teléfono
**Para** revisar y editar documentos en movimiento

**Criterios de Aceptación:**
- [ ] Layout se adapta a pantallas pequeñas
- [ ] Tabs para alternar entre editor y preview (no side-by-side)
- [ ] Sidebar se convierte en drawer
- [ ] Toolbar se simplifica (menú hamburguesa)
- [ ] Touch gestures funcionan correctamente

---

## 3. Flujos de Usuario Principales

### 3.1 Flujo: Crear y Guardar Documento

```
1. Usuario abre la app
2. Se muestra documento vacío "Untitled"
3. Usuario escribe contenido Markdown
4. Preview se actualiza en tiempo real
5. Auto-save guarda en localStorage cada 2 segundos
6. Usuario escribe heading "# Mi Documento"
7. Nombre del archivo cambia automáticamente a "Mi Documento"
8. Usuario hace click en "Download" para guardar como .md
```

### 3.2 Flujo: Abrir Archivo de GitHub

```
1. Usuario hace click en "Connect GitHub" en sidebar
2. Se abre popup de OAuth de GitHub
3. Usuario autoriza la aplicación
4. Popup se cierra, sidebar muestra lista de repos
5. Usuario navega: repo > carpeta > archivo.md
6. Click en archivo lo abre en nuevo tab
7. Contenido se muestra en editor con preview
8. Usuario puede editar y guardar localmente
```

### 3.3 Flujo: Exportar como PDF

```
1. Usuario tiene documento abierto
2. Click en menú "Export" > "PDF"
3. Se genera PDF con tema y estilo actuales
4. Diálogo de descarga aparece
5. Usuario guarda el archivo PDF
```

### 3.4 Flujo: Preview en Segunda Pantalla

```
1. Usuario tiene documento abierto
2. Click en botón "Open Preview in New Window"
3. Nueva ventana/tab se abre con solo el preview
4. Usuario mueve ventana a segundo monitor
5. Al escribir en editor, preview se actualiza en tiempo real
6. Usuario cierra tab del editor
7. Preview muestra "Editor closed - Reconnect"
```

---

## 4. Wireframes de Referencia

### 4.1 Layout Principal

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] MarkView           [Theme] [Settings] [GitHub Avatar]   │
├─────────────────────────────────────────────────────────────────┤
│ [B][I][S][H1▼][🔗][📷][`][```][❝][•][1.][☑][—][😀][◇]  [Format] │
├───────┬─────────────────────────────────────────────────────────┤
│       │ [Tab1.md ●] [Tab2.md] [Tab3.md] [+]                     │
│       ├─────────────────────────┬───────────────────────────────┤
│  S    │                         │                               │
│  I    │      EDITOR             │       PREVIEW                 │
│  D    │                         │                               │
│  E    │   # Heading             │       Heading                 │
│  B    │                         │       ═══════                 │
│  A    │   Some **bold** text    │       Some bold text          │
│  R    │                         │                               │
│       │                         │                               │
├───────┴─────────────────────────┴───────────────────────────────┤
│ Ln 12, Col 34 │ 234 words │ UTF-8 │ LF │ ✓ No issues │ Saved   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Sidebar Expandido

```
┌─────────────┐
│ EXPLORER    │
├─────────────┤
│ ▼ Local     │
│   📄 doc1.md│
│   📄 doc2.md│
│ ▼ GitHub    │
│   ▶ repo1   │
│   ▶ repo2   │
├─────────────┤
│ TOC         │
├─────────────┤
│ • Heading 1 │
│   • Sub 1.1 │
│   • Sub 1.2 │
│ • Heading 2 │
├─────────────┤
│ SEARCH      │
├─────────────┤
│ [🔍 Search] │
└─────────────┘
```

### 4.3 Mobile Layout

```
┌─────────────────────┐
│ ☰ MarkView    ⚙️ 👤 │
├─────────────────────┤
│ [Editor] [Preview]  │  <- Tabs
├─────────────────────┤
│                     │
│   # Heading         │
│                     │
│   Some text here    │
│                     │
│                     │
├─────────────────────┤
│ [B][I][🔗][`]  [+]  │  <- Simplified toolbar
└─────────────────────┘
```

---

## 5. Requisitos No Funcionales

### 5.1 Performance
- Tiempo de carga inicial < 2 segundos
- Render del preview < 100ms para documentos de hasta 5000 palabras
- Debounce de 300ms para actualizaciones del preview
- Debounce de 2000ms para auto-save
- Documentos de hasta 10,000 líneas sin degradación notable

### 5.2 Compatibilidad
- Navegadores: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- Desktop: Windows 10+, macOS 11+, Ubuntu 20.04+
- Mobile: iOS 14+, Android 10+ (PWA)

### 5.3 Accesibilidad
- Navegación completa por teclado
- Soporte para screen readers
- Contraste de colores WCAG AA
- Textos escalables

### 5.4 Seguridad
- OAuth tokens almacenados de forma segura
- No se envían datos a servidores propios (excepto analytics opt-in)
- Content Security Policy estricta
- Sanitización de HTML renderizado

### 5.5 Localización
- Soporte completo para inglés y español
- Formato de fechas según locale
- Estructura preparada para agregar más idiomas

---

## 6. Glosario

| Término | Definición |
|---------|------------|
| **TOC** | Table of Contents, tabla de contenidos generada de headings |
| **Callout** | Bloque destacado tipo nota, advertencia, o tip |
| **Frontmatter** | Metadata YAML al inicio del documento |
| **Mermaid** | Librería para diagramas como código |
| **KaTeX** | Librería para renderizar fórmulas matemáticas |
| **PWA** | Progressive Web App, app web instalable |
| **Tauri** | Framework para crear apps de escritorio con tecnologías web |

---

*Documento de requisitos para MarkView MVP*
*Versión 1.0 - Diciembre 2024*
