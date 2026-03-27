import { Rect, Circle, Triangle, Line, Polygon } from 'fabric';
import { BaseTool } from './BaseTool';
import type { ShapeOptions } from '../types';

export class ShapesTool extends BaseTool {
  activate() {
    this.cm.canvas.selection = true;
  }

  deactivate() {
    /* nothing special */
  }

  addShape(opts: ShapeOptions) {
    const bg = this.cm.getBackgroundImage();
    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    const common = {
      left: cx,
      top: cy,
      originX: 'center' as const,
      originY: 'center' as const,
      fill: opts.fill,
      stroke: opts.stroke,
      strokeWidth: opts.strokeWidth,
      opacity: opts.opacity,
    };

    let shape;
    switch (opts.type) {
      case 'rect':
        shape = new Rect({ ...common, width: 120, height: 80 });
        break;
      case 'circle':
        shape = new Circle({ ...common, radius: 60 });
        break;
      case 'triangle':
        shape = new Triangle({ ...common, width: 120, height: 100 });
        break;
      case 'line':
        shape = new Line([cx - 60, cy, cx + 60, cy], {
          stroke: opts.stroke || opts.fill,
          strokeWidth: opts.strokeWidth || 3,
          originX: 'center',
          originY: 'center',
        });
        break;
      case 'polygon':
        shape = new Polygon(this.hexPoints(cx, cy, 60), common);
        break;
      case 'star':
        shape = new Polygon(this.starPoints(cx, cy, 60, 30, 5), common);
        break;
      default:
        shape = new Rect({ ...common, width: 100, height: 100 });
    }

    this.cm.addObject(shape);
  }

  private hexPoints(cx: number, cy: number, r: number) {
    return Array.from({ length: 6 }, (_, i) => ({
      x: cx + r * Math.cos((Math.PI / 3) * i - Math.PI / 6),
      y: cy + r * Math.sin((Math.PI / 3) * i - Math.PI / 6),
    }));
  }

  private starPoints(cx: number, cy: number, outer: number, inner: number, points: number) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    }
    return pts;
  }
}
