import { useRef, useCallback } from 'react';
import { Undo2, Redo2, Minus, Plus, FolderOpen, Download, Layers } from 'lucide-react';
import { useEditor } from '../EditorContext';
import clsx from 'clsx';

interface Props {
  onExport: () => void;
}

export function TopBar({ onExport }: Props) {
  const { canUndo, canRedo, undo, redo, zoom, zoomManager, showLayers, setShowLayers, canvasManager, saveHistory, setIsLoading } =
    useEditor();

  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!canvasManager) return;
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await canvasManager.loadImage(reader.result as string);
          saveHistory();
        } catch (e) {
          console.error('Failed to load image:', e);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => setIsLoading(false);
      reader.readAsDataURL(file);
    },
    [canvasManager, saveHistory, setIsLoading],
  );

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-editor-surface border-b border-editor-border h-12">
      {/* Left: Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            canUndo ? 'hover:bg-editor-hover text-editor-text' : 'text-gray-300 cursor-not-allowed',
          )}
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            canRedo ? 'hover:bg-editor-hover text-editor-text' : 'text-gray-300 cursor-not-allowed',
          )}
          title="Redo"
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Center: Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => zoomManager?.zoomOut()}
          className="p-1.5 rounded hover:bg-editor-hover text-editor-muted transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => zoomManager?.resetZoom()}
          className="text-sm font-medium text-editor-text min-w-[48px] text-center hover:bg-editor-hover px-2 py-1 rounded transition-colors"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => zoomManager?.zoomIn()}
          className="p-1.5 rounded hover:bg-editor-hover text-editor-muted transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            if (fileRef.current) fileRef.current.value = '';
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-lg hover:bg-editor-hover text-editor-muted transition-colors"
          title="Open Image"
        >
          <FolderOpen size={18} />
        </button>
        <button
          onClick={() => setShowLayers(!showLayers)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            showLayers ? 'bg-blue-50 text-editor-active' : 'hover:bg-editor-hover text-editor-muted',
          )}
          title="Layers"
        >
          <Layers size={18} />
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 ml-2 px-4 py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Download size={16} />
          Done
        </button>
      </div>
    </div>
  );
}
