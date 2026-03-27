import { useEditor } from '../EditorContext';
import { FilterPanel } from './panels/FilterPanel';
import { CropPanel } from './panels/CropPanel';
import { DrawPanel } from './panels/DrawPanel';
import { TextPanel } from './panels/TextPanel';
import { ShapesPanel } from './panels/ShapesPanel';
import { StickersPanel } from './panels/StickersPanel';
import { FramePanel } from './panels/FramePanel';
import { CornersPanel } from './panels/CornersPanel';
import { ResizePanel } from './panels/ResizePanel';
import { MergePanel } from './panels/MergePanel';
import { AIPanel } from './panels/AIPanel';
import { X } from 'lucide-react';

const panelMap: Record<string, { label: string; Component: React.FC }> = {
  filter: { label: 'Filters', Component: FilterPanel },
  crop: { label: 'Crop', Component: CropPanel },
  draw: { label: 'Draw', Component: DrawPanel },
  text: { label: 'Text', Component: TextPanel },
  shapes: { label: 'Shapes', Component: ShapesPanel },
  stickers: { label: 'Stickers', Component: StickersPanel },
  frame: { label: 'Frame', Component: FramePanel },
  corners: { label: 'Corners', Component: CornersPanel },
  resize: { label: 'Resize', Component: ResizePanel },
  merge: { label: 'Merge', Component: MergePanel },
  ai: { label: 'AI Actions', Component: AIPanel },
};

export function ToolPanel() {
  const { activeTool, setActiveTool } = useEditor();
  if (!activeTool) return null;

  const entry = panelMap[activeTool];
  if (!entry) return null;

  const { label, Component } = entry;

  return (
    <div className="w-[300px] shrink-0 bg-editor-surface border-r border-editor-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
        <h2 className="text-sm font-semibold text-editor-text">{label}</h2>
        <button
          onClick={() => setActiveTool(null)}
          className="p-1 rounded-md text-editor-muted hover:bg-editor-hover hover:text-editor-text transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <Component />
      </div>
    </div>
  );
}
