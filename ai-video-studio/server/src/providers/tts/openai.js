import fs from 'node:fs/promises';
import { config } from '../../config.js';

/** Generates narration audio for one scene using the OpenAI TTS API. */
export async function synthesizeOpenAI({ text, voice, outFile }) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: voice.openaiVoice,
      input: text,
      format: 'mp3',
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`OpenAI TTS failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outFile, buffer);
  return outFile;
}
