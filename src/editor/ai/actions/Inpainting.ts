import type { IAIAction, AIActionMeta, AIActionResult } from '../types';
import { AIActionRegistry } from '../AIActionRegistry';

const meta: AIActionMeta = {
  id: 'inpainting',
  name: 'Inpainting',
  description: 'Paint over areas to replace them with AI-generated content. Draw a mask, describe what to fill.',
  icon: 'Paintbrush',
  category: 'transform',
  requiresImage: true,
  isStub: true,
  params: [
    {
      key: 'prompt',
      label: 'Fill Prompt',
      type: 'textarea',
      default: '',
      placeholder: 'Describe what should replace the masked area…',
    },
    {
      key: 'brushSize',
      label: 'Mask Brush Size',
      type: 'slider',
      default: 30,
      min: 5,
      max: 100,
      step: 1,
    },
    {
      key: 'strength',
      label: 'Strength',
      type: 'slider',
      default: 0.8,
      min: 0.1,
      max: 1,
      step: 0.05,
    },
  ],
};

const Inpainting: IAIAction = {
  meta,
  async execute(
    _imageDataUrl: string | null,
    _params: Record<string, string | number>,
  ): Promise<AIActionResult> {
    return {
      error:
        'Inpainting is not yet connected. Wire up a provider (e.g. fal.ai/inpainting, Stability Inpaint, or Replicate) in ai/providers.ts and implement the mask-draw canvas mode.',
    };
  },
};

AIActionRegistry.register(Inpainting);
export default Inpainting;
