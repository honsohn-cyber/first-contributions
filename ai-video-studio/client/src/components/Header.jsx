export default function Header({ aiEnabled }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-fuchsia-500 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none">
              <path d="M5 4.5v15l14-7.5-14-7.5Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            AI Video Studio
          </h1>
        </div>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          Skript einfügen, Stil wählen — fertig ist ein vollständig vertontes Video mit
          Untertiteln und Ken-Burns-Bewegtbild.
        </p>
      </div>
      <span
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
          aiEnabled
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${aiEnabled ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        {aiEnabled ? 'KI-Bilder & KI-Stimmen aktiv' : 'Offline-Modus: kostenlose Stimmen & Grafik-Karten'}
      </span>
    </header>
  );
}
