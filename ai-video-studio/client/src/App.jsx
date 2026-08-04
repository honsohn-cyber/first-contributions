import { useEffect, useState, useCallback, useRef } from 'react';
import Header from './components/Header.jsx';
import ScriptForm from './components/ScriptForm.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import HistoryList from './components/HistoryList.jsx';
import { fetchMeta, fetchJobs, createVideo, subscribeToJob } from './api.js';

const FEATURES = [
  { title: 'Sprachausgabe', text: 'Natürliche Stimmen erzählen dein Skript automatisch vor.' },
  { title: 'Bildwelten je Szene', text: 'Jede Szene bekommt ein passendes, generiertes Hintergrundbild.' },
  { title: 'Ken-Burns & Untertitel', text: 'Sanfte Kamerabewegung plus eingebrannte Untertitel — fertig zum Teilen.' },
];

export default function App() {
  const [meta, setMeta] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    fetchMeta().then(setMeta).catch((e) => setError(e.message));
    fetchJobs().then(setJobs).catch(() => {});
  }, []);

  useEffect(() => () => unsubscribeRef.current?.(), []);

  const watchJob = useCallback((id) => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = subscribeToJob(id, (update) => {
      setActiveJob(update);
      if (update.status === 'done' || update.status === 'error') {
        fetchJobs().then(setJobs).catch(() => {});
      }
    });
  }, []);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError(null);
    try {
      const job = await createVideo(payload);
      setActiveJob(job);
      watchJob(job.id);
      fetchJobs().then(setJobs).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectHistory(id) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    setActiveJob(job);
    if (job.status === 'processing' || job.status === 'queued') {
      watchJob(id);
    }
  }

  function handleReset() {
    unsubscribeRef.current?.();
    setActiveJob(null);
  }

  if (!meta) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        {error ? `Fehler beim Laden: ${error}` : 'Lädt…'}
      </div>
    );
  }

  const isBusy = activeJob && activeJob.status !== 'done' && activeJob.status !== 'error';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Header aiEnabled={meta.aiEnabled} />

      <div className="mt-8 grid grid-cols-3 gap-3 sm:mt-10">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4">
            <p className="text-xs font-semibold text-slate-200 sm:text-sm">{f.title}</p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">{f.text}</p>
          </div>
        ))}
      </div>

      <main className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-panel/60 p-6">
            <ScriptForm meta={meta} onSubmit={handleSubmit} submitting={submitting} disabled={isBusy} />
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </section>

        <section className="space-y-6 lg:col-span-2">
          {activeJob && activeJob.status === 'done' && (
            <ResultPanel job={activeJob} onReset={handleReset} />
          )}
          {activeJob && activeJob.status !== 'done' && <ProgressPanel job={activeJob} />}
          {!activeJob && (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
              Dein generiertes Video erscheint hier.
            </div>
          )}
          <HistoryList jobs={jobs} activeId={activeJob?.id} onSelect={handleSelectHistory} />
        </section>
      </main>

      <footer className="mt-16 border-t border-white/5 pt-6 text-center text-xs text-slate-600">
        AI Video Studio — läuft vollständig lokal. {meta.aiEnabled ? '' : 'Offline-Modus ohne API-Key aktiv.'}
      </footer>
    </div>
  );
}
