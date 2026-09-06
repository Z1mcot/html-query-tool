import { useEffect, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useAppStore } from '../../store/useAppStore';

export function CodeViewer() {
  const rawContent = useAppStore((s) => s.rawContent);
  const matches = useAppStore((s) => s.matches);
  const activeMatchIndex = useAppStore((s) => s.activeMatchIndex);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  const handleMount: OnMount = (editorInstance) => {
    editorRef.current = editorInstance;
  };

  // highlight all matched lines
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;

    const lines = matches.filter((m) => m.line !== null).map((m) => m.line as number);
    const newDecorations: editor.IModelDeltaDecoration[] = lines.map((line) => ({
      range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: 'matched-line-decoration',
      },
    }));

    if (!decorationsRef.current) {
      decorationsRef.current = ed.createDecorationsCollection(newDecorations);
    } else {
      decorationsRef.current.set(newDecorations);
    }
  }, [matches]);

  // jump to the active match
  useEffect(() => {
    const ed = editorRef.current;
    const match = matches[activeMatchIndex];
    if (!ed || !match || match.line === null) return;
    ed.revealLineInCenter(match.line);
    ed.setPosition({ lineNumber: match.line, column: match.column ?? 1 });
  }, [activeMatchIndex, matches]);

  return (
    <div className="h-full w-full">
      <style>{`.matched-line-decoration { background: rgba(245, 158, 11, 0.18); }`}</style>
      <Editor
        height="100%"
        defaultLanguage="html"
        value={rawContent}
        onMount={handleMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: 'off',
        }}
      />
    </div>
  );
}
