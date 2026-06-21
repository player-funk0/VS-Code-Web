import { useUIStore } from '@/stores/uiStore';
import { ExplorerView } from './views/ExplorerView';
import { SearchView } from './views/SearchView';
import { SCMView } from './views/SCMView';
import { DebugView } from './views/DebugView';
import { ExtensionsView } from './views/ExtensionsView';

const viewLabels: Record<string, string> = {
  explorer: 'EXPLORER',
  search: 'SEARCH',
  scm: 'SOURCE CONTROL',
  debug: 'RUN AND DEBUG',
  extensions: 'EXTENSIONS',
};

export function Sidebar() {
  const sidebarView = useUIStore(s => s.sidebarView);

  const renderView = () => {
    switch (sidebarView) {
      case 'explorer':
        return <ExplorerView />;
      case 'search':
        return <SearchView />;
      case 'scm':
        return <SCMView />;
      case 'debug':
        return <DebugView />;
      case 'extensions':
        return <ExtensionsView />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#252526] border-r border-[#1e1e1e]">
      {/* Section header */}
      <div className="h-[35px] flex items-center px-3 text-[11px] font-semibold uppercase tracking-wider text-[#bbbbbb]">
        {viewLabels[sidebarView || ''] || ''}
      </div>

      {/* View content */}
      <div className="flex-1 overflow-auto vscode-scrollbar">
        {renderView()}
      </div>
    </div>
  );
}
