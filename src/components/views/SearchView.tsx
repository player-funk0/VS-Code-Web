import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Replace,
  CaseSensitive,
  WholeWord,
  Regex,
  ChevronRight,
  ChevronDown,
  ReplaceAll,
} from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useEditorStore } from '@/stores/editorStore';

export function SearchView() {
  const {
    query,
    replaceText,
    results,
    matchCase,
    matchWholeWord,
    useRegex,
    setQuery,
    setReplaceText,
    toggleMatchCase,
    toggleMatchWholeWord,
    toggleUseRegex,
    performSearch,
    replaceAll,
    clearResults,
  } = useSearchStore();

  const { openFile } = useEditorStore();
  const [showReplace, setShowReplace] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch();
      } else {
        clearResults();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, matchCase, matchWholeWord, useRegex]);

  // Group results by file
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.path]) acc[result.path] = [];
    acc[result.path].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  const toggleFile = (path: string) => {
    const newSet = new Set(expandedFiles);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setExpandedFiles(newSet);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 mb-1">
          <div className="flex-1 flex items-center bg-[#3c3c3c] px-2 h-[26px]">
            <Search size={14} className="text-[#858585] mr-1.5 flex-shrink-0" />
            <input
              ref={searchInputRef}
              className="flex-1 bg-transparent outline-none text-[#cccccc] text-[13px] placeholder-[#6e6e6e]"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <span className="text-[#858585] text-[11px] mr-1">
                {results.length} results
              </span>
            )}
          </div>
          <button
            className="w-[26px] h-[26px] flex items-center justify-center hover:bg-[#3c3c3c]"
            onClick={() => setShowReplace(!showReplace)}
            title="Toggle Replace"
          >
            <ChevronRight
              size={14}
              className={`text-[#858585] transition-transform ${
                showReplace ? 'rotate-90' : ''
              }`}
            />
          </button>
        </div>

        {/* Replace input */}
        {showReplace && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex-1 flex items-center bg-[#3c3c3c] px-2 h-[26px]">
              <Replace size={14} className="text-[#858585] mr-1.5 flex-shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-[#cccccc] text-[13px] placeholder-[#6e6e6e]"
                placeholder="Replace"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
            </div>
            <button
              className="w-[26px] h-[26px] flex items-center justify-center hover:bg-[#3c3c3c]"
              onClick={replaceAll}
              title="Replace All"
            >
              <ReplaceAll size={14} className="text-[#858585]" />
            </button>
          </div>
        )}

        {/* Options */}
        <div className="flex items-center gap-0.5">
          <button
            className={`w-[24px] h-[24px] flex items-center justify-center rounded ${
              matchCase ? 'bg-[#04395e]' : 'hover:bg-[#3c3c3c]'
            }`}
            onClick={toggleMatchCase}
            title="Match Case"
          >
            <CaseSensitive
              size={14}
              className={matchCase ? 'text-white' : 'text-[#858585]'}
            />
          </button>
          <button
            className={`w-[24px] h-[24px] flex items-center justify-center rounded ${
              matchWholeWord ? 'bg-[#04395e]' : 'hover:bg-[#3c3c3c]'
            }`}
            onClick={toggleMatchWholeWord}
            title="Match Whole Word"
          >
            <WholeWord
              size={14}
              className={matchWholeWord ? 'text-white' : 'text-[#858585]'}
            />
          </button>
          <button
            className={`w-[24px] h-[24px] flex items-center justify-center rounded ${
              useRegex ? 'bg-[#04395e]' : 'hover:bg-[#3c3c3c]'
            }`}
            onClick={toggleUseRegex}
            title="Use Regular Expression"
          >
            <Regex
              size={14}
              className={useRegex ? 'text-white' : 'text-[#858585]'}
            />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto vscode-scrollbar">
        {Object.entries(groupedResults).map(([path, fileResults]) => (
          <div key={path}>
            {/* File header */}
            <button
              className="w-full flex items-center h-[22px] px-3 hover:bg-[#2a2d2e] text-left"
              onClick={() => toggleFile(path)}
            >
              {expandedFiles.has(path) ? (
                <ChevronDown size={12} className="text-[#858585] mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight size={12} className="text-[#858585] mr-1 flex-shrink-0" />
              )}
              <span className="text-[12px] text-[#cccccc] truncate">{path}</span>
              <span className="text-[11px] text-[#858585] ml-1">
                ({fileResults.length})
              </span>
            </button>

            {/* Line results */}
            {expandedFiles.has(path) &&
              fileResults.map((result, index) => (
                <button
                  key={index}
                  className="w-full flex items-start h-auto px-3 py-0.5 hover:bg-[#2a2d2e] text-left pl-7"
                  onClick={() => {
                    const fileName = path.split('/').pop() || '';
                    openFile(path, fileName);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-[#858585] mr-2">
                      {result.line}
                    </span>
                    <span className="text-[12px] text-[#cccccc] truncate">
                      {result.preview}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        ))}

        {query && results.length === 0 && (
          <div className="px-3 py-2 text-[12px] text-[#858585]">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
