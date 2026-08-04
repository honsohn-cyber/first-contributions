export const RESOLUTIONS = {
  '16:9': { output: { w: 1920, h: 1080 }, card: { w: 2400, h: 1350 } },
  '9:16': { output: { w: 1080, h: 1920 }, card: { w: 1350, h: 2400 } },
  '1:1': { output: { w: 1080, h: 1080 }, card: { w: 1600, h: 1600 } },
};

export function resolveAspect(aspect) {
  return RESOLUTIONS[aspect] ? aspect : '16:9';
}
