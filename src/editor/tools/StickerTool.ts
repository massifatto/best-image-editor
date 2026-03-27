import { IText, FabricImage } from 'fabric';
import { BaseTool } from './BaseTool';

export const STICKER_CATEGORIES = [
  {
    name: 'Smileys',
    stickers: ['😀', '😂', '🥰', '😎', '🤩', '😇', '🤔', '😴', '🥳', '😱', '🤗', '😏'],
  },
  {
    name: 'Hands',
    stickers: ['👍', '👎', '👋', '✌️', '🤞', '👏', '🙌', '💪', '🤝', '✋', '🫶', '👊'],
  },
  {
    name: 'Hearts',
    stickers: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💖', '💝', '💘', '💗'],
  },
  {
    name: 'Nature',
    stickers: ['🌟', '⭐', '🌈', '☀️', '🌙', '🔥', '💧', '❄️', '🌸', '🌻', '🍀', '🌊'],
  },
  {
    name: 'Objects',
    stickers: ['📷', '🎨', '🎭', '🎬', '🎵', '💡', '📌', '✏️', '🏆', '🎯', '🎪', '🎁'],
  },
  {
    name: 'Arrows',
    stickers: ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↙️', '↘️', '↖️', '🔄', '↩️', '↪️', '🔀'],
  },
];

export class StickerTool extends BaseTool {
  activate() {
    this.cm.canvas.selection = true;
  }

  deactivate() {
    /* nothing special */
  }

  addEmoji(emoji: string, size = 64) {
    const bg = this.cm.getBackgroundImage();
    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    const text = new IText(emoji, {
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      fontSize: size,
      editable: false,
    });

    this.cm.addObject(text);
  }

  async addImageSticker(url: string): Promise<void> {
    const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const bg = this.cm.getBackgroundImage();
    const cx = bg ? bg.left! + (bg.width! * bg.scaleX!) / 2 : this.cm.canvas.width! / 2;
    const cy = bg ? bg.top! + (bg.height! * bg.scaleY!) / 2 : this.cm.canvas.height! / 2;

    const maxSize = 150;
    const scale = Math.min(maxSize / img.width!, maxSize / img.height!, 1);
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
}
