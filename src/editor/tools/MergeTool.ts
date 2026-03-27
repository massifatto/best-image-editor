import { FabricImage } from 'fabric';
import { BaseTool } from './BaseTool';

export class MergeTool extends BaseTool {
  activate() {
    this.cm.canvas.selection = true;
  }

  deactivate() {
    /* nothing special */
  }

  async addImageLayer(file: File): Promise<void> {
    const dataUrl = await this.fileToDataUrl(file);
    const img = await FabricImage.fromURL(dataUrl);

    const bg = this.cm.getBackgroundImage();
    const maxW = bg ? bg.width! * bg.scaleX! * 0.5 : this.cm.canvas.width! * 0.5;
    const maxH = bg ? bg.height! * bg.scaleY! * 0.5 : this.cm.canvas.height! * 0.5;
    const scale = Math.min(maxW / img.width!, maxH / img.height!, 1);

    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    img.set({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
    });

    this.cm.addObject(img);
  }

  async addImageFromUrl(url: string): Promise<void> {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });

    const bg = this.cm.getBackgroundImage();
    const maxW = bg ? bg.width! * bg.scaleX! * 0.5 : this.cm.canvas.width! * 0.5;
    const maxH = bg ? bg.height! * bg.scaleY! * 0.5 : this.cm.canvas.height! * 0.5;
    const scale = Math.min(maxW / img.width!, maxH / img.height!, 1);

    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    img.set({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
    });

    this.cm.addObject(img);
  }

  flattenAll(): string {
    return this.cm.getImageDataURL('png', 1);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
