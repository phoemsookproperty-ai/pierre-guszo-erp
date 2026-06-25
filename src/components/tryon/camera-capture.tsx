'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setError(null);
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้อง');
    }
  };

  // List available video input devices
  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevices);
    } catch (e) {
      console.log('Error listing devices:', e);
    }
  };

  useEffect(() => {
    startCamera();
    getDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Toggle front/back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture photograph from video stream onto canvas
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions matching the video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // If front camera (user mode), mirror the image
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 preview for UI
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    // Stop camera stream while showing captured review
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Approve the photo and trigger callback
  const handleConfirm = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      'image/jpeg',
      0.85 // compress image
    );
  };

  // Redo camera shot
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4">
      {/* Header bar */}
      <div className="flex justify-between items-center text-white pb-3 z-10">
        <span className="text-sm font-bold">ถ่ายภาพวัดตัวลูกค้า (Camera Capture)</span>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-silver hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Camera View Area */}
      <div className="flex-1 relative flex items-center justify-center rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
        {error ? (
          <div className="text-center text-white p-6 space-y-4 max-w-sm">
            <p className="text-sm text-rose-400 font-semibold">{error}</p>
            <Button variant="outline" onClick={startCamera} className="mx-auto border-white/20 text-white hover:bg-white/10">
              ลองอีกครั้ง (Retry)
            </Button>
          </div>
        ) : capturedImage ? (
          /* Captured Photo Review Mode */
          <img
            src={capturedImage}
            alt="Captured Review"
            className="w-full h-full object-contain"
          />
        ) : (
          /* Live Stream Mode */
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Silhouette frame overlay */}
            <div className="absolute inset-0 border-[3px] border-dashed border-royal-navy/40 pointer-events-none flex items-center justify-center">
              {/* Silhouette Shape SVG */}
              <svg
                viewBox="0 0 400 600"
                className="w-full h-full opacity-60 stroke-white/80 stroke-[2] fill-none"
              >
                {/* Head circle */}
                <circle cx="200" cy="120" r="45" className="stroke-dashed stroke-royal-navy" />
                {/* Neck */}
                <path d="M 185 165 L 185 185 L 215 185 L 215 165 Z" />
                {/* Shoulders and Torso */}
                <path d="M 110 215 C 110 200, 140 185, 200 185 C 260 185, 290 200, 290 215 C 290 250, 275 350, 270 450 C 260 450, 240 450, 230 450 L 230 580 C 215 580, 200 580, 200 580 C 200 580, 185 580, 170 580 L 170 450 C 160 450, 140 450, 130 450 C 125 350, 110 250, 110 215 Z" />
              </svg>

              {/* Guidelines text */}
              <div className="absolute bottom-6 left-4 right-4 bg-black/60 backdrop-blur-sm text-[10px] text-white p-2.5 rounded-lg text-center leading-relaxed">
                <p className="font-bold text-yellow-400 mb-0.5">📌 คำแนะนำในการวางตำแหน่งลูกค้า</p>
                <p>ยืนห่างกล้อง 2-3 เมตร • ให้ศีรษะอยู่ในวงกลมบนสุด • ตัวตรง แขนแนบลำตัว • พื้นหลังสีเรียบ</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden Canvas for processing snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Control Buttons Bar */}
      <div className="py-4 flex justify-center items-center gap-6 z-10">
        {capturedImage ? (
          /* Captured Review Actions */
          <>
            <button
              onClick={handleRetake}
              className="flex flex-col items-center gap-1.5 text-silver hover:text-white transition-colors"
            >
              <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">ถ่ายใหม่ (Retake)</span>
            </button>
            
            <button
              onClick={handleConfirm}
              className="flex flex-col items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <div className="w-16 h-16 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-bold">ใช้ภาพนี้ (Confirm)</span>
            </button>
          </>
        ) : (
          /* Live Camera Actions */
          <>
            {devices.length > 1 && (
              <button
                onClick={toggleFacingMode}
                className="flex flex-col items-center gap-1.5 text-silver hover:text-white transition-colors"
              >
                <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">สลับกล้อง</span>
              </button>
            )}

            <button
              onClick={handleCapture}
              disabled={!!error}
              className="flex flex-col items-center gap-1.5 text-white disabled:opacity-40 transition-colors"
            >
              <div className="w-16 h-16 bg-royal-navy hover:bg-navy text-white rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg shadow-royal-navy/20">
                <Camera className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-bold">กดถ่ายภาพ (Capture)</span>
            </button>

            {/* Spacer if no switch camera button */}
            {devices.length <= 1 && <div className="w-12" />}
          </>
        )}
      </div>
    </div>
  );
}
