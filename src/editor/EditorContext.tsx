import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { CanvasManager } from './canvas/CanvasManager';
import { HistoryManager } from './canvas/HistoryManager';
import { ZoomManager } from './canvas/ZoomManager';
import { CropTool, DrawTool, TextTool, ShapesTool, FilterTool, FrameTool, ResizeTool, StickerTool, CornersTool, MergeTool } from './tools';
import type { ToolType } from './types';

interface EditorContextValue {
  canvasManager: CanvasManager | null;
  historyManager: HistoryManager | null;
  zoomManager: ZoomManager | null;
  tools: {
    crop: CropTool | null;
    draw: DrawTool | null;
    text: TextTool | null;
    shapes: ShapesTool | null;
    filter: FilterTool | null;
    frame: FrameTool | null;
    resize: ResizeTool | null;
    stickers: StickerTool | null;
    corners: CornersTool | null;
    merge: MergeTool | null;
  };
  activeTool: ToolType | null;
  setActiveTool: (tool: ToolType | null) => void;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  showLayers: boolean;
  setShowLayers: (v: boolean) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used inside EditorProvider');
  return ctx;
}

interface Props {
  children: ReactNode;
  canvasEl: HTMLCanvasElement | null;
  containerEl: HTMLElement | null;
}

export function EditorProvider({ children, canvasEl, containerEl }: Props) {
  const cmRef = useRef<CanvasManager | null>(null);
  const hmRef = useRef<HistoryManager | null>(null);
  const zmRef = useRef<ZoomManager | null>(null);

  const cropRef = useRef<CropTool | null>(null);
  const drawRef = useRef<DrawTool | null>(null);
  const textRef = useRef<TextTool | null>(null);
  const shapesRef = useRef<ShapesTool | null>(null);
  const filterRef = useRef<FilterTool | null>(null);
  const frameRef = useRef<FrameTool | null>(null);
  const resizeRef = useRef<ResizeTool | null>(null);
  const stickersRef = useRef<StickerTool | null>(null);
  const cornersRef = useRef<CornersTool | null>(null);
  const mergeRef = useRef<MergeTool | null>(null);

  const [activeTool, setActiveToolState] = useState<ToolType | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!canvasEl || !containerEl) return;
    if (cmRef.current) return;

    const cm = new CanvasManager(canvasEl, containerEl);
    const hm = new HistoryManager(cm);
    const zm = new ZoomManager(cm);

    cmRef.current = cm;
    hmRef.current = hm;
    zmRef.current = zm;

    cropRef.current = new CropTool(cm);
    drawRef.current = new DrawTool(cm);
    textRef.current = new TextTool(cm);
    shapesRef.current = new ShapesTool(cm);
    filterRef.current = new FilterTool(cm);
    frameRef.current = new FrameTool(cm);
    resizeRef.current = new ResizeTool(cm);
    stickersRef.current = new StickerTool(cm);
    cornersRef.current = new CornersTool(cm);
    mergeRef.current = new MergeTool(cm);

    zm.onZoomChange((z) => setZoom(z));
    hm.onStateChange(() => {
      setCanUndo(hm.canUndo);
      setCanRedo(hm.canRedo);
    });

    hm.saveState();
    setInitialized(true);

    return () => {
      cm.dispose();
      cmRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasEl, containerEl]);

  const activeToolRef = useRef<ToolType | null>(null);

  const deactivateCurrentTool = useCallback(() => {
    const current = activeToolRef.current;
    if (!current) return;
    const toolMap: Record<string, { deactivate: () => void } | null> = {
      crop: cropRef.current,
      draw: drawRef.current,
      text: textRef.current,
      shapes: shapesRef.current,
      filter: filterRef.current,
      frame: frameRef.current,
      resize: resizeRef.current,
      stickers: stickersRef.current,
      corners: cornersRef.current,
      merge: mergeRef.current,
    };
    toolMap[current]?.deactivate();
  }, []);

  const setActiveTool = useCallback(
    (tool: ToolType | null) => {
      deactivateCurrentTool();
      activeToolRef.current = tool;
      setActiveToolState(tool);
      if (!tool) return;

      const toolMap: Record<string, { activate: () => void } | null> = {
        crop: cropRef.current,
        draw: drawRef.current,
        text: textRef.current,
        shapes: shapesRef.current,
        filter: filterRef.current,
        frame: frameRef.current,
        resize: resizeRef.current,
        stickers: stickersRef.current,
        corners: cornersRef.current,
        merge: mergeRef.current,
      };
      toolMap[tool]?.activate();
    },
    [deactivateCurrentTool],
  );

  const undo = useCallback(async () => {
    await hmRef.current?.undo();
  }, []);

  const redo = useCallback(async () => {
    await hmRef.current?.redo();
  }, []);

  const saveHistory = useCallback(() => {
    hmRef.current?.saveState();
  }, []);

  const value: EditorContextValue = {
    canvasManager: cmRef.current,
    historyManager: hmRef.current,
    zoomManager: zmRef.current,
    tools: {
      crop: cropRef.current,
      draw: drawRef.current,
      text: textRef.current,
      shapes: shapesRef.current,
      filter: filterRef.current,
      frame: frameRef.current,
      resize: resizeRef.current,
      stickers: stickersRef.current,
      corners: cornersRef.current,
      merge: mergeRef.current,
    },
    activeTool,
    setActiveTool,
    zoom,
    canUndo,
    canRedo,
    undo,
    redo,
    saveHistory,
    isLoading,
    setIsLoading,
    showLayers,
    setShowLayers,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
