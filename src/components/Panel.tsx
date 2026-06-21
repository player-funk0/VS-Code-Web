import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal,
  PanelTop,
  AlertCircle,
  Trash2,
  ChevronUp,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useTerminalStore } from '@/stores/terminalStore';
import { useFileStore } from '@/stores/fileStore';
import type { TerminalLine } from '@/types';

type PanelTab = 'terminal' | 'output' | 'problems';

const TABS: { id: PanelTab; label: string; icon: any }[] = [
  { id: 'terminal', label: 'TERMINAL', icon: Terminal },
  { id: 'output', label: 'OUTPUT', icon: PanelTop },
  { id: 'problems', label: 'PROBLEMS', icon: AlertCircle },
];

export function Panel() {
  const { panelView, setPanelView, togglePanel } = useUIStore();
  const {
    lines,
    currentDirectory,
    commandHistory,
    historyIndex,
    isClaudeMode,
    executeCommand,
    setHistoryIndex,
    clear,
  } = useTerminalStore();

  const [input, setInput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Handle command submission
  const handleSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && input.trim()) {
        executeCommand(input);
        setInput('');
        setHistoryIndex(-1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        if (newIndex >= 0 && newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIndex = Math.max(historyIndex - 1, -1);
        setHistoryIndex(newIndex);
        if (newIndex >= 0) {
          setInput(commandHistory[commandHistory.length - 1 - newIndex]);
        } else {
          setInput('');
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        clear();
      }
    },
    [input, executeCommand, commandHistory, historyIndex, setHistoryIndex, clear]
  );

  // Tab completion
  const handleTab = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Simple tab completion for file names
        const { listDirectory } = useFileStore.getState();
        const files = listDirectory(currentDirectory);
        const partial = input.split(/\s+/).pop() || '';
        const matches = files
          .map((f) => f.name)
          .filter((name) => name.startsWith(partial));
        if (matches.length === 1) {
          const parts = input.split(/\s+/);
          parts[parts.length - 1] = matches[0];
          setInput(parts.join(' '));
        }
      }
    },
    [input, currentDirectory]
  );

  const activePanel = panelView || 'terminal';

  const getPrompt = () => {
    if (isClaudeMode) return 'claude > ';
    const displayDir = currentDirectory.replace('/workspace', '~');
    return `user@vscode:${displayDir}$ `;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Panel tabs */}
      <div className="flex items-center h-[35px] bg-[#252526] border-b border-[#333] px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center h-[35px] px-3 text-[11px] font-semibold tracking-wide transition-colors border-b-2 ${
                activePanel === tab.id
                  ? 'text-[#cccccc] border-[#007acc]'
                  : 'text-[#858585] border-transparent hover:text-[#cccccc]'
              }`}
              onClick={() => setPanelView(tab.id)}
            >
              <Icon size={14} className="mr-1.5" />
              {tab.label}
            </button>
          );
        })}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 px-2">
          {activePanel === 'terminal' && (
            <button
              className="w-[24px] h-[24px] flex items-center justify-center hover:bg-[#3c3c3c]"
              onClick={clear}
              title="Clear Terminal"
            >
              <Trash2 size={12} className="text-[#858585]" />
            </button>
          )}
          <button
            className="w-[24px] h-[24px] flex items-center justify-center hover:bg-[#3c3c3c]"
            onClick={togglePanel}
            title="Collapse Panel"
          >
            <ChevronUp size={12} className="text-[#858585]" />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activePanel === 'terminal' && (
          <div
            className="h-full overflow-auto p-2 font-mono text-[14px] leading-[1.4] cursor-text vscode-scrollbar"
            ref={terminalRef}
            onClick={handleTerminalClick}
          >
            {lines.map((line, index) => (
              <TerminalLineComponent key={index} line={line} />
            ))}

            {/* Input line */}
            <div className="flex items-start">
              <span className="text-[#858585] whitespace-pre shrink-0 select-none">
                {getPrompt()}
              </span>
              <input
                ref={inputRef}
                className="flex-1 bg-transparent outline-none text-[#cccccc] min-w-0"
                style={{ caretColor: '#cccccc' }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  handleSubmit(e);
                  handleTab(e);
                }}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>
        )}

        {activePanel === 'output' && (
          <div className="h-full overflow-auto p-2 font-mono text-[13px] vscode-scrollbar">
            <div className="text-[#858585]">
              <p>[info] Extension host started</p>
              <p>[info] Loaded 15 extensions</p>
              <p>[info] TypeScript language service initialized</p>
              <p>[info] ESLint server started</p>
              <p className="text-[#89d185]">[success] Build completed in 1.2s</p>
              <p>[info] Watching for file changes...</p>
            </div>
          </div>
        )}

        {activePanel === 'problems' && (
          <div className="h-full overflow-auto vscode-scrollbar">
            <div className="flex items-center h-[24px] px-3 hover:bg-[#2a2d2e]">
              <AlertCircle size={14} className="text-[#f48771] mr-2" />
              <span className="text-[12px] text-[#cccccc]">
                src/components/App.tsx
              </span>
              <span className="text-[11px] text-[#858585] ml-2">Line 8</span>
              <span className="text-[12px] text-[#cccccc] ml-4">
                'useState' is defined but never used
              </span>
            </div>
            <div className="flex items-center h-[24px] px-3 hover:bg-[#2a2d2e]">
              <AlertCircle size={14} className="text-[#cca700] mr-2" />
              <span className="text-[12px] text-[#cccccc]">
                src/hooks/useFileSystem.ts
              </span>
              <span className="text-[11px] text-[#858585] ml-2">Line 12</span>
              <span className="text-[12px] text-[#cccccc] ml-4">
                Variable 'timeoutId' implicitly has type 'any'
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalLineComponent({ line }: { line: TerminalLine }) {
  const getColor = () => {
    switch (line.type) {
      case 'error':
        return 'text-[#f48771]';
      case 'success':
        return 'text-[#89d185]';
      case 'system':
        return 'text-[#858585]';
      case 'ai':
        return 'text-[#cccccc]';
      case 'tool':
        return 'text-[#4ec9b0]';
      default:
        return 'text-[#cccccc]';
    }
  };

  // Handle ANSI codes in output
  const cleanContent = line.content
    .replace(/\x1b\[\d+m/g, '')
    .replace(/\x1b\[38;5;\d+m/g, '')
    .replace(/\x1b\[0m/g, '');

  return (
    <div className={`whitespace-pre-wrap break-all ${getColor()}`}>
      {cleanContent}
    </div>
  );
}
