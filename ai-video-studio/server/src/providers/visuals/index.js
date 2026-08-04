import { hasOpenAI } from '../../config.js';
import { generateAIImage } from './openaiImages.js';
import { generateGradientCard } from './gradientCard.js';

export { STYLES, resolveStyle } from './styles.js';

/**
 * Generates the background visual for a scene. Uses AI image generation
 * when an API key is configured, otherwise falls back to a procedurally
 * rendered gradient title card so the app never produces a blank scene.
 */
export async function generateSceneVisual({ text, headline, styleId, sceneIndex, aspect, sceneDir }) {
  if (hasOpenAI()) {
    try {
      const file = await generateAIImage({ text, styleId, aspect, sceneDir });
      return { file, engine: 'openai' };
    } catch (err) {
      // Fall back gracefully rather than failing the whole video render.
      const file = await generateGradientCard({ headline, styleId, sceneIndex, aspect, sceneDir });
      return { file, engine: 'gradient-fallback', warning: err.message };
    }
  }

  const file = await generateGradientCard({ headline, styleId, sceneIndex, aspect, sceneDir });
  return { file, engine: 'gradient' };
}
