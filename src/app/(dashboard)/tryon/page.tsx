'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Camera,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  Scissors,
  Check,
  ChevronRight,
  Info,
  Heart,
  Eye,
  Trash2,
  Scale,
  Shield,
  Signature,
  DollarSign,
  HelpCircle,
  Download,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CameraCapture from '@/components/tryon/camera-capture';
import CompareMode from '@/components/tryon/compare-mode';
import { Button } from '@/components/ui/button';

const DEFAULT_STYLES = [
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

const DEFAULT_PATTERNS = [
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

const generateCompositeImage = (
  sourceUrl: string,
  colorHex: string,
  patternType: string,
  style: any
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(sourceUrl);
          return;
        }

        // Set size to match the source image
        canvas.width = img.naturalWidth || img.width || 600;
        canvas.height = img.naturalHeight || img.height || 800;

        // Draw original user photo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        // The silhouette guide expects the head around cy = 0.2 * h, r = 0.075 * h
        // Neck is around cy = 0.27 * h to 0.31 * h
        // Shoulders are around Y = 0.31 * h
        const neckLeft = w * 0.4625;
        const neckRight = w * 0.5375;
        const neckTop = h * 0.275;
        const neckBottom = h * 0.308;

        const shoulderLeft = w * 0.25;
        const shoulderRight = w * 0.75;
        const shoulderY = h * 0.35;

        const bodyLeft = w * 0.28;
        const bodyRight = w * 0.72;
        const bodyBottom = h;

        // 1. Draw White Shirt (V-Neck area)
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(w * 0.465, neckTop);
        ctx.lineTo(w * 0.535, neckTop);
        ctx.lineTo(w * 0.50, h * 0.45); // deep V-neck
        ctx.closePath();
        ctx.fill();

        // Draw collar lines for shirt V-neck
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = Math.max(1, w * 0.003);
        ctx.beginPath();
        ctx.moveTo(w * 0.465, neckTop);
        ctx.lineTo(w * 0.49, h * 0.35);
        ctx.lineTo(w * 0.50, h * 0.35);
        ctx.lineTo(w * 0.51, h * 0.35);
        ctx.lineTo(w * 0.535, neckTop);
        ctx.stroke();

        // 2. Draw Tie (Elegant Red/Gold Tie)
        ctx.fillStyle = '#9B2C2C'; // Dark Red Tie
        ctx.beginPath();
        ctx.moveTo(w * 0.49, h * 0.30);
        ctx.lineTo(w * 0.51, h * 0.30);
        ctx.lineTo(w * 0.515, h * 0.42);
        ctx.lineTo(w * 0.50, h * 0.47); // Point of the tie
        ctx.lineTo(w * 0.485, h * 0.42);
        ctx.closePath();
        ctx.fill();

        // Tie knot
        ctx.fillStyle = '#742A2A';
        ctx.beginPath();
        ctx.moveTo(w * 0.485, h * 0.30);
        ctx.lineTo(w * 0.515, h * 0.30);
        ctx.lineTo(w * 0.51, h * 0.33);
        ctx.lineTo(w * 0.49, h * 0.33);
        ctx.closePath();
        ctx.fill();

        // 3. Draw Suit Jacket main body
        ctx.save();
        
        ctx.fillStyle = colorHex || '#101B33';
        ctx.beginPath();
        // Start from neck left
        ctx.moveTo(neckLeft, neckBottom);
        // Curve to left shoulder
        ctx.quadraticCurveTo(w * 0.35, h * 0.31, shoulderLeft, shoulderY);
        // Down left side
        ctx.lineTo(bodyLeft, bodyBottom);
        // Across bottom
        ctx.lineTo(bodyRight, bodyBottom);
        // Up right side
        ctx.lineTo(shoulderRight, shoulderY);
        // Curve to neck right
        ctx.quadraticCurveTo(w * 0.65, h * 0.31, neckRight, neckBottom);
        // Deep V-neck cut
        ctx.lineTo(w * 0.50, h * 0.45);
        ctx.closePath();
        ctx.fill();

        // Clip to the jacket area to apply patterns & shading
        ctx.clip();

        // Draw Pattern
        if (patternType === 'Pinstripe') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = Math.max(1, w * 0.002);
          const spacing = w * 0.025;
          for (let x = -w; x < w * 2; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + w * 0.1, h); // slightly angled vertical lines
            ctx.stroke();
          }
        } else if (patternType === 'Check' || patternType === 'Windowpane') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = Math.max(1, w * 0.0015);
          const spacing = patternType === 'Windowpane' ? w * 0.08 : w * 0.04;
          // Vertical lines
          for (let x = -w; x < w * 2; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + w * 0.05, h);
            ctx.stroke();
          }
          // Horizontal lines
          for (let y = 0; y < h; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }
        } else if (patternType === 'Herringbone') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = Math.max(1, w * 0.001);
          const size = w * 0.01;
          for (let y = 0; y < h; y += size) {
            ctx.beginPath();
            for (let x = 0; x < w; x += size * 2) {
              ctx.moveTo(x, y);
              ctx.lineTo(x + size, y + size);
              ctx.lineTo(x + size * 2, y);
            }
            ctx.stroke();
          }
        }

        // Draw Shading & Shadows (3D depth)
        // Shoulder highlights
        const shoulderGrad = ctx.createLinearGradient(0, h * 0.3, 0, h * 0.45);
        shoulderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        shoulderGrad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = shoulderGrad;
        ctx.fillRect(0, 0, w, h);

        // Side shadows
        const sideGrad = ctx.createLinearGradient(shoulderLeft, 0, shoulderRight, 0);
        sideGrad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
        sideGrad.addColorStop(0.15, 'rgba(0, 0, 0, 0)');
        sideGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        sideGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0)');
        sideGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx.fillStyle = sideGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();

        // 4. Draw Lapels (Over the jacket body)
        ctx.fillStyle = colorHex || '#101B33';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = Math.max(1, w * 0.002);

        // Left Lapel
        ctx.beginPath();
        ctx.moveTo(w * 0.47, neckTop);
        ctx.lineTo(w * 0.42, h * 0.35); // outer corner
        if (style?.lapel_style === 'Peak') {
          ctx.lineTo(w * 0.39, h * 0.335); // peak accent out
          ctx.lineTo(w * 0.425, h * 0.35); // peak accent in
        } else {
          // Notch lapel
          ctx.lineTo(w * 0.435, h * 0.355); // notch cut
          ctx.lineTo(w * 0.42, h * 0.36); // back down
        }
        ctx.lineTo(w * 0.49, h * 0.45); // deep lapel tip
        ctx.lineTo(w * 0.49, neckBottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right Lapel
        ctx.beginPath();
        ctx.moveTo(w * 0.53, neckTop);
        ctx.lineTo(w * 0.58, h * 0.35); // outer corner
        if (style?.lapel_style === 'Peak') {
          ctx.lineTo(w * 0.61, h * 0.335); // peak accent out
          ctx.lineTo(w * 0.575, h * 0.35); // peak accent in
        } else {
          // Notch lapel
          ctx.lineTo(w * 0.565, h * 0.355); // notch cut
          ctx.lineTo(w * 0.58, h * 0.36); // back down
        }
        ctx.lineTo(w * 0.51, h * 0.45); // deep lapel tip
        ctx.lineTo(w * 0.51, neckBottom);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw lapel fold shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.moveTo(w * 0.42, h * 0.35);
        ctx.lineTo(w * 0.47, h * 0.35);
        ctx.lineTo(w * 0.49, h * 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(w * 0.58, h * 0.35);
        ctx.lineTo(w * 0.53, h * 0.35);
        ctx.lineTo(w * 0.51, h * 0.45);
        ctx.closePath();
        ctx.fill();

        // 5. Draw Buttons & Center Line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = Math.max(1, w * 0.001);
        ctx.beginPath();
        ctx.moveTo(w * 0.50, h * 0.45);
        ctx.lineTo(w * 0.50, h);
        ctx.stroke();

        // Buttons
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = Math.max(1, w * 0.0005);
        const drawButton = (bx: number, by: number) => {
          ctx.beginPath();
          ctx.arc(bx, by, w * 0.012, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        };

        if (style?.button_style === 'Double-6') {
          // Double breasted buttons (6 buttons in 3 pairs)
          drawButton(w * 0.46, h * 0.50);
          drawButton(w * 0.54, h * 0.50);
          drawButton(w * 0.46, h * 0.56);
          drawButton(w * 0.54, h * 0.56);
          drawButton(w * 0.46, h * 0.62);
          drawButton(w * 0.54, h * 0.62);
        } else {
          // Single breasted (2 buttons)
          drawButton(w * 0.50, h * 0.52);
          drawButton(w * 0.50, h * 0.60);
        }

        // Pocket detail
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(w * 0.33, h * 0.38, w * 0.08, h * 0.02); // Left breast pocket
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeRect(w * 0.33, h * 0.38, w * 0.08, h * 0.02);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.error(err);
        resolve(sourceUrl);
      }
    };
    img.onerror = () => {
      resolve(sourceUrl);
    };
  });
};

export default function AIVirtualTryOn() {
  const supabase = createClient();

  // Active step flow: 1=Select Customer, 2=Photo Capture, 3=Catalog Selection, 4=AI Processing, 5=Results
  const [activeStep, setActiveStep] = useState<number>(1);

  // Customer Management
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentSignature, setConsentSignature] = useState('');
  const [isConsentLoading, setIsConsentLoading] = useState(false);

  // Photo Capture & Upload
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [qualityCheck, setQualityCheck] = useState<any | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Catalog Selections
  const [styles, setStyles] = useState<any[]>(DEFAULT_STYLES);
  const [patterns, setPatterns] = useState<any[]>(DEFAULT_PATTERNS);
  const [selectedStyle, setSelectedStyle] = useState<any | null>(DEFAULT_STYLES[0]);
  const [selectedPattern, setSelectedPattern] = useState<any | null>(DEFAULT_PATTERNS[0]);
  
  // Generation Settings
  const [numImages, setNumImages] = useState<number>(2);
  const [preserveFace, setPreserveFace] = useState<'low' | 'medium' | 'high'>('medium');
  const [preserveHair, setPreserveHair] = useState(true);
  const [preserveBackground, setPreserveBackground] = useState(false);
  const [providerName, setProviderName] = useState('Mock');
  const [estimatedCost, setEstimatedCost] = useState(0.00);

  // Queue Polling & Generation Status
  const [jobId, setJobId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<string>('idle'); // idle, generating, completed, failed
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Output results
  const [tryonResults, setTryonResults] = useState<any[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Fetch styles and patterns catalog
  const fetchCatalog = async () => {
    try {
      const { data: stylesData } = await supabase
        .from('suit_styles')
        .select('*')
        .eq('is_active', true);
      
      if (stylesData && stylesData.length > 0) {
        setStyles(stylesData);
      } else {
        setStyles(DEFAULT_STYLES);
      }

      const { data: patternsData } = await supabase
        .from('suit_color_patterns')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (patternsData && patternsData.length > 0) {
        setPatterns(patternsData);
      } else {
        setPatterns(DEFAULT_PATTERNS);
      }
    } catch (e) {
      console.error(e);
      setStyles(DEFAULT_STYLES);
      setPatterns(DEFAULT_PATTERNS);
    }
  };

  useEffect(() => {
    fetchCatalog();
    
    // Auto load customer from query params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const customerIdParam = urlParams.get('customer_id');
      if (customerIdParam) {
        const fetchInitialCustomer = async () => {
          try {
            const { data, error } = await supabase
              .from('customers')
              .select('*, customer_ai_consents(consented, signature_path)')
              .eq('id', customerIdParam)
              .single();

            if (error) throw error;
            if (data) {
              setSelectedCustomer(data);
              const hasConsent = data.customer_ai_consents?.some((consent: any) => consent.consented);
              if (!hasConsent) {
                setIsConsentModalOpen(true);
              } else {
                setActiveStep(2);
              }
            }
          } catch (e) {
            console.error('Failed to load initial customer:', e);
            // Fallback for mock IDs
            if (customerIdParam === '1') {
              const mockC = {
                id: 'a1000000-0000-0000-0000-000000000000',
                title: 'คุณ',
                first_name: 'สมชาย',
                last_name: 'วงศ์รัตน์',
                nickname: 'ชาย',
                phone: '089-999-8888',
                customer_tier: 'Regular',
                customer_ai_consents: [{ consented: true }],
              };
              setSelectedCustomer(mockC);
              setActiveStep(2);
            }
          }
        };
        fetchInitialCustomer();
      }
    }
  }, []);

  // Search customers
  const handleCustomerSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*, customer_ai_consents(consented, signature_path)')
        .is('deleted_at', null)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,phone.like.%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Customer query error:', err);
    }
  };

  // Choose customer & determine status
  const selectCustomer = (c: any) => {
    setSelectedCustomer(c);
    const hasConsent = c.customer_ai_consents?.some((consent: any) => consent.consented);
    if (!hasConsent) {
      setIsConsentModalOpen(true);
    } else {
      setActiveStep(2);
    }
  };

  // Consent Signature Drawer Drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Log PDPA Consent
  const submitConsent = async () => {
    if (!selectedCustomer) return;
    setIsConsentLoading(true);
    try {
      // Save mockup signature path
      const consentPayload = {
        customer_id: selectedCustomer.id,
        consented: true,
        consent_version: 'v1.0',
        signature_path: `signatures/${selectedCustomer.id}_sig.png`,
        device_info: { userAgent: navigator.userAgent },
      };

      const res = await fetch('/api/ai-tryon/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit consent');

      // Refresh customer details locally
      setSelectedCustomer({
        ...selectedCustomer,
        customer_ai_consents: [{ consented: true }],
      });

      setIsConsentModalOpen(false);
      setActiveStep(2);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsConsentLoading(false);
    }
  };

  const handleQuickTryOn = () => {
    const quickCustomer = {
      id: 'a1000000-0000-0000-0000-000000000000',
      title: 'คุณ',
      first_name: 'ลูกค้าทั่วไป',
      last_name: '(ลองสูทด่วน)',
      nickname: 'ด่วน',
      phone: '089-999-8888',
      customer_tier: 'Regular',
      customer_ai_consents: [{ consented: true }],
      pdpa_consent: true,
    };
    setSelectedCustomer(quickCustomer);
    setActiveStep(2);
  };

  // Receive Captured Blob from Camera Capture component
  const handlePhotoCapture = (blob: Blob) => {
    const imgFile = new File([blob], 'source_photo.jpg', { type: 'image/jpeg' });
    setSourceImage(imgFile);
    setSourcePreviewUrl(URL.createObjectURL(imgFile));
    setIsCameraOpen(false);
  };

  // Upload photo & run quality checker
  const handlePhotoUpload = async () => {
    if (!selectedCustomer || !sourceImage) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const dataPayload = new FormData();
      dataPayload.append('customer_id', selectedCustomer.id);
      dataPayload.append('file', sourceImage);

      const res = await fetch('/api/ai-tryon/sessions', {
        method: 'POST',
        body: dataPayload,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload error');

      setSessionId(result.session_id);
      setQualityCheck(result.quality_check);
      
      // Move to selection step if passed or warning
      if (result.quality_check.status !== 'failed') {
        setActiveStep(3);
      }
    } catch (e: any) {
      console.warn('Backend upload failed, falling back to client mock:', e);
      setSessionId(`mock_sess_${crypto.randomUUID()}`);
      setQualityCheck({
        status: 'passed',
        details: {
          resolution: { status: 'passed', message: 'ความละเอียดผ่านเกณฑ์ (Mock)', value: '1200x900px' },
          brightness: { status: 'passed', message: 'ระดับความสว่างเพียงพอ (Mock)' },
          blur: { status: 'passed', message: 'ภาพคมชัดดี (Mock)' },
          faceDetected: { status: 'passed', message: 'ตรวจพบใบหน้าชัดเจน (Mock)' },
          bodyDetected: { status: 'passed', message: 'ตรวจพบร่างกายครบถ้วน (Mock)' },
          personCount: { status: 'passed', message: 'ตรวจพบบุคคล 1 คน (Mock)', value: 1 }
        },
        recommendation: 'ผ่านเกณฑ์มาตรฐาน (Mock Mode)'
      });
      setActiveStep(3);
    } finally {
      setIsUploading(false);
    }
  };

  // Fabric / Cost estimation hooks
  useEffect(() => {
    const rateMap: Record<string, number> = {
      'Mock': 0.00,
      'Fal': 0.0150,
      'Fashn': 0.0500,
      'Replicate': 0.0250,
    };
    const rate = rateMap[providerName] || 0.00;
    setEstimatedCost(numImages * rate);
  }, [providerName, numImages]);

  const simulateClientSideGeneration = () => {
    let progress = 10;
    const interval = setInterval(() => {
      progress += 15;
      if (progress >= 100) {
        clearInterval(interval);
        
        const renderMockImages = async () => {
          const images = [];
          if (sourcePreviewUrl) {
            try {
              const compositeUrl = await generateCompositeImage(
                sourcePreviewUrl,
                selectedPattern?.primary_hex || '#101B33',
                selectedPattern?.pattern_type || 'Solid',
                selectedStyle
              );
              for (let i = 0; i < numImages; i++) {
                images.push({
                  id: `client_res_${Math.random().toString(36).substring(2, 9)}_${i}`,
                  session_id: sessionId,
                  output_image_path: compositeUrl,
                  is_favorite: false,
                  is_selected: false,
                });
              }
            } catch (err) {
              console.error("Failed to generate composite image:", err);
            }
          }
          
          if (images.length === 0) {
            const suitMockImages = [
              'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
            ];
            for (let i = 0; i < numImages; i++) {
              const baseImg = suitMockImages[(i + Math.floor(Math.random() * 4)) % suitMockImages.length];
              images.push({
                id: `client_res_${Math.random().toString(36).substring(2, 9)}_${i}`,
                session_id: sessionId,
                output_image_path: `${baseImg}&idx=${i}&color=${encodeURIComponent(selectedPattern?.primary_hex || '')}`,
                is_favorite: false,
                is_selected: false,
              });
            }
          }
          
          setTryonResults(images);
          setGenerationProgress(100);
          setGenerationStatus('completed');
          setActiveStep(5);
        };
        
        renderMockImages();
      } else {
        setGenerationProgress(progress);
      }
    }, 800);
  };

  // Trigger AI generation
  const handleTriggerAI = async () => {
    if (!sessionId || !selectedStyle || !selectedPattern) return;
    setGenerationStatus('generating');
    setGenerationProgress(10);
    setErrorMessage(null);
    setActiveStep(4);

    if (sessionId.startsWith('mock_sess_')) {
      simulateClientSideGeneration();
      return;
    }

    try {
      const reqPayload = {
        suit_style_id: selectedStyle.id,
        color_pattern_id: selectedPattern.id,
        generation_count: numImages,
        preserve_face: preserveFace,
        preserve_hair: preserveHair,
        preserve_background: preserveBackground,
        background_mode: preserveBackground ? 'original' : 'studio',
        provider_name: providerName,
      };

      const res = await fetch(`/api/ai-tryon/sessions/${sessionId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start AI generation');

      setJobId(data.job_id);

      if (data.status === 'completed') {
        // Mock provider resolves immediately sometimes
        setGenerationProgress(100);
        setGenerationStatus('completed');
        fetchResults();
        setActiveStep(5);
      } else {
        // Begin queue status polling
        pollQueueStatus(data.job_id);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'เกิดข้อผิดพลาดในการสั่งการระบบ AI');
      setGenerationStatus('failed');
    }
  };

  // Poll status from server endpoint
  const pollQueueStatus = (jobIdString: string) => {
    let intervalId: any;
    let pollCount = 0;

    const fetchStatus = async () => {
      pollCount++;
      if (pollCount > 30) { // 90 seconds timeout
        clearInterval(intervalId);
        setErrorMessage('การรอประมวลผลล่วงเวลาเกินกำหนด (API Timeout)');
        setGenerationStatus('failed');
        return;
      }

      try {
        const res = await fetch(`/api/ai-tryon/sessions/${sessionId}/status?job_id=${jobIdString}`);
        const data = await res.json();

        if (data.status === 'processing') {
          setGenerationProgress(data.progressPct || 50);
        } else if (data.status === 'completed') {
          clearInterval(intervalId);
          setGenerationProgress(100);
          setGenerationStatus('completed');
          fetchResults();
          setActiveStep(5);
        } else if (data.status === 'failed') {
          clearInterval(intervalId);
          setErrorMessage(data.error || 'การประมวลผลของ AI Adapter ล้มเหลว');
          setGenerationStatus('failed');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    intervalId = setInterval(fetchStatus, 3000);
  };

  // Load results images
  const fetchResults = async () => {
    if (!sessionId) return;
    try {
      const { data, error } = await supabase
        .from('ai_tryon_results')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      
      const rawResults = data || [];
      if (providerName === 'Mock' && sourcePreviewUrl && rawResults.length > 0) {
        const compositeUrl = await generateCompositeImage(
          sourcePreviewUrl,
          selectedPattern?.primary_hex || '#101B33',
          selectedPattern?.pattern_type || 'Solid',
          selectedStyle
        );
        const mapped = rawResults.map((r: any) => ({
          ...r,
          output_image_path: compositeUrl,
        }));
        setTryonResults(mapped);
      } else {
        setTryonResults(rawResults);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle favorite output
  const toggleFavoriteResult = async (id: string) => {
    const updated = tryonResults.map((r) => {
      if (r.id === id) {
        return { ...r, is_favorite: !r.is_favorite };
      }
      return r;
    });
    setTryonResults(updated);

    try {
      const target = tryonResults.find((r) => r.id === id);
      await supabase
        .from('ai_tryon_results')
        .update({ is_favorite: !target.is_favorite })
        .eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  // Select image to link to orders/customers profile
  const selectResultImage = async (id: string) => {
    setSelectedResultId(id);
    const updated = tryonResults.map((r) => ({
      ...r,
      is_selected: r.id === id,
    }));
    setTryonResults(updated);

    try {
      await supabase
        .from('ai_tryon_results')
        .update({ is_selected: false })
        .eq('session_id', sessionId);

      await supabase
        .from('ai_tryon_results')
        .update({ is_selected: true })
        .eq('id', id);

      alert('บันทึกการเลือกภาพจำลองนี้เข้าความต้องการของลูกค้าเรียบร้อยแล้ว');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <section className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-royal-navy/10 rounded-lg text-royal-navy shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">AI Virtual Try-On Studio</h2>
            <p className="text-[10px] font-semibold text-slate-400">ลองชุดสูทเสมือนจริงด้วย AI รักษาเอกลักษณ์รูปร่างใบหน้าลูกค้า</p>
          </div>
        </div>

        {/* Stepper Wizard Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className={activeStep === 1 ? 'text-royal-navy font-bold' : ''}>1. เลือกลูกค้า</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={activeStep === 2 ? 'text-royal-navy font-bold' : ''}>2. ถ่ายภาพ</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={activeStep === 3 ? 'text-royal-navy font-bold' : ''}>3. เลือกแบบสูท</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={activeStep >= 4 ? 'text-royal-navy font-bold' : ''}>4. แสดงผล</span>
        </div>
      </section>

      {/* Step 1: Select Customer Workspace */}
      {activeStep === 1 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-royal-navy mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">เลือกลูกค้าเพื่อเริ่มต้นทำแบบจำลองสูท</h3>
            <p className="text-xs text-slate-400">กรุณาพิมพ์ค้นหารายชื่อในระบบหรือกรอกรหัสลูกค้า</p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="ค้นหาลูกค้าด้วย ชื่อ, นามสกุล หรือเบอร์โทร..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomerSearch()}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-navy"
              />
            </div>
            <Button onClick={handleCustomerSearch} className="bg-royal-navy hover:bg-navy font-bold text-xs">
              ค้นหา
            </Button>
          </div>

          {/* Searched lists */}
          {customers.length > 0 && (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-sm">
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors text-left"
                >
                  <div>
                    <span className="font-bold text-slate-800">
                      {c.title} {c.first_name} {c.last_name} ({c.nickname || '-'})
                    </span>
                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      เบอร์โทร: {c.phone} • ระดับ: {c.customer_tier}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {/* Divider and Quick Try-On */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">หรือ / Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <Button
            onClick={handleQuickTryOn}
            className="w-full bg-slate-800 hover:bg-slate-700 font-bold text-xs py-2.5 shadow flex items-center justify-center gap-2 text-white"
          >
            <Camera className="w-4 h-4" />
            <span>ข้ามขั้นตอนและถ่ายภาพเลย (ลองสูทด่วน / Quick Try-On)</span>
          </Button>
        </section>
      )}

      {/* Step 2: Photograph Capture */}
      {activeStep === 2 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-slate-800">ถ่ายภาพร่างกายลูกค้า (Customer Photo Capture)</h3>
            <p className="text-xs text-slate-400">กรุณาจัดท่ายืนลูกค้าให้เหมาะสมตามคำแนะนำ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Capture Panel */}
            <div
              onClick={() => setIsCameraOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-royal-navy/40 hover:bg-slate-50/55 transition-all min-h-[220px]"
            >
              <div className="w-12 h-12 bg-royal-navy/10 rounded-full flex items-center justify-center text-royal-navy">
                <Camera className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-700 block">เปิดกล้องถ่ายภาพ</span>
                <span className="text-[10px] text-slate-400">แนะนำกล้องหลังแท็บเล็ต/มือถือ</span>
              </div>
            </div>

            {/* Custom file upload fallback */}
            <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-royal-navy/40 hover:bg-slate-50/55 transition-all min-h-[220px]">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSourceImage(e.target.files[0]);
                    setSourcePreviewUrl(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                className="hidden"
              />
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-700 block">อัปโหลดไฟล์ภาพ</span>
                <span className="text-[10px] text-slate-400">รองรับไฟล์ JPG, PNG, WEBP</span>
              </div>
            </label>
          </div>

          {/* Source Preview Review section */}
          {sourcePreviewUrl && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">พรีวิวรูปภาพต้นฉบับ</span>
              <div className="flex gap-4 items-center">
                <img src={sourcePreviewUrl} alt="Preview" className="w-24 h-32 object-cover rounded-lg border border-slate-200 shadow-sm" />
                <div className="space-y-2 flex-1">
                  <span className="text-xs font-bold text-slate-700 block">ลูกค้า: {selectedCustomer?.first_name} {selectedCustomer?.last_name}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePhotoUpload}
                      disabled={isUploading}
                      className="bg-royal-navy hover:bg-navy text-xs font-bold"
                    >
                      {isUploading ? 'กำลังอัปโหลด...' : 'ตรวจสอบภาพ & ดำเนินการต่อ'}
                    </Button>
                    <Button variant="outline" onClick={() => { setSourceImage(null); setSourcePreviewUrl(null); }} className="text-xs">
                      ลบภาพ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-600 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMessage}</p>
            </div>
          )}
        </section>
      )}

      {/* Step 3: Catalog Styles & Fabrics Selection */}
      {activeStep === 3 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Style Catalog Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Style list */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 text-left border-b pb-2">1. เลือกทรงสูท / Silhouette</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {styles.map((sty) => (
                  <div
                    key={sty.id}
                    onClick={() => setSelectedStyle(sty)}
                    className={`p-3 border rounded-xl cursor-pointer text-left transition-all duration-200 ${
                      selectedStyle?.id === sty.id
                        ? 'border-royal-navy bg-blue-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 block">{sty.name_th}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{sty.category} • {sty.fit_type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern list */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 text-left border-b pb-2">2. เลือกสีและลายผ้าสูท / Swatches</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {patterns.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPattern(pat)}
                    className={`p-2.5 border rounded-xl cursor-pointer text-center space-y-2 transition-all duration-200 ${
                      selectedPattern?.id === pat.id
                        ? 'border-royal-navy bg-blue-50/30 ring-1 ring-royal-navy shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Swatch hex color preview */}
                    <div
                      className="w-full h-10 rounded-lg border border-slate-200/60 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: pat.primary_hex }}
                    >
                      {pat.secondary_hex && (
                        <div
                          className="w-1/2 h-full opacity-50"
                          style={{
                            backgroundColor: pat.secondary_hex,
                            backgroundImage: pat.pattern_type === 'Pinstripe'
                              ? `repeating-linear-gradient(90deg, transparent, transparent 4px, ${pat.secondary_hex} 4px, ${pat.secondary_hex} 6px)`
                              : 'none',
                          }}
                        />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-800 block truncate">{pat.name_th}</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider block">{pat.pattern_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Generation Settings */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-left space-y-5">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2">3. ตั้งค่าการจำลองภาพ AI</h3>
              
              {/* Preserves */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">รักษาใบหน้า (Face Preservation)</label>
                  <select
                    value={preserveFace}
                    onChange={(e: any) => setPreserveFace(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="low">ระดับต่ำ (ผ่อนปรนทิศทางหน้า)</option>
                    <option value="medium">ระดับกลาง (แนะนำ)</option>
                    <option value="high">ระดับสูง (รักษาโครงหน้าเดิมเข้มงวด)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span>รักษาทรงผมของลูกค้า</span>
                  <input
                    type="checkbox"
                    checked={preserveHair}
                    onChange={(e) => setPreserveHair(e.target.checked)}
                    className="w-4 h-4 accent-royal-navy"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span>รักษาพื้นหลังเดิม (ไม่ปรับเข้าสตูดิโอ)</span>
                  <input
                    type="checkbox"
                    checked={preserveBackground}
                    onChange={(e) => setPreserveBackground(e.target.checked)}
                    className="w-4 h-4 accent-royal-navy"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">จำนวนภาพที่ต้องการ (Count)</label>
                  <select
                    value={numImages}
                    onChange={(e) => setNumImages(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value={1}>1 ภาพ (Standard)</option>
                    <option value={2}>2 ภาพ (แนะนำ)</option>
                    <option value={4}>4 ภาพ (High-end Selection)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Provider Engine</label>
                  <select
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Mock">Mock Model (ฟรี - ทันที)</option>
                    <option value="Fal">Fal IDM-VTON (0.015 USD/รูป)</option>
                    <option value="Fashn">Fashn Professional (0.050 USD/รูป)</option>
                    <option value="OpenAI">OpenAI DALL-E 3 (0.040 USD/รูป)</option>
                    <option value="Replicate">Replicate IDM-VTON (0.025 USD/รูป)</option>
                  </select>
                </div>
              </div>

              {/* Estimate cost preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>ประมาณการค่าประมวลผล:</span>
                  <span className="text-royal-navy font-bold">{estimatedCost.toFixed(4)} USD</span>
                </div>
                <p className="text-[9px] text-slate-400">หักแต้มเครดิตจำลองประจำวันของ Sales (จำกัด 20 รูป/วัน)</p>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleTriggerAI}
                  disabled={!selectedStyle || !selectedPattern}
                  className="w-full bg-royal-navy hover:bg-navy font-bold text-xs py-2 shadow-lg shadow-royal-navy/15 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>สั่งสร้างภาพจำลองสูท AI</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveStep(2)}
                  className="w-full text-xs"
                >
                  ย้อนกลับ (Back)
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 4: AI Generation Progress Queue */}
      {activeStep === 4 && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-md mx-auto space-y-6 text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-royal-navy mx-auto shadow-inner animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">กำลังประมวลผลภาพจำลองสวมสูท...</h3>
            <p className="text-xs text-slate-400">ระบบ AI กำลังวิเคราะห์ใบหน้าและสวมชุดสูททับแบบสัดส่วนจริง</p>
          </div>

          <div className="space-y-2">
            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-royal-navy rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
              <span>สถานะ: {generationStatus === 'generating' ? 'กำลังคำนวณสัดส่วน...' : 'กำลังรอคิว API...'}</span>
              <span>{generationProgress}%</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-left text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-600 mb-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>ทำไมขั้นตอนนี้ใช้เวลา?</span>
            </div>
            <p>1. ระบบ scrub ลบ metadata ป้องกันความเป็นส่วนตัว</p>
            <p>2. ส่งลิงก์ชั่วคราว (Signed URL 10 นาที) ปลอดภัยให้โมดูล AI</p>
            <p>3. รอรันโมเดล Face preservation รักษาสีผิวและใบหน้าเดิม</p>
          </div>

          {errorMessage && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-600 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
              <Button onClick={() => setActiveStep(3)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold w-full">
                กลับไปเลือกแบบใหม่
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Step 5: Grid results review and action links */}
      {activeStep === 5 && (
        <section className="space-y-6 text-left">
          {/* Configuration Summary Header */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-royal-navy bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ผลลัพธ์การจำลอง AI Try-On
              </span>
              <h3 className="text-sm font-bold text-slate-800 pt-1">
                ทรงสูท: {selectedStyle?.name_th} • ผ้า: {selectedPattern?.name_th}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold">ลูกค้า: {selectedCustomer?.first_name} {selectedCustomer?.last_name} • เครื่องยนต์: {providerName}</p>
            </div>

            <div className="flex gap-2">
              {tryonResults.length > 1 && (
                <Button
                  onClick={() => setIsCompareOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <Scale className="w-4 h-4" />
                  <span>เปรียบเทียบแบบ (Compare)</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSourceImage(null);
                  setSourcePreviewUrl(null);
                  setTryonResults([]);
                  setActiveStep(2);
                }}
                className="text-xs"
              >
                ลองชุดสูทตัวใหม่
              </Button>
            </div>
          </div>

          {/* Previews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {tryonResults.map((res) => (
              <div
                key={res.id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col relative transition-all duration-300 ${
                  res.is_selected 
                    ? 'border-royal-navy ring-1 ring-royal-navy shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Result Image */}
                <div className="flex-1 aspect-[3/4] relative overflow-hidden bg-slate-50 flex items-center justify-center">
                  <img
                    src={res.output_image_path}
                    alt="AI result render"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlaid Favorite toggle */}
                  <button
                    onClick={() => toggleFavoriteResult(res.id)}
                    className={`absolute top-3 right-3 p-2.5 rounded-full border shadow transition-all duration-200 ${
                      res.is_favorite
                        ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600 scale-110'
                        : 'bg-white/90 border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${res.is_favorite ? 'fill-current' : ''}`} />
                  </button>

                  {res.is_selected && (
                    <span className="absolute top-3 left-3 bg-royal-navy text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" />
                      <span>บันทึกเข้าประวัติแล้ว</span>
                    </span>
                  )}
                </div>

                {/* Card control footer */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">โมเดลประมวลผลรุ่น 1.0</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => selectResultImage(res.id)}
                      disabled={res.is_selected}
                      className={`flex-1 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-all duration-150 ${
                        res.is_selected
                          ? 'bg-slate-300 text-slate-500 cursor-default'
                          : 'bg-royal-navy hover:bg-navy text-white'
                      }`}
                    >
                      {res.is_selected ? 'เลือกแล้ว' : 'บันทึกเข้าลูกค้า'}
                    </Button>
                    <a
                      href={res.output_image_path}
                      download={`PierreGuszo_Tryon_${res.id}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg transition-colors flex items-center justify-center"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer warning */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex gap-3 text-xs text-slate-500 text-left">
            <Info className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-600 block">⚠️ ข้อความแจ้งปฏิเสธความรับผิดชอบ (Disclaimer)</span>
              <p className="leading-relaxed">ภาพผลลัพธ์ที่แสดงด้านบนนี้เป็นภาพจำลองโดยปัญญาประดิษฐ์ (AI Generative Mockup) เพื่อช่วยประกอบการตัดสินใจของลูกค้าในการเปรียบเทียบแบบ สี รูปทรงปก และลายผ้าเท่านั้น สีของผ้าจริง สัดส่วนทางสรีระของสูทช่างตัดวัดตัวจริง อาจแตกต่างไปตามเงื่อนไขของโครงสร้างร่างกายและการเย็บด้วยมือจริง</p>
            </div>
          </div>
        </section>
      )}

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handlePhotoCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Consent signature Modal */}
      {isConsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-royal-navy">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">แบบยินยอมประมวลผลข้อมูล AI (AI Consent Form)</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[60vh] text-xs text-slate-600 leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-2.5 text-blue-800 mb-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ภาพถ่ายเรือนร่างและใบหน้าเป็นข้อมูลอ่อนไหว (Sensitive Data) ระบบจำเป็นต้องบันทึกความยินยอมของลูกค้าเป็นลายลักษณ์อักษรก่อนบันทึกลงฐานข้อมูล</p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-800">วัตถุประสงค์การเก็บและใช้ข้อมูล:</p>
                <p>1. เพื่อประมวลผลโครงร่างจำลองด้วยระบบคอมพิวเตอร์และสวมชุดสูทสังเคราะห์</p>
                <p>2. ภาพผลลัพธ์จะถูกจัดเก็บในคลังรูปภาพส่วนตัว (Private Storage) เข้าถึงเฉพาะพนักงานวัดตัวและช่างเย็บผู้ดูแลออเดอร์ของลูกค้าเท่านั้น</p>
                <p>3. ข้อมูลที่ประมวลผลจะไม่ถูกเผยแพร่สู่สาธารณะและจะไม่นำไปใช้เพื่อเทรนโมเดล AI ภายนอก</p>
              </div>

              {/* Digital signature canvas drawer */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ลงชื่อยินยอมของลูกค้า (Customer Signature)</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 relative">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={150}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    className="w-full h-[150px] cursor-crosshair bg-white"
                  />
                  <button
                    onClick={clearSignature}
                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-[10px] font-bold text-slate-600 transition-colors"
                  >
                    ล้างลายเซ็น
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConsentModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="text-xs"
              >
                ปฏิเสธ (Decline)
              </Button>
              <Button
                onClick={submitConsent}
                disabled={isConsentLoading}
                className="bg-royal-navy hover:bg-navy text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Signature className="w-4 h-4" />
                <span>{isConsentLoading ? 'กำลังบันทึก...' : 'ยอมรับและบันทึกข้อตกลง'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Mode Modal viewport */}
      {isCompareOpen && (
        <CompareMode
          images={tryonResults.map((r) => ({
            id: r.id,
            url: r.output_image_path,
            styleName: selectedStyle?.name_th || 'Suit Style',
            patternName: selectedPattern?.name_th || 'Fabric Pattern',
            isFavorite: r.is_favorite || false,
            is_selected: r.is_selected || false,
          }))}
          onClose={() => setIsCompareOpen(false)}
          onToggleFavorite={toggleFavoriteResult}
          onSelectImage={selectResultImage}
        />
      )}
    </div>
  );
}
