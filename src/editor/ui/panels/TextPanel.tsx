import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Plus } from 'lucide-react';
import clsx from 'clsx';

const fonts = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
];

const colors = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

export function TextPanel() {
  const { tools, saveHistory } = useEditor();
  const [font, setFont] = useState('Arial');
  const [size, setSize] = useState(32);
  const [color, setColor] = useState('#000000');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [align, setAlign] = useState('left');

  const addText = () => {
    tools.text?.addText({
      fontFamily: font,
      fontSize: size,
      fill: color,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textAlign: align,
      underline,
    });
    saveHistory();
  };

  const updateSelected = () => {
    tools.text?.updateSelected({
      fontFamily: font,
      fontSize: size,
      fill: color,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      textAlign: align,
      underline,
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={addText}
        className="w-full flex items-center justify-center gap-2 py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
      >
        <Plus size={16} />
        Add Text
      </button>

      <div className="grid grid-cols-2 gap-3">
        {/* Font */}
        <div>
          <label className="text-xs text-editor-muted font-medium mb-1 block">Font</label>
          <select
            value={font}
            onChange={(e) => {
              setFont(e.target.value);
              updateSelected();
            }}
            className="w-full px-2 py-1.5 border border-editor-border rounded-md text-sm bg-white"
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>
        {/* Size */}
        <div>
          <label className="text-xs text-editor-muted font-medium mb-1 block">Size</label>
          <input
            type="number"
            min={8}
            max={200}
            value={size}
            onChange={(e) => {
              setSize(parseInt(e.target.value) || 32);
              updateSelected();
            }}
            className="w-full px-2 py-1.5 border border-editor-border rounded-md text-sm"
          />
        </div>
      </div>

      {/* Style buttons */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider">Style</h3>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setBold(!bold); updateSelected(); }}
            className={clsx('flex-1 p-2 rounded-md border transition-colors flex justify-center', bold ? 'border-editor-active bg-blue-50' : 'border-editor-border')}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => { setItalic(!italic); updateSelected(); }}
            className={clsx('flex-1 p-2 rounded-md border transition-colors flex justify-center', italic ? 'border-editor-active bg-blue-50' : 'border-editor-border')}
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => { setUnderline(!underline); updateSelected(); }}
            className={clsx('flex-1 p-2 rounded-md border transition-colors flex justify-center', underline ? 'border-editor-active bg-blue-50' : 'border-editor-border')}
          >
            <Underline size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {(['left', 'center', 'right'] as const).map((a) => {
            const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
            return (
              <button
                key={a}
                onClick={() => { setAlign(a); updateSelected(); }}
                className={clsx('flex-1 p-2 rounded-md border transition-colors flex justify-center', align === a ? 'border-editor-active bg-blue-50' : 'border-editor-border')}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">Color</h3>
        <div className="flex flex-wrap gap-1.5">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                updateSelected();
              }}
              className={clsx(
                'w-7 h-7 rounded-full border-2 transition-transform',
                color === c ? 'border-editor-active scale-110' : 'border-gray-200',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
