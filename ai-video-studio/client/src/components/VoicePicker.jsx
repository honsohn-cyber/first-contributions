import { useRef, useState } from 'react';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M6 4.5v15l14-7.5-14-7.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function VoicePicker({ voices, value, onChange, provider }) {
  const audioRef = useRef(null);
  const [preview, setPreview] = useState({ id: null, status: null });

  function togglePreview(e, id) {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;

    if (preview.id === id && preview.status === 'playing') {
      audio.pause();
      setPreview({ id: null, status: null });
      return;
    }

    setPreview({ id, status: 'loading' });
    audio.src = `/api/videos/voices/${id}/preview`;
    audio.play().catch(() => setPreview({ id: null, status: null }));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">Stimme</p>
        <span className="text-[11px] text-slate-500">
          {provider === 'elevenlabs' ? 'ElevenLabs' : 'Offline (espeak)'}
        </span>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2">
        {voices.map((v) => {
          const isActivePreview = preview.id === v.id;
          return (
            <label
              key={v.id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${
                value === v.id
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <input
                type="radio"
                name="voice"
                value={v.id}
                checked={value === v.id}
                onChange={() => onChange(v.id)}
                className="sr-only"
              />
              <button
                type="button"
                onClick={(e) => togglePreview(e, v.id)}
                aria-label={`${v.label} anhören`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-accent hover:text-accent-light"
              >
                {isActivePreview && preview.status === 'loading' && <SpinnerIcon />}
                {isActivePreview && preview.status === 'playing' && <PauseIcon />}
                {!(isActivePreview && (preview.status === 'loading' || preview.status === 'playing')) && (
                  <PlayIcon />
                )}
              </button>
              <span className="text-xs font-medium text-slate-200">{v.label}</span>
            </label>
          );
        })}
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        onPlaying={() => setPreview((p) => (p.id ? { ...p, status: 'playing' } : p))}
        onEnded={() => setPreview({ id: null, status: null })}
        onPause={() => setPreview((p) => (p.status === 'playing' ? { id: null, status: null } : p))}
        onError={() => setPreview({ id: null, status: null })}
      />
    </div>
  );
}
