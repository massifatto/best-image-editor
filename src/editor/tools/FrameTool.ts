import { Rect, Shadow } from 'fabric';
import { BaseTool } from './BaseTool';
import type { FrameConfig } from '../types';

export const FRAME_PRESETS: FrameConfig[] = [
  { name: 'None', color: 'transparent', width: 0, style: 'solid', opacity: 1 },
  { name: 'Thin Black', color: '#000000', width: 4, style: 'solid', opacity: 1 },
  { name: 'White Classic', color: '#ffffff', width: 20, style: 'solid', opacity: 1 },
  { name: 'Gold', color: '#d4a574', width: 15, style: 'double', opacity: 1 },
  { name: 'Shadow', color: 'transparent', width: 0, style: 'shadow', opacity: 1 },
  { name: 'Dark Frame', color: '#1a1a1a', width: 12, style: 'solid', opacity: 1 },
  { name: 'Pastel', color: '#e8d5c4', width: 25, style: 'solid', opacity: 0.9 },
  { name: 'Blue Modern', color: '#3b82f6', width: 6, style: 'solid', opacity: 1 },
];

export class FrameTool extends BaseTool {
  private frameObjects: Rect[] = [];

  activate() {
    /* nothing special */
  }

  deactivate() {
    this.removeFrame();
  }

  applyFrame(config: FrameConfig) {
    this.removeFrame();
    if (config.name === 'None') return;

    const bg = this.cm.getBackgroundImage();
    if (!bg) return;

    const l = bg.left!;
    const t = bg.top!;
    const w = bg.width! * bg.scaleX!;
    const h = bg.height! * bg.scaleY!;

    if (config.style === 'shadow') {
      const shadow = new Rect({
        left: l,
        top: t,
        width: w,
        height: h,
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        selectable: false,
        evented: false,
        shadow: new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 20, offsetX: 5, offsetY: 5 }),
      } as any);
      (shadow as any)._isFrame = true;
      this.cm.canvas.add(shadow);
      this.frameObjects.push(shadow);
    } else if (config.style === 'double') {
      const outer = new Rect({
        left: l - config.width,
        top: t - config.width,
        width: w + config.width * 2,
        height: h + config.width * 2,
        fill: 'transparent',
        stroke: config.color,
        strokeWidth: config.width / 2,
        opacity: config.opacity,
        selectable: false,
        evented: false,
      } as any);
      const inner = new Rect({
        left: l - config.width / 3,
        top: t - config.width / 3,
        width: w + (config.width / 3) * 2,
        height: h + (config.width / 3) * 2,
        fill: 'transparent',
        stroke: config.color,
        strokeWidth: config.width / 4,
        opacity: config.opacity,
        selectable: false,
        evented: false,
      } as any);
      (outer as any)._isFrame = true;
      (inner as any)._isFrame = true;
      this.cm.canvas.add(outer);
      this.cm.canvas.add(inner);
      this.frameObjects.push(outer, inner);
    } else {
      const frame = new Rect({
        left: l - config.width,
        top: t - config.width,
        width: w + config.width * 2,
        height: h + config.width * 2,
        fill: 'transparent',
        stroke: config.color,
        strokeWidth: config.width,
        opacity: config.opacity,
        selectable: false,
        evented: false,
      } as any);
      (frame as any)._isFrame = true;
      this.cm.canvas.add(frame);
      this.frameObjects.push(frame);
    }

    this.cm.renderAll();
  }

  private removeFrame() {
    this.frameObjects.forEach((f) => this.cm.canvas.remove(f));
    const remaining = this.cm.canvas.getObjects().filter((o: any) => o._isFrame);
    remaining.forEach((o) => this.cm.canvas.remove(o));
    this.frameObjects = [];
    this.cm.renderAll();
  }
}
