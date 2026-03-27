import type { IAIAction, AIActionMeta, AIActionResult } from '../types';
import { AIActionRegistry } from '../AIActionRegistry';
import { callProvider } from '../providers';

const meta: AIActionMeta = {
  id: 'text-to-image',
  name: 'Text to Image',
  description: 'Generate an image from a text description using AI.',
  icon: 'Wand2',
  category: 'generate',
  requiresImage: false,
  params: [
    {
      key: 'prompt',
      label: 'Prompt',
      type: 'textarea',
      default: '',
      placeholder: 'Describe the image you want to generate…',
    },
    {
      key: 'width',
      label: 'Width',
      type: 'select',
      default: '768',
      options: [
        { label: '512', value: '512' },
        { label: '768', value: '768' },
        { label: '1024', value: '1024' },
      ],
    },
    {
      key: 'height',
      label: 'Height',
      type: 'select',
      default: '768',
      options: [
        { label: '512', value: '512' },
        { label: '768', value: '768' },
        { label: '1024', value: '1024' },
      ],
    },
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      default: 'auto',
      options: [
        { label: 'Auto', value: 'auto' },
        { label: 'Photographic', value: 'photographic' },
        { label: 'Digital Art', value: 'digital-art' },
        { label: 'Anime', value: 'anime' },
        { label: 'Cinematic', value: 'cinematic' },
      ],
    },
  ],
};

const TextToImage: IAIAction = {
  meta,
  async execute(
    _imageDataUrl: string | null,
    params: Record<string, string | number>,
  ): Promise<AIActionResult> {
    if (!params.prompt || String(params.prompt).trim() === '') {
      return { error: 'Please enter a prompt' };
    }

    try {
      const result = await callProvider('text-to-image', null, params);
      if (result.error) return { error: result.error };
      return { imageDataUrl: result.imageBase64 };
    } catch (e: any) {
      return { error: e.message || 'Image generation failed' };
    }
  },
};

AIActionRegistry.register(TextToImage);
export default TextToImage;
