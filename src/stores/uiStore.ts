import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import type { SidebarView, PanelView } from '@/types';

interface UIState {
  // Sidebar
  sidebarVisible: boolean;
  sidebarView: SidebarView;
  sidebarWidth: number;
  
  // Panel
  panelVisible: boolean;
  panelView: PanelView;
  panelHeight: number;
  
  // Command palette
  commandPaletteOpen: boolean;
  
  // Context menu
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    items: { label: string; action: () => void; disabled?: boolean; separator?: boolean }[];
  };

  // Global toasts/notifications
  notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];

  // Actions
  initialize: () => Promise<void>;
  toggleSidebar: () => void;
  setSidebarView: (view: SidebarView) => void;
  setSidebarWidth: (width: number) => void;
  togglePanel: () => void;
  setPanelView: (view: PanelView) => void;
  setPanelHeight: (height: number) => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  openContextMenu: (x: number, y: number, items: { label: string; action: () => void; disabled?: boolean; separator?: boolean }[]) => void;
  closeContextMenu: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
  persistUI: () => Promise<void>;
}

export const useUIStore = create<UIState>((setState, getState) => ({
  sidebarVisible: true,
  sidebarView: 'explorer',
  sidebarWidth: 250,
  panelVisible: true,
  panelView: 'terminal',
  panelHeight: 200,
  commandPaletteOpen: false,
  contextMenu: { visible: false, x: 0, y: 0, items: [] },
  notifications: [],

  initialize: async () => {
    try {
      const saved = await get<{
        sidebarVisible: boolean;
        sidebarView: SidebarView;
        sidebarWidth: number;
        panelVisible: boolean;
        panelView: PanelView;
        panelHeight: number;
      }>('vscode-ui');
      if (saved) {
        setState({
          sidebarVisible: saved.sidebarVisible,
          sidebarView: saved.sidebarView,
          sidebarWidth: saved.sidebarWidth,
          panelVisible: saved.panelVisible,
          panelView: saved.panelView,
          panelHeight: saved.panelHeight,
        });
      }
    } catch {
      // ignore
    }
  },

  toggleSidebar: () => {
    const newVal = !getState().sidebarVisible;
    setState({ sidebarVisible: newVal });
    getState().persistUI();
  },

  setSidebarView: (view: SidebarView) => {
    const state = getState();
    if (state.sidebarView === view && state.sidebarVisible) {
      // Clicking same view toggles sidebar
      setState({ sidebarVisible: false });
    } else {
      setState({ sidebarView: view, sidebarVisible: true });
    }
    getState().persistUI();
  },

  setSidebarWidth: (width: number) => {
    setState({ sidebarWidth: Math.max(170, Math.min(width, window.innerWidth * 0.5)) });
    getState().persistUI();
  },

  togglePanel: () => {
    const newVal = !getState().panelVisible;
    setState({ panelVisible: newVal });
    getState().persistUI();
  },

  setPanelView: (view: PanelView) => {
    const state = getState();
    if (state.panelView === view && state.panelVisible) {
      setState({ panelVisible: false });
    } else {
      setState({ panelView: view, panelVisible: true });
    }
    getState().persistUI();
  },

  setPanelHeight: (height: number) => {
    setState({ panelHeight: Math.max(80, Math.min(height, window.innerHeight * 0.7)) });
    getState().persistUI();
  },

  openCommandPalette: () => setState({ commandPaletteOpen: true }),
  closeCommandPalette: () => setState({ commandPaletteOpen: false }),

  openContextMenu: (x: number, y: number, items) => {
    setState({ contextMenu: { visible: true, x, y, items } });
  },

  closeContextMenu: () => {
    setState({ contextMenu: { ...getState().contextMenu, visible: false } });
  },

  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setState({ notifications: [...getState().notifications, { id, message, type }] });
    setTimeout(() => {
      getState().removeNotification(id);
    }, 3000);
  },

  removeNotification: (id: string) => {
    setState({ notifications: getState().notifications.filter(n => n.id !== id) });
  },

  persistUI: async () => {
    const state = getState();
    await set('vscode-ui', {
      sidebarVisible: state.sidebarVisible,
      sidebarView: state.sidebarView,
      sidebarWidth: state.sidebarWidth,
      panelVisible: state.panelVisible,
      panelView: state.panelView,
      panelHeight: state.panelHeight,
    });
  },
}));
