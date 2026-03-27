import { PencilBrush, SprayBrush } from 'fabric';
import { BaseTool } from './BaseTool';
import type { DrawOptions } from '../types';

export class DrawTool extends BaseTool {
  private options: DrawOptions = {
    color: '#000000',
    width: 5,
    mode: 'pencil',
    opacity: 1,
  };

  activate() {
    const canvas = this.cm.canvas;
    canvas.isDrawingMode = true;
    this.applyBrush();
  }

  deactivate() {
    this.cm.canvas.isDrawingMode = false;
  }

  setOptions(opts: Partial<DrawOptions>) {
    Object.assign(this.options, opts);
    if (this.cm.canvas.isDrawingMode) this.applyBrush();
  }

  getOptions(): DrawOptions {
    return { ...this.options };
  }

  private applyBrush() {
    const canvas = this.cm.canvas;
    let brush;

    if (this.options.mode === 'spray') {
      brush = new SprayBrush(canvas);
      brush.density = 20;
    } else {
      brush = new PencilBrush(canvas);
    }

    brush.color = this.options.color;
    brush.width = this.options.width;

    if (this.options.mode === 'eraser') {
      brush.color = '#ffffff';
    }

    canvas.freeDrawingBrush = brush;
  }
}
