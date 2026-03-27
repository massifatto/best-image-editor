import { filters } from 'fabric';
import { BaseTool } from './BaseTool';
import type { FilterPreset } from '../types';

export const FILTER_PRESETS: FilterPreset[] = [
  { name: 'None', filters: [] },
  { name: 'Grayscale', filters: [{ type: 'Grayscale' }] },
  { name: 'Sepia', filters: [{ type: 'Sepia' }] },
  { name: 'Vintage', filters: [{ type: 'Sepia' }, { type: 'Brightness', options: { brightness: -0.1 } }, { type: 'Contrast', options: { contrast: 0.1 } }] },
  { name: 'Bright', filters: [{ type: 'Brightness', options: { brightness: 0.15 } }] },
  { name: 'High Contrast', filters: [{ type: 'Contrast', options: { contrast: 0.3 } }] },
  { name: 'Warm', filters: [{ type: 'Brightness', options: { brightness: 0.05 } }, { type: 'Saturation', options: { saturation: 0.2 } }] },
  { name: 'Cool', filters: [{ type: 'Saturation', options: { saturation: -0.2 } }, { type: 'Brightness', options: { brightness: -0.05 } }] },
  { name: 'Blur', filters: [{ type: 'Blur', options: { blur: 0.15 } }] },
  { name: 'Sharpen', filters: [{ type: 'Convolute', options: { matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] } }] },
  { name: 'Invert', filters: [{ type: 'Invert' }] },
  { name: 'B&W High', filters: [{ type: 'Grayscale' }, { type: 'Contrast', options: { contrast: 0.4 } }] },
];

const filterFactory: Record<string, (opts?: any) => any> = {
  Grayscale: () => new filters.Grayscale(),
  Sepia: () => new filters.Sepia(),
  Brightness: (o: any) => new filters.Brightness({ brightness: o?.brightness ?? 0 }),
  Contrast: (o: any) => new filters.Contrast({ contrast: o?.contrast ?? 0 }),
  Saturation: (o: any) => new filters.Saturation({ saturation: o?.saturation ?? 0 }),
  Blur: (o: any) => new filters.Blur({ blur: o?.blur ?? 0 }),
  Invert: () => new filters.Invert(),
  Convolute: (o: any) => new filters.Convolute({ matrix: o?.matrix }),
};

export class FilterTool extends BaseTool {
  private currentPreset: string = 'None';

  activate() {
    /* nothing special */
  }

  deactivate() {
    /* nothing special */
  }

  applyPreset(preset: FilterPreset) {
    this.currentPreset = preset.name;
    const fabricFilters = preset.filters
      .map((f) => {
        const factory = filterFactory[f.type];
        return factory ? factory(f.options) : null;
      })
      .filter(Boolean);

    this.cm.setFilters(fabricFilters);
  }

  getCurrentPreset(): string {
    return this.currentPreset;
  }

  applyCustom(type: string, options?: Record<string, number>) {
    const factory = filterFactory[type];
    if (factory) {
      this.cm.applyFilter(factory(options));
    }
  }

  adjustBrightness(value: number) {
    this.applyCustomFilter('Brightness', { brightness: value });
  }

  adjustContrast(value: number) {
    this.applyCustomFilter('Contrast', { contrast: value });
  }

  adjustSaturation(value: number) {
    this.applyCustomFilter('Saturation', { saturation: value });
  }

  private applyCustomFilter(type: string, opts: Record<string, number>) {
    const bg = this.cm.getBackgroundImage();
    if (!bg) return;
    const existing = bg.filters || [];
    const idx = existing.findIndex((f: any) => f.type === type);
    const factory = filterFactory[type];
    if (!factory) return;
    const newFilter = factory(opts);
    if (idx >= 0) {
      existing[idx] = newFilter;
    } else {
      existing.push(newFilter);
    }
    bg.filters = existing;
    bg.applyFilters();
    this.cm.renderAll();
  }
}
