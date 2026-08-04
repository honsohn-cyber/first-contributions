import fs from 'node:fs/promises';
import path from 'node:path';
import { parseScript, detectLanguage } from '../lib/scriptParser.js';
import { jobDir, updateJob, getJob } from '../lib/store.js';
import { getDuration, ffmpeg } from '../lib/ffmpegRunner.js';
import { synthesizeScene } from '../providers/tts/index.js';
import { generateSceneVisual } from '../providers/visuals/index.js';
import { buildSceneClip } from './sceneClip.js';
import { concatScenes } from './concat.js';

const SCENE_WORK_START = 10;
const SCENE_WORK_END = 85;

function setSceneStatus(scenes, index, patch) {
  return scenes.map((s) => (s.index === index ? { ...s, ...patch } : s));
}

/** Runs the full script -> video pipeline for a job, reporting progress as it goes. */
export async function runPipeline(jobId) {
  const job = getJob(jobId);
  if (!job) throw new Error(`Unknown job ${jobId}`);

  const dir = jobDir(jobId);

  try {
    const parsed = parseScript(job.script);
    if (!parsed.length) throw new Error('Das Skript enthält keinen verwendbaren Text.');

    const language = job.options.language === 'auto' ? detectLanguage(job.script) : job.options.language;
    let scenes = parsed.map((s) => ({ ...s, status: 'pending', duration: null }));

    updateJob(jobId, {
      status: 'processing',
      stage: 'analyzing',
      progress: 5,
      language,
      scenes,
    });

    const sceneFiles = [];
    for (const scene of parsed) {
      const sceneDir = path.join(dir, `scene-${scene.index}`);
      await fs.mkdir(sceneDir, { recursive: true });

      scenes = setSceneStatus(scenes, scene.index, { status: 'narration' });
      updateJob(jobId, {
        stage: 'narration',
        scenes,
        progress: SCENE_WORK_START + (scene.index / parsed.length) * (SCENE_WORK_END - SCENE_WORK_START) * 0.33,
      });
      const tts = await synthesizeScene({
        text: scene.text,
        voiceId: job.options.voiceId,
        language,
        sceneDir,
      });
      const audioDuration = await getDuration(tts.file);

      scenes = setSceneStatus(scenes, scene.index, { status: 'visual' });
      updateJob(jobId, {
        stage: 'visuals',
        scenes,
        progress: SCENE_WORK_START + (scene.index / parsed.length) * (SCENE_WORK_END - SCENE_WORK_START) * 0.66,
      });
      const visual = await generateSceneVisual({
        text: scene.text,
        headline: scene.headline,
        styleId: job.options.styleId,
        sceneIndex: scene.index,
        aspect: job.options.aspect,
        sceneDir,
      });

      scenes = setSceneStatus(scenes, scene.index, { status: 'rendering' });
      updateJob(jobId, {
        stage: 'rendering',
        scenes,
        progress: SCENE_WORK_START + (scene.index / parsed.length) * (SCENE_WORK_END - SCENE_WORK_START),
      });
      const clip = await buildSceneClip({
        visualFile: visual.file,
        audioFile: tts.file,
        audioDuration,
        captionText: scene.text,
        aspect: job.options.aspect,
        sceneIndex: scene.index,
        sceneDir,
        keepCentered: visual.engine !== 'openai',
      });

      sceneFiles.push(clip.file);
      scenes = setSceneStatus(scenes, scene.index, {
        status: 'done',
        duration: clip.duration,
        narrationEngine: tts.engine,
        visualEngine: visual.engine,
      });
      updateJob(jobId, {
        scenes,
        progress: SCENE_WORK_START + ((scene.index + 1) / parsed.length) * (SCENE_WORK_END - SCENE_WORK_START),
      });
    }

    updateJob(jobId, { stage: 'assembling', progress: 90, scenes });
    const finalFile = await concatScenes(sceneFiles, dir);

    const posterFile = path.join(dir, 'poster.jpg');
    await ffmpeg(['-i', finalFile, '-ss', '00:00:00.4', '-frames:v', '1', posterFile]);

    const totalDuration = await getDuration(finalFile);

    updateJob(jobId, {
      status: 'done',
      stage: 'done',
      progress: 100,
      videoUrl: `/media/${jobId}/final.mp4`,
      posterUrl: `/media/${jobId}/poster.jpg`,
      totalDuration,
      finishedAt: new Date().toISOString(),
    });
  } catch (err) {
    updateJob(jobId, {
      status: 'error',
      stage: 'error',
      error: err.message,
    });
  }
}
