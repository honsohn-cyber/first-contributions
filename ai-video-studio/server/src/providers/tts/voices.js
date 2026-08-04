export const VOICES = [
  {
    id: 'alloy',
    label: 'Alloy — neutral & klar',
    openaiVoice: 'alloy',
    espeak: { variant: 'm3', speed: 165, pitch: 45 },
  },
  {
    id: 'nova',
    label: 'Nova — warm & freundlich',
    openaiVoice: 'nova',
    espeak: { variant: 'f3', speed: 160, pitch: 55 },
  },
  {
    id: 'onyx',
    label: 'Onyx — tief & seriös',
    openaiVoice: 'onyx',
    espeak: { variant: 'm5', speed: 150, pitch: 25 },
  },
  {
    id: 'shimmer',
    label: 'Shimmer — energiegeladen',
    openaiVoice: 'shimmer',
    espeak: { variant: 'f4', speed: 182, pitch: 65 },
  },
];

export function resolveVoice(voiceId) {
  return VOICES.find((v) => v.id === voiceId) || VOICES[0];
}
