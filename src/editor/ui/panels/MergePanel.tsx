import { useRef } from 'react';
import { useEditor } from '../../EditorContext';
import { Upload, Image } from 'lucide-react';

export function MergePanel() {
  const { tools, saveHistory } = useEditor();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await tools.merge?.addImageLayer(file);
    saveHistory();
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-editor-muted">
        Add another image as a layer on top of the current canvas. You can move, resize, and rotate
        the added image.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-editor-border rounded-lg hover:border-editor-active hover:bg-blue-50 transition-colors text-sm text-editor-text"
      >
        <Upload size={18} />
        Upload Image to Merge
      </button>

      <div className="text-xs text-editor-muted">
        <strong>Tip:</strong> After merging, use the Layers panel to reorder or hide layers.
      </div>
    </div>
  );
}
