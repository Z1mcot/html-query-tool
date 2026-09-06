import { create } from 'zustand';
import type { QueryMatch, QueryMode } from '../lib/types';

// Files above this size disable live/continuous query evaluation
// in favor of an explicit "Search" trigger (see spec: Edge Cases & Constraints).
export const LARGE_FILE_THRESHOLD_BYTES = 2 * 1024 * 1024;

interface AppState {
  fileName: string | null;
  rawContent: string;
  queryMode: QueryMode;
  query: string;
  matches: QueryMatch[];
  activeMatchIndex: number;
  queryError: string | null;

  setFile: (name: string, content: string) => void;
  setQueryMode: (mode: QueryMode) => void;
  setQuery: (query: string) => void;
  setMatches: (matches: QueryMatch[], error: string | null) => void;
  setActiveMatchIndex: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  fileName: null,
  rawContent: '',
  queryMode: 'css',
  query: '',
  matches: [],
  activeMatchIndex: 0,
  queryError: null,

  setFile: (name, content) =>
    set({ fileName: name, rawContent: content, matches: [], activeMatchIndex: 0, queryError: null }),
  setQueryMode: (mode) => set({ queryMode: mode }),
  setQuery: (query) => set({ query }),
  setMatches: (matches, error) => set({ matches, queryError: error, activeMatchIndex: 0 }),
  setActiveMatchIndex: (index) => set({ activeMatchIndex: index }),
}));
