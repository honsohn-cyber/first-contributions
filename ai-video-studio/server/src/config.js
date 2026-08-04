import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 8787,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || '',
  storageDir: path.resolve(serverRoot, process.env.STORAGE_DIR || './storage'),
};

// Used for AI scene image generation.
export const hasOpenAI = () => Boolean(config.openaiApiKey);
// Used for narration voices.
export const hasElevenLabs = () => Boolean(config.elevenLabsApiKey);
