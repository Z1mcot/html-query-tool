import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useAppStore, LARGE_FILE_THRESHOLD_BYTES } from '../../store/useAppStore';
import { runQuery } from '../../lib/htmlQuery';
import type { QueryMode } from '../../lib/types';

export function QueryBar() {
  const rawContent = useAppStore((s) => s.rawContent);
  const queryMode = useAppStore((s) => s.queryMode);
  const query = useAppStore((s) => s.query);
  const matches = useAppStore((s) => s.matches);
  const activeMatchIndex = useAppStore((s) => s.activeMatchIndex);
  const queryError = useAppStore((s) => s.queryError);
  const setQueryMode = useAppStore((s) => s.setQueryMode);
  const setQuery = useAppStore((s) => s.setQuery);
  const setMatches = useAppStore((s) => s.setMatches);
  const setActiveMatchIndex = useAppStore((s) => s.setActiveMatchIndex);

  const isLargeFile = useMemo(
    () => new Blob([rawContent]).size > LARGE_FILE_THRESHOLD_BYTES,
    [rawContent],
  );

  const [pendingQuery, setPendingQuery] = useState(query);
  const deferredQuery = useDeferredValue(pendingQuery);

  // Live evaluation for small files; large files require the explicit Search button.
  useEffect(() => {
    if (isLargeFile) return;
    setQuery(deferredQuery);
    const result = runQuery(rawContent, queryMode, deferredQuery);
    setMatches(result.matches, result.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredQuery, queryMode, rawContent, isLargeFile]);

  function runExplicitSearch() {
    setQuery(pendingQuery);
    const result = runQuery(rawContent, queryMode, pendingQuery);
    setMatches(result.matches, result.error);
  }

  function handleModeChange(mode: QueryMode) {
    setQueryMode(mode);
    if (isLargeFile) return;
    const result = runQuery(rawContent, mode, pendingQuery);
    setMatches(result.matches, result.error);
  }

  function goTo(delta: number) {
    if (matches.length === 0) return;
    const next = (activeMatchIndex + delta + matches.length) % matches.length;
    setActiveMatchIndex(next);
  }

  return (
    <div className="flex flex-col gap-2 border-b border-neutral-200 bg-white p-3 sm:flex-row sm:items-center">
      <div className="flex overflow-hidden rounded border border-neutral-300 text-xs font-medium">
        <button
          onClick={() => handleModeChange('css')}
          className={`px-2.5 py-1.5 ${queryMode === 'css' ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
        >
          CSS
        </button>
        <button
          onClick={() => handleModeChange('xpath')}
          className={`px-2.5 py-1.5 ${queryMode === 'xpath' ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
        >
          XPath
        </button>
      </div>

      <input
        value={pendingQuery}
        onChange={(e) => setPendingQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && runExplicitSearch()}
        placeholder={queryMode === 'css' ? 'e.g. div.card > a[href]' : 'e.g. //div[@class="card"]'}
        className="min-w-0 flex-1 rounded border border-neutral-300 px-2.5 py-1.5 font-mono text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
      />

      {isLargeFile && (
        <button
          onClick={runExplicitSearch}
          className="flex items-center gap-1.5 rounded bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
        >
          <Search className="h-3.5 w-3.5" />
          Search
        </button>
      )}

      <div className="flex items-center gap-1 text-xs text-neutral-600">
        <span className="tabular-nums">
          {matches.length > 0 ? `${activeMatchIndex + 1} / ${matches.length}` : '0 matches'}
        </span>
        <button
          onClick={() => goTo(-1)}
          disabled={matches.length === 0}
          className="rounded p-1 hover:bg-neutral-100 disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => goTo(1)}
          disabled={matches.length === 0}
          className="rounded p-1 hover:bg-neutral-100 disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {queryError && <span className="text-xs text-red-600 sm:ml-2">{queryError}</span>}
    </div>
  );
}
