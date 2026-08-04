function formatDuration(seconds) {
  if (!seconds) return '–';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ResultPanel({ job, onReset }) {
  const aspect = job.options?.aspect || '16:9';
  const frameClass =
    aspect === '9:16' ? 'aspect-[9/16] max-w-xs' : aspect === '1:1' ? 'aspect-square max-w-md' : 'aspect-video';

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Dein Video ist fertig</h2>
        <span className="text-xs text-slate-500">{formatDuration(job.totalDuration)} Min.</span>
      </div>

      <div className={`mx-auto overflow-hidden rounded-xl border border-white/10 bg-black ${frameClass}`}>
        <video
          src={job.videoUrl}
          poster={job.posterUrl}
          controls
          className="h-full w-full"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={job.videoUrl}
          download={`${job.title || 'video'}.mp4`}
          className="flex-1 rounded-xl bg-gradient-to-r from-accent to-fuchsia-500 px-4 py-3 text-center text-sm font-bold text-white shadow-glow transition hover:brightness-110"
        >
          Video herunterladen
        </a>
        <button
          onClick={onReset}
          className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/30"
        >
          Neues Video
        </button>
      </div>

      {job.scenes?.length > 0 && (
        <div className="mt-6 space-y-1.5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {job.scenes.length} Szenen
          </p>
          {job.scenes.map((scene) => (
            <div
              key={scene.index}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs text-slate-400"
            >
              <span className="truncate">{scene.text}</span>
              <span className="shrink-0">{formatDuration(scene.duration)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
