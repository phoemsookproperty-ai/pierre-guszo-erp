'use client';

import { useState } from 'react';
import { X, Heart, ZoomIn, ZoomOut, Check, ShoppingCart, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompareModeProps {
  images: Array<{
    id: string;
    url: string;
    styleName: string;
    patternName: string;
    isFavorite: boolean;
    is_selected: boolean;
  }>;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectImage: (id: string) => void;
}

export default function CompareMode({
  images,
  onClose,
  onToggleFavorite,
  onSelectImage,
}: CompareModeProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 75));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col justify-between p-4">
      {/* Top Header bar */}
      <header className="flex justify-between items-center text-white pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold">เปรียบเทียบแบบและลายสูท (Compare Mode)</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full">
            แสดงผลลัพธ์ {images.length} แบบคู่ขนาน
          </span>
        </div>

        {/* Zoom Controls & Close button */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-300 w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Grid Comparison View */}
      <main className="flex-1 overflow-auto py-6 flex items-center justify-center">
        <div
          className={`grid gap-6 w-full max-w-7xl h-full items-center justify-center`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(images.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              className={`bg-slate-950 border rounded-2xl overflow-hidden flex flex-col h-full relative transition-all duration-300 ${
                img.is_selected 
                  ? 'border-royal-navy shadow-lg shadow-royal-navy/20' 
                  : 'border-slate-800'
              }`}
            >
              {/* Image Frame */}
              <div className="flex-1 overflow-hidden relative bg-slate-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={img.url}
                  alt={`${img.styleName} - ${img.patternName}`}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                  }}
                />

                {/* Overlaid Favorite button */}
                <button
                  onClick={() => onToggleFavorite(img.id)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full border shadow transition-all duration-200 ${
                    img.isFavorite
                      ? 'bg-rose-500 border-rose-400 text-white hover:bg-rose-600 scale-110'
                      : 'bg-black/60 border-slate-700 text-slate-300 hover:text-white hover:bg-black/80'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${img.isFavorite ? 'fill-current' : ''}`} />
                </button>

                {img.is_selected && (
                  <div className="absolute top-3 left-3 bg-royal-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                    <Check className="w-3 h-3" />
                    <span>เลือกชุดนี้แล้ว</span>
                  </div>
                )}
              </div>

              {/* Garment details footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-left space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white leading-tight truncate">
                    {img.styleName}
                  </h4>
                  <p className="text-[10px] text-yellow-400 font-semibold truncate">
                    ผ้า: {img.patternName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectImage(img.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                      img.is_selected
                        ? 'bg-royal-navy text-white cursor-default'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                    }`}
                    disabled={img.is_selected}
                  >
                    {img.is_selected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>เลือกชุดแล้ว</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>เลือกชุดนี้ (Select)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Info warning bar */}
      <footer className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5">
        <HelpCircle className="w-3.5 h-3.5" />
        <span>ภาพจำลองโดย AI ใช้สำหรับเทียบเคียงแบบเสื้อผ้า สี และลายเท่านั้น ขนาดและลายละเอียดจริงอาจคลาดเคลื่อน</span>
      </footer>
    </div>
  );
}
