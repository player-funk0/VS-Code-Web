import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import { useFileStore } from '@/stores/fileStore';
import { useDebugStore } from '@/stores/debugStore';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface Menu {
  label: string;
  items: MenuItem[];
}

const createMenus = (): Menu[] => [
  {
    label: 'File',
    items: [
      { label: 'New File...', shortcut: 'Ctrl+N', action: () => {} },
      { label: 'New Window', shortcut: 'Ctrl+Shift+N', action: () => {} },
      { label: 'Open File...', shortcut: 'Ctrl+O', action: () => {} },
      { label: 'Open Folder...', shortcut: 'Ctrl+K Ctrl+O', action: () => {} },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Save',
        shortcut: 'Ctrl+S',
        action: () => {
          const activePath = useEditorStore.getState().activeTabPath;
          if (activePath) {
            const content = useFileStore.getState().getFileContent(activePath);
            useFileStore.getState().writeFile(activePath, content);
            useEditorStore.getState().markSaved(activePath);
          }
        },
      },
      { label: 'Save All', shortcut: 'Ctrl+K S', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Auto Save', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Preferences', shortcut: 'Ctrl+,', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Exit', action: () => {} },
    ],
  },
  {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => {} },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Cut', shortcut: 'Ctrl+X', action: () => {} },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => {} },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Find', shortcut: 'Ctrl+F', action: () => {} },
      { label: 'Replace', shortcut: 'Ctrl+H', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Toggle Line Comment', shortcut: 'Ctrl+/', action: () => {} },
    ],
  },
  {
    label: 'Selection',
    items: [
      { label: 'Select All', shortcut: 'Ctrl+A', action: () => {} },
      { label: 'Expand Selection', shortcut: 'Shift+Alt+Right', action: () => {} },
      { label: 'Shrink Selection', shortcut: 'Shift+Alt+Left', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Copy Line Up', shortcut: 'Shift+Alt+Up', action: () => {} },
      { label: 'Copy Line Down', shortcut: 'Shift+Alt+Down', action: () => {} },
      { label: 'Move Line Up', shortcut: 'Alt+Up', action: () => {} },
      { label: 'Move Line Down', shortcut: 'Alt+Down', action: () => {} },
    ],
  },
  {
    label: 'View',
    items: [
      {
        label: 'Command Palette...',
        shortcut: 'Ctrl+Shift+P',
        action: () => useUIStore.getState().openCommandPalette(),
      },
      { label: 'Open View...', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Appearance', action: () => {} },
      { label: 'Editor Layout', action: () => {} },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Explorer',
        shortcut: 'Ctrl+Shift+E',
        action: () => useUIStore.getState().setSidebarView('explorer'),
      },
      {
        label: 'Search',
        shortcut: 'Ctrl+Shift+F',
        action: () => useUIStore.getState().setSidebarView('search'),
      },
      {
        label: 'Source Control',
        shortcut: 'Ctrl+Shift+G',
        action: () => useUIStore.getState().setSidebarView('scm'),
      },
      {
        label: 'Run and Debug',
        shortcut: 'Ctrl+Shift+D',
        action: () => useUIStore.getState().setSidebarView('debug'),
      },
      {
        label: 'Extensions',
        shortcut: 'Ctrl+Shift+X',
        action: () => useUIStore.getState().setSidebarView('extensions'),
      },
      { label: '', separator: true } as MenuItem,
      { label: 'Appearance', shortcut: 'Ctrl+K Ctrl+T', action: () => {} },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Toggle Terminal',
        shortcut: 'Ctrl+`',
        action: () => useUIStore.getState().togglePanel(),
      },
    ],
  },
  {
    label: 'Go',
    items: [
      { label: 'Back', shortcut: 'Alt+Left', action: () => {} },
      { label: 'Forward', shortcut: 'Alt+Right', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Go to File...', shortcut: 'Ctrl+P', action: () => {} },
      { label: 'Go to Symbol in Workspace...', shortcut: 'Ctrl+T', action: () => {} },
      { label: 'Go to Symbol in Editor...', shortcut: 'Ctrl+Shift+O', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Go to Line/Column...', shortcut: 'Ctrl+G', action: () => {} },
    ],
  },
  {
    label: 'Run',
    items: [
      {
        label: 'Start Debugging',
        shortcut: 'F5',
        action: () => useDebugStore.getState().startSession('Launch Program'),
      },
      { label: 'Run without Debugging', shortcut: 'Ctrl+F5', action: () => {} },
      {
        label: 'Stop Debugging',
        shortcut: 'Shift+F5',
        action: () => useDebugStore.getState().stopSession(),
      },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Step Over',
        shortcut: 'F10',
        action: () => useDebugStore.getState().stepOver(),
      },
      {
        label: 'Step Into',
        shortcut: 'F11',
        action: () => useDebugStore.getState().stepInto(),
      },
      {
        label: 'Step Out',
        shortcut: 'Shift+F11',
        action: () => useDebugStore.getState().stepOut(),
      },
    ],
  },
  {
    label: 'Terminal',
    items: [
      {
        label: 'New Terminal',
        shortcut: 'Ctrl+Shift+`',
        action: () => useUIStore.getState().setPanelView('terminal'),
      },
      { label: 'Split Terminal', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Run Task...', action: () => {} },
      { label: 'Run Build Task...', shortcut: 'Ctrl+Shift+B', action: () => {} },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Clear',
        action: () => {
          // Clear is handled elsewhere
        },
      },
    ],
  },
  {
    label: 'Help',
    items: [
      { label: 'Welcome', action: () => {} },
      {
        label: 'Show All Commands',
        shortcut: 'Ctrl+Shift+P',
        action: () => useUIStore.getState().openCommandPalette(),
      },
      { label: '', separator: true } as MenuItem,
      {
        label: 'Documentation',
        action: () => window.open('https://code.visualstudio.com/docs', '_blank'),
      },
      { label: 'Release Notes', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+K Ctrl+R', action: () => {} },
      { label: '', separator: true } as MenuItem,
      { label: 'About', action: () => {} },
    ],
  },
];

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menus = createMenus();

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    if (activeMenu !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

  return (
    <div
      ref={menuRef}
      className="flex items-center h-[30px] bg-[#3c3c3c] text-[#cccccc] text-[13px] px-2 select-none"
    >
      {/* App Icon */}
      <div className="flex items-center mr-3">
        <svg width="16" height="16" viewBox="0 0 100 100" fill="none">
          <path d="M70 10L90 30L70 50L50 30L70 10Z" fill="#1F9CF0" />
          <path d="M30 50L50 30L70 50L50 70L30 50Z" fill="#1F9CF0" opacity="0.8" />
          <path d="M50 70L70 50L90 70L70 90L50 70Z" fill="#1F9CF0" opacity="0.6" />
          <path d="M10 50L30 30L50 50L30 70L10 50Z" fill="#1F9CF0" opacity="0.7" />
        </svg>
      </div>

      {/* Menu Items */}
      {menus.map((menu, index) => (
        <div key={menu.label} className="relative">
          <button
            className={`h-[30px] px-2 flex items-center transition-colors ${
              activeMenu === index ? 'bg-[#505050]' : 'hover:bg-[#505050]'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === index ? null : index);
            }}
          >
            {menu.label}
          </button>

          {/* Dropdown */}
          {activeMenu === index && (
            <div
              className="absolute top-full left-0 bg-[#252526] border border-[#454545] shadow-lg z-[1000] py-1 min-w-[220px]"
              onClick={(e) => e.stopPropagation()}
            >
              {menu.items.map((item, itemIndex) =>
                item.separator ? (
                  <div key={itemIndex} className="my-1 border-t border-[#454545]" />
                ) : (
                  <button
                    key={itemIndex}
                    className={`w-full text-left px-4 py-1 flex items-center justify-between transition-colors text-[13px] ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-[#04395e] cursor-pointer'
                    }`}
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled && item.action) {
                        item.action();
                        setActiveMenu(null);
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[#858585] text-[12px] ml-6">{item.shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
