import { getProviderAdapter } from './adapters/mock';

export interface TryOnGenerationInput {
  sessionId: string;
  sourceImageUrl: string;
  garmentType: string;
  fitType: string;
  styleDetails: string;
  colorHex: string;
  patternType: string;
  patternDesc: string;
  preserveFace: 'low' | 'medium' | 'high';
  preserveHair: boolean;
  preserveBody: boolean;
  preservePose: boolean;
  preserveBackground: boolean;
  backgroundMode: 'original' | 'studio';
  numImages: number;
}

export interface TryOnGenerationResult {
  providerJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  outputImageUrls?: string[];
  estimatedCost: number;
  error?: string;
}

export interface TryOnJobStatus {
  providerJobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progressPct?: number;
  outputImageUrls?: string[];
  error?: string;
}

export interface VirtualTryOnProvider {
  generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult>;
  getStatus(jobId: string): Promise<TryOnJobStatus>;
  cancel(jobId: string): Promise<void>;
}

/**
 * Server-Side dynamic registry to load Virtual Try-On API adapters.
 */
export function getProvider(providerName: string): VirtualTryOnProvider {
  // Currently redirecting everything through getProviderAdapter
  // (which handles Mock and has adapters for others)
  return getProviderAdapter(providerName);
}

/**
 * Server-side Prompt Builder compiling styles and pattern choices.
 */
export function buildGarmentPrompt(style: any, colorPattern: any): string {
  const parts = [
    `garment type: ${style.category || 'suit'}`,
    `cut fit: ${style.fit_type || 'slim fit'}`,
    `jacket button style: ${style.button_style || 'single-breasted'}`,
    `lapel type: ${style.lapel_style || 'notch'} lapel`,
    `pocket configuration: ${style.pocket_style || 'flap'} pocket`,
    `back vents: ${style.vent_style || 'double'} vent`,
  ];

  if (style.vest_style && style.vest_style !== 'None') {
    parts.push(`vest: matching ${style.vest_style} vest`);
  }

  parts.push(
    `suit main color: ${colorPattern.name_en || 'navy'} (${colorPattern.primary_hex})`,
    `fabric pattern: ${colorPattern.pattern_type}`,
    `pattern details: ${colorPattern.pattern_description || 'solid structured wool texture'}`,
    `recommended shirt: ${colorPattern.recommended_shirt || 'white classic shirt'}`
  );

  if (colorPattern.recommended_tie) {
    parts.push(`neckwear: matching ${colorPattern.recommended_tie}`);
  }

  return parts.join(', ');
}

export const DEFAULT_NEGATIVE_PROMPT = `
different person, changed identity, altered face, beautified face, de-aged face,
incorrect eyes, distorted facial features, changed hairstyle, changed skin tone,
extra limbs, missing fingers, deformed hands, duplicated body parts,
incorrect lapel, incorrect buttons, wrong fabric pattern, warped suit,
unrealistic fabric, cartoon, illustration, low resolution, blurry face,
text, logo, watermark
`.trim();
