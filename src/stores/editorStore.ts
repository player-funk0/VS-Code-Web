import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import type { Tab } from '@/types';

interface EditorState {
  tabs: Tab[];
  activeTabPath: string | null;
  previewTabPath: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  openFile: (path: string, name: string) => void;
  openPreviewFile: (path: string, name: string) => void;
  closeTab: (path: string) => void;
  closeAllTabs: () => void;
  closeOtherTabs: (path: string) => void;
  closeTabsToRight: (path: string) => void;
  setActiveTab: (path: string) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  markDirty: (path: string) => void;
  markSaved: (path: string) => void;
  persistTabs: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((setState, getState) => ({
  tabs: [],
  activeTabPath: null,
  previewTabPath: null,

  initialize: async () => {
    try {
      const saved = await get<{ tabs: Tab[]; activeTabPath: string | null }>('vscode-tabs');
      if (saved) {
        setState({
          tabs: saved.tabs,
          activeTabPath: saved.activeTabPath,
        });
      }
    } catch {
      // ignore
    }
  },

  openFile: (path: string, name: string) => {
    const state = getState();
    const exists = state.tabs.find(t => t.path === path);
    if (exists) {
      setState({ activeTabPath: path, previewTabPath: null });
      // Upgrade preview to persistent
      const newTabs = state.tabs.map(t =>
        t.path === path ? { ...t, isPreview: false } : t
      );
      setState({ tabs: newTabs });
    } else {
      // Close any existing preview tab
      const tabsWithoutPreview = state.previewTabPath
        ? state.tabs.filter(t => t.path !== state.previewTabPath)
        : state.tabs;
      const newTab: Tab = { path, name, isPreview: false, isDirty: false };
      setState({
        tabs: [...tabsWithoutPreview, newTab],
        activeTabPath: path,
        previewTabPath: null,
      });
    }
    getState().persistTabs();
  },

  openPreviewFile: (path: string, name: string) => {
    const state = getState();
    const exists = state.tabs.find(t => t.path === path);
    if (exists) {
      setState({ activeTabPath: path, previewTabPath: null });
      return;
    }
    // Close existing preview
    const tabsWithoutPreview = state.previewTabPath
      ? state.tabs.filter(t => t.path !== state.previewTabPath)
      : state.tabs;
    const newTab: Tab = { path, name, isPreview: true, isDirty: false };
    setState({
      tabs: [...tabsWithoutPreview, newTab],
      activeTabPath: path,
      previewTabPath: path,
    });
    getState().persistTabs();
  },

  closeTab: (path: string) => {
    const state = getState();
    const newTabs = state.tabs.filter(t => t.path !== path);
    let newActive = state.activeTabPath;
    if (state.activeTabPath === path) {
      // Activate the tab to the left, or the last tab
      const closedIndex = state.tabs.findIndex(t => t.path === path);
      const newIndex = Math.max(0, closedIndex - 1);
      newActive = newTabs[newIndex]?.path || null;
    }
    setState({
      tabs: newTabs,
      activeTabPath: newActive,
      previewTabPath: state.previewTabPath === path ? null : state.previewTabPath,
    });
    getState().persistTabs();
  },

  closeAllTabs: () => {
    setState({ tabs: [], activeTabPath: null, previewTabPath: null });
    getState().persistTabs();
  },

  closeOtherTabs: (path: string) => {
    const state = getState();
    const keep = state.tabs.filter(t => t.path === path);
    setState({ tabs: keep, activeTabPath: path, previewTabPath: null });
    getState().persistTabs();
  },

  closeTabsToRight: (path: string) => {
    const state = getState();
    const index = state.tabs.findIndex(t => t.path === path);
    const newTabs = state.tabs.slice(0, index + 1);
    setState({ tabs: newTabs });
    getState().persistTabs();
  },

  setActiveTab: (path: string) => {
    setState({ activeTabPath: path });
    getState().persistTabs();
  },

  moveTab: (fromIndex: number, toIndex: number) => {
    const state = getState();
    const newTabs = [...state.tabs];
    const [moved] = newTabs.splice(fromIndex, 1);
    newTabs.splice(toIndex, 0, moved);
    setState({ tabs: newTabs });
    getState().persistTabs();
  },

  markDirty: (path: string) => {
    const state = getState();
    const newTabs = state.tabs.map(t =>
      t.path === path ? { ...t, isDirty: true } : t
    );
    setState({ tabs: newTabs });
  },

  markSaved: (path: string) => {
    const state = getState();
    const newTabs = state.tabs.map(t =>
      t.path === path ? { ...t, isDirty: false } : t
    );
    setState({ tabs: newTabs });
    getState().persistTabs();
  },

  persistTabs: async () => {
    const state = getState();
    await set('vscode-tabs', {
      tabs: state.tabs,
      activeTabPath: state.activeTabPath,
    });
  },
}));
