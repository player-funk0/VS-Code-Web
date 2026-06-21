import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  Bell,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editorStore';

export function StatusBar() {
  const { activeTabPath, tabs } = useEditorStore();

  const activeTab = tabs.find((t) => t.path === activeTabPath);
  const language = activeTab
    ? activeTab.name.split('.').pop()?.toUpperCase() || 'PLAINTEXT'
    : '';

  return (
    <div className="flex items-center h-[22px] bg-[#007acc] text-white text-[12px] px-1 select-none">
      {/* Left items */}
      <div className="flex items-center">
        {/* Git branch */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <GitBranch size={12} className="mr-1" />
          <span>main</span>
          <span className="ml-1 text-white/70">*</span>
        </button>

        {/* Errors */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <AlertCircle size={12} className="mr-1" />
          <span>0</span>
        </button>

        {/* Warnings */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <AlertTriangle size={12} className="mr-1" />
          <span>2</span>
        </button>
      </div>

      {/* Center - can be empty or show current operation */}
      <div className="flex-1" />

      {/* Right items */}
      <div className="flex items-center">
        {/* Cursor position */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <span>Ln 12, Col 34</span>
        </button>

        {/* Indentation */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <span>Spaces: 2</span>
        </button>

        {/* Encoding */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <span>UTF-8</span>
        </button>

        {/* Line ending */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <span>LF</span>
        </button>

        {/* Language */}
        {language && (
          <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
            <span>{language}</span>
          </button>
        )}

        {/* Notifications */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <Bell size={12} />
        </button>

        {/* Settings gear */}
        <button className="flex items-center h-[22px] px-2 hover:bg-white/15 transition-colors">
          <Settings size={12} />
        </button>
      </div>
    </div>
  );
}
