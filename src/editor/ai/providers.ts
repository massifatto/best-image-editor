import type { AIProviderConfig } from './types';

interface ProviderRequest {
  imageBase64?: string;
  params: Record<string, string | number>;
}

interface ProviderResponse {
  imageBase64?: string;
  error?: string;
}

type ProviderFn = (
  config: AIProviderConfig,
  request: ProviderRequest,
) => Promise<ProviderResponse>;

/* ─── Background Removal Providers ─── */

const removebg: ProviderFn = async (config, req) => {
  const form = new FormData();
  form.append('image_file_b64', req.imageBase64!);
  form.append('size', 'auto');
  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': config.apiKey },
    body: form,
  });
  if (!res.ok) return { error: `remove.bg error: ${res.status}` };
  const blob = await res.blob();
  return { imageBase64: await blobToBase64(blob) };
};

const photoroom: ProviderFn = async (config, req) => {
  const form = new FormData();
  form.append('image_file_b64', req.imageBase64!);
  const res = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: { 'x-api-key': config.apiKey },
    body: form,
  });
  if (!res.ok) return { error: `PhotoRoom error: ${res.status}` };
  const blob = await res.blob();
  return { imageBase64: await blobToBase64(blob) };
};

const falaiRembg: ProviderFn = async (_config, req) => {
  const res = await fetch('/api/ai/background-removal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: req.imageBase64 }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  return { imageBase64: data.image };
};

/* ─── Text to Image Providers ─── */

const stability: ProviderFn = async (_config, req) => {
  const res = await fetch('/api/ai/text-to-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: req.params.prompt,
      width: req.params.width || 512,
      height: req.params.height || 512,
      style: req.params.style || 'photographic',
    }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  return { imageBase64: data.image };
};

const dalle: ProviderFn = async (_config, req) => {
  const res = await fetch('/api/ai/text-to-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: req.params.prompt,
      width: req.params.width || 1024,
      height: req.params.height || 1024,
    }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  return { imageBase64: data.image };
};

const replicate: ProviderFn = async (_config, req) => {
  const res = await fetch('/api/ai/text-to-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: req.params.prompt,
      width: req.params.width || 768,
      height: req.params.height || 768,
    }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  return { imageBase64: data.image };
};

const falaiImage: ProviderFn = async (_config, req) => {
  const res = await fetch('/api/ai/text-to-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: req.params.prompt,
      width: req.params.width || 768,
      height: req.params.height || 768,
      style: req.params.style || 'auto',
    }),
  });
  const data = await res.json();
  if (data.error) return { error: data.error };
  return { imageBase64: data.image };
};

/* ─── Provider Maps ─── */

export const bgRemovalProviders: Record<string, ProviderFn> = {
  removebg,
  photoroom,
  'falai-rembg': falaiRembg,
};

export const textToImageProviders: Record<string, ProviderFn> = {
  stability,
  dalle,
  replicate,
  falai: falaiImage,
};

/* ─── Utility ─── */

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function callProvider(
  type: 'bg-removal' | 'text-to-image',
  imageBase64: string | null,
  params: Record<string, string | number>,
): Promise<ProviderResponse> {
  const providers = type === 'bg-removal' ? bgRemovalProviders : textToImageProviders;
  const defaultProvider = type === 'bg-removal' ? 'falai-rembg' : 'falai';

  const providerKey = defaultProvider;
  const provider = providers[providerKey];
  if (!provider) return { error: `Unknown provider: ${providerKey}` };

  return provider(
    { provider: providerKey, apiKey: '' },
    { imageBase64: imageBase64 || undefined, params },
  );
}
