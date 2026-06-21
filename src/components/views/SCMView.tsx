import { useState } from 'react';
import {
  GitBranch,
  Check,
  Plus,
  Minus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileDiff,
  MessageSquare,
} from 'lucide-react';
import type { GitChange } from '@/types';

const INITIAL_CHANGES: GitChange[] = [
  { path: 'src/components/App.tsx', status: 'modified', staged: false },
  { path: 'src/styles/global.css', status: 'modified', staged: false },
  { path: 'src/hooks/useDebounce.ts', status: 'untracked', staged: false },
  { path: 'package.json', status: 'modified', staged: true },
  { path: 'README.md', status: 'modified', staged: true },
];

export function SCMView() {
  const [changes, setChanges] = useState<GitChange[]>(INITIAL_CHANGES);
  const [commitMessage, setCommitMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    staged: true,
    unstaged: true,
  });

  const toggleStage = (path: string) => {
    setChanges((prev) =>
      prev.map((c) => (c.path === path ? { ...c, staged: !c.staged } : c))
    );
  };

  const stageAll = () => {
    setChanges((prev) => prev.map((c) => ({ ...c, staged: true })));
  };

  const unstageAll = () => {
    setChanges((prev) => prev.map((c) => ({ ...c, staged: false })));
  };

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    // Remove staged changes
    setChanges((prev) => prev.filter((c) => !c.staged));
    setCommitMessage('');
  };

  const staged = changes.filter((c) => c.staged);
  const unstaged = changes.filter((c) => !c.staged);

  const getStatusIcon = (status: GitChange['status']) => {
    switch (status) {
      case 'modified':
        return <span className="text-[#e2c08d] text-[11px] font-mono">M</span>;
      case 'added':
        return <span className="text-[#89d185] text-[11px] font-mono">A</span>;
      case 'deleted':
        return <span className="text-[#f48771] text-[11px] font-mono">D</span>;
      case 'untracked':
        return <span className="text-[#858585] text-[11px] font-mono">U</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Branch indicator */}
      <div className="flex items-center h-[30px] px-3 bg-[#252526]">
        <GitBranch size={14} className="text-[#cccccc] mr-2" />
        <span className="text-[13px] text-[#cccccc] font-semibold">main</span>
        <span className="text-[11px] text-[#858585] ml-2">
          • {changes.length} changes
        </span>
        <button
          className="ml-auto w-[24px] h-[24px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
          title="Refresh"
        >
          <RefreshCw size={12} className="text-[#858585]" />
        </button>
      </div>

      {/* Commit message */}
      <div className="px-3 py-2">
        <div className="flex items-center bg-[#3c3c3c] px-2 h-[30px] mb-2">
          <MessageSquare size={14} className="text-[#858585] mr-1.5" />
          <input
            className="flex-1 bg-transparent outline-none text-[#cccccc] text-[13px] placeholder-[#6e6e6e]"
            placeholder="Message (Ctrl+Enter to commit)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleCommit();
              }
            }}
          />
        </div>
        <button
          className={`w-full h-[28px] text-[13px] font-medium transition-colors ${
            commitMessage.trim() && staged.length > 0
              ? 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
              : 'bg-[#3c3c3c] text-[#6e6e6e] cursor-not-allowed'
          }`}
          disabled={!commitMessage.trim() || staged.length === 0}
          onClick={handleCommit}
        >
          Commit
        </button>
      </div>

      {/* Changes list */}
      <div className="flex-1 overflow-auto vscode-scrollbar">
        {/* Staged changes */}
        {staged.length > 0 && (
          <div>
            <button
              className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
              onClick={() =>
                setExpandedSections((s) => ({ ...s, staged: !s.staged }))
              }
            >
              {expandedSections.staged ? (
                <ChevronDown size={12} className="text-[#858585] mr-1" />
              ) : (
                <ChevronRight size={12} className="text-[#858585] mr-1" />
              )}
              <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
                Staged
              </span>
              <span className="text-[11px] text-[#858585] ml-1">
                ({staged.length})
              </span>
              <button
                className="ml-auto w-[20px] h-[20px] flex items-center justify-center hover:bg-[#3c3c3c]"
                onClick={(e) => {
                  e.stopPropagation();
                  unstageAll();
                }}
                title="Unstage All"
              >
                <Minus size={12} className="text-[#858585]" />
              </button>
            </button>

            {expandedSections.staged &&
              staged.map((change) => (
                <div
                  key={change.path}
                  className="flex items-center h-[22px] px-3 hover:bg-[#2a2d2e] group"
                >
                  <button
                    className="w-[16px] h-[16px] flex items-center justify-center mr-1"
                    onClick={() => toggleStage(change.path)}
                  >
                    <Check size={12} className="text-[#89d185]" />
                  </button>
                  {getStatusIcon(change.status)}
                  <FileDiff size={12} className="text-[#858585] ml-1 mr-1.5" />
                  <span className="text-[12px] text-[#cccccc] truncate">
                    {change.path}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Unstaged changes */}
        {unstaged.length > 0 && (
          <div>
            <button
              className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
              onClick={() =>
                setExpandedSections((s) => ({ ...s, unstaged: !s.unstaged }))
              }
            >
              {expandedSections.unstaged ? (
                <ChevronDown size={12} className="text-[#858585] mr-1" />
              ) : (
                <ChevronRight size={12} className="text-[#858585] mr-1" />
              )}
              <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
                Changes
              </span>
              <span className="text-[11px] text-[#858585] ml-1">
                ({unstaged.length})
              </span>
              <button
                className="ml-auto w-[20px] h-[20px] flex items-center justify-center hover:bg-[#3c3c3c]"
                onClick={(e) => {
                  e.stopPropagation();
                  stageAll();
                }}
                title="Stage All"
              >
                <Plus size={12} className="text-[#858585]" />
              </button>
            </button>

            {expandedSections.unstaged &&
              unstaged.map((change) => (
                <div
                  key={change.path}
                  className="flex items-center h-[22px] px-3 hover:bg-[#2a2d2e] group"
                >
                  <button
                    className="w-[16px] h-[16px] flex items-center justify-center mr-1"
                    onClick={() => toggleStage(change.path)}
                  >
                    <Plus size={12} className="text-[#858585] group-hover:text-[#cccccc]" />
                  </button>
                  {getStatusIcon(change.status)}
                  <FileDiff size={12} className="text-[#858585] ml-1 mr-1.5" />
                  <span className="text-[12px] text-[#cccccc] truncate">
                    {change.path}
                  </span>
                </div>
              ))}
          </div>
        )}

        {changes.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-[12px] text-[#858585]">
              There are no changes to commit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
