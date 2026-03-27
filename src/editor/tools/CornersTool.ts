import { Rect, Group } from 'fabric';
import { BaseTool } from './BaseTool';

export const CORNER_PRESETS = [
  { name: 'None', radius: 0 },
  { name: 'Slight', radius: 8 },
  { name: 'Medium', radius: 20 },
  { name: 'Large', radius: 40 },
  { name: 'Extra Large', radius: 80 },
  { name: 'Circle', radius: -1 },
];

export class CornersTool extends BaseTool {
  private maskRect: Rect | null = null;

  activate() {
    /* nothing special */
  }

  deactivate() {
    if (this.maskRect) {
      this.cm.canvas.remove(this.maskRect);
      this.maskRect = null;
    }
  }

  async applyCorners(radius: number): Promise<void> {
    const bg = this.cm.getBackgroundImage();
    if (!bg) return;

    const w = bg.width! * bg.scaleX!;
    const h = bg.height! * bg.scaleY!;

    const r = radius === -1 ? Math.min(w, h) / 2 : radius;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const ctx = tempCanvas.getContext('2d')!;

    const sourceCanvas = this.cm.canvas.toCanvasElement(1, {
      left: bg.left!,
      top: bg.top!,
      width: w,
      height: h,
    } as any);

    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(sourceCanvas, 0, 0, w, h);

    const dataUrl = tempCanvas.toDataURL('image/png');
    await this.cm.loadImageFromDataUrl(dataUrl);
  }
}
