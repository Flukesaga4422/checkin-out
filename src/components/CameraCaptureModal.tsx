import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, X, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getNowTimeStr, playSound } from '../utils/dateUtils';

interface CameraCaptureModalProps {
  userName: string;
  onCapture: (base64Photo: string) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  userName,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraLoading, setCameraLoading] = useState<boolean>(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Camera stream
  const startCamera = async (mode: 'user' | 'environment') => {
    setCameraLoading(true);
    setErrorMessage(null);

    // Stop existing stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('อุปกรณ์ไม่รองรับ Live Camera กรุณาใช้ปุ่มอัปโหลดรูปถ่าย');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setHasCamera(true);
    } catch (err: unknown) {
      console.warn('Camera access error:', err);
      setHasCamera(false);
      setErrorMessage('ไม่สามารถเปิดกล้องสดได้ หรือยังไม่ได้อนุญาตการเข้าถึง สามารถกด "เลือกรูปจากเครื่อง" ได้เลยค่ะ');
    } finally {
      setCameraLoading(false);
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera between front and back
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Shrink helper for canvas to keep base64 compact (~360px JPEG, ~30-50kb)
  const processImageToCompactDataUrl = (
    source: HTMLVideoElement | HTMLImageElement,
    width: number,
    height: number,
    isMirrored = false
  ): string => {
    const maxSize = 360;
    const scale = Math.min(1, maxSize / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (isMirrored) {
      ctx.translate(targetW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(source, 0, 0, targetW, targetH);

    // Reset transform for overlay stamp
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Stamp watermark banner at bottom: Time & Name
    const bannerH = Math.max(34, Math.round(targetH * 0.16));
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, targetH - bannerH, targetW, bannerH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `600 ${Math.max(12, Math.round(targetW * 0.04))}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${userName} · ${getNowTimeStr()} น.`, 10, targetH - bannerH / 2);

    return canvas.toDataURL('image/jpeg', 0.75);
  };

  // Capture snapshot from live stream
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash + sound
    setFlash(true);
    playSound('click');
    setTimeout(() => setFlash(false), 200);

    const w = video.videoWidth || 480;
    const h = video.videoHeight || 480;
    const isMirrored = facingMode === 'user';
    const photoDataUrl = processImageToCompactDataUrl(video, w, h, isMirrored);
    setCapturedPhoto(photoDataUrl);
  };

  // Handle fallback file upload / camera capture from input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const photoDataUrl = processImageToCompactDataUrl(img, img.width, img.height, false);
        setCapturedPhoto(photoDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#172A27] rounded-3xl shadow-2xl overflow-hidden border border-[#254039]/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[#254039]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#2F7D6D] dark:text-[#4FB39F]" />
            <h3 className="font-semibold text-base text-[#17332F] dark:text-[#E4F0ED]">
              ถ่ายรูปเช็คอินเข้างาน
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            title="ปิด"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport content */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full aspect-square max-h-[340px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            {flash && (
              <div className="absolute inset-0 bg-white z-20 transition-opacity duration-150" />
            )}

            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured selfie"
                className="w-full h-full object-cover"
              />
            ) : hasCamera ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />
                {cameraLoading && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2">
                    <RefreshCw className="w-7 h-7 animate-spin text-[#4FB39F]" />
                    <span className="text-xs">กำลังเปิดกล้อง...</span>
                  </div>
                )}
                {/* Guidelines overlay */}
                <div className="absolute inset-8 border-2 border-white/30 border-dashed rounded-full pointer-events-none flex items-center justify-center">
                  <span className="text-white/60 text-xs bg-black/30 px-3 py-1 rounded-full backdrop-blur-xs">
                    จัดใบหน้าให้อยู่ในกรอบ
                  </span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-300 flex flex-col items-center gap-3">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <p className="text-sm">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 px-4 py-2.5 bg-[#2F7D6D] hover:bg-[#27685b] text-white rounded-xl text-sm font-medium inline-flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  เลือกรูปภาพหรือถ่ายจากมือถือ
                </button>
              </div>
            )}
          </div>

          {/* Hidden native camera/file picker for fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Action controls */}
          <div className="w-full mt-4 flex items-center justify-center gap-4">
            {capturedPhoto ? (
              <div className="w-full flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCapturedPhoto(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-[#254039] text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-[#1B3A34] transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  ถ่ายใหม่
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2F7D6D] hover:bg-[#27685b] text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-[#2F7D6D]/20 transition-transform active:scale-[0.98]"
                >
                  <Check className="w-4 h-4" />
                  ยืนยันเช็คอิน
                </button>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between px-2">
                {/* Secondary upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#1B3A34] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#254039] transition-colors"
                  title="เลือกรูปจากเครื่อง"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                {/* Primary Shutter button */}
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={!hasCamera || cameraLoading}
                  className="w-16 h-16 rounded-full bg-[#2F7D6D] border-4 border-white dark:border-[#172A27] ring-4 ring-[#2F7D6D]/30 flex items-center justify-center text-white shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                  title="กดถ่ายรูป"
                >
                  <Camera className="w-7 h-7" />
                </button>

                {/* Flip camera button */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  disabled={!hasCamera}
                  className="w-11 h-11 rounded-full bg-slate-100 dark:bg-[#1B3A34] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-[#254039] transition-colors disabled:opacity-40"
                  title="สลับกล้องหน้า/หลัง"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
