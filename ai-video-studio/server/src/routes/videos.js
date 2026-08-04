import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createJob, getJob, listJobs, onJobUpdate } from '../lib/store.js';
import { resolveAspect } from '../lib/resolutions.js';
import { runPipeline } from '../pipeline/buildVideo.js';
import { getVoiceCatalog, resolveVoice, activeVoiceProvider } from '../providers/tts/index.js';
import { STYLES, resolveStyle } from '../providers/visuals/index.js';
import { hasOpenAI } from '../config.js';

export const router = Router();

const MAX_SCRIPT_LENGTH = 8000;
const ASPECTS = ['16:9', '9:16', '1:1'];

router.get('/meta', (req, res) => {
  res.json({
    voices: getVoiceCatalog().map((v) => ({ id: v.id, label: v.label })),
    voiceProvider: activeVoiceProvider(),
    styles: STYLES.map((s) => ({ id: s.id, label: s.label })),
    aspects: ASPECTS,
    aiEnabled: hasOpenAI(),
  });
});

function summarize(job) {
  return {
    id: job.id,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    createdAt: job.createdAt,
    finishedAt: job.finishedAt || null,
    totalDuration: job.totalDuration || null,
    title: job.title,
    options: job.options,
    sceneCount: job.scenes?.length || 0,
    hasVideo: job.status === 'done',
    videoUrl: job.videoUrl || null,
    posterUrl: job.posterUrl || null,
    error: job.error || null,
  };
}

router.get('/', (req, res) => {
  res.json(listJobs().map(summarize));
});

router.post('/', (req, res) => {
  const { script, aspect, styleId, voiceId, language } = req.body || {};

  if (typeof script !== 'string' || !script.trim()) {
    return res.status(400).json({ error: 'Bitte gib ein Skript ein.' });
  }
  if (script.length > MAX_SCRIPT_LENGTH) {
    return res.status(400).json({ error: `Skript ist zu lang (max. ${MAX_SCRIPT_LENGTH} Zeichen).` });
  }

  const options = {
    aspect: resolveAspect(aspect),
    styleId: resolveStyle(styleId).id,
    voiceId: resolveVoice(voiceId).id,
    language: language === 'de' || language === 'en' ? language : 'auto',
  };

  const id = uuidv4();
  const title = script.trim().split(/\s+/).slice(0, 6).join(' ');

  const job = createJob({
    id,
    script: script.trim(),
    title: title.length > 40 ? `${title.slice(0, 40)}…` : title,
    options,
    status: 'queued',
    stage: 'queued',
    progress: 0,
    scenes: [],
    createdAt: new Date().toISOString(),
  });

  // Fire and forget; progress is reported via SSE / polling.
  runPipeline(id);

  res.status(201).json(summarize(job));
});

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job nicht gefunden.' });
  res.json(job);
});

router.get('/:id/events', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).end();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  const unsubscribe = onJobUpdate(req.params.id, (updated) => {
    res.write(`data: ${JSON.stringify(updated)}\n\n`);
    if (updated.status === 'done' || updated.status === 'error') {
      res.end();
    }
  });

  req.on('close', unsubscribe);
});
