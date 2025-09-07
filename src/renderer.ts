/**
 * JSExec - JavaScript Playground
 * Open Source alternative to RunJs
 */

import './index.css';

// Monaco Editor imports
import * as monaco from 'monaco-editor';
import * as ts from 'typescript';

// The vite-plugin-monaco-editor will handle worker configuration automatically

// JSExec Application Class
interface AppSettings {
  autoRunEnabled: boolean;
  theme: string;
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  tabSize: number;
  fontFamily: string;
  language: string;
}

interface EditorSettings {
  theme: string;
  fontSize: number;
  lineNumbers: boolean;
  fontFamily: string;
  language: string;
}

interface ThemeDefinition {
  name: string;
  displayName: string;
  colors: {
    background: string;
    foreground: string;
    selection: string;
    lineHighlight: string;
    cursor: string;
  };
}

class JSExecApp {
  private editors: Map<string, monaco.editor.IStandaloneCodeEditor> = new Map();
  private tabCounter = 1;
  private activeTabId = 'tab-1';
  private tabData: Map<string, { title: string; content: string; isDirty: boolean; file: string | null }> = new Map();
  private autoRunEnabled = true;
  private autoRunTimeout: Map<string, NodeJS.Timeout> = new Map();
  private readonly AUTO_RUN_DELAY = 1000; // 1 segundo de delay
  private readonly EXECUTION_TIMEOUT = 5000; // 5 segundos máximo de ejecución
  private readonly MAX_OUTPUT_LINES = 1000; // Máximo 1000 líneas de output
  private executionAbortController: Map<string, AbortController> = new Map();
  private settings: AppSettings = {
    autoRunEnabled: true,
    theme: 'github-dark',
    fontSize: 14,
    wordWrap: true,
    minimap: false,
    lineNumbers: false,
    tabSize: 2,
    fontFamily: 'JetBrains Mono',
    language: 'en'
  };
  private readonly SETTINGS_KEY = 'jsexec-settings';

  private themes: ThemeDefinition[] = [
    {
      name: 'github-dark',
      displayName: 'GitHub Dark',
      colors: {
        background: '#0d1117',
        foreground: '#e6edf3',
        selection: '#264f78',
        lineHighlight: '#21262d',
        cursor: '#e6edf3'
      }
    },
    {
      name: 'tomorrow-night-bright',
      displayName: 'Tomorrow Night Bright',
      colors: {
        background: '#000000',
        foreground: '#eaeaea',
        selection: '#424242',
        lineHighlight: '#2a2a2a',
        cursor: '#eaeaea'
      }
    }
  ];

  private fontFamilies = [
    'JetBrains Mono',
    'Fira Code',
    'Consolas',
    'Monaco',
    'Menlo'
  ];

  private translations = {
    en: {
      file: 'File',
      new: 'New',
      open: 'Open',
      save: 'Save',
      settings: 'Settings',
      theme: 'Theme',
      fontSize: 'Font Size',
      fontFamily: 'Font Family',
      language: 'Language',
      lineNumbers: 'Line Numbers',
      run: 'Run',
      clear: 'Clear',
      // Tooltips
      runTooltip: 'Run (⌘R)',
      newTooltip: 'New file (⌘N)',
      openTooltip: 'Open file (⌘O)',
      saveTooltip: 'Save (⌘S)',
      clearTooltip: 'Clear output (⌘K)',
      settingsTooltip: 'Settings (⌘,)',
      // Settings panel
      general: 'General',
      appearance: 'Appearance',
      editor: 'Editor',
      font: 'Font',
      tabSize: 'Tab Size',
      wordWrap: 'Word Wrap',
      minimap: 'Show Minimap',
      autoRun: 'Real-time Auto-execution',
      shortcuts: 'Keyboard Shortcuts',
      runCode: 'Run code:',
      newTab: 'New tab:',
      saveFile: 'Save:',
      openSettings: 'Settings:'
    },
    es: {
      file: 'Archivo',
      new: 'Nuevo',
      open: 'Abrir',
      save: 'Guardar',
      settings: 'Configuración',
      theme: 'Tema',
      fontSize: 'Tamaño de Fuente',
      fontFamily: 'Familia de Fuente',
      language: 'Idioma',
      lineNumbers: 'Números de Línea',
      run: 'Ejecutar',
      clear: 'Limpiar',
      // Tooltips
      runTooltip: 'Ejecutar (⌘R)',
      newTooltip: 'Nuevo archivo (⌘N)',
      openTooltip: 'Abrir archivo (⌘O)',
      saveTooltip: 'Guardar (⌘S)',
      clearTooltip: 'Limpiar salida (⌘K)',
      settingsTooltip: 'Configuración (⌘,)',
      // Settings panel
      general: 'General',
      appearance: 'Apariencia',
      editor: 'Editor',
      font: 'Fuente',
      tabSize: 'Tamaño de Tab',
      wordWrap: 'Ajuste de línea automático',
      minimap: 'Mostrar minimap',
      autoRun: 'Auto-ejecución en tiempo real',
      shortcuts: 'Atajos de teclado',
      runCode: 'Ejecutar código:',
      newTab: 'Nuevo tab:',
      saveFile: 'Guardar:',
      openSettings: 'Configuraciones:'
    }
  };

  constructor() {
    this.loadSettings();
    this.configureMonaco();
    this.initializeMonacoTheme();
    this.initializeFirstTab();
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.setupTabSystem();
    this.setupSettingsPanel();
    this.updateUILanguage();
  }

  private configureMonaco(): void {
    // Disable all TypeScript diagnostics globally to prevent console errors
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
      diagnosticCodesToIgnore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Ignore all diagnostic codes
    });

    // Also disable for JavaScript
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSyntaxValidation: true,
      noSemanticValidation: true,
      noSuggestionDiagnostics: true,
      diagnosticCodesToIgnore: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });

    // Configure TypeScript compiler options ONCE at startup to avoid Monaco bug
    // Issue: https://github.com/microsoft/monaco-editor/issues/4364
    // Use Object.assign to merge with existing options instead of replacing them
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
      Object.assign(
        monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        {
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          module: monaco.languages.typescript.ModuleKind.None,
          lib: ['ES2020', 'DOM'],
          allowJs: true,
          checkJs: false,
          strict: false,
          noImplicitAny: false,
          skipLibCheck: true,
          removeComments: false,
          sourceMap: false,
          declaration: false,
          allowNonTsExtensions: true,
          moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          noEmit: true,
          esModuleInterop: true
        }
      )
    );

    // IntelliSense features are now enabled since we use official TypeScript transpiler
    // No need to disable hover or completion providers
  }

  private initializeMonacoTheme(): void {
    // Configure Monaco Editor with GitHub Dark theme
    monaco.editor.defineTheme('github-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '7d8590' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: '79c0ff' },
        { token: 'regexp', foreground: '7ee787' },
        { token: 'operator', foreground: 'ff7b72' },
        { token: 'namespace', foreground: 'ffa657' },
        { token: 'type', foreground: 'ffa657' },
        { token: 'struct', foreground: 'ffa657' },
        { token: 'class', foreground: 'ffa657' },
        { token: 'interface', foreground: 'ffa657' },
        { token: 'parameter', foreground: 'ffa657' },
        { token: 'variable', foreground: 'ffa657' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'method', foreground: 'd2a8ff' }
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editorLineNumber.foreground': '#30363d',
        'editorLineNumber.activeForeground': '#6e7681',
        'editor.selectionBackground': '#264f78',
        'editor.selectionHighlightBackground': '#264f7840',
        'editorCursor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#21262d50'
      }
    });

    // Configure Monaco Editor with Tomorrow Night Bright theme
    monaco.editor.defineTheme('tomorrow-night-bright', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '969896', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd54e53' },
        { token: 'string', foreground: 'b9ca4a' },
        { token: 'number', foreground: 'e78c45' },
        { token: 'regexp', foreground: 'b9ca4a' },
        { token: 'operator', foreground: 'd54e53' },
        { token: 'namespace', foreground: 'e7c547' },
        { token: 'type', foreground: 'e7c547' },
        { token: 'struct', foreground: 'e7c547' },
        { token: 'class', foreground: 'e7c547' },
        { token: 'interface', foreground: 'e7c547' },
        { token: 'parameter', foreground: 'e7c547' },
        { token: 'variable', foreground: 'eaeaea' },
        { token: 'function', foreground: '7aa6da' },
        { token: 'method', foreground: '7aa6da' }
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#eaeaea',
        'editorLineNumber.foreground': '#666666',
        'editorLineNumber.activeForeground': '#eaeaea',
        'editor.selectionBackground': '#424242',
        'editor.lineHighlightBackground': '#2a2a2a'
      }
    });
  }

  private initializeFirstTab(): void {
    this.tabData.set('tab-1', {
      title: 'Untitled-1',
      content: this.getWelcomeCode(),
      isDirty: false,
      file: null
    });
    this.createEditor('tab-1');
  }

  private createEditor(tabId: string): void {
    const editorContainer = document.querySelector(`[data-tab-id="${tabId}"].editor-container`) as HTMLElement;
    if (!editorContainer) return;

    const editor = monaco.editor.create(editorContainer, {
      value: this.tabData.get(tabId)?.content || '',
      language: 'typescript', // TypeScript incluye soporte para JavaScript
      theme: this.settings.theme,
      fontSize: this.settings.fontSize,
      fontFamily: this.settings.fontFamily,
      minimap: { enabled: this.settings.minimap },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: this.settings.tabSize,
      insertSpaces: true,
      wordWrap: this.settings.wordWrap ? 'on' : 'off',
      lineNumbers: this.settings.lineNumbers ? 'on' : 'off',
      renderWhitespace: 'selection',
      contextmenu: true,
      mouseWheelZoom: true,
      cursorBlinking: 'blink',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      folding: true,
      foldingHighlight: true,
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      // Enable IntelliSense features now that we use official TypeScript transpiler
      hover: { enabled: true },
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'currentDocument',
      parameterHints: { enabled: true },
      autoClosingBrackets: 'languageDefined',
      autoClosingQuotes: 'languageDefined',
      autoSurround: 'languageDefined'
    });

    // Track changes for dirty state and auto-run
    editor.onDidChangeModelContent(() => {
      const tabData = this.tabData.get(tabId);
      if (tabData) {
        tabData.isDirty = true;
        tabData.content = editor.getValue();
        this.updateTabTitle(tabId);
        
        // Auto-run functionality
         if (this.autoRunEnabled && tabId === this.activeTabId) {
           this.scheduleAutoRun(tabId);
         }
       }
     });

    this.editors.set(tabId, editor);
  }

  private setupEventListeners(): void {
    // Run button
    document.getElementById('runBtn')?.addEventListener('click', () => {
      this.executeCode();
    });

    // Clear button
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.clearOutput();
    });

    // File operations
    document.getElementById('newBtn')?.addEventListener('click', () => {
      this.newFile();
    });

    document.getElementById('openBtn')?.addEventListener('click', () => {
      this.openFile();
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      this.saveFile();
    });
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'r') {
        e.preventDefault();
        this.executeCode();
      } else if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        this.saveFile();
      } else if (cmdOrCtrl && e.key === 'n') {
        e.preventDefault();
        this.newFile();
      } else if (cmdOrCtrl && e.key === 'o') {
        e.preventDefault();
        this.openFile();
      } else if (cmdOrCtrl && e.key === 't') {
        e.preventDefault();
        this.addNewTab();
      } else if (cmdOrCtrl && e.key === ',') {
        e.preventDefault();
        document.getElementById('settingsPanel')?.classList.add('open');
      }
    });
  }

  private setupTabSystem(): void {
    // Add tab button
    document.querySelector('.add-tab-btn')?.addEventListener('click', () => {
      this.addNewTab();
    });

    // Setup event delegation for tab clicks and close buttons
    document.querySelector('.tabs-list')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const tab = target.closest('.tab') as HTMLElement;
      
      if (!tab) return;
      
      const tabId = tab.getAttribute('data-tab-id');
      if (!tabId) return;

      if (target.closest('.tab-close')) {
        this.closeTab(tabId);
      } else {
        this.switchToTab(tabId);
      }
    });

    // Clear output functionality is now handled by the sidebar button
  }

  private addNewTab(): void {
    this.tabCounter++;
    const newTabId = `tab-${this.tabCounter}`;
    const newTabTitle = `Untitled-${this.tabCounter}`;

    // Add tab data
    this.tabData.set(newTabId, {
      title: newTabTitle,
      content: '',
      isDirty: false,
      file: null
    });

    // Create tab element
    const tabsContainer = document.querySelector('.tabs-list');
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.setAttribute('data-tab-id', newTabId);
    newTab.innerHTML = `
      <span class="tab-title">${newTabTitle}</span>
      <button class="tab-close" title="Cerrar tab">
        <i class="fas fa-times"></i>
      </button>
    `;
    tabsContainer?.appendChild(newTab);

    // Create tab content
    const tabsContent = document.querySelector('.tabs-content');
    const newTabPane = document.createElement('div');
    newTabPane.className = 'tab-pane';
    newTabPane.setAttribute('data-tab-id', newTabId);
    newTabPane.innerHTML = `
      <div class="split-view">
         <div class="split-panel editor-panel">
            <div class="editor-container" data-tab-id="${newTabId}"></div>
          </div>
          
          <div class="split-divider"></div>
          
          <div class="split-panel output-panel">
            <div class="output-container" data-tab-id="${newTabId}"></div>
          </div>
       </div>
    `;
    tabsContent?.appendChild(newTabPane);

    // Create editor for new tab
    setTimeout(() => {
      this.createEditor(newTabId);
      this.switchToTab(newTabId);
    }, 100);
  }

  private closeTab(tabId: string): void {
    const tabData = this.tabData.get(tabId);
    
    // Check if there's only one tab left
    if (this.tabData.size <= 1) {
      return; // Don't close the last tab
    }

    // Check if tab has unsaved changes
    if (tabData?.isDirty) {
      const save = confirm(`¿Quieres guardar los cambios en ${tabData.title}?`);
      if (save) {
        this.saveFile(tabId);
      }
    }

    // Remove editor
    const editor = this.editors.get(tabId);
    if (editor) {
      editor.dispose();
      this.editors.delete(tabId);
    }

    // Remove tab data
    this.tabData.delete(tabId);

    // Remove DOM elements
    document.querySelector(`[data-tab-id="${tabId}"].tab`)?.remove();
    document.querySelector(`[data-tab-id="${tabId}"].tab-pane`)?.remove();

    // Switch to another tab if this was the active tab
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabData.keys());
      if (remainingTabs.length > 0) {
        this.switchToTab(remainingTabs[0]);
      }
    }
  }

  private switchToTab(tabId: string): void {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // Add active class to selected tab and pane
    document.querySelector(`[data-tab-id="${tabId}"].tab`)?.classList.add('active');
    document.querySelector(`[data-tab-id="${tabId}"].tab-pane`)?.classList.add('active');

    this.activeTabId = tabId;

    // Trigger editor resize
    setTimeout(() => {
      const editor = this.editors.get(tabId);
      if (editor) {
        editor.layout();
      }
    }, 100);

    this.updateTitle();
  }

  private executeCode(): void {
    const editor = this.editors.get(this.activeTabId);
    if (!editor) return;

    const code = editor.getValue();
    this.clearOutput(this.activeTabId);
    this.executeCodeSafely(this.activeTabId, code);
  }

  private appendOutput(tabId: string, type: string, args: any[], timestamp: Date): void {
    const outputContainer = document.querySelector(`[data-tab-id="${tabId}"].output-container`) as HTMLElement;
    if (!outputContainer) return;

    const outputLine = document.createElement('div');
    outputLine.className = `output-${type}`;
    
    const argsStr = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    outputLine.innerHTML = argsStr;
    outputContainer.appendChild(outputLine);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  private clearOutput(tabId?: string): void {
    const targetTabId = tabId || this.activeTabId;
    const outputContainer = document.querySelector(`[data-tab-id="${targetTabId}"].output-container`) as HTMLElement;
    if (outputContainer) {
      outputContainer.innerHTML = '';
    }
  }

  private newFile(): void {
    this.addNewTab();
  }

  private async openFile(): Promise<void> {
    try {
      // Use the File System Access API if available
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [{
            description: 'JavaScript files',
            accept: { 'text/javascript': ['.js'] }
          }]
        });
        
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        const editor = this.editors.get(this.activeTabId);
        if (editor) {
          editor.setValue(content);
          const tabData = this.tabData.get(this.activeTabId);
          if (tabData) {
            tabData.file = file.name;
            tabData.title = file.name;
            tabData.isDirty = false;
            this.updateTabTitle(this.activeTabId);
          }
        }
      } else {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.txt';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const editor = this.editors.get(this.activeTabId);
              if (editor) {
                editor.setValue(e.target?.result as string || '');
                const tabData = this.tabData.get(this.activeTabId);
                if (tabData) {
                  tabData.file = file.name;
                  tabData.title = file.name;
                  tabData.isDirty = false;
                  this.updateTabTitle(this.activeTabId);
                }
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }

  private async saveFile(tabId?: string): Promise<void> {
    const targetTabId = tabId || this.activeTabId;
    const editor = this.editors.get(targetTabId);
    const tabData = this.tabData.get(targetTabId);
    
    if (!editor || !tabData) return;
    
    const content = editor.getValue();
    
    try {
      // Use the File System Access API if available
      if ('showSaveFilePicker' in window) {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: tabData.file || tabData.title + '.js',
          types: [{
            description: 'JavaScript files',
            accept: { 'text/javascript': ['.js'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        
        tabData.file = fileHandle.name;
        tabData.title = fileHandle.name;
        tabData.isDirty = false;
        this.updateTabTitle(targetTabId);
      } else {
        // Fallback for older browsers
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = tabData.file || tabData.title + '.js';
        a.click();
        URL.revokeObjectURL(url);
        
        tabData.isDirty = false;
        this.updateTabTitle(targetTabId);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  private updateTabTitle(tabId: string): void {
    const tabData = this.tabData.get(tabId);
    if (!tabData) return;

    const tabElement = document.querySelector(`[data-tab-id="${tabId}"] .tab-title`) as HTMLElement;
    if (tabElement) {
      tabElement.textContent = tabData.title + (tabData.isDirty ? ' •' : '');
    }

    if (tabId === this.activeTabId) {
      this.updateTitle();
    }
  }

  private updateTitle(): void {
    const tabData = this.tabData.get(this.activeTabId);
    if (tabData) {
      const title = `${tabData.title}${tabData.isDirty ? ' •' : ''} - JSExec`;
      document.title = title;
    }
  }

  private setupSettingsPanel(): void {
    // Settings panel HTML is now in index.html, just setup event listeners
    this.setupSettingsEventListeners();
    this.applySettingsToUI();
  }

  private setupSettingsEventListeners(): void {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    const fontSizeSlider = document.getElementById('font-size-slider') as HTMLInputElement;
    const fontSizeValue = document.getElementById('font-size-value');
    const wordWrapToggle = document.getElementById('word-wrap-toggle') as HTMLInputElement;
    const minimapToggle = document.getElementById('minimap-toggle') as HTMLInputElement;
    const autoRunToggle = document.getElementById('auto-run-toggle') as HTMLInputElement;
    const lineNumbersToggle = document.getElementById('line-numbers-toggle') as HTMLInputElement;
    const tabSizeSelect = document.getElementById('tab-size-select') as HTMLSelectElement;
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    const fontFamilySelect = document.getElementById('font-family-select') as HTMLSelectElement;

    // Abrir panel de configuraciones
    settingsBtn?.addEventListener('click', () => {
      settingsPanel?.classList.add('open');
    });

    // Cerrar panel de configuraciones
    closeSettingsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked'); // Debug
      settingsPanel?.classList.remove('open');
    });

    // Cerrar modal haciendo click en el overlay
    settingsPanel?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target === settingsPanel) {
        settingsPanel.classList.remove('open');
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && settingsPanel?.classList.contains('open')) {
        settingsPanel.classList.remove('open');
      }
    });

    // Configuración de tema
    themeSelect?.addEventListener('change', () => {
      const theme = themeSelect.value;
      this.settings.theme = theme;
      this.editors.forEach(editor => {
        monaco.editor.setTheme(theme);
      });
      this.saveSettings();
    });

    // Configuración de tamaño de fuente
    fontSizeSlider?.addEventListener('input', () => {
      const fontSize = parseInt(fontSizeSlider.value);
      this.settings.fontSize = fontSize;
      
      // Update the display value
      if (fontSizeValue) {
        fontSizeValue.textContent = `${fontSize}px`;
      }
      
      // Update all editors
      this.editors.forEach(editor => {
        editor.updateOptions({ fontSize });
      });
      this.saveSettings();
    });

    // Configuración de ajuste de línea
    wordWrapToggle?.addEventListener('change', () => {
      const wordWrap = wordWrapToggle.checked ? 'on' : 'off';
      this.settings.wordWrap = wordWrapToggle.checked;
      this.editors.forEach(editor => {
        editor.updateOptions({ wordWrap });
      });
      this.saveSettings();
    });

    // Configuración de minimap
    minimapToggle?.addEventListener('change', () => {
      const minimapEnabled = minimapToggle.checked;
      this.settings.minimap = minimapEnabled;
      this.editors.forEach(editor => {
        editor.updateOptions({ minimap: { enabled: minimapEnabled } });
      });
      this.saveSettings();
    });

    // Configuración de números de línea
    lineNumbersToggle?.addEventListener('change', () => {
      const lineNumbers = lineNumbersToggle.checked ? 'on' : 'off';
      this.settings.lineNumbers = lineNumbersToggle.checked;
      this.editors.forEach(editor => {
        editor.updateOptions({ lineNumbers });
      });
      this.saveSettings();
    });

    // Configuración de auto-ejecución
    autoRunToggle?.addEventListener('change', () => {
      this.autoRunEnabled = autoRunToggle.checked;
      this.settings.autoRunEnabled = autoRunToggle.checked;
      if (!this.autoRunEnabled) {
        // Clear all pending timeouts
        this.autoRunTimeout.forEach(timeout => clearTimeout(timeout));
        this.autoRunTimeout.clear();
      }
      this.saveSettings();
    });

    // Configuración de tamaño de tab
    tabSizeSelect?.addEventListener('change', () => {
      const tabSize = parseInt(tabSizeSelect.value);
      this.settings.tabSize = tabSize;
      this.editors.forEach(editor => {
        editor.updateOptions({ tabSize });
      });
      this.saveSettings();
    });

    // Language configuration
    languageSelect?.addEventListener('change', () => {
      this.settings.language = languageSelect.value;
      this.saveSettings();
      // Update UI with new language
      this.updateUILanguage();
    });

    // Font family configuration
    fontFamilySelect?.addEventListener('change', () => {
      const fontFamily = fontFamilySelect.value;
      this.settings.fontFamily = fontFamily;
      this.editors.forEach(editor => {
        editor.updateOptions({ fontFamily });
      });
      this.saveSettings();
    });
  }

  private scheduleAutoRun(tabId: string): void {
    // Clear existing timeout for this tab
    const existingTimeout = this.autoRunTimeout.get(tabId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new auto-run with intelligent delay
    const timeout = setTimeout(() => {
      const editor = this.editors.get(tabId);
      if (editor && this.isCodeReadyForExecution(editor.getValue())) {
        this.autoExecuteCode(tabId);
      }
    }, this.AUTO_RUN_DELAY);

    this.autoRunTimeout.set(tabId, timeout);
  }

  private isCodeReadyForExecution(code: string): boolean {
    const trimmedCode = code.trim();
    
    // Don't execute empty code
    if (!trimmedCode) return false;
    
    // Don't execute if code ends with incomplete syntax
    if (this.hasIncompleteStatement(trimmedCode)) return false;
    
    // Don't execute if brackets/braces are unbalanced
    if (!this.areBracketsBalanced(trimmedCode)) return false;
    
    // Don't execute if it looks like user is still typing
    if (this.looksLikeIncompleteTyping(trimmedCode)) return false;
    
    return true;
  }
  
  private hasIncompleteStatement(code: string): boolean {
    const incompletePatterns = [
      /\bif\s*\(.*\)\s*$/,           // if (...) at end
      /\belse\s*$/,                 // else at end
      /\bfor\s*\(.*\)\s*$/,         // for (...) at end
      /\bwhile\s*\(.*\)\s*$/,       // while (...) at end
      /\bfunction\s+\w*\s*\([^)]*\)\s*$/,  // function declaration at end
      /\bconst\s+\w+\s*=\s*$/,      // const x = at end
      /\blet\s+\w+\s*=\s*$/,        // let x = at end
      /\bvar\s+\w+\s*=\s*$/,        // var x = at end
      /\w+\s*=\s*$/,                // assignment at end
      /\w+\s*\(\s*$/,               // function call start
      /\w+\s*\.\s*$/,               // property access at end
      /\binterface\s+\w*\s*$/,      // interface declaration
      /\btype\s+\w*\s*=\s*$/        // type declaration
    ];
    
    return incompletePatterns.some(pattern => pattern.test(code));
  }
  
  private areBracketsBalanced(code: string): boolean {
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    let inString = false;
    let inComment = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1];
      
      // Handle comments
      if (!inString && char === '/' && nextChar === '/') {
        inComment = true;
        continue;
      }
      if (inComment && char === '\n') {
        inComment = false;
        continue;
      }
      if (inComment) continue;
      
      // Handle strings
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
        continue;
      }
      if (inString && char === stringChar && code[i-1] !== '\\') {
        inString = false;
        stringChar = '';
        continue;
      }
      if (inString) continue;
      
      // Handle brackets
      if (char in brackets) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const lastOpen = stack.pop();
        if (!lastOpen || brackets[lastOpen as keyof typeof brackets] !== char) {
          return false;
        }
      }
    }
    
    return stack.length === 0;
  }
  
  private looksLikeIncompleteTyping(code: string): boolean {
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    
    // Check if last line looks incomplete
    const incompleteTypingPatterns = [
      /^\w+$/,                      // Single word
      /^\w+\s*\.$/, // Word followed by dot
      /^\w+\s*\($/,                 // Word followed by opening paren
      /^\w+\s*\[$/,                 // Word followed by opening bracket
      /^\w+\s*\{$/,                 // Word followed by opening brace
      /^\w+\s*:\s*$/,               // Word followed by colon (TypeScript)
      /^\s*\.\w*$/,                 // Dot followed by partial word
    ];
    
    return incompleteTypingPatterns.some(pattern => pattern.test(lastLine));
  }

  private autoExecuteCode(tabId: string): void {
    const editor = this.editors.get(tabId);
    if (!editor || tabId !== this.activeTabId) return;

    const code = editor.getValue().trim();
    if (!code) {
      this.clearOutput(tabId);
      return;
    }

    this.clearOutput(tabId);
    this.executeCodeSafely(tabId, code);
  }

  private isTypeScriptCode(code: string): boolean {
    // Detect TypeScript-specific syntax
    const tsPatterns = [
      /interface\s+\w+/g,
      /type\s+\w+\s*=/g,
      /:\s*(string|number|boolean|object|any|void|never|unknown)\b/g,
      /<[^>]+>/g, // Generic types
      /as\s+\w+/g, // Type assertions
      /enum\s+\w+/g,
      /public\s+|private\s+|protected\s+|readonly\s+/g,
      /implements\s+\w+/g,
      /extends\s+\w+/g,
      /abstract\s+class/g,
      /declare\s+/g
    ];

    return tsPatterns.some(pattern => pattern.test(code));
  }

  private async compileTypeScript(code: string): Promise<string> {
    try {
      // Use the official TypeScript transpiler
      const result = ts.transpileModule(code, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.None,
          removeComments: false,
          strict: false,
          noImplicitAny: false,
          skipLibCheck: true,
          isolatedModules: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          suppressImplicitAnyIndexErrors: true
        }
      });
      
      if (result.outputText) {
         const jsCode = result.outputText
          .replace(/^"use strict";?\s*/gm, '')
          .replace(/^\s*\n+/gm, '')
          .trim();
        
        console.log('📄 Original code length:', code.length);
        console.log('🧹 Transpiled code length:', jsCode.length);
        console.log('✅ Official TypeScript compilation successful');
        
        return jsCode;
      } else {
        console.log('❌ TypeScript transpilation returned no output');
        return code;
      }
      
    } catch (error: any) {
      console.log('❌ TypeScript compilation error:', error.message);
      return code;
    }
  }

  private async executeCodeSafely(tabId: string, code: string): Promise<void> {
    // Abort any previous execution
    const existingController = this.executionAbortController.get(tabId);
    if (existingController) {
      existingController.abort();
    }

    const abortController = new AbortController();
    this.executionAbortController.set(tabId, abortController);

    try {
      // Check for potentially dangerous patterns
      if (this.containsDangerousCode(code)) {
        this.appendSecurityError(tabId, 'Código potencialmente peligroso detectado');
        return;
      }

      let executableCode = code;
      
      // Detect and compile TypeScript if needed
      if (this.isTypeScriptCode(code)) {
        try {
          executableCode = await this.compileTypeScript(code);
        } catch (compileError: any) {
          this.appendFriendlyError(tabId, compileError);
          return;
        }
      }

      // Create a safe execution context with limits
      const logs: Array<{type: string, args: any[], timestamp: Date}> = [];
      let outputLineCount = 0;
      const executionStartTime = Date.now();
      
      // Override console methods with limits
      const mockConsole = {
        log: (...args: any[]) => {
          if (abortController.signal.aborted) return;
          if (outputLineCount >= this.MAX_OUTPUT_LINES) {
            this.appendSecurityError(tabId, `Límite de output alcanzado (${this.MAX_OUTPUT_LINES} líneas)`);
            abortController.abort();
            return;
          }
          if (Date.now() - executionStartTime > this.EXECUTION_TIMEOUT) {
            this.appendSecurityError(tabId, 'Ejecución detenida por timeout');
            abortController.abort();
            return;
          }
          logs.push({type: 'log', args, timestamp: new Date()});
          outputLineCount++;
        },
        error: (...args: any[]) => {
          if (abortController.signal.aborted) return;
          logs.push({type: 'error', args, timestamp: new Date()});
          outputLineCount++;
        },
        warn: (...args: any[]) => {
          if (abortController.signal.aborted) return;
          logs.push({type: 'warn', args, timestamp: new Date()});
          outputLineCount++;
        },
        info: (...args: any[]) => {
          if (abortController.signal.aborted) return;
          logs.push({type: 'info', args, timestamp: new Date()});
          outputLineCount++;
        }
      };

      // Create execution timeout
      const timeoutId = setTimeout(() => {
        if (!abortController.signal.aborted) {
          this.appendSecurityError(tabId, `Ejecución detenida por timeout (${this.EXECUTION_TIMEOUT/1000}s)`);
          abortController.abort();
        }
      }, this.EXECUTION_TIMEOUT);

      // Execute code in a restricted environment
      const safeCode = this.wrapCodeForSafeExecution(executableCode);
      const executeFunction = new Function('console', 'AbortSignal', safeCode);
      
      const result = executeFunction(mockConsole, abortController.signal);

      clearTimeout(timeoutId);

      if (abortController.signal.aborted) {
        return;
      }

      // Display captured logs
      logs.forEach(log => {
        this.appendOutput(tabId, log.type, log.args, log.timestamp);
      });

      // Display result if it's not undefined
      if (result !== undefined) {
        this.appendOutput(tabId, 'result', [result], new Date());
      }
      
    } catch (error: any) {
      if (abortController.signal.aborted) {
        return;
      }
      // Friendly error display
      this.appendFriendlyError(tabId, error);
    } finally {
      this.executionAbortController.delete(tabId);
    }
  }

  private containsDangerousCode(code: string): boolean {
    const dangerousPatterns = [
      /while\s*\(\s*true\s*\)/gi, // while(true)
      /for\s*\(\s*;\s*;\s*\)/gi, // for(;;)
      /setInterval|setTimeout/gi, // Timers
      /XMLHttpRequest|fetch/gi, // Network requests
      /localStorage|sessionStorage/gi, // Storage access
      /document\.|window\.|global\./gi, // DOM/Window access
      /eval\s*\(/gi, // eval function
      /Function\s*\(/gi, // Function constructor
      /import\s|require\s*\(/gi, // Module imports
    ];

    return dangerousPatterns.some(pattern => pattern.test(code));
  }

  private wrapCodeForSafeExecution(code: string): string {
    // Wrap code to detect infinite loops
    return `
      let __loopCount = 0;
      const __maxLoops = 100000;
      const __originalCode = function() {
        ${code.replace(/for\s*\(/g, 'for (__loopCount++; __loopCount < __maxLoops && (').replace(/while\s*\(/g, 'while (__loopCount++ < __maxLoops && (')}
      };
      
      try {
        return __originalCode();
      } catch (e) {
        if (__loopCount >= __maxLoops) {
          throw new Error('Bucle infinito detectado - ejecución detenida por seguridad');
        }
        throw e;
      }
    `;
  }

  private appendSecurityError(tabId: string, message: string): void {
    const outputContainer = document.querySelector(`[data-tab-id="${tabId}"].output-container`) as HTMLElement;
    if (!outputContainer) return;

    const errorLine = document.createElement('div');
    errorLine.className = 'output-security-error';
    
    errorLine.innerHTML = `🛡️ ${message}`;
    outputContainer.appendChild(errorLine);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  private appendFriendlyError(tabId: string, error: Error): void {
    const outputContainer = document.querySelector(`[data-tab-id="${tabId}"].output-container`) as HTMLElement;
    if (!outputContainer) return;

    const errorLine = document.createElement('div');
    errorLine.className = 'output-error-friendly';
    
    let friendlyMessage = '';
    
    // Make error messages more friendly
    if (error.message.includes('Unexpected token')) {
      friendlyMessage = '❌ Error de sintaxis: Revisa que todas las llaves, paréntesis y comillas estén cerradas correctamente.';
    } else if (error.message.includes('is not defined')) {
      const variable = error.message.match(/(\w+) is not defined/)?.[1];
      friendlyMessage = `❌ Variable no definida: '${variable}' no existe. ¿La escribiste correctamente?`;
    } else if (error.message.includes('Cannot read property')) {
      friendlyMessage = '❌ Error de propiedad: Intentas acceder a una propiedad de algo que es null o undefined.';
    } else if (error.message.includes('Cannot access')) {
      friendlyMessage = '❌ Error de acceso: Intentas usar una variable antes de declararla.';
    } else {
      friendlyMessage = `❌ Error: ${error.message}`;
    }
    
    errorLine.innerHTML = friendlyMessage;
    outputContainer.appendChild(errorLine);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem(this.SETTINGS_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        this.autoRunEnabled = this.settings.autoRunEnabled;
      }
    } catch (error) {
      console.warn('Error loading settings:', error);
    }
  }

  private t(key: string): string {
    const lang = this.settings.language as 'en' | 'es';
    return this.translations[lang][key as keyof typeof this.translations.en] || key;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Error saving settings:', error);
    }
  }

  private applySettingsToUI(): void {
    // Update UI elements with current settings
    const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
    const fontSizeInput = document.getElementById('font-size-input') as HTMLInputElement;
    const fontSizeValue = document.getElementById('font-size-value');
    const wordWrapToggle = document.getElementById('word-wrap-toggle') as HTMLInputElement;
    const minimapToggle = document.getElementById('minimap-toggle') as HTMLInputElement;
    const autoRunToggle = document.getElementById('auto-run-toggle') as HTMLInputElement;
    const lineNumbersToggle = document.getElementById('line-numbers-toggle') as HTMLInputElement;
    const tabSizeInput = document.getElementById('tab-size-input') as HTMLSelectElement;
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    const fontFamilySelect = document.getElementById('font-family-select') as HTMLSelectElement;

    if (themeSelect) themeSelect.value = this.settings.theme;
    if (fontSizeInput) {
      fontSizeInput.value = this.settings.fontSize.toString();
      if (fontSizeValue) {
        fontSizeValue.textContent = `${this.settings.fontSize}px`;
      }
    }
    if (wordWrapToggle) wordWrapToggle.checked = this.settings.wordWrap;
    if (minimapToggle) minimapToggle.checked = this.settings.minimap;
    if (autoRunToggle) autoRunToggle.checked = this.settings.autoRunEnabled;
    if (lineNumbersToggle) lineNumbersToggle.checked = this.settings.lineNumbers;
    if (tabSizeInput) tabSizeInput.value = this.settings.tabSize.toString();
    if (languageSelect) languageSelect.value = this.settings.language;
    if (fontFamilySelect) fontFamilySelect.value = this.settings.fontFamily;
  }

  private updateUILanguage(): void {
    // Update tooltips for sidebar buttons
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const newBtn = document.getElementById('newBtn');
    const openBtn = document.getElementById('openBtn');
    const saveBtn = document.getElementById('saveBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    if (runBtn) runBtn.setAttribute('title', this.t('runTooltip'));
    if (clearBtn) clearBtn.setAttribute('title', this.t('clearTooltip'));
    if (newBtn) newBtn.setAttribute('title', this.t('newTooltip'));
    if (openBtn) openBtn.setAttribute('title', this.t('openTooltip'));
    if (saveBtn) saveBtn.setAttribute('title', this.t('saveTooltip'));
    if (settingsBtn) settingsBtn.setAttribute('title', this.t('settingsTooltip'));

    // Update settings panel content
    this.updateSettingsPanelLanguage();
  }

  private updateSettingsPanelLanguage(): void {
    // Update settings panel headers and labels
    const settingsTitle = document.querySelector('.settings-header h3');
    if (settingsTitle) settingsTitle.textContent = this.t('settings');

    // Update section headers
    const sections = document.querySelectorAll('.settings-section h4');
    if (sections[0]) sections[0].textContent = this.t('general');
    if (sections[1]) sections[1].textContent = this.t('appearance');
    if (sections[2]) sections[2].textContent = this.t('editor');
    if (sections[3]) sections[3].textContent = this.t('shortcuts');

    // Update labels
    const labels = document.querySelectorAll('.setting-item label');
    labels.forEach(label => {
      const text = label.textContent?.trim();
      if (text?.includes('Idioma') || text?.includes('Language')) {
        label.childNodes[0].textContent = this.t('language') + ': ';
      } else if (text?.includes('Tema') || text?.includes('Theme')) {
        label.childNodes[0].textContent = this.t('theme') + ': ';
      } else if (text?.includes('Fuente') || text?.includes('Font')) {
        label.childNodes[0].textContent = this.t('font') + ': ';
      } else if (text?.includes('Tamaño de fuente') || text?.includes('Font Size')) {
        label.childNodes[0].textContent = this.t('fontSize') + ': ';
      } else if (text?.includes('Tamaño de tab') || text?.includes('Tab Size')) {
        label.childNodes[0].textContent = this.t('tabSize') + ': ';
      }
    });

    // Update checkbox labels
    const checkboxLabels = document.querySelectorAll('.setting-item label');
    checkboxLabels.forEach(label => {
      const checkbox = label.querySelector('input[type="checkbox"]');
      if (checkbox) {
        const text = label.textContent?.trim();
        if (text?.includes('Ajuste de línea') || text?.includes('Word Wrap')) {
          label.childNodes[2].textContent = this.t('wordWrap');
        } else if (text?.includes('minimap') || text?.includes('Minimap')) {
          label.childNodes[2].textContent = this.t('minimap');
        } else if (text?.includes('Auto-ejecución') || text?.includes('Auto-execution')) {
          label.childNodes[2].textContent = this.t('autoRun');
        } else if (text?.includes('números de línea') || text?.includes('Line Numbers')) {
          label.childNodes[2].textContent = this.t('lineNumbers');
        }
      }
    });

    // Update keyboard shortcuts section
    const shortcutItems = document.querySelectorAll('.shortcut-item span');
    if (shortcutItems[0]) shortcutItems[0].textContent = this.t('runCode');
    if (shortcutItems[1]) shortcutItems[1].textContent = this.t('newTab');
    if (shortcutItems[2]) shortcutItems[2].textContent = this.t('saveFile');
    if (shortcutItems[3]) shortcutItems[3].textContent = this.t('openSettings');
  }

  private getWelcomeCode(): string {
    return `// ¡Bienvenido a JSExec! 🚀
// Tu playground de JavaScript y TypeScript open source
// ✨ Auto-ejecución activada: el código se ejecuta automáticamente
// 🔷 Soporte nativo para TypeScript - detección automática

// Ejemplo básico JavaScript
console.log('¡Hola JSExec!');

// Ejemplo TypeScript con tipos
interface Persona {
  nombre: string;
  edad: number;
  hobbies: string[];
}

const persona: Persona = {
  nombre: 'Juan',
  edad: 30,
  hobbies: ['programar', 'leer', 'viajar']
};

// Función con tipos TypeScript
function saludar(nombre: string): string {
  return \`¡Hola, \${nombre}! Bienvenido a JSExec\`;
}

console.log(saludar('Desarrollador'));
console.log('Persona:', persona);
console.log('Hobbies:', persona.hobbies.join(', '));

// Operaciones con arrays tipados
const numeros: number[] = [1, 2, 3, 4, 5];
const cuadrados = numeros.map((n: number) => n * n);
console.log('Números:', numeros);
console.log('Cuadrados:', cuadrados);

// ¡Presiona Ctrl/Cmd + R para ejecutar manualmente!
// ¡Presiona Ctrl/Cmd + T para nuevo tab!
// ¡Presiona Ctrl/Cmd + S para guardar!
// ¡Presiona Ctrl/Cmd + , para configuraciones!

// Resultado final
'¡JSExec con TypeScript está funcionando perfectamente!'`;
  }
}

// Initialize the application when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new JSExecApp());
} else {
  new JSExecApp();
}
