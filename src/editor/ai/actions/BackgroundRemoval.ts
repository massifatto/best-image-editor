import type { IAIAction, AIActionMeta, AIActionResult } from '../types';
import { AIActionRegistry } from '../AIActionRegistry';
import { callProvider } from '../providers';

const meta: AIActionMeta = {
  id: 'background-removal',
  name: 'Remove Background',
  description: 'Remove the background from the current image using AI.',
  icon: 'Scissors',
  category: 'remove',
  requiresImage: true,
  params: [
    {
      key: 'outputFormat',
      label: 'Output Format',
      type: 'select',
      default: 'png',
      options: [
        { label: 'PNG (transparent)', value: 'png' },
        { label: 'JPEG (white bg)', value: 'jpeg' },
      ],
    },
  ],
};

const BackgroundRemoval: IAIAction = {
  meta,
  async execute(
    imageDataUrl: string | null,
    params: Record<string, string | number>,
  ): Promise<AIActionResult> {
    if (!imageDataUrl) return { error: 'No image loaded' };

    try {
      const result = await callProvider('bg-removal', imageDataUrl, params);
      if (result.error) return { error: result.error };
      return { imageDataUrl: result.imageBase64 };
    } catch (e: any) {
      return { error: e.message || 'Background removal failed' };
    }
  },
};

AIActionRegistry.register(BackgroundRemoval);
export default BackgroundRemoval;
