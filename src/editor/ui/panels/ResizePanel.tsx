import { useState, useEffect } from 'react';
import { useEditor } from '../../EditorContext';
import { Link, Unlink } from 'lucide-react';

export function ResizePanel() {
  const { tools, saveHistory } = useEditor();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    const size = tools.resize?.getCurrentSize();
    if (size) {
      setWidth(size.width);
      setHeight(size.height);
      setAspectRatio(size.width / size.height);
    }
  }, [tools.resize]);

  const onWidthChange = (w: number) => {
    setWidth(w);
    if (maintainAspect) setHeight(Math.round(w / aspectRatio));
  };

  const onHeightChange = (h: number) => {
    setHeight(h);
    if (maintainAspect) setWidth(Math.round(h * aspectRatio));
  };

  const applyResize = async () => {
    await tools.resize?.applyResize({ width, height, maintainAspect });
    saveHistory();
  };

  const original = tools.resize?.getOriginalSize() ?? { width: 0, height: 0 };

  return (
    <div className="space-y-4">
      <div className="text-xs text-editor-muted">
        Original: {original.width} x {original.height}px
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs text-editor-muted font-medium mb-1 block">Width (px)</label>
          <input
            type="number"
            min={1}
            value={width}
            onChange={(e) => onWidthChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-editor-border rounded-md text-sm"
          />
        </div>

        <button
          onClick={() => setMaintainAspect(!maintainAspect)}
          className="p-2 mb-0.5 border border-editor-border rounded-md hover:bg-editor-hover transition-colors"
          title={maintainAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
        >
          {maintainAspect ? <Link size={16} /> : <Unlink size={16} />}
        </button>

        <div className="flex-1">
          <label className="text-xs text-editor-muted font-medium mb-1 block">Height (px)</label>
          <input
            type="number"
            min={1}
            value={height}
            onChange={(e) => onHeightChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-editor-border rounded-md text-sm"
          />
        </div>
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        {[25, 50, 75, 100, 150, 200].map((pct) => (
          <button
            key={pct}
            onClick={() => {
              const w = Math.round(original.width * (pct / 100));
              const h = Math.round(original.height * (pct / 100));
              setWidth(w);
              setHeight(h);
            }}
            className="py-2 text-xs font-medium border border-editor-border rounded-md hover:border-editor-active hover:bg-blue-50 transition-colors"
          >
            {pct}%
          </button>
        ))}
      </div>

      <button
        onClick={applyResize}
        className="w-full py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        Apply Resize
      </button>
    </div>
  );
}
