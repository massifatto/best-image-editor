import { Canvas, FabricImage, FabricObject, filters, util } from 'fabric';

export class CanvasManager {
  canvas: Canvas;
  private bgImage: FabricImage | null = null;
  private containerEl: HTMLElement;
  private _onChangeCallbacks: Array<() => void> = [];

  constructor(canvasEl: HTMLCanvasElement, container: HTMLElement) {
    this.containerEl = container;
    this.canvas = new Canvas(canvasEl, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff',
    });
    this.fitToContainer();
  }

  fitToContainer() {
    const rect = this.containerEl.getBoundingClientRect();
    const w = Math.max(rect.width, 100);
    const h = Math.max(rect.height, 100);
    this.canvas.setDimensions({ width: w, height: h });
    this.canvas.renderAll();
  }

  async loadImage(src: string): Promise<void> {
    this.fitToContainer();

    const loadOpts = src.startsWith('data:') ? {} : { crossOrigin: 'anonymous' as const };
    const img = await FabricImage.fromURL(src, loadOpts);

    if (!img.width || !img.height) {
      throw new Error(`Image has zero dimensions: ${img.width}x${img.height}`);
    }

    this.bgImage = img;

    const cw = this.canvas.width!;
    const ch = this.canvas.height!;
    const scale = Math.min(
      (cw * 0.85) / img.width,
      (ch * 0.85) / img.height,
      1,
    );

    img.set({
      scaleX: scale,
      scaleY: scale,
      left: (cw - img.width * scale) / 2,
      top: (ch - img.height * scale) / 2,
      selectable: false,
      evented: false,
    });

    this.canvas.clear();
    this.canvas.backgroundColor = '#f0f0f0';
    this.canvas.add(img);
    this.canvas.sendObjectToBack(img);
    this.canvas.renderAll();
    this.notifyChange();
  }

  async loadImageFromDataUrl(dataUrl: string): Promise<void> {
    await this.loadImage(dataUrl);
  }

  getBackgroundImage(): FabricImage | null {
    return this.bgImage;
  }

  getImageDataURL(format = 'png', quality = 1): string {
    if (!this.bgImage) return '';

    const bg = this.bgImage;
    const left = bg.left!;
    const top = bg.top!;
    const width = bg.width! * bg.scaleX!;
    const height = bg.height! * bg.scaleY!;

    return this.canvas.toDataURL({
      format: format as 'png' | 'jpeg',
      quality,
      left,
      top,
      width,
      height,
    } as any);
  }

  addObject(obj: FabricObject) {
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
    this.notifyChange();
  }

  removeActive() {
    const active = this.canvas.getActiveObjects();
    if (active.length) {
      active.forEach((obj) => {
        if (obj !== this.bgImage) this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
      this.notifyChange();
    }
  }

  getActiveObject(): FabricObject | null {
    return this.canvas.getActiveObject() ?? null;
  }

  getAllObjects(): FabricObject[] {
    return this.canvas.getObjects();
  }

  getNonBgObjects(): FabricObject[] {
    return this.canvas.getObjects().filter((o) => o !== this.bgImage);
  }

  applyFilter(filter: InstanceType<typeof filters.BaseFilter>) {
    if (!this.bgImage) return;
    this.bgImage.filters!.push(filter);
    this.bgImage.applyFilters();
    this.canvas.renderAll();
    this.notifyChange();
  }

  clearFilters() {
    if (!this.bgImage) return;
    this.bgImage.filters = [];
    this.bgImage.applyFilters();
    this.canvas.renderAll();
    this.notifyChange();
  }

  setFilters(filterList: InstanceType<typeof filters.BaseFilter>[]) {
    if (!this.bgImage) return;
    this.bgImage.filters = filterList;
    this.bgImage.applyFilters();
    this.canvas.renderAll();
    this.notifyChange();
  }

  toJSON(): string {
    return JSON.stringify(this.canvas.toJSON());
  }

  async loadFromJSON(json: string): Promise<void> {
    const parsed = JSON.parse(json);
    await this.canvas.loadFromJSON(parsed);
    const objects = this.canvas.getObjects();
    const img = objects.find((o) => o instanceof FabricImage && !(o as any)._isFrame);
    if (img) {
      this.bgImage = img as FabricImage;
      this.bgImage.set({ selectable: false, evented: false });
    }
    this.canvas.renderAll();
  }

  bringForward(obj: FabricObject) {
    this.canvas.bringObjectForward(obj);
    this.canvas.renderAll();
  }

  sendBackward(obj: FabricObject) {
    this.canvas.sendObjectBackwards(obj);
    this.canvas.renderAll();
  }

  setObjectVisibility(obj: FabricObject, visible: boolean) {
    obj.set({ visible });
    this.canvas.renderAll();
  }

  renderAll() {
    this.canvas.renderAll();
  }

  onChange(cb: () => void) {
    this._onChangeCallbacks.push(cb);
    return () => {
      this._onChangeCallbacks = this._onChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyChange() {
    this._onChangeCallbacks.forEach((cb) => cb());
  }

  dispose() {
    this.canvas.dispose();
    this._onChangeCallbacks = [];
  }
}
