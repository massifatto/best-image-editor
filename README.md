# Image Editor

An embeddable image editor built with React, TypeScript, and Fabric.js.

## Quick Start

```bash
npm install
npm run dev        # Vite dev server on :3000
npm run server     # AI proxy server on :3001 (optional, for AI features)
```

## Embedding

```tsx
import { ImageEditor } from './editor';

<ImageEditor
  src="/path/to/image.jpg"
  onSave={(dataUrl) => uploadToServer(dataUrl)}
/>
```

## Core Tools

| Tool | Description |
|------|-------------|
| **Filter** | 12 presets (Grayscale, Sepia, Vintage, etc.) + manual brightness/contrast/saturation |
| **Resize** | Pixel-precise with aspect lock, quick % presets |
| **Crop** | Free-form or locked aspect ratio (1:1, 4:3, 16:9, etc.) |
| **Draw** | Pencil, spray, eraser modes with color/size controls |
| **Text** | Interactive text with font, size, style, alignment, color |
| **Shapes** | Rectangle, circle, triangle, line, hexagon, star |
| **Stickers** | 72 emoji stickers across 6 categories |
| **Frame** | 8 frame presets (solid, double, shadow) |
| **Corners** | 6 corner-radius presets + custom slider |
| **Merge** | Overlay additional images as layers |
| **Layers** | Visibility toggles, reorder, delete |
| **History** | Undo/redo with 50-state stack |
| **Zoom/Pan** | Mouse wheel zoom, percentage display, reset |

## AI Plugin System

The `AIActionRegistry` is the centerpiece. Adding a new AI action is a single file:

```typescript
// src/editor/ai/actions/MyAction.ts
import type { IAIAction } from '../types';
import { AIActionRegistry } from '../AIActionRegistry';

const MyAction: IAIAction = {
  meta: {
    id: 'my-action',
    name: 'My Action',
    description: 'Does something cool with AI',
    icon: 'Wand2',
    category: 'enhance',
    requiresImage: true,
    params: [
      { key: 'strength', label: 'Strength', type: 'slider', default: 0.5, min: 0, max: 1, step: 0.1 },
    ],
  },
  async execute(imageDataUrl, params) {
    const result = await fetch('/api/ai/my-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, ...params }),
    });
    const data = await result.json();
    return { imageDataUrl: data.image };
  },
};

AIActionRegistry.register(MyAction);
export default MyAction;
```

Then import it in `ai/actions/index.ts` — the UI panel renders it automatically.

### Wired Actions

- **Background Removal** — Providers: remove.bg, PhotoRoom, fal.ai/birefnet
- **Text to Image** — Providers: Stability AI, DALL-E 3, Replicate, fal.ai/flux

### Stubs (ready to wire)

- **Inpainting** — Mask draw mode + fill prompt
- **Upscaling** — 2x/4x AI super-resolution

### Provider Swapping

Change one line in `.env`:

```env
AI_BG_REMOVAL_PROVIDER=falai-rembg    # or: removebg, photoroom
AI_TEXT_TO_IMAGE_PROVIDER=falai        # or: stability, dalle, replicate
```

Zero UI changes required.

## Architecture

```
src/editor/
├── canvas/           # Fabric.js engine wrappers
│   ├── CanvasManager.ts    # Core canvas operations
│   ├── HistoryManager.ts   # Undo/redo (JSON snapshots)
│   └── ZoomManager.ts      # Zoom/pan with wheel support
├── tools/            # Tool logic classes
├── ui/               # React UI components
│   ├── Toolbar.tsx         # Bottom tool bar
│   ├── TopBar.tsx          # Undo/redo, zoom, export
│   ├── ToolPanel.tsx       # Dynamic panel renderer
│   ├── LayersPanel.tsx     # Layer management sidebar
│   └── panels/             # One panel per tool + AI panel
├── ai/               # AI plugin system
│   ├── AIActionRegistry.ts # Singleton registry
│   ├── types.ts            # IAIAction interface
│   ├── providers.ts        # Provider abstraction layer
│   └── actions/            # Self-registering action files
├── EditorContext.tsx  # React context (state + tool refs)
├── ImageEditor.tsx    # Main embeddable component
└── types.ts           # Shared type definitions
```

## Tech Stack

- **Canvas**: Fabric.js 6
- **UI**: React 18 + TypeScript + Tailwind CSS
- **Icons**: Lucide React
- **Build**: Vite 6
- **AI Proxy**: Express (for API key security)
