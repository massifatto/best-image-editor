import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Image, Type, Shapes, Pencil } from 'lucide-react';
import { useEditor } from '../EditorContext';
import { FabricImage, IText, Rect, Circle, Triangle, Polygon, Path } from 'fabric';
import { useState, useEffect } from 'react';

interface LayerItem {
  id: number;
  name: string;
  icon: React.FC<any>;
  visible: boolean;
  isBg: boolean;
}

function getLayerIcon(obj: any): React.FC<any> {
  if (obj instanceof FabricImage) return Image;
  if (obj instanceof IText) return Type;
  if (obj instanceof Path) return Pencil;
  if (obj instanceof Rect || obj instanceof Circle || obj instanceof Triangle || obj instanceof Polygon) return Shapes;
  return Shapes;
}

function getLayerName(obj: any, idx: number): string {
  if (obj instanceof IText) return `Text: "${(obj.text || '').slice(0, 15)}"`;
  if (obj instanceof FabricImage) return `Image ${idx}`;
  if (obj instanceof Path) return `Drawing ${idx}`;
  if (obj instanceof Rect) return 'Rectangle';
  if (obj instanceof Circle) return 'Circle';
  if (obj instanceof Triangle) return 'Triangle';
  if (obj instanceof Polygon) return 'Polygon';
  return `Object ${idx}`;
}

export function LayersPanel() {
  const { canvasManager, showLayers, saveHistory } = useEditor();
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const refresh = () => {
    if (!canvasManager) return;
    const bg = canvasManager.getBackgroundImage();
    const objects = canvasManager.getAllObjects();
    setLayers(
      objects.map((obj, i) => ({
        id: i,
        name: obj === bg ? 'Background' : getLayerName(obj, i),
        icon: getLayerIcon(obj),
        visible: obj.visible !== false,
        isBg: obj === bg,
      })).reverse(),
    );
  };

  useEffect(() => {
    refresh();
    const unsub = canvasManager?.onChange(refresh);
    return () => unsub?.();
  }, [canvasManager]);

  if (!showLayers) return null;

  const objects = canvasManager?.getAllObjects() ?? [];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-56 bg-editor-surface border-l border-editor-border flex flex-col z-20 shadow-lg">
      <div className="px-3 py-2 border-b border-editor-border text-sm font-semibold text-editor-text">
        Layers
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {layers.map((layer) => {
          const Icon = layer.icon;
          const obj = objects[objects.length - 1 - layers.indexOf(layer)];
          return (
            <div
              key={layer.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-editor-hover text-sm border-b border-editor-border/50"
            >
              <Icon size={14} className="text-editor-muted shrink-0" />
              <span className="flex-1 truncate text-editor-text">{layer.name}</span>
              <button
                onClick={() => {
                  if (obj) canvasManager?.setObjectVisibility(obj, !layer.visible);
                  refresh();
                }}
                className="p-0.5 text-editor-muted hover:text-editor-text"
              >
                {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              {!layer.isBg && (
                <>
                  <button
                    onClick={() => {
                      if (obj) {
                        canvasManager?.bringForward(obj);
                        refresh();
                      }
                    }}
                    className="p-0.5 text-editor-muted hover:text-editor-text"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (obj) {
                        canvasManager?.sendBackward(obj);
                        refresh();
                      }
                    }}
                    className="p-0.5 text-editor-muted hover:text-editor-text"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (obj) {
                        canvasManager?.canvas.remove(obj);
                        saveHistory();
                        refresh();
                      }
                    }}
                    className="p-0.5 text-editor-muted hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          );
        })}
        {layers.length === 0 && (
          <div className="px-3 py-6 text-center text-editor-muted text-sm">No layers</div>
        )}
      </div>
    </div>
  );
}
