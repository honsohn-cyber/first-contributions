import path from 'node:path';
import { hasElevenLabs } from '../../config.js';
import { synthesizeElevenLabs } from './elevenlabs.js';
import { synthesizeEspeak } from './espeak.js';
import { ELEVENLABS_VOICES, ESPEAK_VOICES } from './voices.js';

export function activeVoiceProvider() {
  return hasElevenLabs() ? 'elevenlabs' : 'espeak';
}

export function getVoiceCatalog() {
  return activeVoiceProvider() === 'elevenlabs' ? ELEVENLABS_VOICES : ESPEAK_VOICES;
}

export function resolveVoice(voiceId) {
  const catalog = getVoiceCatalog();
  return catalog.find((v) => v.id === voiceId) || catalog[0];
}

/**
 * Generates narration audio for a scene. Uses ElevenLabs when an API key is
 * configured, otherwise transparently falls back to the offline espeak-ng
 * engine so the product works with zero configuration. If an ElevenLabs
 * call fails at runtime, the scene falls back to espeak rather than failing
 * the whole render.
 */
export async function synthesizeScene({ text, voiceId, language, sceneDir }) {
  if (hasElevenLabs()) {
    const voice = ELEVENLABS_VOICES.find((v) => v.id === voiceId) || ELEVENLABS_VOICES[0];
    try {
      const outFile = path.join(sceneDir, 'narration.mp3');
      await synthesizeElevenLabs({ text, voice, outFile });
      return { file: outFile, engine: 'elevenlabs' };
    } catch (err) {
      const outFile = path.join(sceneDir, 'narration.wav');
      await synthesizeEspeak({ text, voice: ESPEAK_VOICES[0], language, outFile });
      return { file: outFile, engine: 'espeak-fallback', warning: err.message };
    }
  }

  const voice = ESPEAK_VOICES.find((v) => v.id === voiceId) || ESPEAK_VOICES[0];
  const outFile = path.join(sceneDir, 'narration.wav');
  await synthesizeEspeak({ text, voice, language, outFile });
  return { file: outFile, engine: 'espeak' };
}
