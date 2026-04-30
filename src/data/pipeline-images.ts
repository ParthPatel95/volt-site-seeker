import jinja from '@/assets/pipeline/jinja-uganda-hydro.jpg';
import texas from '@/assets/pipeline/texas-natgas.jpg';
import nepal from '@/assets/pipeline/nepal-mix.jpg';
import bhutan from '@/assets/pipeline/bhutan-hydro.jpg';
import india from '@/assets/pipeline/india-solar-hydro.jpg';
import newfoundland from '@/assets/pipeline/newfoundland-canada-hybrid.jpg';
import type { PipelineImageKey } from './advisory-pipeline';

export const PIPELINE_IMAGES: Record<PipelineImageKey, string> = {
  jinja,
  texas,
  nepal,
  bhutan,
  india,
  newfoundland,
};
