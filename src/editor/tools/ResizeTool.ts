import { BaseTool } from './BaseTool';
import type { ResizeConfig } from '../types';

export class ResizeTool extends BaseTool {
  activate() {
    /* nothing special */
  }

  deactivate() {
    /* nothing special */
  }

  getCurrentSize(): { width: number; height: number } {
    const bg = this.cm.getBackgroundImage();
    if (!bg) return { width: 0, height: 0 };
    return {
      width: Math.round(bg.width! * bg.scaleX!),
      height: Math.round(bg.height! * bg.scaleY!),
    };
  }

  getOriginalSize(): { width: number; height: number } {
    const bg = this.cm.getBackgroundImage();
    if (!bg) return { width: 0, height: 0 };
    return { width: bg.width!, height: bg.height! };
  }

  async applyResize(config: ResizeConfig): Promise<void> {
    const bg = this.cm.getBackgroundImage();
    if (!bg) return;

    const currentW = bg.width! * bg.scaleX!;
    const currentH = bg.height! * bg.scaleY!;

    const scaleX = config.width / bg.width!;
    const scaleY = config.height / bg.height!;

    bg.set({ scaleX, scaleY });

    const dx = (config.width - currentW) / 2;
    const dy = (config.height - currentH) / 2;
    bg.set({ left: bg.left! - dx, top: bg.top! - dy });

    this.cm.renderAll();
  }
}
