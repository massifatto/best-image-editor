import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { Square, Circle, Triangle, Minus, Hexagon, Star } from 'lucide-react';
import type { ShapeOptions } from '../../types';
import clsx from 'clsx';

const shapes: { id: ShapeOptions['type']; label: string; Icon: React.FC<any> }[] = [
  { id: 'rect', label: 'Rectangle', Icon: Square },
  { id: 'circle', label: 'Circle', Icon: Circle },
  { id: 'triangle', label: 'Triangle', Icon: Triangle },
  { id: 'line', label: 'Line', Icon: Minus },
  { id: 'polygon', label: 'Hexagon', Icon: Hexagon },
  { id: 'star', label: 'Star', Icon: Star },
];

const colors = [
  '#3b82f6', '#ef4444', '#22c55e', '#f97316', '#eab308', '#8b5cf6',
  '#ec4899', '#000000', '#ffffff', '#6b7280', '#0d9488', '#92400e',
];

export function ShapesPanel() {
  const { tools, saveHistory } = useEditor();
  const [fill, setFill] = useState('#3b82f6');
  const [stroke, setStroke] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const addShape = (type: ShapeOptions['type']) => {
    tools.shapes?.addShape({ type, fill, stroke, strokeWidth, opacity: 1 });
    saveHistory();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-3">Shape</h3>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => addShape(id)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-lg border border-editor-border hover:border-editor-active hover:bg-blue-50 transition-colors"
            >
              <Icon size={22} className="text-editor-text" />
              <span className="text-[11px] text-editor-muted">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">Fill</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setFill(c)}
              className={clsx(
                'w-7 h-7 rounded-full border-2 transition-transform',
                fill === c ? 'border-editor-active scale-110' : 'border-gray-200',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">Stroke</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setStroke(c)}
              className={clsx(
                'w-7 h-7 rounded-full border-2 transition-transform',
                stroke === c ? 'border-editor-active scale-110' : 'border-gray-200',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-editor-text font-medium">Stroke Width</span>
          <span className="text-xs text-editor-muted tabular-nums">{strokeWidth}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
