import { Rect, FabricImage } from 'fabric';
import { BaseTool } from './BaseTool';
import type { CropRect } from '../types';

export class CropTool extends BaseTool {
  private overlay: Rect | null = null;
  private cropRect: Rect | null = null;

  activate() {
    const canvas = this.cm.canvas;
    canvas.selection = false;
    canvas.forEachObject((o) => o.set({ selectable: false, evented: false }));

    const bg = this.cm.getBackgroundImage();
    if (!bg) return;

    const left = bg.left!;
    const top = bg.top!;
    const width = bg.width! * bg.scaleX!;
    const height = bg.height! * bg.scaleY!;

    this.overlay = new Rect({
      left: 0,
      top: 0,
      width: canvas.width!,
      height: canvas.height!,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      evented: false,
      excludeFromExport: true,
    } as any);

    this.cropRect = new Rect({
      left,
      top,
      width,
      height,
      fill: 'transparent',
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#3b82f6',
      cornerSize: 10,
      transparentCorners: false,
      hasRotatingPoint: false,
      lockRotation: true,
      excludeFromExport: true,
    } as any);

    canvas.add(this.overlay);
    canvas.add(this.cropRect);
    canvas.setActiveObject(this.cropRect);
    canvas.renderAll();
  }

  deactivate() {
    if (this.overlay) this.cm.canvas.remove(this.overlay);
    if (this.cropRect) this.cm.canvas.remove(this.cropRect);
    this.overlay = null;
    this.cropRect = null;

    const canvas = this.cm.canvas;
    canvas.selection = true;
    canvas.forEachObject((o) => {
      if (o !== this.cm.getBackgroundImage()) {
        o.set({ selectable: true, evented: true });
      }
    });
    canvas.renderAll();
  }

  getCropRect(): CropRect | null {
    if (!this.cropRect) return null;
    return {
      left: this.cropRect.left!,
      top: this.cropRect.top!,
      width: this.cropRect.width! * this.cropRect.scaleX!,
      height: this.cropRect.height! * this.cropRect.scaleY!,
    };
  }

  setAspectRatio(ratio: number | null) {
    if (!this.cropRect) return;
    if (ratio === null) {
      this.cropRect.set({ lockUniScaling: false });
    } else {
      const w = this.cropRect.width! * this.cropRect.scaleX!;
      this.cropRect.set({
        height: w / ratio / this.cropRect.scaleY!,
        lockUniScaling: true,
      });
    }
    this.cm.canvas.renderAll();
  }

  async applyCrop(): Promise<void> {
    const rect = this.getCropRect();
    if (!rect) return;

    const dataUrl = this.cm.canvas.toDataURL({
      format: 'png',
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    } as any);

    this.deactivate();
    await this.cm.loadImageFromDataUrl(dataUrl);
  }
}
