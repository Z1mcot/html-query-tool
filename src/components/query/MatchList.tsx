import { FileCode } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function MatchList() {
  const fileName = useAppStore((s) => s.fileName);
  const rawContent = useAppStore((s) => s.rawContent);
  const matches = useAppStore((s) => s.matches);
  const activeMatchIndex = useAppStore((s) => s.activeMatchIndex);
  const setActiveMatchIndex = useAppStore((s) => s.setActiveMatchIndex);

  const sizeKb = (new Blob([rawContent]).size / 1024).toFixed(1);

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50">
      <div className="flex items-center gap-2 border-b border-neutral-200 p-3">
        <FileCode className="h-4 w-4 shrink-0 text-neutral-500" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-800">{fileName}</p>
          <p className="text-xs text-neutral-500">{sizeKb} KB</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <p className="p-3 text-xs text-neutral-400">No matches yet.</p>
        ) : (
          <ul>
            {matches.map((m) => (
              <li key={m.index}>
                <button
                  onClick={() => setActiveMatchIndex(m.index)}
                  className={`block w-full truncate px-3 py-1.5 text-left font-mono text-xs ${
                    m.index === activeMatchIndex
                      ? 'bg-amber-100 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {m.summary}
                  {m.line !== null && <span className="ml-1 text-neutral-400">:{m.line}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
