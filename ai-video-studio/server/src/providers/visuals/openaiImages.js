import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../../config.js';
import { resolveStyle } from './styles.js';

const SIZE_BY_ASPECT = {
  '16:9': '1536x1024',
  '9:16': '1024x1536',
  '1:1': '1024x1024',
};

/** Generates a scene background image with the OpenAI Images API. */
export async function generateAIImage({ text, styleId, aspect, sceneDir }) {
  const style = resolveStyle(styleId);
  const size = SIZE_BY_ASPECT[aspect] || '1536x1024';

  const prompt =
    `Create a high quality, ${style.imagePrompt} background illustration for a video scene ` +
    `about: "${text}". No text, no letters, no watermark, no logos in the image. ` +
    `Wide dynamic range, rich detail, professional cinematic composition.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      n: 1,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`OpenAI image generation failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const json = await response.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI image generation returned no image data');

  const outFile = path.join(sceneDir, 'visual.png');
  await fs.writeFile(outFile, Buffer.from(b64, 'base64'));
  return outFile;
}
