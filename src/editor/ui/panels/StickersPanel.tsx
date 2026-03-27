import { useState } from 'react';
import { useEditor } from '../../EditorContext';
import { STICKER_CATEGORIES } from '../../tools/StickerTool';
import clsx from 'clsx';

export function StickersPanel() {
  const { tools, saveHistory } = useEditor();
  const [activeCategory, setActiveCategory] = useState(STICKER_CATEGORIES[0].name);
  const [size, setSize] = useState(64);

  const category = STICKER_CATEGORIES.find((c) => c.name === activeCategory) ?? STICKER_CATEGORIES[0];

  const addSticker = (emoji: string) => {
    tools.stickers?.addEmoji(emoji, size);
    saveHistory();
  };

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={clsx(
              'px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors',
              activeCategory === cat.name
                ? 'border-editor-active bg-blue-50 text-editor-active'
                : 'border-editor-border text-editor-text hover:border-gray-300',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-4 gap-1">
        {category.stickers.map((emoji, i) => (
          <button
            key={i}
            onClick={() => addSticker(emoji)}
            className="text-2xl p-2.5 rounded-lg hover:bg-editor-hover transition-colors text-center"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Size */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-editor-text font-medium">Size</span>
          <span className="text-xs text-editor-muted tabular-nums">{size}px</span>
        </div>
        <input
          type="range"
          min={24}
          max={120}
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
