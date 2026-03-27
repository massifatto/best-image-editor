import { IText } from 'fabric';
import { BaseTool } from './BaseTool';
import type { TextOptions } from '../types';

export class TextTool extends BaseTool {
  private defaults: TextOptions = {
    text: 'Type here',
    fontFamily: 'Arial',
    fontSize: 32,
    fill: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    underline: false,
  };

  activate() {
    this.cm.canvas.selection = true;
  }

  deactivate() {
    /* nothing special */
  }

  addText(opts?: Partial<TextOptions>) {
    const config = { ...this.defaults, ...opts };
    const bg = this.cm.getBackgroundImage();
    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    const text = new IText(config.text, {
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      fontFamily: config.fontFamily,
      fontSize: config.fontSize,
      fill: config.fill,
      fontWeight: config.fontWeight as any,
      fontStyle: config.fontStyle as any,
      textAlign: config.textAlign,
      underline: config.underline,
    });

    this.cm.addObject(text);
    text.enterEditing();
  }

  updateSelected(opts: Partial<TextOptions>) {
    const active = this.cm.getActiveObject();
    if (active && active instanceof IText) {
      active.set(opts as any);
      this.cm.canvas.renderAll();
    }
  }
}
