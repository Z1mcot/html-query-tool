import { useRef, useState } from 'react';
import { UploadCloud, ClipboardPaste } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function FileDropzone() {
  const setFile = useAppStore((s) => s.setFile);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setFile(file.name, String(reader.result ?? ''));
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handlePasteSubmit() {
    if (!pasteValue.trim()) return;
    setFile('pasted.html', pasteValue);
    setPasteMode(false);
    setPasteValue('');
  }

  if (pasteMode) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <textarea
          className="h-40 w-full resize-none rounded border border-neutral-300 bg-white p-2 font-mono text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          placeholder="Paste raw HTML here…"
          value={pasteValue}
          onChange={(e) => setPasteValue(e.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handlePasteSubmit}
            className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
          >
            Load
          </button>
          <button
            onClick={() => setPasteMode(false)}
            className="rounded px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`m-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragging ? 'border-neutral-500 bg-neutral-50' : 'border-neutral-300'
      }`}
    >
      <UploadCloud className="h-8 w-8 text-neutral-400" />
      <p className="text-sm text-neutral-600">
        Drag & drop an .html file here, or{' '}
        <button className="text-neutral-800 underline hover:no-underline" onClick={() => inputRef.current?.click()}>
          browse
        </button>
      </p>
      <button
        onClick={() => setPasteMode(true)}
        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800"
      >
        <ClipboardPaste className="h-3.5 w-3.5" />
        or paste HTML directly
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".html,.htm,text/html"
        className="hidden"
        onChange={handleBrowse}
      />
    </div>
  );
}
