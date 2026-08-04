const STAGES = [
  { key: 'analyzing', label: 'Skript analysieren' },
  { key: 'narration', label: 'Sprachausgabe erzeugen' },
  { key: 'visuals', label: 'Bildwelten erzeugen' },
  { key: 'rendering', label: 'Szenen rendern' },
  { key: 'assembling', label: 'Video zusammensetzen' },
  { key: 'done', label: 'Fertig' },
];

const SCENE_STATUS_LABEL = {
  pending: 'wartet',
  narration: 'Sprachausgabe…',
  visual: 'Bild wird erzeugt…',
  rendering: 'wird gerendert…',
  done: 'fertig',
};

function stageIndex(stage) {
  const i = STAGES.findIndex((s) => s.key === stage);
  return i === -1 ? 0 : i;
}

export default function ProgressPanel({ job }) {
  const currentIndex = stageIndex(job.stage);

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/60 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Dein Video entsteht…</h2>
        <span className="text-sm font-bold text-accent-light">{Math.round(job.progress || 0)}%</span>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-fuchsia-500 transition-all duration-500"
          style={{ width: `${Math.max(3, job.progress || 0)}%` }}
        />
      </div>

      <ol className="space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex || job.status === 'done';
          const active = i === currentIndex && job.status !== 'done';
          return (
            <li key={stage.key} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  done
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                    : active
                    ? 'border-accent bg-accent/20 text-accent-light animate-pulse'
                    : 'border-white/15 text-slate-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={done || active ? 'text-slate-200' : 'text-slate-500'}>{stage.label}</span>
            </li>
          );
        })}
      </ol>

      {job.scenes?.length > 0 && (
        <div className="mt-6 max-h-64 space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Szenen ({job.scenes.length})
          </p>
          {job.scenes.map((scene) => (
            <div
              key={scene.index}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-xs"
            >
              <span className="truncate text-slate-300">{scene.headline || scene.text}</span>
              <span
                className={`shrink-0 font-medium ${
                  scene.status === 'done' ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {SCENE_STATUS_LABEL[scene.status] || scene.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {job.status === 'error' && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Fehler: {job.error}
        </div>
      )}
    </div>
  );
}
