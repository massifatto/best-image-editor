import { CanvasManager } from './CanvasManager';

const MAX_HISTORY = 50;

export class HistoryManager {
  private states: string[] = [];
  private currentIndex = -1;
  private locked = false;
  private cm: CanvasManager;
  private _listeners: Array<() => void> = [];

  constructor(canvasManager: CanvasManager) {
    this.cm = canvasManager;
  }

  saveState() {
    if (this.locked) return;
    const json = this.cm.toJSON();
    if (this.currentIndex < this.states.length - 1) {
      this.states = this.states.slice(0, this.currentIndex + 1);
    }
    this.states.push(json);
    if (this.states.length > MAX_HISTORY) {
      this.states.shift();
    } else {
      this.currentIndex++;
    }
    this.notify();
  }

  async undo(): Promise<void> {
    if (!this.canUndo) return;
    this.locked = true;
    this.currentIndex--;
    await this.cm.loadFromJSON(this.states[this.currentIndex]);
    this.locked = false;
    this.notify();
  }

  async redo(): Promise<void> {
    if (!this.canRedo) return;
    this.locked = true;
    this.currentIndex++;
    await this.cm.loadFromJSON(this.states[this.currentIndex]);
    this.locked = false;
    this.notify();
  }

  get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  clear() {
    this.states = [];
    this.currentIndex = -1;
    this.notify();
  }

  onStateChange(cb: () => void) {
    this._listeners.push(cb);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this._listeners.forEach((l) => l());
  }
}
