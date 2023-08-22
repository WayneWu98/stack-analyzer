import { defineConfig, toEscapedSelector as e } from 'unocss';
import presetWind from '@unocss/preset-wind';
import transformerVariantGroup from '@unocss/transformer-variant-group';

export default defineConfig({
  presets: [presetWind()],
  transformers: [transformerVariantGroup()],
  rules: [],
});
