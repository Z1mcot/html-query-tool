import { FileDropzone } from './components/upload/FileDropzone';
import { CodeViewer } from './components/editor/CodeViewer';
import { QueryBar } from './components/query/QueryBar';
import { MatchList } from './components/query/MatchList';
import { useAppStore } from './store/useAppStore';

function App() {
  const fileName = useAppStore((s) => s.fileName);

  if (!fileName) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-neutral-50">
        <h1 className="mb-1 text-lg font-semibold text-neutral-800">HTML Query Tool</h1>
        <p className="mb-4 text-sm text-neutral-500">Query raw HTML with CSS selectors or XPath.</p>
        <div className="w-full max-w-md">
          <FileDropzone />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <QueryBar />
      <div className="flex min-h-0 flex-1">
        <MatchList />
        <div className="min-w-0 flex-1">
          <CodeViewer />
        </div>
      </div>
    </div>
  );
}

export default App;
