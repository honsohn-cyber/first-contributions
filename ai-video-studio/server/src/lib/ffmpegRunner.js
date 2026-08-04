import { execFile } from 'node:child_process';

/**
 * Runs ffmpeg/ffprobe with an argv array (no shell), so scene text and file
 * paths never pass through shell interpolation.
 */
function run(bin, args) {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { maxBuffer: 1024 * 1024 * 64 }, (err, stdout, stderr) => {
      if (err) {
        const e = new Error(`${bin} failed: ${err.message}\n${stderr?.slice(-4000) || ''}`);
        e.stderr = stderr;
        reject(e);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

export function ffmpeg(args) {
  return run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args]);
}

export function ffprobe(args) {
  return run('ffprobe', args);
}

/** Returns the duration of a media file in seconds. */
export async function getDuration(filePath) {
  const { stdout } = await ffprobe([
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    filePath,
  ]);
  const seconds = parseFloat(stdout.trim());
  if (!Number.isFinite(seconds)) {
    throw new Error(`Could not read duration of ${filePath}`);
  }
  return seconds;
}
