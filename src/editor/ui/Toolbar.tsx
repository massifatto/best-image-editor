import {
  SlidersHorizontal,
  Scaling,
  Crop,
  Pencil,
  Type,
  Shapes,
  SmilePlus,
  Frame,
  RectangleHorizontal,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useEditor } from '../EditorContext';
import type { ToolType } from '../types';
import clsx from 'clsx';

const tools: { id: ToolType; label: string; Icon: React.FC<any> }[] = [
  { id: 'filter', label: 'Filter', Icon: SlidersHorizontal },
  { id: 'resize', label: 'Resize', Icon: Scaling },
  { id: 'crop', label: 'Crop', Icon: Crop },
  { id: 'draw', label: 'Draw', Icon: Pencil },
  { id: 'text', label: 'Text', Icon: Type },
  { id: 'shapes', label: 'Shapes', Icon: Shapes },
  { id: 'stickers', label: 'Stickers', Icon: SmilePlus },
  { id: 'frame', label: 'Frame', Icon: Frame },
  { id: 'corners', label: 'Corners', Icon: RectangleHorizontal },
  { id: 'merge', label: 'Merge', Icon: Layers },
  { id: 'ai', label: 'AI', Icon: Sparkles },
];

export function Toolbar() {
  const { activeTool, setActiveTool } = useEditor();

  return (
    <div className="flex flex-col items-center gap-0.5 py-3 px-1 bg-editor-surface border-r border-editor-border overflow-y-auto scrollbar-thin w-[68px] shrink-0">
      {tools.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTool(activeTool === id ? null : id)}
          className={clsx(
            'flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-lg transition-colors w-full',
            activeTool === id
              ? 'bg-blue-50 text-editor-active'
              : 'text-editor-muted hover:bg-editor-hover hover:text-editor-text',
          )}
        >
          <Icon size={19} strokeWidth={activeTool === id ? 2.5 : 1.8} />
          <span className="text-[10px] font-medium leading-none">{label}</span>
        </button>
      ))}
    </div>
  );
}
