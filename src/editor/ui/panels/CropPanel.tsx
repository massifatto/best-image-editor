import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import clsx from 'clsx';

const aspects = [
  { label: 'Free', value: null },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '9:16', value: 9 / 16 },
];

export function CropPanel() {
  const { tools, saveHistory } = useEditor();
  const [activeAspect, setActiveAspect] = useState<string>('Free');

  const applyCrop = async () => {
    await tools.crop?.applyCrop();
    saveHistory();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-editor-muted uppercase tracking-wider mb-2">
          Aspect Ratio
        </h3>
        <div className="flex flex-wrap gap-2">
          {aspects.map((a) => (
            <button
              key={a.label}
              onClick={() => {
                setActiveAspect(a.label);
                tools.crop?.setAspectRatio(a.value);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                activeAspect === a.label
                  ? 'border-editor-active bg-blue-50 text-editor-active'
                  : 'border-editor-border text-editor-text hover:border-gray-300',
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={applyCrop}
          className="flex-1 py-2 bg-editor-active text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Apply Crop
        </button>
        <button
          onClick={() => tools.crop?.deactivate()}
          className="flex-1 py-2 border border-editor-border rounded-lg text-sm font-medium text-editor-text hover:bg-editor-hover transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
