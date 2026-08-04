export const STYLES = [
  {
    id: 'aurora',
    label: 'Aurora — Blau/Violett',
    imagePrompt: 'cinematic, ethereal aurora lighting, deep blues and violets, dramatic atmosphere',
    palette: [['0f2027', '5b247a'], ['1e3c72', '2a5298'], ['360033', '0b8793']],
  },
  {
    id: 'sunset',
    label: 'Sunset — Warm & energisch',
    imagePrompt: 'cinematic golden hour lighting, warm oranges and pinks, vibrant and energetic',
    palette: [['ff512f', 'dd2476'], ['f7971e', 'ffd200'], ['ee0979', 'ff6a00']],
  },
  {
    id: 'ocean',
    label: 'Ocean — Frisch & klar',
    imagePrompt: 'clean, crisp lighting, ocean blues and teals, modern and airy',
    palette: [['2193b0', '6dd5ed'], ['00c6ff', '0072ff'], ['136a8a', '267871']],
  },
  {
    id: 'mono',
    label: 'Mono — Elegant & minimal',
    imagePrompt: 'minimalist, high contrast black and white, elegant studio lighting',
    palette: [['232526', '414345'], ['0f0c29', '302b63'], ['1c1c1c', '3a3a3a']],
  },
  {
    id: 'forest',
    label: 'Forest — Natürlich & ruhig',
    imagePrompt: 'soft natural daylight, deep greens and earth tones, calm and organic',
    palette: [['134e5e', '71b280'], ['0f2027', '2c5364'], ['1a2a6c', '2c5364']],
  },
];

export function resolveStyle(styleId) {
  return STYLES.find((s) => s.id === styleId) || STYLES[0];
}
