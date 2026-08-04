const STATUS_LABEL = {
  queued: 'wartet',
  processing: 'läuft…',
  done: 'fertig',
  error: 'Fehler',
};

export default function HistoryList({ jobs, activeId, onSelect }) {
  if (!jobs.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/60 p-6">
      <h2 className="mb-4 text-sm font-semibold text-slate-200">Verlauf</h2>
      <div className="space-y-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onSelect(job.id)}
            className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
              job.id === activeId
                ? 'border-accent bg-accent/10'
                : 'border-white/5 bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/40">
              {job.posterUrl ? (
                <img src={job.posterUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-slate-600">–</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-200">{job.title || 'Ohne Titel'}</p>
              <p className="text-[11px] text-slate-500">
                {job.options?.aspect} · {STATUS_LABEL[job.status] || job.status}
                {job.status === 'processing' ? ` (${Math.round(job.progress)}%)` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
