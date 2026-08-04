import path from 'node:path';
import fs from 'node:fs/promises';
import { ffmpeg } from '../lib/ffmpegRunner.js';
import { RESOLUTIONS } from '../lib/resolutions.js';
import { wrapText } from '../lib/textWrap.js';

const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FPS = 30;
const TAIL_PAD = 0.4;
const FADE_IN = 0.25;
const FADE_OUT = 0.35;

function panExpressions(variant, totalFrames) {
  switch (variant) {
    case 1: // top-left anchored zoom
      return { x: '0', y: '0' };
    case 2: // bottom-right anchored zoom
      return { x: 'iw-(iw/zoom)', y: 'ih-(ih/zoom)' };
    case 3: // slow horizontal drift, vertically centered
      return {
        x: `(iw-(iw/zoom))*(on/${totalFrames})`,
        y: 'ih/2-(ih/zoom/2)',
      };
    default: // centered zoom-in
      return { x: 'iw/2-(iw/zoom/2)', y: 'ih/2-(ih/zoom/2)' };
  }
}

/**
 * Renders one scene as a fully muxed MP4 clip: Ken Burns pan/zoom over the
 * scene visual, burned-in captions, narration audio (loudness-normalized
 * and padded), and short fades at both ends for clean cuts on concat.
 */
export async function buildSceneClip({
  visualFile,
  audioFile,
  audioDuration,
  captionText,
  aspect,
  sceneIndex,
  sceneDir,
  keepCentered = false,
}) {
  const { output } = RESOLUTIONS[aspect];
  const duration = audioDuration + TAIL_PAD;
  const totalFrames = Math.max(1, Math.round(duration * FPS));

  // Base the caption font size on the shorter side so it scales consistently
  // across landscape/portrait/square, and use a conservative average glyph
  // width (DejaVu Sans Bold) plus a safety margin so lines never clip.
  const fontSize = Math.round(Math.min(output.w, output.h) * 0.048);
  const maxChars = Math.max(10, Math.floor((output.w * 0.88) / (fontSize * 0.62)));
  const maxLines = output.h > output.w ? 5 : output.w === output.h ? 4 : 3;
  const lines = wrapText(captionText, maxChars, maxLines);
  const captionFile = path.join(sceneDir, 'caption.txt');
  await fs.writeFile(captionFile, lines.join('\n'), 'utf8');

  const boxHeight = Math.round(lines.length * fontSize * 1.3 + fontSize * 1.1);
  const boxY = output.h - boxHeight - Math.round(output.h * 0.05);

  // Gradient title cards bake their headline into the image, centered on
  // the canvas, so panning toward a corner would crop the text out of
  // frame. Only vary the pan for photographic AI visuals without text.
  const { x, y } = panExpressions(keepCentered ? 0 : sceneIndex % 4, totalFrames);
  const fadeOutStart = Math.max(0, duration - FADE_OUT);

  const videoFilter = [
    `zoompan=z='min(zoom+0.0015,1.18)':x='${x}':y='${y}':d=${totalFrames}:s=${output.w}x${output.h}:fps=${FPS}`,
    `drawbox=x=0:y=${boxY}:w=${output.w}:h=${boxHeight}:color=black@0.45:t=fill`,
    `drawtext=fontfile=${FONT}:textfile=${captionFile}:fontsize=${fontSize}:fontcolor=white:` +
      `borderw=2:bordercolor=black@0.6:line_spacing=${Math.round(fontSize * 0.3)}:` +
      `x=(w-text_w)/2:y=${boxY + Math.round(fontSize * 0.55)}:text_align=center`,
    `fade=t=in:st=0:d=${FADE_IN}`,
    `fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${FADE_OUT}`,
  ].join(',');

  const audioFilter = `apad=pad_dur=${TAIL_PAD},loudnorm=I=-16:TP=-1.5:LRA=11`;

  const outFile = path.join(sceneDir, 'scene.mp4');

  await ffmpeg([
    '-loop', '1',
    '-t', duration.toFixed(2),
    '-i', visualFile,
    '-i', audioFile,
    '-filter_complex', `[0:v]${videoFilter}[v];[1:a]${audioFilter}[a]`,
    '-map', '[v]',
    '-map', '[a]',
    '-t', duration.toFixed(2),
    '-r', String(FPS),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    outFile,
  ]);

  return { file: outFile, duration };
}
