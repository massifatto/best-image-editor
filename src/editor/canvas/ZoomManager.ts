import { CanvasManager } from './CanvasManager';
import { Point } from 'fabric';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

export class ZoomManager {
  private cm: CanvasManager;
  private _zoom = 1;
  private _isPanning = false;
  private _lastPosX = 0;
  private _lastPosY = 0;
  private _listeners: Array<(zoom: number) => void> = [];

  constructor(canvasManager: CanvasManager) {
    this.cm = canvasManager;
    this.setupWheelZoom();
  }

  get zoom(): number {
    return this._zoom;
  }

  get zoomPercent(): number {
    return Math.round(this._zoom * 100);
  }

  zoomIn() {
    this.zoomTo(Math.min(this._zoom + ZOOM_STEP, MAX_ZOOM));
  }

  zoomOut() {
    this.zoomTo(Math.max(this._zoom - ZOOM_STEP, MIN_ZOOM));
  }

  zoomTo(level: number) {
    const canvas = this.cm.canvas;
    const center = canvas.getCenterPoint();
    this._zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
    canvas.zoomToPoint(new Point(center.x, center.y), this._zoom);
    canvas.renderAll();
    this.notify();
  }

  resetZoom() {
    const canvas = this.cm.canvas;
    this._zoom = 1;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
    this.notify();
  }

  enablePan() {
    const canvas = this.cm.canvas;
    this._isPanning = true;
    canvas.defaultCursor = 'grab';
    canvas.selection = false;

    canvas.on('mouse:down', this.onMouseDown);
    canvas.on('mouse:move', this.onMouseMove);
    canvas.on('mouse:up', this.onMouseUp);
  }

  disablePan() {
    const canvas = this.cm.canvas;
    this._isPanning = false;
    canvas.defaultCursor = 'default';
    canvas.selection = true;

    canvas.off('mouse:down', this.onMouseDown);
    canvas.off('mouse:move', this.onMouseMove);
    canvas.off('mouse:up', this.onMouseUp);
  }

  private onMouseDown = (opt: any) => {
    if (!this._isPanning) return;
    const e = opt.e as MouseEvent;
    this.cm.canvas.defaultCursor = 'grabbing';
    this._lastPosX = e.clientX;
    this._lastPosY = e.clientY;
    (this.cm.canvas as any).__panning = true;
  };

  private onMouseMove = (opt: any) => {
    if (!(this.cm.canvas as any).__panning) return;
    const e = opt.e as MouseEvent;
    const vpt = this.cm.canvas.viewportTransform!;
    vpt[4] += e.clientX - this._lastPosX;
    vpt[5] += e.clientY - this._lastPosY;
    this._lastPosX = e.clientX;
    this._lastPosY = e.clientY;
    this.cm.canvas.requestRenderAll();
  };

  private onMouseUp = () => {
    (this.cm.canvas as any).__panning = false;
    this.cm.canvas.defaultCursor = this._isPanning ? 'grab' : 'default';
  };

  private setupWheelZoom() {
    this.cm.canvas.on('mouse:wheel', (opt) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let newZoom = this._zoom * (1 - delta / 500);
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      this._zoom = newZoom;

      const pointer = this.cm.canvas.getScenePoint(e);
      this.cm.canvas.zoomToPoint(pointer, newZoom);
      this.notify();
    });
  }

  onZoomChange(cb: (zoom: number) => void) {
    this._listeners.push(cb);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this._listeners.forEach((l) => l(this._zoom));
  }
}
