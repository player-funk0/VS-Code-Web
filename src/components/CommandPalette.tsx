import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Command,
  FileText,
  Search,
  GitBranch,
  Bug,
  Blocks,
  Settings,
  Terminal,
  Keyboard,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, setSidebarView, togglePanel, toggleSidebar } = useUIStore();
  const { files } = useFileStore();
  const { openFile } = useEditorStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build commands list
  const commands = useMemo(() => {
    const items: CommandItem[] = [
      // View commands
      {
        id: 'view-explorer',
        label: 'View: Show Explorer',
        category: 'View',
        icon: FileText,
        shortcut: 'Ctrl+Shift+E',
        action: () => { setSidebarView('explorer'); closeCommandPalette(); },
      },
      {
        id: 'view-search',
        label: 'View: Show Search',
        category: 'View',
        icon: Search,
        shortcut: 'Ctrl+Shift+F',
        action: () => { setSidebarView('search'); closeCommandPalette(); },
      },
      {
        id: 'view-scm',
        label: 'View: Show Source Control',
        category: 'View',
        icon: GitBranch,
        shortcut: 'Ctrl+Shift+G',
        action: () => { setSidebarView('scm'); closeCommandPalette(); },
      },
      {
        id: 'view-debug',
        label: 'View: Show Run and Debug',
        category: 'View',
        icon: Bug,
        shortcut: 'Ctrl+Shift+D',
        action: () => { setSidebarView('debug'); closeCommandPalette(); },
      },
      {
        id: 'view-extensions',
        label: 'View: Show Extensions',
        category: 'View',
        icon: Blocks,
        shortcut: 'Ctrl+Shift+X',
        action: () => { setSidebarView('extensions'); closeCommandPalette(); },
      },
      {
        id: 'view-terminal',
        label: 'View: Toggle Terminal',
        category: 'View',
        icon: Terminal,
        shortcut: 'Ctrl+`',
        action: () => { togglePanel(); closeCommandPalette(); },
      },
      {
        id: 'view-sidebar',
        label: 'View: Toggle Sidebar',
        category: 'View',
        icon: FileText,
        shortcut: 'Ctrl+B',
        action: () => { toggleSidebar(); closeCommandPalette(); },
      },
      // Settings
      {
        id: 'settings-open',
        label: 'Preferences: Open Settings',
        category: 'Preferences',
        icon: Settings,
        shortcut: 'Ctrl+,',
        action: () => closeCommandPalette(),
      },
      {
        id: 'settings-shortcuts',
        label: 'Preferences: Open Keyboard Shortcuts',
        category: 'Preferences',
        icon: Keyboard,
        shortcut: 'Ctrl+K Ctrl+S',
        action: () => closeCommandPalette(),
      },
    ];

    // Add file commands
    const addFileCommands = (nodes: any[], prefix = '') => {
      for (const node of nodes) {
        if (node.type === 'file') {
          items.push({
            id: `file-${node.path}`,
            label: `File: ${prefix}${node.name}`,
            category: 'Files',
            icon: FileText,
            action: () => { openFile(node.path, node.name); closeCommandPalette(); },
          });
        }
        if (node.children) {
          addFileCommands(node.children, `${prefix}${node.name}/`);
        }
      }
    };
    addFileCommands(files);

    return items;
  }, [files, setSidebarView, togglePanel, toggleSidebar, openFile, closeCommandPalette]);

  // Filter commands
  const filtered = useMemo(() => {
    if (!query) return commands.slice(0, 20);
    const q = query.toLowerCase();
    const scored = commands
      .map((cmd) => {
        const label = cmd.label.toLowerCase();
        let score = 0;
        if (label.startsWith(q)) score += 3;
        else if (label.includes(q)) score += 1;
        return { cmd, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.cmd.label.localeCompare(b.cmd.label))
      .map((s) => s.cmd);
    return scored.slice(0, 20);
  }, [commands, query]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filtered[selectedIndex]) {
            filtered[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeCommandPalette();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filtered, selectedIndex, closeCommandPalette]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[2000] flex justify-center pt-[10vh]"
      onClick={closeCommandPalette}
    >
      <div
        className="w-[600px] max-h-[60vh] bg-[#252526] border border-[#454545] shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center h-[40px] px-3 border-b border-[#454545]">
          <Command size={16} className="text-[#858585] mr-2" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#cccccc] placeholder-[#6e6e6e]"
            placeholder="Type the name of a command to run."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="text-[#858585] hover:text-[#cccccc] text-[12px]"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="flex-1 overflow-auto vscode-scrollbar"
        >
          {filtered.map((cmd, index) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.id}
                className={`w-full flex items-center h-[36px] px-3 text-left transition-colors ${
                  index === selectedIndex ? 'bg-[#04395e]' : 'hover:bg-[#2a2d2e]'
                }`}
                onClick={() => cmd.action()}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon
                  size={16}
                  className={
                    index === selectedIndex ? 'text-white' : 'text-[#858585]'
                  }
                />
                <span
                  className={`ml-2 text-[13px] flex-1 ${
                    index === selectedIndex ? 'text-white' : 'text-[#cccccc]'
                  }`}
                >
                  {cmd.label}
                </span>
                <span
                  className={`text-[11px] ${
                    index === selectedIndex ? 'text-white/70' : 'text-[#858585]'
                  }`}
                >
                  {cmd.category}
                </span>
                {cmd.shortcut && (
                  <span
                    className={`ml-2 text-[11px] ${
                      index === selectedIndex ? 'text-white/70' : 'text-[#858585]'
                    }`}
                  >
                    {cmd.shortcut}
                  </span>
                )}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-[60px] text-[13px] text-[#858585]">
              No matching commands
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
