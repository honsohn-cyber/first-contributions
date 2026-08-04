import fs from 'node:fs/promises';
import { config } from '../../config.js';

/** Generates narration audio for one scene using the ElevenLabs TTS API. */
export async function synthesizeElevenLabs({ text, voice, outFile }) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${detail.slice(0, 500)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outFile, buffer);
  return outFile;
}
