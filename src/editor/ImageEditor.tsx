import { useRef, useState, useCallback, useEffect } from 'react';
import { EditorProvider, useEditor } from './EditorContext';
import { TopBar } from './ui/TopBar';
import { Toolbar } from './ui/Toolbar';
import { ToolPanel } from './ui/ToolPanel';
import { LayersPanel } from './ui/LayersPanel';
import type { EditorConfig } from './types';
import { Upload, Image as ImageIcon } from 'lucide-react';

function EditorCanvas({ src }: { src?: string }) {
  const { canvasManager, setIsLoading, saveHistory } = useEditor();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!canvasManager || !src || loaded) return;
    let cancelled = false;
    setIsLoading(true);
    canvasManager
      .loadImage(src)
      .then(() => {
        if (!cancelled) {
          saveHistory();
          setLoaded(true);
        }
      })
      .catch((e) => console.error('Failed to load src image:', e))
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [canvasManager, src, loaded, setIsLoading, saveHistory]);

  return null;
}

function DropZone() {
  const { canvasManager, saveHistory, setIsLoading } = useEditor();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (!canvasManager) return;
    const check = () => setHasImage(!!canvasManager.getBackgroundImage());
    check();
    return canvasManager.onChange(check);
  }, [canvasManager]);

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

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) handleFile(file);
    },
    [handleFile],
  );

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDragging(false);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  if (hasImage && !dragging) return null;

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-colors ${
        dragging ? 'bg-blue-100/70 z-30' : 'z-10'
      }`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging ? (
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-white/80 flex items-center justify-center shadow-lg">
            <Upload size={28} strokeWidth={1.5} className="text-editor-active" />
          </div>
          <p className="text-sm font-semibold text-editor-active">Drop image to open</p>
        </div>
      ) : !hasImage ? (
        <div className="flex flex-col items-center gap-4 text-editor-muted">
          <div className="w-16 h-16 rounded-2xl bg-editor-hover flex items-center justify-center">
            <ImageIcon size={28} strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-editor-text">Drop an image here</p>
            <p className="text-xs mt-1">or</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Upload size={16} />
            Browse Files
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EditorShell({ config }: { config: EditorConfig }) {
  const { isLoading } = useEditor();

  return (
    <>
      <EditorCanvas src={config.src} />
      <DropZone />
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-lg">
            <div className="w-5 h-5 border-2 border-editor-active border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-editor-text">Processing…</span>
          </div>
        </div>
      )}
    </>
  );
}

export interface ImageEditorProps extends EditorConfig {}

export function ImageEditor({ src, width, height, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) setReady(true);
  }, []);

  const handleExport = () => {
    // Reach into the provider to export — we do this via a callback ref pattern
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSave) onSave(dataUrl);
    else {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'edited-image.png';
      a.click();
    }
  };

  return (
    <EditorProvider
      canvasEl={ready ? canvasRef.current : null}
      containerEl={ready ? containerRef.current : null}
    >
      <div
        className="flex flex-col bg-editor-bg overflow-hidden"
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
        }}
      >
        <ExportableTopBar onExport={handleExport} />

        <div className="flex flex-1 min-h-0">
          <Toolbar />
          <ToolPanel />

          <div className="flex-1 relative overflow-hidden" ref={containerRef}>
            <canvas ref={canvasRef} />
            <EditorShell config={{ src, width, height, onSave, onClose }} />
            <LayersPanel />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

function ExportableTopBar({ onExport }: { onExport: () => void }) {
  const { canvasManager } = useEditor();

  const handleExport = () => {
    if (!canvasManager) return;
    const dataUrl = canvasManager.getImageDataURL('png', 1);
    if (dataUrl) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'edited-image.png';
      a.click();
    }
  };

  return <TopBar onExport={handleExport} />;
}
