import { MockAdapter } from './adapters/mock';
import { FalAdapter } from './adapters/fal';
import { FashnAdapter } from './adapters/fashn';
import { OpenAIAdapter } from './adapters/openai';
import { ReplicateAdapter } from './adapters/replicate';
export const DEFAULT_STYLES = [
  {
    id: 'style-slim-2p-notch',
    code: 'STYLE-SLIM-2P-NOTCH',
    name_th: 'สูทกระดุมแถวเดียว 2 เม็ด ปก Notch (Slim Fit)',
    name_en: 'Slim Fit Single-Breasted 2-Button Notch Lapel Suit',
    category: 'Suit-2P',
    fit_type: 'Slim Fit',
    button_style: 'Single-2',
    lapel_style: 'Notch',
    pocket_style: 'Flap',
    vent_style: 'Double',
    vest_style: 'None',
  },
  {
    id: 'style-classic-2p-peak',
    code: 'STYLE-CLASSIC-2P-PEAK',
    name_th: 'สูทกระดุมแถวเดียว 2 เม็ด ปก Peak (Classic Fit)',
    name_en: 'Classic Fit Single-Breasted 2-Button Peak Lapel Suit',
    category: 'Suit-2P',
    fit_type: 'Classic Fit',
    button_style: 'Single-2',
    lapel_style: 'Peak',
    pocket_style: 'Flap',
    vent_style: 'Double',
    vest_style: 'None',
  },
  {
    id: 'style-db-tux-shawl',
    code: 'STYLE-DB-TUX-SHAWL',
    name_th: 'ทักซิโด้กระดุมสองแถว 6 เม็ด ปก Shawl (Tailored Fit)',
    name_en: 'Tailored Fit Double-Breasted 6-Button Shawl Tuxedo',
    category: 'Tuxedo',
    fit_type: 'Tailored Fit',
    button_style: 'Double-6',
    lapel_style: 'Shawl',
    pocket_style: 'Jetted',
    vent_style: 'None',
    vest_style: 'None',
  },
  {
    id: 'style-3p-exec-peak',
    code: 'STYLE-3P-EXEC-PEAK',
    name_th: 'สูทสามชิ้นกระดุมแถวเดียว ปก Peak พร้อมเสื้อกั๊ก (Tailored Fit)',
    name_en: 'Tailored Fit 3-Piece Executive Peak Lapel Suit',
    category: 'Suit-3P',
    fit_type: 'Tailored Fit',
    button_style: 'Single-2',
    lapel_style: 'Peak',
    pocket_style: 'Flap',
    vent_style: 'Double',
    vest_style: 'Single-Breasted',
  },
  {
    id: 'style-blazer-patch',
    code: 'STYLE-BLAZER-PATCH',
    name_th: 'เบลเซอร์ลำลองกระดุม 2 เม็ด กระเป๋าแปะ (Comfort Fit)',
    name_en: 'Comfort Fit Casual Blazer with Patch Pockets',
    category: 'Blazer',
    fit_type: 'Comfort Fit',
    button_style: 'Single-2',
    lapel_style: 'Notch',
    pocket_style: 'Patch',
    vent_style: 'Center',
    vest_style: 'None',
  }
];

export const DEFAULT_PATTERNS = [
  {
    id: 'suit-midnight-navy',
    code: 'SUIT-MIDNIGHT-NAVY',
    name_th: 'กรมท่าเข้ม',
    name_en: 'Midnight Navy',
    primary_hex: '#101B33',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'กรมท่าเข้มคลาสสิก ให้ภาพลักษณ์สุขุมและเป็นทางการ',
    recommended_shirt: 'White',
    recommended_tie: 'Burgundy หรือ Silver',
  },
  {
    id: 'suit-classic-navy',
    code: 'SUIT-CLASSIC-NAVY',
    name_th: 'กรมท่าคลาสสิก',
    name_en: 'Classic Navy',
    primary_hex: '#1D3155',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'เหมาะกับการทำงานและโอกาสทางธุรกิจทั่วไป',
    recommended_shirt: 'White หรือ Light Blue',
    recommended_tie: 'Navy, Red',
  },
  {
    id: 'suit-royal-blue',
    code: 'SUIT-ROYAL-BLUE',
    name_th: 'น้ำเงินรอยัล',
    name_en: 'Royal Blue',
    primary_hex: '#254A84',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'สีสดขึ้นเล็กน้อย เหมาะกับงานแต่งและงานกลางวัน',
    recommended_shirt: 'White',
    recommended_tie: 'Navy หรือ Champagne',
  },
  {
    id: 'suit-charcoal-grey',
    code: 'SUIT-CHARCOAL-GREY',
    name_th: 'เทาชาร์โคล',
    name_en: 'Charcoal Grey',
    primary_hex: '#3C3F45',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'สีเทาเข้มสำหรับผู้บริหารและงานทางการ',
    recommended_shirt: 'White หรือ Pale Blue',
    recommended_tie: 'Black, Burgundy',
  },
  {
    id: 'suit-medium-grey',
    code: 'SUIT-MEDIUM-GREY',
    name_th: 'เทากลาง',
    name_en: 'Medium Grey',
    primary_hex: '#686B70',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'ใช้งานง่าย เหมาะกับทั้งงานกลางวันและกลางคืน',
    recommended_shirt: 'White, Blue, Pink',
    recommended_tie: 'Navy',
  },
  {
    id: 'suit-light-grey',
    code: 'SUIT-LIGHT-GREY',
    name_th: 'เทาอ่อน',
    name_en: 'Light Grey',
    primary_hex: '#A6A8AB',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'เหมาะกับอากาศร้อน งานกลางวัน และงานแต่ง',
    recommended_shirt: 'White',
    recommended_tie: 'Pastel Blue หรือ Pink',
  },
  {
    id: 'suit-jet-black',
    code: 'SUIT-JET-BLACK',
    name_th: 'ดำสนิท',
    name_en: 'Jet Black',
    primary_hex: '#111111',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'สีดำหรูสำหรับงานพิธี งานกลางคืน และงานเป็นทางการ',
    recommended_shirt: 'White',
    recommended_tie: 'Black',
  },
  {
    id: 'suit-warm-beige',
    code: 'SUIT-WARM-BEIGE',
    name_th: 'เบจอุ่น',
    name_en: 'Warm Beige',
    primary_hex: '#B49A78',
    secondary_hex: null,
    pattern_type: 'Solid',
    pattern_scale: 'medium',
    pattern_description: 'ให้ภาพลักษณ์อบอุ่น สบาย เหมาะกับงานกลางแจ้ง',
    recommended_shirt: 'White หรือ Cream',
    recommended_tie: 'Brown',
  },
  {
    id: 'suit-navy-pinstripe',
    code: 'SUIT-NAVY-PINSTRIPE',
    name_th: 'กรมท่าลายทางเล็ก',
    name_en: 'Navy Pinstripe',
    primary_hex: '#17243C',
    secondary_hex: '#A7B0C0',
    pattern_type: 'Pinstripe',
    pattern_scale: 'small',
    pattern_description: 'ลายเส้นแนวตั้งช่วยให้รูปร่างดูสูงและเพรียว',
    recommended_shirt: 'White',
    recommended_tie: 'Burgundy',
  },
  {
    id: 'suit-charcoal-pinstripe',
    code: 'SUIT-CHARCOAL-PINSTRIPE',
    name_th: 'เทาชาร์โคลลายทาง',
    name_en: 'Charcoal Pinstripe',
    primary_hex: '#37393D',
    secondary_hex: '#9DA0A4',
    pattern_type: 'Pinstripe',
    pattern_scale: 'small',
    pattern_description: 'ลายทางแบบผู้บริหาร เหมาะกับงานธุรกิจระดับสูง',
    recommended_shirt: 'White',
    recommended_tie: 'Black หรือ Silver',
  },
  {
    id: 'suit-prince-wales-grey',
    code: 'SUIT-PRINCE-WALES-GREY',
    name_th: 'เทาลายปรินซ์ออฟเวลส์',
    name_en: 'Prince of Wales Grey',
    primary_hex: '#777A7C',
    secondary_hex: '#35383B',
    pattern_type: 'Check',
    pattern_scale: 'medium',
    pattern_description: 'ลายตารางอังกฤษ ให้ลุคคลาสสิกและมีรายละเอียด',
    recommended_shirt: 'White หรือ Light Blue',
    recommended_tie: 'Burgundy',
  },
  {
    id: 'suit-navy-windowpane',
    code: 'SUIT-NAVY-WINDOWPANE',
    name_th: 'กรมท่าลายตารางใหญ่',
    name_en: 'Navy Windowpane',
    primary_hex: '#1B2B48',
    secondary_hex: '#7183A0',
    pattern_type: 'Windowpane',
    pattern_scale: 'large',
    pattern_description: 'ลายตารางใหญ่ที่ดูทันสมัย เหมาะกับผู้ที่ต้องการความโดดเด่น',
    recommended_shirt: 'White',
    recommended_tie: 'Navy',
  }
];
export interface TryOnGenerationInput {
  sessionId: string;
  sourceImageUrl: string;
  garmentImageUrl?: string;
  personDescription?: string;
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
  switch (providerName) {
    case 'Fal':
      return new FalAdapter();
    case 'Fashn':
      return new FashnAdapter();
    case 'OpenAI':
      return new OpenAIAdapter();
    case 'Replicate':
      return new ReplicateAdapter();
    default:
      return new MockAdapter();
  }
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
