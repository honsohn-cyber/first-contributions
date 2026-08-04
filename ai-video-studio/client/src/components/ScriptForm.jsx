import { useState } from 'react';
import VoicePicker from './VoicePicker.jsx';

const ASPECT_INFO = {
  '16:9': { label: 'Querformat', hint: 'YouTube, Web', shape: 'h-6 w-10' },
  '9:16': { label: 'Hochformat', hint: 'Shorts, Reels, TikTok', shape: 'h-10 w-6' },
  '1:1': { label: 'Quadrat', hint: 'Feed-Post', shape: 'h-8 w-8' },
};

const EXAMPLE_SCRIPT = `Willkommen bei AI Video Studio, der Plattform, die aus einem einfachen Textskript ein vollständiges Video erstellt.

Du schreibst einfach deinen Text, wählst eine Stimme und einen visuellen Stil.

Unsere Pipeline erzeugt automatisch Sprachausgabe, passende Hintergrundbilder und Untertitel für jede Szene.

Am Ende erhältst du ein fertiges, herunterladbares Video in hoher Qualität.`;

const MAX_LENGTH = 8000;

export default function ScriptForm({ meta, onSubmit, submitting, disabled }) {
  const [script, setScript] = useState('');
  const [aspect, setAspect] = useState('16:9');
  const [styleId, setStyleId] = useState(meta.styles[0]?.id);
  const [voiceId, setVoiceId] = useState(meta.voices[0]?.id);
  const [language, setLanguage] = useState('auto');

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!script.trim() || submitting) return;
    onSubmit({ script, aspect, styleId, voiceId, language });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="script" className="text-sm font-semibold text-slate-200">
            Dein Skript
          </label>
          <button
            type="button"
            onClick={() => setScript(EXAMPLE_SCRIPT)}
            className="text-xs font-medium text-accent-light hover:text-white"
          >
            Beispiel einfügen
          </button>
        </div>
        <textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Schreibe oder füge deinen Skripttext ein. Trenne Szenen mit einer Leerzeile für die beste Kontrolle über den Szenenwechsel…"
          rows={10}
          className="w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="mt-1.5 flex justify-between text-xs text-slate-500">
          <span>Leerzeile = neue Szene. Sonst wird automatisch sinnvoll aufgeteilt.</span>
          <span>{wordCount} Wörter · {script.length}/{MAX_LENGTH}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-200">Format</p>
        <div className="grid grid-cols-3 gap-2">
          {meta.aspects.map((a) => {
            const info = ASPECT_INFO[a] || { label: a, hint: '', shape: 'h-8 w-8' };
            const active = aspect === a;
            return (
              <button
                type="button"
                key={a}
                onClick={() => setAspect(a)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                  active
                    ? 'border-accent bg-accent/10 shadow-glow'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex h-10 items-center justify-center">
                  <div className={`rounded-sm border-2 ${active ? 'border-accent-light' : 'border-slate-500'} ${info.shape}`} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">{info.label} · {a}</div>
                  <div className="text-[10px] text-slate-500">{info.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-200">Visueller Stil</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {meta.styles.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setStyleId(s.id)}
              className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition ${
                styleId === s.id
                  ? 'border-accent bg-accent/10 text-white shadow-glow'
                  : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <VoicePicker
        voices={meta.voices}
        value={voiceId}
        onChange={setVoiceId}
        provider={meta.voiceProvider}
      />

      <div>
        <label htmlFor="language" className="mb-2 block text-sm font-semibold text-slate-200">
          Sprache
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 p-2.5 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-1/2"
        >
          <option value="auto">Automatisch erkennen</option>
          <option value="de">Deutsch</option>
          <option value="en">Englisch</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!script.trim() || submitting || disabled}
        className="w-full rounded-xl bg-gradient-to-r from-accent to-fuchsia-500 px-4 py-3.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Video wird erstellt…' : 'Video erstellen'}
      </button>
    </form>
  );
}
