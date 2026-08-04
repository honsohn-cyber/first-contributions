import fs from 'node:fs/promises';
import path from 'node:path';
import { config, hasElevenLabs } from '../../config.js';
import { synthesizeElevenLabs } from './elevenlabs.js';
import { synthesizeEspeak } from './espeak.js';
import { ELEVENLABS_VOICES, ESPEAK_VOICES } from './voices.js';

const PREVIEW_TEXT = 'Hallo! So klingt diese Stimme in deinem Video.';

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

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates (and caches on disk) a short spoken sample for a voice, so the
 * UI can offer a "listen before you choose" preview like ElevenLabs does.
 * Falls back to espeak if an ElevenLabs preview call fails.
 */
export async function synthesizePreview(voiceId) {
  const dir = path.join(config.storageDir, 'previews');
  await fs.mkdir(dir, { recursive: true });

  if (hasElevenLabs()) {
    const voice = ELEVENLABS_VOICES.find((v) => v.id === voiceId) || ELEVENLABS_VOICES[0];
    const file = path.join(dir, `elevenlabs-${voice.id}.mp3`);
    if (await fileExists(file)) return file;
    try {
      await synthesizeElevenLabs({ text: PREVIEW_TEXT, voice, outFile: file });
      return file;
    } catch {
      // fall through to the espeak preview below
    }
  }

  const voice = ESPEAK_VOICES.find((v) => v.id === voiceId) || ESPEAK_VOICES[0];
  const file = path.join(dir, `espeak-${voice.id}.wav`);
  if (await fileExists(file)) return file;
  await synthesizeEspeak({ text: PREVIEW_TEXT, voice, language: 'de', outFile: file });
  return file;
}
