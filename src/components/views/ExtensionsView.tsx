import { useState } from 'react';
import {
  Search,
  Download,
  Star,
  Blocks,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useExtensionStore } from '@/stores/extensionStore';

export function ExtensionsView() {
  const {
    searchQuery,
    selectedExtension,
    setSearchQuery,
    setSelectedExtension,
    toggleExtension,
    getInstalled,
    getPopular,
    getFiltered,
  } = useExtensionStore();

  const [activeTab, setActiveTab] = useState<'installed' | 'popular'>('installed');

  const installed = getInstalled();
  const popular = getPopular();
  const filtered = getFiltered();

  const displayExtensions = searchQuery ? filtered : activeTab === 'installed' ? installed : popular;

  if (selectedExtension) {
    return (
      <div className="flex flex-col h-full overflow-auto vscode-scrollbar">
        {/* Back button */}
        <button
          className="flex items-center h-[28px] px-3 hover:bg-[#2a2d2e] text-[13px] text-[#cccccc]"
          onClick={() => setSelectedExtension(null)}
        >
          <ChevronRight size={14} className="text-[#858585] mr-1 rotate-180" />
          Back
        </button>

        {/* Extension header */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="w-[64px] h-[64px] bg-[#3c3c3c] rounded flex items-center justify-center flex-shrink-0">
              <Blocks size={32} className="text-[#007acc]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[16px] font-semibold text-[#cccccc]">
                {selectedExtension.name}
              </h3>
              <p className="text-[12px] text-[#858585]">
                {selectedExtension.publisher}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-[#cccccc]">
                  v{selectedExtension.version}
                </span>
                {selectedExtension.rating && (
                  <span className="flex items-center text-[11px] text-[#858585]">
                    <Star size={10} className="text-[#cca700] mr-0.5" />
                    {selectedExtension.rating}
                  </span>
                )}
                {selectedExtension.downloads && (
                  <span className="text-[11px] text-[#858585]">
                    {formatDownloads(selectedExtension.downloads)} downloads
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Install/Uninstall button */}
          <button
            className={`mt-3 w-full h-[32px] text-[13px] font-medium transition-colors ${
              selectedExtension.installed
                ? 'bg-[#3c3c3c] hover:bg-[#454545] text-[#cccccc]'
                : 'bg-[#0e639c] hover:bg-[#1177bb] text-white'
            }`}
            onClick={() => toggleExtension(selectedExtension.id)}
          >
            {selectedExtension.installed ? 'Uninstall' : 'Install'}
          </button>
        </div>

        {/* Description */}
        <div className="px-4 py-2">
          <p className="text-[13px] text-[#cccccc] leading-relaxed">
            {selectedExtension.description}
          </p>
          {selectedExtension.categories && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedExtension.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[11px] text-[#858585] bg-[#333] px-2 py-0.5"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center bg-[#3c3c3c] px-2 h-[26px]">
          <Search size={14} className="text-[#858585] mr-1.5" />
          <input
            className="flex-1 bg-transparent outline-none text-[#cccccc] text-[13px] placeholder-[#6e6e6e]"
            placeholder="Search Extensions in Marketplace"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="text-[#858585] hover:text-[#cccccc] text-[11px]"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!searchQuery && (
        <div className="flex items-center h-[28px] px-3 gap-2">
          <button
            className={`text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'installed'
                ? 'text-[#cccccc]'
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            onClick={() => setActiveTab('installed')}
          >
            Installed ({installed.length})
          </button>
          <button
            className={`text-[11px] font-semibold uppercase tracking-wide transition-colors ${
              activeTab === 'popular'
                ? 'text-[#cccccc]'
                : 'text-[#858585] hover:text-[#cccccc]'
            }`}
            onClick={() => setActiveTab('popular')}
          >
            Popular
          </button>
        </div>
      )}

      {/* Extension list */}
      <div className="flex-1 overflow-auto vscode-scrollbar">
        {displayExtensions.map((ext) => (
          <button
            key={ext.id}
            className="w-full flex items-start px-3 py-2 hover:bg-[#2a2d2e] text-left group"
            onClick={() => setSelectedExtension(ext)}
          >
            <div className="w-[40px] h-[40px] bg-[#3c3c3c] rounded flex items-center justify-center flex-shrink-0 mr-2">
              <Blocks size={20} className="text-[#007acc]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className="text-[13px] text-[#cccccc] font-medium truncate">
                  {ext.name}
                </span>
                {ext.installed && (
                  <Check size={12} className="text-[#89d185] ml-1 flex-shrink-0" />
                )}
              </div>
              <p className="text-[12px] text-[#858585] truncate">
                {ext.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-[#858585]">
                  {ext.publisher}
                </span>
                {ext.rating && (
                  <span className="flex items-center text-[11px] text-[#858585]">
                    <Star size={10} className="text-[#cca700] mr-0.5" />
                    {ext.rating}
                  </span>
                )}
                {ext.downloads && (
                  <span className="text-[11px] text-[#858585] flex items-center">
                    <Download size={10} className="mr-0.5" />
                    {formatDownloads(ext.downloads)}
                  </span>
                )}
              </div>
            </div>
            {!ext.installed && (
              <button
                className="ml-2 w-[60px] h-[24px] bg-[#0e639c] hover:bg-[#1177bb] text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExtension(ext.id);
                }}
              >
                Install
              </button>
            )}
          </button>
        ))}

        {displayExtensions.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-[12px] text-[#858585]">No extensions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDownloads(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}
