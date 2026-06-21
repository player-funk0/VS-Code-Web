export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  isDirty?: boolean;
}

export interface Tab {
  path: string;
  name: string;
  isPreview?: boolean;
  isDirty?: boolean;
}

export type SidebarView = 'explorer' | 'search' | 'scm' | 'debug' | 'extensions' | null;

export type PanelView = 'terminal' | 'output' | 'problems' | null;

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'ai' | 'tool';
  content: string;
  timestamp: number;
}

export interface SearchResult {
  path: string;
  line: number;
  column: number;
  text: string;
  preview: string;
}

export interface Extension {
  id: string;
  name: string;
  publisher: string;
  version: string;
  description: string;
  installed: boolean;
  enabled: boolean;
  icon?: string;
  downloads?: number;
  rating?: number;
  categories?: string[];
}

export interface Breakpoint {
  path: string;
  line: number;
  enabled: boolean;
}

export interface DebugSession {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  currentFile?: string;
  currentLine?: number;
}

export interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

export interface GitChange {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  staged: boolean;
}

export interface ThemeColors {
  editorBg: string;
  sidebarBg: string;
  activityBarBg: string;
  titleBarBg: string;
  statusBarBg: string;
  foreground: string;
  secondaryText: string;
  activeSelection: string;
  border: string;
  accentBlue: string;
  errorRed: string;
  warningYellow: string;
  successGreen: string;
  terminalBg: string;
  terminalFg: string;
}
