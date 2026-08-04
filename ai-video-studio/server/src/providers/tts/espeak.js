import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';

function run(args) {
  return new Promise((resolve, reject) => {
    execFile('espeak-ng', args, { maxBuffer: 1024 * 1024 * 16 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`espeak-ng failed: ${err.message}\n${stderr}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

/**
 * Offline narration fallback used when no OPENAI_API_KEY is configured.
 * Renders the scene text to a WAV file with espeak-ng.
 */
export async function synthesizeEspeak({ text, voice, language, outFile }) {
  const textFile = path.join(os.tmpdir(), `avs-tts-${randomUUID()}.txt`);
  await fs.writeFile(textFile, text, 'utf8');

  const espeakLang = language === 'de' ? 'de' : 'en-us';
  try {
    await run([
      '-v', `${espeakLang}+${voice.espeak.variant}`,
      '-s', String(voice.espeak.speed),
      '-p', String(voice.espeak.pitch),
      '-a', '160',
      '-f', textFile,
      '-w', outFile,
    ]);
  } finally {
    await fs.unlink(textFile).catch(() => {});
  }
  return outFile;
}
