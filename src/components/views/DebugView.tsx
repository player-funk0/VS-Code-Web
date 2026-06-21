import { useState } from 'react';
import {
  Play,
  Square,
  SkipForward,
  CornerDownRight,
  CornerUpLeft,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Plus,
  Eye,
  ListOrdered,
  CircleDot,
} from 'lucide-react';
import { useDebugStore } from '@/stores/debugStore';

export function DebugView() {
  const {
    session,
    variables,
    callStack,
    watchItems,
    breakpoints,
    startSession,
    stopSession,
    continueSession,
    stepOver,
    stepInto,
    stepOut,
    addWatch,
    removeWatch,
  } = useDebugStore();

  const [expandedSections, setExpandedSections] = useState({
    variables: true,
    watch: true,
    callstack: true,
    breakpoints: true,
  });

  const [newWatchExpr, setNewWatchExpr] = useState('');

  return (
    <div className="flex flex-col h-full">
      {/* Debug toolbar */}
      <div className="flex items-center h-[38px] px-3 gap-1 border-b border-[#333]">
        {!session || session.status === 'stopped' ? (
          <button
            className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
            onClick={() => startSession('Launch Program')}
            title="Start Debugging (F5)"
          >
            <Play size={16} className="text-[#89d185]" />
          </button>
        ) : (
          <>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={() =>
                session.status === 'paused'
                  ? continueSession()
                  : stopSession()
              }
              title={session.status === 'paused' ? 'Continue (F5)' : 'Pause'}
            >
              {session.status === 'paused' ? (
                <Play size={16} className="text-[#89d185]" />
              ) : (
                <Square size={14} className="text-[#f48771]" />
              )}
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={stepOver}
              title="Step Over (F10)"
            >
              <SkipForward size={14} className="text-[#cccccc]" />
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={stepInto}
              title="Step Into (F11)"
            >
              <CornerDownRight size={14} className="text-[#cccccc]" />
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={stepOut}
              title="Step Out (Shift+F11)"
            >
              <CornerUpLeft size={14} className="text-[#cccccc]" />
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={() => startSession('Restart')}
              title="Restart (Ctrl+Shift+F5)"
            >
              <RotateCcw size={14} className="text-[#89d185]" />
            </button>
            <button
              className="w-[28px] h-[28px] flex items-center justify-center hover:bg-[#3c3c3c] rounded"
              onClick={stopSession}
              title="Stop (Shift+F5)"
            >
              <Square size={14} className="text-[#f48771]" />
            </button>
          </>
        )}
      </div>

      {/* Debug sections */}
      <div className="flex-1 overflow-auto vscode-scrollbar">
        {/* Variables */}
        <div>
          <button
            className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
            onClick={() =>
              setExpandedSections((s) => ({ ...s, variables: !s.variables }))
            }
          >
            {expandedSections.variables ? (
              <ChevronDown size={12} className="text-[#858585] mr-1" />
            ) : (
              <ChevronRight size={12} className="text-[#858585] mr-1" />
            )}
            <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
              Variables
            </span>
          </button>

          {expandedSections.variables &&
            variables.map((v, i) => (
              <div
                key={i}
                className="flex items-center h-[22px] px-3 pl-6 hover:bg-[#2a2d2e]"
              >
                <span className="text-[12px] text-[#9cdcfe] min-w-[120px]">
                  {v.name}
                </span>
                <span className="text-[11px] text-[#4ec9b0] mr-2">
                  {v.type}
                </span>
                <span className="text-[12px] text-[#ce9178]">{v.value}</span>
              </div>
            ))}
        </div>

        {/* Watch */}
        <div>
          <button
            className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
            onClick={() =>
              setExpandedSections((s) => ({ ...s, watch: !s.watch }))
            }
          >
            {expandedSections.watch ? (
              <ChevronDown size={12} className="text-[#858585] mr-1" />
            ) : (
              <ChevronRight size={12} className="text-[#858585] mr-1" />
            )}
            <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
              Watch
            </span>
          </button>

          {expandedSections.watch && (
            <>
              {/* Add watch expression */}
              <div className="flex items-center h-[22px] px-3 pl-6">
                <Plus size={12} className="text-[#858585] mr-1" />
                <input
                  className="flex-1 bg-transparent outline-none text-[12px] text-[#cccccc] placeholder-[#6e6e6e]"
                  placeholder="Expression to watch"
                  value={newWatchExpr}
                  onChange={(e) => setNewWatchExpr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newWatchExpr.trim()) {
                      addWatch(newWatchExpr.trim());
                      setNewWatchExpr('');
                    }
                  }}
                />
              </div>

              {watchItems.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center h-[22px] px-3 pl-6 hover:bg-[#2a2d2e] group"
                >
                  <Eye size={12} className="text-[#858585] mr-1" />
                  <span className="text-[12px] text-[#9cdcfe] mr-2">
                    {w.expression}
                  </span>
                  <span className="text-[12px] text-[#ce9178]">{w.value}</span>
                  <button
                    className="ml-auto opacity-0 group-hover:opacity-100 w-[16px] h-[16px] flex items-center justify-center"
                    onClick={() => removeWatch(w.id)}
                  >
                    <span className="text-[#858585] text-[10px]">✕</span>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Call Stack */}
        <div>
          <button
            className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
            onClick={() =>
              setExpandedSections((s) => ({ ...s, callstack: !s.callstack }))
            }
          >
            {expandedSections.callstack ? (
              <ChevronDown size={12} className="text-[#858585] mr-1" />
            ) : (
              <ChevronRight size={12} className="text-[#858585] mr-1" />
            )}
            <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
              Call Stack
            </span>
          </button>

          {expandedSections.callstack &&
            callStack.map((frame) => (
              <div
                key={frame.id}
                className="flex items-center h-[22px] px-3 pl-6 hover:bg-[#2a2d2e]"
              >
                <ListOrdered size={12} className="text-[#858585] mr-1.5" />
                <span className="text-[12px] text-[#dcdcaa]">{frame.name}</span>
                <span className="text-[11px] text-[#858585] ml-auto">
                  {frame.file}:{frame.line}
                </span>
              </div>
            ))}
        </div>

        {/* Breakpoints */}
        <div>
          <button
            className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e]"
            onClick={() =>
              setExpandedSections((s) => ({
                ...s,
                breakpoints: !s.breakpoints,
              }))
            }
          >
            {expandedSections.breakpoints ? (
              <ChevronDown size={12} className="text-[#858585] mr-1" />
            ) : (
              <ChevronRight size={12} className="text-[#858585] mr-1" />
            )}
            <span className="text-[11px] font-semibold text-[#bbbbbb] uppercase tracking-wide">
              Breakpoints
            </span>
          </button>

          {expandedSections.breakpoints &&
            breakpoints.map((bp, i) => (
              <div
                key={i}
                className="flex items-center h-[22px] px-3 pl-6 hover:bg-[#2a2d2e]"
              >
                <CircleDot
                  size={12}
                  className={
                    bp.enabled ? 'text-[#e51400] mr-1.5' : 'text-[#858585] mr-1.5'
                  }
                />
                <span className="text-[12px] text-[#cccccc] truncate">
                  {bp.path.split('/').pop()}
                </span>
                <span className="text-[11px] text-[#858585] ml-auto">
                  Line {bp.line}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
