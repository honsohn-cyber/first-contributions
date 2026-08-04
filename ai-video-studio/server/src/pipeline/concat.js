import fs from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg } from '../lib/ffmpegRunner.js';

/** Concatenates already-encoded scene clips (matching codecs) into the final video. */
export async function concatScenes(sceneFiles, jobDir) {
  const listFile = path.join(jobDir, 'concat_list.txt');
  const listContent = sceneFiles
    .map((f) => `file '${f.replace(/'/g, "'\\''")}'`)
    .join('\n');
  await fs.writeFile(listFile, listContent, 'utf8');

  const outFile = path.join(jobDir, 'final.mp4');
  await ffmpeg([
    '-f', 'concat',
    '-safe', '0',
    '-i', listFile,
    '-c', 'copy',
    '-movflags', '+faststart',
    outFile,
  ]);

  return outFile;
}
