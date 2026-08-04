import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { config } from '../config.js';

fs.mkdirSync(config.storageDir, { recursive: true });
const indexFile = path.join(config.storageDir, 'jobs.json');

function loadIndex() {
  try {
    return JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveIndex(index) {
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
}

const jobs = loadIndex();
const emitters = new Map();

function emitterFor(id) {
  if (!emitters.has(id)) emitters.set(id, new EventEmitter());
  return emitters.get(id);
}

export function jobDir(id) {
  const dir = path.join(config.storageDir, id);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function createJob(job) {
  jobs[job.id] = job;
  saveIndex(jobs);
  return job;
}

export function updateJob(id, patch) {
  const current = jobs[id];
  if (!current) return undefined;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  jobs[id] = updated;
  saveIndex(jobs);
  emitterFor(id).emit('update', updated);
  return updated;
}

export function getJob(id) {
  return jobs[id];
}

export function listJobs() {
  return Object.values(jobs).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function onJobUpdate(id, handler) {
  const emitter = emitterFor(id);
  emitter.on('update', handler);
  return () => emitter.off('update', handler);
}
