const MIN_WORDS_PER_SCENE = 10;
const MAX_WORDS_PER_SCENE = 28;

const STOPWORDS = new Set([
  'der', 'die', 'das', 'und', 'oder', 'ein', 'eine', 'einen', 'einem', 'einer',
  'ist', 'sind', 'war', 'waren', 'mit', 'von', 'zu', 'im', 'in', 'auf', 'für',
  'the', 'a', 'an', 'and', 'or', 'is', 'are', 'was', 'were', 'with', 'of',
  'to', 'in', 'on', 'for', 'it', 'this', 'that', 'as', 'at', 'by',
]);

function splitIntoSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [];
}

function chunkSentences(sentences) {
  const chunks = [];
  let current = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean).length;
    if (currentWords + words > MAX_WORDS_PER_SCENE && currentWords >= MIN_WORDS_PER_SCENE) {
      chunks.push(current.join(' '));
      current = [];
      currentWords = 0;
    }
    current.push(sentence);
    currentWords += words;
  }
  if (current.length) chunks.push(current.join(' '));
  return chunks;
}

function headlineFor(text) {
  const words = text
    .replace(/[.,!?;:„“"']/g, '')
    .split(/\s+/)
    .filter(Boolean);
  const significant = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  const picked = (significant.length ? significant : words).slice(0, 4);
  return picked
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Splits a raw script into scenes. Users may separate scenes explicitly with
 * a blank line or a "---" marker; otherwise scenes are inferred by grouping
 * sentences up to a target word count so narration pacing stays natural.
 */
export function parseScript(rawScript) {
  const normalized = rawScript.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const explicitBlocks = normalized
    .split(/\n\s*\n|\n\s*---+\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const scenes = [];
  for (const block of explicitBlocks) {
    const sentences = splitIntoSentences(block);
    const chunks = chunkSentences(sentences);
    for (const chunk of chunks) {
      scenes.push(chunk);
    }
  }

  return scenes.map((text, index) => ({
    index,
    text,
    headline: headlineFor(text),
    wordCount: text.split(/\s+/).filter(Boolean).length,
  }));
}

/** Very small heuristic to pick a default narration language. */
export function detectLanguage(rawScript) {
  const sample = rawScript.toLowerCase();
  const germanHints = ['der ', 'die ', 'und ', 'ist ', 'nicht ', 'ich ', 'ein ', 'für ', 'mit ', 'ä', 'ö', 'ü', 'ß'];
  const hits = germanHints.reduce((n, hint) => n + (sample.includes(hint) ? 1 : 0), 0);
  return hits >= 3 ? 'de' : 'en';
}
