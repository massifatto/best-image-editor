import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { FILTER_PRESETS } from '../../tools/FilterTool';
import clsx from 'clsx';

export function FilterPanel() {
  const { tools, saveHistory } = useEditor();
  const [active, setActive] = useState('None');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);

  const applyPreset = (preset: (typeof FILTER_PRESETS)[0]) => {
    setActive(preset.name);
    tools.filter?.applyPreset(preset);
    saveHistory();
  };

  return (
    <div className="space-y-4">
      {/* Preset Grid */}
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-3">Presets</h3>
        <div className="grid grid-cols-3 gap-2">
          {FILTER_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-2 rounded-lg border text-xs transition-colors',
                active === p.name
                  ? 'border-editor-active bg-blue-50 text-editor-active'
                  : 'border-editor-border hover:border-gray-300 text-editor-text',
              )}
            >
              <div
                className={clsx(
                  'w-full aspect-square rounded-md bg-gradient-to-br',
                  p.name === 'None' && 'from-gray-100 to-gray-200',
                  p.name === 'Grayscale' && 'from-gray-400 to-gray-600',
                  p.name === 'Sepia' && 'from-amber-200 to-amber-400',
                  p.name === 'Vintage' && 'from-amber-300 to-yellow-600',
                  p.name === 'Bright' && 'from-yellow-100 to-orange-200',
                  p.name === 'High Contrast' && 'from-gray-800 to-white',
                  p.name === 'Warm' && 'from-orange-200 to-red-300',
                  p.name === 'Cool' && 'from-blue-200 to-cyan-300',
                  p.name === 'Blur' && 'from-gray-200 to-gray-300',
                  p.name === 'Sharpen' && 'from-gray-300 to-gray-500',
                  p.name === 'Invert' && 'from-gray-900 to-gray-700',
                  p.name === 'B&W High' && 'from-black to-gray-400',
                )}
              />
              <span className="truncate w-full text-center leading-tight">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Adjustments */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider">Adjustments</h3>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-editor-text font-medium">Brightness</span>
            <span className="text-xs text-editor-muted tabular-nums">{Math.round(brightness * 100)}</span>
          </div>
          <input
            type="range"
            min={-0.5}
            max={0.5}
            step={0.01}
            value={brightness}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setBrightness(v);
              tools.filter?.adjustBrightness(v);
            }}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-editor-text font-medium">Contrast</span>
            <span className="text-xs text-editor-muted tabular-nums">{Math.round(contrast * 100)}</span>
          </div>
          <input
            type="range"
            min={-0.5}
            max={0.5}
            step={0.01}
            value={contrast}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setContrast(v);
              tools.filter?.adjustContrast(v);
            }}
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-editor-text font-medium">Saturation</span>
            <span className="text-xs text-editor-muted tabular-nums">{Math.round(saturation * 100)}</span>
          </div>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={saturation}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setSaturation(v);
              tools.filter?.adjustSaturation(v);
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
