import { create } from 'zustand';
import type { SearchResult } from '@/types';
import { useFileStore } from './fileStore';

interface SearchState {
  query: string;
  replaceText: string;
  results: SearchResult[];
  matchCase: boolean;
  matchWholeWord: boolean;
  useRegex: boolean;
  isSearching: boolean;
  includePattern: string;
  excludePattern: string;
  filesToInclude: string;
  filesToExclude: string;

  setQuery: (q: string) => void;
  setReplaceText: (t: string) => void;
  toggleMatchCase: () => void;
  toggleMatchWholeWord: () => void;
  toggleUseRegex: () => void;
  setFilesToInclude: (p: string) => void;
  setFilesToExclude: (p: string) => void;
  performSearch: () => void;
  replaceAll: () => void;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((setState, getState) => ({
  query: '',
  replaceText: '',
  results: [],
  matchCase: false,
  matchWholeWord: false,
  useRegex: false,
  isSearching: false,
  includePattern: '',
  excludePattern: '',
  filesToInclude: '',
  filesToExclude: '',

  setQuery: (q: string) => setState({ query: q }),
  setReplaceText: (t: string) => setState({ replaceText: t }),
  toggleMatchCase: () => setState(s => ({ matchCase: !s.matchCase })),
  toggleMatchWholeWord: () => setState(s => ({ matchWholeWord: !s.matchWholeWord })),
  toggleUseRegex: () => setState(s => ({ useRegex: !s.useRegex })),
  setFilesToInclude: (p: string) => setState({ filesToInclude: p }),
  setFilesToExclude: (p: string) => setState({ filesToExclude: p }),

  performSearch: () => {
    const state = getState();
    if (!state.query) {
      setState({ results: [] });
      return;
    }

    setState({ isSearching: true });

    // Get all files
    const fileStore = useFileStore.getState();
    const allFiles = getAllFiles(fileStore.files);
    const results: SearchResult[] = [];

    let flags = state.matchCase ? 'g' : 'gi';
    let searchPattern: RegExp;

    try {
      if (state.useRegex) {
        searchPattern = new RegExp(state.query, flags);
      } else {
        const escaped = state.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escaped, flags);
      }
    } catch {
      setState({ results: [], isSearching: false });
      return;
    }

    for (const file of allFiles) {
      if (!file.content) continue;
      
      // Apply include/exclude patterns
      if (state.filesToInclude && !new RegExp(state.filesToInclude).test(file.path)) continue;
      if (state.filesToExclude && new RegExp(state.filesToExclude).test(file.path)) continue;

      const lines = file.content.split('\n');
      lines.forEach((line: string, lineIndex: number) => {
        searchPattern.lastIndex = 0;
        if (searchPattern.test(line)) {
          const match = line.match(searchPattern);
          const column = match ? line.indexOf(match[0]) : 0;
          results.push({
            path: file.path,
            line: lineIndex + 1,
            column: column + 1,
            text: match ? match[0] : state.query,
            preview: line.trim(),
          });
        }
      });
    }

    setState({ results, isSearching: false });
  },

  replaceAll: () => {
    const state = getState();
    if (!state.query || !state.replaceText) return;

    const fileStore = useFileStore.getState();
    let flags = state.matchCase ? 'g' : 'gi';
    let searchPattern: RegExp;

    if (state.useRegex) {
      searchPattern = new RegExp(state.query, flags);
    } else {
      const escaped = state.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchPattern = new RegExp(escaped, flags);
    }

    for (const result of state.results) {
      const content = fileStore.getFileContent(result.path);
      const lines = content.split('\n');
      const lineIndex = result.line - 1;
      if (lines[lineIndex]) {
        lines[lineIndex] = lines[lineIndex].replace(searchPattern, state.replaceText);
        const newContent = lines.join('\n');
        fileStore.updateFileContent(result.path, newContent);
      }
    }

    // Re-run search to update results
    getState().performSearch();
  },

  clearResults: () => setState({ results: [] }),
}));

function getAllFiles(files: any[]): any[] {
  const result: any[] = [];
  const traverse = (nodes: any[]) => {
    for (const node of nodes) {
      if (node.type === 'file') {
        result.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(files);
  return result;
}
