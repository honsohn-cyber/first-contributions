import path from 'node:path';
import { hasOpenAI } from '../../config.js';
import { synthesizeOpenAI } from './openai.js';
import { synthesizeEspeak } from './espeak.js';
import { resolveVoice } from './voices.js';

export { VOICES, resolveVoice } from './voices.js';

/**
 * Generates narration audio for a scene. Uses OpenAI TTS when an API key is
 * configured, otherwise transparently falls back to the offline espeak-ng
 * engine so the product works with zero configuration.
 */
export async function synthesizeScene({ text, voiceId, language, sceneDir }) {
  const voice = resolveVoice(voiceId);

  if (hasOpenAI()) {
    const outFile = path.join(sceneDir, 'narration.mp3');
    await synthesizeOpenAI({ text, voice, outFile });
    return { file: outFile, engine: 'openai' };
  }

  const outFile = path.join(sceneDir, 'narration.wav');
  await synthesizeEspeak({ text, voice, language, outFile });
  return { file: outFile, engine: 'espeak' };
}
