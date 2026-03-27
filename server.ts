import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = parseInt(process.env.PORT || '3001');

const BG_PROVIDER = process.env.AI_BG_REMOVAL_PROVIDER || 'falai-rembg';
const T2I_PROVIDER = process.env.AI_TEXT_TO_IMAGE_PROVIDER || 'falai';

/* ─── Background Removal ─── */

app.post('/api/ai/background-removal', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ error: 'No image provided' });

  try {
    switch (BG_PROVIDER) {
      case 'removebg': {
        const apiKey = process.env.REMOVEBG_API_KEY;
        if (!apiKey) return res.json({ error: 'REMOVEBG_API_KEY not set' });
        const base64 = image.replace(/^data:image\/\w+;base64,/, '');
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_file_b64: base64, size: 'auto' }),
        });
        if (!response.ok) return res.json({ error: `remove.bg: ${response.status}` });
        const buffer = Buffer.from(await response.arrayBuffer());
        return res.json({ image: `data:image/png;base64,${buffer.toString('base64')}` });
      }

      case 'photoroom': {
        const apiKey = process.env.PHOTOROOM_API_KEY;
        if (!apiKey) return res.json({ error: 'PHOTOROOM_API_KEY not set' });
        const base64 = image.replace(/^data:image\/\w+;base64,/, '');
        const form = new FormData();
        form.append('image_file_b64', base64);
        const response = await fetch('https://sdk.photoroom.com/v1/segment', {
          method: 'POST',
          headers: { 'x-api-key': apiKey },
          body: form,
        });
        if (!response.ok) return res.json({ error: `PhotoRoom: ${response.status}` });
        const buffer = Buffer.from(await response.arrayBuffer());
        return res.json({ image: `data:image/png;base64,${buffer.toString('base64')}` });
      }

      case 'falai-rembg': {
        const apiKey = process.env.FAL_AI_API_KEY;
        if (!apiKey) return res.json({ error: 'FAL_AI_API_KEY not set' });
        const response = await fetch('https://queue.fal.run/fal-ai/birefnet', {
          method: 'POST',
          headers: {
            Authorization: `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_url: image }),
        });
        if (!response.ok) return res.json({ error: `fal.ai: ${response.status}` });
        const data = await response.json() as any;
        return res.json({ image: data.image?.url || data.output?.url || '' });
      }

      default:
        return res.json({ error: `Unknown provider: ${BG_PROVIDER}` });
    }
  } catch (e: any) {
    return res.json({ error: e.message });
  }
});

/* ─── Text to Image ─── */

app.post('/api/ai/text-to-image', async (req, res) => {
  const { prompt, width = 768, height = 768, style } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    switch (T2I_PROVIDER) {
      case 'stability': {
        const apiKey = process.env.STABILITY_API_KEY;
        if (!apiKey) return res.json({ error: 'STABILITY_API_KEY not set' });
        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              text_prompts: [{ text: prompt, weight: 1 }],
              cfg_scale: 7,
              width: parseInt(String(width)),
              height: parseInt(String(height)),
              steps: 30,
              style_preset: style !== 'auto' ? style : undefined,
            }),
          },
        );
        if (!response.ok) return res.json({ error: `Stability: ${response.status}` });
        const data = await response.json() as any;
        const b64 = data.artifacts?.[0]?.base64;
        return res.json({ image: b64 ? `data:image/png;base64,${b64}` : '' });
      }

      case 'dalle': {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return res.json({ error: 'OPENAI_API_KEY not set' });
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: `${width}x${height}`,
            response_format: 'b64_json',
          }),
        });
        if (!response.ok) return res.json({ error: `DALL-E: ${response.status}` });
        const data = await response.json() as any;
        const b64 = data.data?.[0]?.b64_json;
        return res.json({ image: b64 ? `data:image/png;base64,${b64}` : '' });
      }

      case 'replicate': {
        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) return res.json({ error: 'REPLICATE_API_TOKEN not set' });
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
            input: { prompt, width: parseInt(String(width)), height: parseInt(String(height)) },
          }),
        });
        if (!response.ok) return res.json({ error: `Replicate: ${response.status}` });
        const data = await response.json() as any;
        if (data.urls?.get) {
          let result;
          for (let i = 0; i < 60; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            const poll = await fetch(data.urls.get, {
              headers: { Authorization: `Bearer ${apiKey}` },
            });
            result = await poll.json() as any;
            if (result.status === 'succeeded') break;
            if (result.status === 'failed') return res.json({ error: 'Replicate generation failed' });
          }
          return res.json({ image: result?.output?.[0] || '' });
        }
        return res.json({ error: 'Unexpected Replicate response' });
      }

      case 'falai': {
        const apiKey = process.env.FAL_AI_API_KEY;
        if (!apiKey) return res.json({ error: 'FAL_AI_API_KEY not set' });
        const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
          method: 'POST',
          headers: {
            Authorization: `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            image_size: { width: parseInt(String(width)), height: parseInt(String(height)) },
            num_images: 1,
          }),
        });
        if (!response.ok) return res.json({ error: `fal.ai: ${response.status}` });
        const data = await response.json() as any;
        const url = data.images?.[0]?.url || data.output?.url || '';
        return res.json({ image: url });
      }

      default:
        return res.json({ error: `Unknown provider: ${T2I_PROVIDER}` });
    }
  } catch (e: any) {
    return res.json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`AI proxy server running on http://localhost:${PORT}`);
  console.log(`Background removal provider: ${BG_PROVIDER}`);
  console.log(`Text-to-image provider: ${T2I_PROVIDER}`);
});
