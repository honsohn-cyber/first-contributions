// Curated selection of ElevenLabs' standard premade voices (multilingual,
// so they work well for both German and English scripts).
export const ELEVENLABS_VOICES = [
  { id: 'rachel', label: 'Rachel — klar & ruhig (weiblich)', voiceId: '21m00Tcm4TlvDq8ikWAM' },
  { id: 'domi', label: 'Domi — selbstbewusst & energisch (weiblich)', voiceId: 'AZnzlk1XvdvUeBnXmlld' },
  { id: 'bella', label: 'Bella — sanft & warm (weiblich)', voiceId: 'EXAVITQu4vr4xnSDxMaL' },
  { id: 'elli', label: 'Elli — jugendlich & lebendig (weiblich)', voiceId: 'MF3mGyEYCl7XYWbV9V6O' },
  { id: 'antoni', label: 'Antoni — ausgewogen & angenehm (männlich)', voiceId: 'ErXwobaYiN019PkySvjV' },
  { id: 'josh', label: 'Josh — tief & seriös (männlich)', voiceId: 'TxGEqnHWrfWFTfGW9XjX' },
  { id: 'arnold', label: 'Arnold — kraftvoll & markant (männlich)', voiceId: 'VR6AewLTigWG4xSOukaG' },
  { id: 'adam', label: 'Adam — neutral & vielseitig (männlich)', voiceId: 'pNInz6obpgDQGcFmaJgB' },
];

// Offline fallback voices (espeak-ng) used when no ELEVENLABS_API_KEY is set.
export const ESPEAK_VOICES = [
  { id: 'alloy', label: 'Alloy — neutral & klar', espeak: { variant: 'm3', speed: 165, pitch: 45 } },
  { id: 'nova', label: 'Nova — warm & freundlich', espeak: { variant: 'f3', speed: 160, pitch: 55 } },
  { id: 'onyx', label: 'Onyx — tief & seriös', espeak: { variant: 'm5', speed: 150, pitch: 25 } },
  { id: 'shimmer', label: 'Shimmer — energiegeladen', espeak: { variant: 'f4', speed: 182, pitch: 65 } },
];
