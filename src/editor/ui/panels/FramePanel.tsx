import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { FRAME_PRESETS } from '../../tools/FrameTool';
import clsx from 'clsx';

export function FramePanel() {
  const { tools, saveHistory } = useEditor();
  const [active, setActive] = useState('None');

  const apply = (preset: (typeof FRAME_PRESETS)[0]) => {
    setActive(preset.name);
    tools.frame?.applyFrame(preset);
    saveHistory();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-3">Frame Style</h3>
      <div className="grid grid-cols-2 gap-2">
        {FRAME_PRESETS.map((p) => (
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
            <div className="w-14 h-11 bg-gray-100 rounded relative">
              {p.name !== 'None' && p.style !== 'shadow' && (
                <div
                  className="absolute inset-0 rounded"
                  style={{
                    border: `${Math.min(p.width, 4)}px ${p.style === 'double' ? 'double' : 'solid'} ${p.color}`,
                  }}
                />
              )}
              {p.style === 'shadow' && (
                <div className="absolute inset-1 bg-white rounded shadow-lg" />
              )}
            </div>
            <span className="text-[11px] text-editor-text">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
