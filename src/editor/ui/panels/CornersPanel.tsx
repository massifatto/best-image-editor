import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { CORNER_PRESETS } from '../../tools/CornersTool';
import clsx from 'clsx';

export function CornersPanel() {
  const { tools, saveHistory } = useEditor();
  const [active, setActive] = useState('None');
  const [customRadius, setCustomRadius] = useState(20);

  const apply = async (preset: (typeof CORNER_PRESETS)[0]) => {
    setActive(preset.name);
    await tools.corners?.applyCorners(preset.radius);
    saveHistory();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-3">Corner Radius</h3>
      <div className="grid grid-cols-3 gap-2">
        {CORNER_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => apply(p)}
            className={clsx(
              'flex flex-col items-center gap-2 py-3 rounded-lg border transition-colors',
              active === p.name
                ? 'border-editor-active bg-blue-50'
                : 'border-editor-border hover:border-gray-300',
            )}
          >
            <div
              className="w-12 h-10 bg-gray-300"
              style={{
                borderRadius: p.radius === -1 ? '50%' : `${Math.min(p.radius, 16)}px`,
              }}
            />
            <span className="text-[11px] text-editor-text">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-editor-text font-medium">Custom Radius</span>
            <span className="text-xs text-editor-muted tabular-nums">{customRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            value={customRadius}
            onChange={(e) => setCustomRadius(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={async () => {
            setActive('custom');
            await tools.corners?.applyCorners(customRadius);
            saveHistory();
          }}
          className="w-full py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Apply Custom Corners
        </button>
      </div>
    </div>
  );
}
