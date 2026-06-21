import { create } from 'zustand';
import type { Breakpoint, DebugSession } from '@/types';

interface Variable {
  name: string;
  type: string;
  value: string;
}

interface CallFrame {
  id: number;
  name: string;
  file: string;
  line: number;
  column: number;
}

interface WatchItem {
  id: string;
  expression: string;
  value: string;
}

interface DebugState {
  session: DebugSession | null;
  breakpoints: Breakpoint[];
  variables: Variable[];
  callStack: CallFrame[];
  watchItems: WatchItem[];
  selectedWatchId: string | null;

  // Actions
  startSession: (name: string) => void;
  stopSession: () => void;
  pauseSession: () => void;
  continueSession: () => void;
  stepOver: () => void;
  stepInto: () => void;
  stepOut: () => void;
  toggleBreakpoint: (path: string, line: number) => void;
  addWatch: (expression: string) => void;
  removeWatch: (id: string) => void;
  editWatch: (id: string, expression: string) => void;
}

export const useDebugStore = create<DebugState>((setState) => ({
  session: null,
  breakpoints: [
    { path: '/workspace/src/components/App.tsx', line: 8, enabled: true },
    { path: '/workspace/src/hooks/useFileSystem.ts', line: 12, enabled: false },
  ],
  variables: [
    { name: 'sidebarVisible', type: 'boolean', value: 'true' },
    { name: 'activeFile', type: 'string | null', value: 'null' },
    { name: 'files', type: 'FileNode[]', value: '[{...}, {...}]' },
    { name: 'count', type: 'number', value: '42' },
  ],
  callStack: [
    { id: 0, name: 'App', file: 'src/components/App.tsx', line: 12, column: 10 },
    { id: 1, name: 'render', file: 'react-dom.development.js', line: 28456, column: 5 },
  ],
  watchItems: [
    { id: '1', expression: 'files.length', value: '5' },
    { id: '2', expression: 'activeTab', value: 'undefined' },
  ],
  selectedWatchId: null,

  startSession: (name: string) => {
    setState({
      session: {
        id: Date.now().toString(),
        name,
        status: 'running',
        currentFile: '/workspace/src/components/App.tsx',
        currentLine: 12,
      },
    });
  },

  stopSession: () => {
    setState({ session: null });
  },

  pauseSession: () => {
    setState(s => ({
      session: s.session ? { ...s.session, status: 'paused' as const } : null,
    }));
  },

  continueSession: () => {
    setState(s => ({
      session: s.session ? { ...s.session, status: 'running' as const } : null,
    }));
  },

  stepOver: () => {
    setState(s => ({
      session: s.session
        ? { ...s.session, currentLine: (s.session.currentLine || 0) + 1 }
        : null,
    }));
  },

  stepInto: () => {
    setState(s => ({
      session: s.session
        ? { ...s.session, currentLine: (s.session.currentLine || 0) + 1 }
        : null,
    }));
  },

  stepOut: () => {
    setState(s => ({
      session: s.session
        ? { ...s.session, currentLine: Math.max(1, (s.session.currentLine || 0) - 2) }
        : null,
    }));
  },

  toggleBreakpoint: (path: string, line: number) => {
    setState(s => {
      const exists = s.breakpoints.find(b => b.path === path && b.line === line);
      if (exists) {
        return { breakpoints: s.breakpoints.filter(b => !(b.path === path && b.line === line)) };
      }
      return { breakpoints: [...s.breakpoints, { path, line, enabled: true }] };
    });
  },

  addWatch: (expression: string) => {
    const newWatch: WatchItem = {
      id: Date.now().toString(),
      expression,
      value: 'undefined',
    };
    setState(s => ({ watchItems: [...s.watchItems, newWatch] }));
  },

  removeWatch: (id: string) => {
    setState(s => ({ watchItems: s.watchItems.filter(w => w.id !== id) }));
  },

  editWatch: (id: string, expression: string) => {
    setState(s => ({
      watchItems: s.watchItems.map(w =>
        w.id === id ? { ...w, expression, value: 'pending...' } : w
      ),
    }));
  },
}));
