/** Greedy word-wrap used to prepare drawtext `textfile` contents. */
export function wrapText(text, maxCharsPerLine, maxLines = 6) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[maxLines - 1] = `${truncated[maxLines - 1].replace(/[.,;:]?$/, '')}…`;
    return truncated;
  }
  return lines;
}
