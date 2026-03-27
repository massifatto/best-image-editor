import type { IAIAction, AIActionMeta, AIActionResult } from '../types';
import { AIActionRegistry } from '../AIActionRegistry';

const meta: AIActionMeta = {
  id: 'upscaling',
  name: 'Upscale Image',
  description: 'Increase image resolution using AI super-resolution.',
  icon: 'Maximize2',
  category: 'enhance',
  requiresImage: true,
  isStub: true,
  params: [
    {
      key: 'scale',
      label: 'Scale Factor',
      type: 'select',
      default: '2',
      options: [
        { label: '2x', value: '2' },
        { label: '4x', value: '4' },
      ],
    },
    {
      key: 'model',
      label: 'Model',
      type: 'select',
      default: 'real-esrgan',
      options: [
        { label: 'Real-ESRGAN', value: 'real-esrgan' },
        { label: 'Stable Diffusion Upscale', value: 'sd-upscale' },
      ],
    },
  ],
};

const Upscaling: IAIAction = {
  meta,
  async execute(
    _imageDataUrl: string | null,
    _params: Record<string, string | number>,
  ): Promise<AIActionResult> {
    return {
      error:
        'Upscaling is not yet connected. Wire up a provider (e.g. fal.ai/esrgan, Replicate real-esrgan, or Stability upscale) in ai/providers.ts.',
    };
  },
};

AIActionRegistry.register(Upscaling);
export default Upscaling;
