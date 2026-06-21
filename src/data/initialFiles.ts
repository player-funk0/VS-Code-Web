import type { FileNode } from '@/types';

export const initialFiles: FileNode[] = [
  {
    name: 'src',
    path: '/workspace/src',
    type: 'directory',
    isOpen: true,
    children: [
      {
        name: 'components',
        path: '/workspace/src/components',
        type: 'directory',
        isOpen: true,
        children: [
          {
            name: 'App.tsx',
            path: '/workspace/src/components/App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Editor } from './Editor';
import { StatusBar } from './StatusBar';

export const App: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the application
    console.log('VS Code: Web initialized');
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="vscode-app">
      <Header />
      <div className="workspace">
        {sidebarVisible && <Sidebar />}
        <Editor activeFile={activeFile} />
      </div>
      <StatusBar />
    </div>
  );
};
`,
          },
          {
            name: 'Header.tsx',
            path: '/workspace/src/components/Header.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="vscode-header">
      <div className="menu-bar">
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
      </div>
    </header>
  );
};
`,
          },
          {
            name: 'Sidebar.tsx',
            path: '/workspace/src/components/Sidebar.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
import { FileTree } from './FileTree';

export const Sidebar: React.FC = () => {
  return (
    <aside className="vscode-sidebar">
      <div className="sidebar-header">
        <span>EXPLORER</span>
      </div>
      <FileTree />
    </aside>
  );
};
`,
          },
        ],
      },
      {
        name: 'hooks',
        path: '/workspace/src/hooks',
        type: 'directory',
        isOpen: false,
        children: [
          {
            name: 'useFileSystem.ts',
            path: '/workspace/src/hooks/useFileSystem.ts',
            type: 'file',
            language: 'typescript',
            content: `import { useState, useCallback } from 'react';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileNode[]>([]);

  const addFile = useCallback((path: string) => {
    // Add file logic
  }, []);

  const deleteFile = useCallback((path: string) => {
    // Delete file logic
  }, []);

  return { files, addFile, deleteFile };
};
`,
          },
        ],
      },
      {
        name: 'styles',
        path: '/workspace/src/styles',
        type: 'directory',
        isOpen: false,
        children: [
          {
            name: 'global.css',
            path: '/workspace/src/styles/global.css',
            type: 'file',
            language: 'css',
            content: `:root {
  --editor-bg: #1e1e1e;
  --sidebar-bg: #252526;
  --activity-bar-bg: #333333;
  --status-bar-bg: #007acc;
  --foreground: #cccccc;
  --border: #454545;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--editor-bg);
  color: var(--foreground);
  overflow: hidden;
}

.vscode-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
}
`,
          },
        ],
      },
      {
        name: 'utils',
        path: '/workspace/src/utils',
        type: 'directory',
        isOpen: false,
        children: [
          {
            name: 'helpers.ts',
            path: '/workspace/src/utils/helpers.ts',
            type: 'file',
            language: 'typescript',
            content: `/**
 * Utility helper functions for the application
 */

export const debounce = <T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): T => {
  let inThrottle = false;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
`,
          },
          {
            name: 'constants.ts',
            path: '/workspace/src/utils/constants.ts',
            type: 'file',
            language: 'typescript',
            content: `/**
 * Application constants
 */

export const APP_NAME = 'VS Code: Web';
export const APP_VERSION = '1.0.0';

export const EDITOR_DEFAULTS = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'off' as const,
  minimap: true,
  lineNumbers: true,
};

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'rust',
  'go',
  'java',
  'csharp',
  'cpp',
  'c',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'scss',
  'json',
  'yaml',
  'markdown',
  'sql',
  'shell',
  'dockerfile',
  'graphql',
  'lua',
  'perl',
  'r',
  'scala',
  'dart',
  'elixir',
  'haskell',
  'clojure',
  'erlang',
  'ocaml',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
`,
          },
        ],
      },
      {
        name: 'index.tsx',
        path: '/workspace/src/index.tsx',
        type: 'file',
        language: 'typescript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import './styles/global.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
          },
        ],
      },
      {
        name: 'public',
        path: '/workspace/public',
        type: 'directory',
        isOpen: false,
        children: [
          {
            name: 'index.html',
            path: '/workspace/public/index.html',
            type: 'file',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VS Code: Web</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #1e1e1e;
        color: #cccccc;
        font-family: system-ui, -apple-system, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
          },
        ],
      },
      {
        name: 'package.json',
        path: '/workspace/package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "vscode-web",
  "version": "1.0.0",
  "description": "VS Code: replica in the browser",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.0",
    "vitest": "^1.2.2"
  }
}
`,
      },
      {
        name: 'tsconfig.json',
        path: '/workspace/tsconfig.json',
        type: 'file',
        language: 'json',
        content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
`,
      },
      {
        name: 'README.md',
        path: '/workspace/README.md',
        type: 'file',
        language: 'markdown',
        content: `# VS Code: Web

A faithful replica of Visual Studio Code: running entirely in the browser.

## Features

- Monaco Editor with syntax highlighting for 30+ languages
- Multi-tab editor with preview tabs
- File explorer with create, rename, delete operations
- Working terminal with common commands
- Search and replace across files
- Git source control view
- Debug panel
- Extensions marketplace
- Command palette (Ctrl+Shift+P)
- Keyboard shortcuts
- Persistent settings via IndexedDB

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+P | Command palette |
| Ctrl+P | Quick file open |
| Ctrl+\` | Toggle terminal |
| Ctrl+B | Toggle sidebar |
| Ctrl+S | Save file |
| Ctrl+N | New file |

## License

MIT
`,
      },
      {
        name: '.gitignore',
        path: '/workspace/.gitignore',
        type: 'file',
        language: 'ignore',
        content: `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
`,
      },
    ];

export const getLanguageFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    rs: 'rust',
    go: 'go',
    java: 'java',
    cs: 'csharp',
    cpp: 'cpp',
    c: 'c',
    rb: 'ruby',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
    sql: 'sql',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    dockerfile: 'dockerfile',
    graphql: 'graphql',
    gql: 'graphql',
    lua: 'lua',
    pl: 'perl',
    r: 'r',
    scala: 'scala',
    dart: 'dart',
    ex: 'elixir',
    exs: 'elixir',
    hs: 'haskell',
    clj: 'clojure',
    erl: 'erlang',
    ml: 'ocaml',
    gitignore: 'ignore',
  };
  return langMap[ext] || 'plaintext';
};
