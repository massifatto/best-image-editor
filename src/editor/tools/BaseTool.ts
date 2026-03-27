import { CanvasManager } from '../canvas/CanvasManager';

export abstract class BaseTool {
  protected cm: CanvasManager;

  constructor(canvasManager: CanvasManager) {
    this.cm = canvasManager;
  }

  abstract activate(): void;
  abstract deactivate(): void;
}
