import { IAIAction, AIActionMeta } from './types';

class AIActionRegistryClass {
  private actions = new Map<string, IAIAction>();
  private _listeners: Array<() => void> = [];

  register(action: IAIAction) {
    this.actions.set(action.meta.id, action);
    this._listeners.forEach((l) => l());
  }

  unregister(id: string) {
    this.actions.delete(id);
    this._listeners.forEach((l) => l());
  }

  get(id: string): IAIAction | undefined {
    return this.actions.get(id);
  }

  getAll(): IAIAction[] {
    return Array.from(this.actions.values());
  }

  getAllMeta(): AIActionMeta[] {
    return this.getAll().map((a) => a.meta);
  }

  getByCategory(category: string): IAIAction[] {
    return this.getAll().filter((a) => a.meta.category === category);
  }

  onChange(cb: () => void) {
    this._listeners.push(cb);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== cb);
    };
  }
}

export const AIActionRegistry = new AIActionRegistryClass();
