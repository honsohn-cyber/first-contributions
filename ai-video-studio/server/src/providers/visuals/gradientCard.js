import fs from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg } from '../../lib/ffmpegRunner.js';
import { RESOLUTIONS } from '../../lib/resolutions.js';
import { wrapText } from '../../lib/textWrap.js';
import { resolveStyle } from './styles.js';

function hexToRgb(hex) {
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

/**
 * Offline visual fallback used when no image-generation API key is
 * configured: a stylized gradient title card rendered entirely with ffmpeg
 * (geq gradient + vignette + film grain + headline typography).
 */
export async function generateGradientCard({ headline, styleId, sceneIndex, aspect, sceneDir }) {
  const { card } = RESOLUTIONS[aspect];
  const style = resolveStyle(styleId);
  const [c1, c2] = style.palette[sceneIndex % style.palette.length];
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);

  const textFile = path.join(sceneDir, 'headline.txt');
  const wrapped = wrapText(headline.toUpperCase(), 16, 3).join('\n');
  await fs.writeFile(textFile, wrapped, 'utf8');

  const fontSize = Math.round(card.w * 0.062);
  const outFile = path.join(sceneDir, 'visual.png');

  const gradientExpr =
    `geq=` +
    `r='${r1}+(${r2}-${r1})*((X/W+Y/H)/2)':` +
    `g='${g1}+(${g2}-${g1})*((X/W+Y/H)/2)':` +
    `b='${b1}+(${b2}-${b1})*((X/W+Y/H)/2)'`;

  const filter = [
    gradientExpr,
    'vignette=PI/3.2',
    'noise=alls=6:allf=t+u',
    `drawtext=fontfile=${FONT}:textfile=${textFile}:fontsize=${fontSize}:fontcolor=white@0.96:` +
      `borderw=3:bordercolor=black@0.35:line_spacing=${Math.round(fontSize * 0.35)}:` +
      `x=(w-text_w)/2:y=(h-text_h)/2`,
    `drawbox=x=(w-${Math.round(card.w * 0.14)})/2:y=(h/2)+${Math.round(fontSize * 1.6)}:` +
      `w=${Math.round(card.w * 0.14)}:h=6:color=white@0.75:t=fill`,
  ].join(',');

  await ffmpeg([
    '-f', 'lavfi',
    '-i', `color=c=black:s=${card.w}x${card.h}:d=1`,
    '-vf', filter,
    '-frames:v', '1',
    outFile,
  ]);

  return outFile;
}
