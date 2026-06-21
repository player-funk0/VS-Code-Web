import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import {
  X,
  CircleDot,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';
import { useFileStore } from '@/stores/fileStore';
import { useUIStore } from '@/stores/uiStore';
import type { Tab } from '@/types';

const FILE_ICONS: Record<string, { color: string }> = {
  tsx: { color: '#519aba' },
  ts: { color: '#519aba' },
  js: { color: '#f1e05a' },
  jsx: { color: '#f1e05a' },
  css: { color: '#563d7c' },
  scss: { color: '#c6538c' },
  html: { color: '#e34c26' },
  json: { color: '#f1e05a' },
  md: { color: '#519aba' },
  default: { color: '#cccccc' },
};

function getFileColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_ICONS[ext]?.color || FILE_ICONS.default.color;
}

function TabItem({ tab, isActive }: { tab: Tab; isActive: boolean }) {
  const { setActiveTab, closeTab } = useEditorStore();
  const [showClose, setShowClose] = useState(false);

  return (
    <div
      className={`group flex items-center h-[35px] min-w-[100px] max-w-[200px] px-2 cursor-pointer border-r border-[#252526] select-none ${
        isActive
          ? 'bg-[#1e1e1e] text-[#cccccc]'
          : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]'
      }`}
      onClick={() => setActiveTab(tab.path)}
      onMouseEnter={() => setShowClose(true)}
      onMouseLeave={() => setShowClose(false)}
    >
      {/* File icon dot */}
      <CircleDot
        size={10}
        className="flex-shrink-0 mr-1.5"
        style={{ color: getFileColor(tab.name) }}
      />

      {/* Filename */}
      <span
        className={`text-[12px] truncate flex-1 ${
          tab.isPreview ? 'italic' : ''
        }`}
      >
        {tab.name}
      </span>

      {/* Dirty indicator / Close button */}
      <button
        className="w-[16px] h-[16px] flex items-center justify-center ml-1 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          closeTab(tab.path);
        }}
      >
        {tab.isDirty ? (
          <div className="w-[8px] h-[8px] rounded-full bg-[#cccccc]" />
        ) : (
          <X
            size={12}
            className={`transition-opacity ${
              showClose || isActive ? 'opacity-100' : 'opacity-0'
            } text-[#858585] hover:text-[#ffffff]`}
          />
        )}
      </button>
    </div>
  );
}

export function EditorArea() {
  const { tabs, activeTabPath, closeTab, closeAllTabs, closeOtherTabs } = useEditorStore();
  const { getFileContent, updateFileContent } = useFileStore();
  const { openContextMenu, addNotification } = useUIStore();

  const activeTab = tabs.find((t) => t.path === activeTabPath);
  const content = activeTab ? getFileContent(activeTab.path) : '';

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeTab && value !== undefined) {
        updateFileContent(activeTab.path, value);
        useEditorStore.getState().markDirty(activeTab.path);
      }
    },
    [activeTab, updateFileContent]
  );

  const handleTabContextMenu = useCallback(
    (e: React.MouseEvent, tab: Tab) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, [
        {
          label: 'Close',
          action: () => closeTab(tab.path),
        },
        {
          label: 'Close Others',
          action: () => closeOtherTabs(tab.path),
        },
        {
          label: 'Close All',
          action: () => closeAllTabs(),
        },
        { label: '', separator: true, action: () => {} },
        {
          label: 'Save',
          action: () => {
            const content = useFileStore.getState().getFileContent(tab.path);
            useFileStore.getState().writeFile(tab.path, content);
            useEditorStore.getState().markSaved(tab.path);
            addNotification(`Saved ${tab.name}`, 'success');
          },
        },
      ]);
    },
    [closeTab, closeOtherTabs, closeAllTabs, openContextMenu, addNotification]
  );

  // Breadcrumbs
  const breadcrumbs = activeTab
    ? activeTab.path.split('/').filter(Boolean)
    : [];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Tab bar */}
      {tabs.length > 0 && (
        <div className="flex items-center h-[35px] bg-[#2d2d2d] overflow-x-auto overflow-y-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onContextMenu={(e) => handleTabContextMenu(e, tab)}
            >
              <TabItem tab={tab} isActive={tab.path === activeTabPath} />
            </div>
          ))}
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center h-[22px] px-3 bg-[#1e1e1e] border-b border-[#333] text-[12px] text-[#a9a9a9]">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && (
                <span className="text-[#858585] mx-1">&gt;</span>
              )}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? 'text-[#cccccc]'
                    : ''
                }
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Editor */}
      {activeTab ? (
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={activeTab.name.split('.').pop() || 'plaintext'}
            value={content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Consolas', 'Courier New', monospace",
              lineNumbers: 'on',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: 'off',
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              folding: true,
              foldingStrategy: 'indentation',
              guides: { bracketPairs: true, highlightActiveIndentation: true },
              renderLineHighlight: 'line',
              renderLineHighlightOnlyWhenFocus: false,
              cursorBlinking: 'blink',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              contextmenu: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              wordBasedSuggestions: 'allDocuments',
            }}
            loading={
              <div className="flex items-center justify-center h-full text-[#858585] text-[13px]">
                Loading editor...
              </div>
            }
          />
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-full text-[#858585]">
          <div className="text-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 100"
              fill="none"
              className="mx-auto mb-4 opacity-20"
            >
              <path
                d="M30 20L50 10L70 20V70L50 80L30 70V20Z"
                stroke="#cccccc"
                strokeWidth="2"
              />
              <path
                d="M50 10V80M30 20L50 30L70 20"
                stroke="#cccccc"
                strokeWidth="2"
              />
              <path
                d="M35 45H45M35 55H50M35 65H45"
                stroke="#cccccc"
                strokeWidth="2"
              />
            </svg>
            <p className="text-[18px] font-light mb-2">
              VS Code: Web
            </p>
            <p className="text-[13px]">
              Select a file to start editing
            </p>
            <div className="mt-6 flex flex-col gap-1 text-[12px] text-[#6e6e6e]">
              <div className="flex items-center justify-center gap-2">
                <span>Quick Open</span>
                <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 text-[11px]">
                  Ctrl+P
                </kbd>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>New File</span>
                <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 text-[11px]">
                  Ctrl+N
                </kbd>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>Command Palette</span>
                <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 text-[11px]">
                  Ctrl+Shift+P
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
