import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import clsx from 'clsx';

const colors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#92400e', '#0d9488',
];

const modes = [
  { id: 'pencil' as const, label: 'Pencil' },
  { id: 'spray' as const, label: 'Spray' },
  { id: 'eraser' as const, label: 'Eraser' },
];

export function DrawPanel() {
  const { tools, saveHistory } = useEditor();
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(5);
  const [mode, setMode] = useState<'pencil' | 'spray' | 'eraser'>('pencil');

  const update = (opts: Record<string, any>) => {
    tools.draw?.setOptions(opts);
  };

  return (
    <div className="space-y-4">
      {/* Mode */}
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">Mode</h3>
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                update({ mode: m.id });
              }}
              className={clsx(
                'flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors',
                mode === m.id
                  ? 'border-editor-active bg-blue-50 text-editor-active'
                  : 'border-editor-border text-editor-text hover:border-gray-300',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      {mode !== 'eraser' && (
        <div>
          <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  update({ color: c });
                }}
                className={clsx(
                  'w-8 h-8 rounded-full border-2 transition-transform',
                  color === c ? 'border-editor-active scale-110' : 'border-gray-200',
                )}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                update({ color: e.target.value });
              }}
              className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
            />
          </div>
        </div>
      )}

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-editor-text font-medium">Brush Size</span>
          <span className="text-xs text-editor-muted tabular-nums">{width}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={80}
          value={width}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            setWidth(v);
            update({ width: v });
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
