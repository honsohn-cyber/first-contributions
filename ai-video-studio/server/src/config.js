import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 8787,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  storageDir: path.resolve(serverRoot, process.env.STORAGE_DIR || './storage'),
};

export const hasOpenAI = () => Boolean(config.openaiApiKey);
