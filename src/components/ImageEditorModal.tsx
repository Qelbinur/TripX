import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, FlipHorizontal2, RotateCcw, RotateCw, X } from 'lucide-react';

type AspectRatioKey = '4:3' | '16:9' | '1:1';
type FilterPresetKey = 'original' | 'natural' | 'warm' | 'cool' | 'mono';

interface AspectOption {
  key: AspectRatioKey;
  label: string;
  ratio: number;
}

const ASPECT_OPTIONS: AspectOption[] = [
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '1:1', label: '1:1', ratio: 1 },
];

interface PresetValues {
  key: FilterPresetKey;
  label: string;
  brightness: number;
  contrast: number;
  saturation: number;
}

const FILTER_PRESETS: PresetValues[] = [
  { key: 'original', label: 'Orijinal', brightness: 100, contrast: 100, saturation: 100 },
  { key: 'natural', label: 'Təbii', brightness: 104, contrast: 106, saturation: 112 },
  { key: 'warm', label: 'İsti', brightness: 105, contrast: 104, saturation: 118 },
  { key: 'cool', label: 'Sərin', brightness: 102, contrast: 108, saturation: 92 },
  { key: 'mono', label: 'Ağ-qara', brightness: 102, contrast: 115, saturation: 0 },
];

interface ImageEditorModalProps {
  imageSrc: string | null;
  title?: string;
  defaultAspect?: AspectRatioKey;
  onCancel: () => void;
  onSave: (editedDataUrl: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  imageSrc,
  title = 'Şəkli redaktə et',
  defaultAspect = '4:3',
  onCancel,
  onSave,
}) => {
  const [aspect, setAspect] = useState<AspectRatioKey>(defaultAspect);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activePreset, setActivePreset] = useState<FilterPresetKey>('original');
  const [imageReady, setImageReady] = useState(false);
  const [frameSize, setFrameSize] = useState({ width: 320, height: 240 });

  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    if (!imageSrc) return;
    setAspect(defaultAspect);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipX(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setActivePreset('original');
    setImageReady(false);

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageReady(true);
    };
    img.src = imageSrc;

    return () => {
      imageRef.current = null;
    };
  }, [imageSrc, defaultAspect]);

  useEffect(() => {
    if (!imageSrc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageSrc, onCancel]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setFrameSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [aspect, imageSrc]);

  const clampPan = useCallback(
    (nextX: number, nextY: number, nextZoom: number, nextRotation: number) => {
      const img = imageRef.current;
      if (!img || frameSize.width <= 0 || frameSize.height <= 0) {
        return { x: 0, y: 0 };
      }
      const rotW = nextRotation % 180 === 0 ? img.naturalWidth : img.naturalHeight;
      const rotH = nextRotation % 180 === 0 ? img.naturalHeight : img.naturalWidth;
      const baseScale = Math.max(frameSize.width / rotW, frameSize.height / rotH);
      const dispW = rotW * baseScale * nextZoom;
      const dispH = rotH * baseScale * nextZoom;
      const maxX = Math.max(0, (dispW - frameSize.width) / 2);
      const maxY = Math.max(0, (dispH - frameSize.height) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, nextX)),
        y: Math.max(-maxY, Math.min(maxY, nextY)),
      };
    },
    [frameSize.height, frameSize.width]
  );

  const renderToCanvas = useCallback(
    (
      canvas: HTMLCanvasElement,
      outW: number,
      outH: number,
      pixelRatio = 1
    ) => {
      const img = imageRef.current;
      if (!img || outW <= 0 || outH <= 0) return;

      canvas.width = Math.round(outW * pixelRatio);
      canvas.height = Math.round(outH * pixelRatio);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.scale(pixelRatio, pixelRatio);
      ctx.clearRect(0, 0, outW, outH);

      const rotW = rotation % 180 === 0 ? img.naturalWidth : img.naturalHeight;
      const rotH = rotation % 180 === 0 ? img.naturalHeight : img.naturalWidth;
      const baseScale = Math.max(outW / rotW, outH / rotH);
      const drawScale = baseScale * zoom;
      const scaleRatio = frameSize.width > 0 ? outW / frameSize.width : 1;

      if (typeof ctx.filter === 'string') {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      }

      ctx.translate(outW / 2 + pan.x * scaleRatio, outH / 2 + pan.y * scaleRatio);
      ctx.scale(flipX ? -1 : 1, 1);
      ctx.rotate((rotation * Math.PI) / 180);

      ctx.drawImage(
        img,
        (-img.naturalWidth * drawScale) / 2,
        (-img.naturalHeight * drawScale) / 2,
        img.naturalWidth * drawScale,
        img.naturalHeight * drawScale
      );

      ctx.restore();
    },
    [brightness, contrast, flipX, frameSize.width, pan.x, pan.y, rotation, saturation, zoom]
  );

  useEffect(() => {
    if (!imageReady || !canvasRef.current) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderToCanvas(canvasRef.current, frameSize.width, frameSize.height, dpr);
  }, [frameSize.height, frameSize.width, imageReady, renderToCanvas]);

  useEffect(() => {
    if (!imageReady) return;
    setPan((prev) => clampPan(prev.x, prev.y, zoom, rotation));
  }, [clampPan, imageReady, rotation, zoom]);

  if (!imageSrc) return null;

  const currentAspectRatio =
    ASPECT_OPTIONS.find((opt) => opt.key === aspect)?.ratio ?? 4 / 3;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPan(clampPan(dragRef.current.originX + dx, dragRef.current.originY + dy, zoom, rotation));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  const applyPreset = (preset: PresetValues) => {
    setActivePreset(preset.key);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
  };

  const resetAll = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setFlipX(false);
    applyPreset(FILTER_PRESETS[0]);
  };

  const handleSave = () => {
    if (!imageRef.current) return;
    const exportWidth = 1200;
    const exportHeight = Math.round(exportWidth / currentAspectRatio);
    const outCanvas = document.createElement('canvas');
    renderToCanvas(outCanvas, exportWidth, exportHeight, 1);
    const dataUrl = outCanvas.toDataURL('image/jpeg', 0.88);
    onSave(dataUrl);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1116]/65 p-3 backdrop-blur-xs sm:p-4"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[#141A23]/8 bg-white shadow-xl sm:rounded-2xl dark:border-[#EEF2F6]/10 dark:bg-[#161B22]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div>
            <h2
              id="image-editor-title"
              className="font-display text-base font-semibold text-[#141A23] dark:text-[#EEF2F6]"
            >
              {title}
            </h2>
            <p className="text-xs text-[#5B6472] dark:text-[#94A0B2]">
              Şəkli sürüşdürüb kəsin və tənzimləyin
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Bağla"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#5B6472] transition-colors hover:bg-[#F0F2F5] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable editor body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
          {/* Interactive crop frame */}
          <div className="flex justify-center rounded-2xl bg-[#E7ECF2] p-3 dark:bg-[#0E1116]">
            <div
              ref={frameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ aspectRatio: String(currentAspectRatio) }}
              className="relative w-full max-h-[34dvh] cursor-grab overflow-hidden rounded-xl bg-[#141A23]/10 touch-none active:cursor-grabbing dark:bg-black/40"
            >
              <canvas
                ref={canvasRef}
                className="block h-full w-full pointer-events-none"
              />
              {/* Subtle rule-of-thirds crop guide */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/25"
              >
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>
            </div>
          </div>

          {/* Aspect ratio + quick transforms */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-[#F7F8FA] p-1 dark:bg-[#0E1116]">
              {ASPECT_OPTIONS.map((opt) => {
                const isSelected = aspect === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setAspect(opt.key);
                      setPan({ x: 0, y: 0 });
                    }}
                    className={`min-h-[36px] rounded-lg px-2.5 text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#1F5D6B] shadow-xs dark:bg-[#1E252F] dark:text-[#6BC0D1]'
                        : 'text-[#5B6472] hover:text-[#141A23] dark:text-[#94A0B2] dark:hover:text-[#EEF2F6]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                aria-label="90 dərəcə döndər"
                title="Döndər"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] px-3 text-xs font-medium text-[#2B3544] transition-colors hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#C5D0DC] dark:hover:bg-[#1E252F] cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Döndər</span>
              </button>

              <button
                type="button"
                onClick={() => setFlipX((prev) => !prev)}
                aria-pressed={flipX}
                aria-label="Üfüqi əks et"
                title="Əks et"
                className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors cursor-pointer ${
                  flipX
                    ? 'border-[#1F5D6B] bg-[#E4F0F3] text-[#1F5D6B] dark:border-[#3A8A9C] dark:bg-[#1D323A] dark:text-[#6BC0D1]'
                    : 'border-[#141A23]/10 bg-[#F7F8FA] text-[#2B3544] hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#C5D0DC] dark:hover:bg-[#1E252F]'
                }`}
              >
                <FlipHorizontal2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Əks et</span>
              </button>
            </div>
          </div>

          {/* Filter presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {FILTER_PRESETS.map((preset) => {
              const isSelected = activePreset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`min-h-[38px] shrink-0 rounded-xl border px-3 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'border-[#1F5D6B] bg-[#1F5D6B] text-white dark:border-[#3A8A9C] dark:bg-[#2B7788]'
                      : 'border-[#141A23]/10 bg-[#F7F8FA] text-[#2B3544] hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#C5D0DC] dark:hover:bg-[#1E252F]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Fine sliders */}
          <div className="space-y-3 rounded-2xl border border-[#141A23]/[0.06] bg-[#F7F8FA] p-3.5 dark:border-[#EEF2F6]/[0.07] dark:bg-[#0E1116]">
            <label className="block space-y-1">
              <span className="flex items-center justify-between text-xs font-medium text-[#4B5563] dark:text-[#94A0B2]">
                <span>Yaxınlaşdırma</span>
                <span className="tabular-nums">{zoom.toFixed(1)}×</span>
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full accent-[#1F5D6B] cursor-pointer dark:accent-[#4FA3B3]"
              />
            </label>

            <label className="block space-y-1">
              <span className="flex items-center justify-between text-xs font-medium text-[#4B5563] dark:text-[#94A0B2]">
                <span>Parlaqlıq</span>
                <span className="tabular-nums">{brightness}%</span>
              </span>
              <input
                type="range"
                min={60}
                max={145}
                step={1}
                value={brightness}
                onChange={(e) => {
                  setBrightness(Number(e.target.value));
                  setActivePreset('original');
                }}
                className="h-2 w-full accent-[#1F5D6B] cursor-pointer dark:accent-[#4FA3B3]"
              />
            </label>

            <label className="block space-y-1">
              <span className="flex items-center justify-between text-xs font-medium text-[#4B5563] dark:text-[#94A0B2]">
                <span>Kontrast</span>
                <span className="tabular-nums">{contrast}%</span>
              </span>
              <input
                type="range"
                min={65}
                max={145}
                step={1}
                value={contrast}
                onChange={(e) => {
                  setContrast(Number(e.target.value));
                  setActivePreset('original');
                }}
                className="h-2 w-full accent-[#1F5D6B] cursor-pointer dark:accent-[#4FA3B3]"
              />
            </label>

            <label className="block space-y-1">
              <span className="flex items-center justify-between text-xs font-medium text-[#4B5563] dark:text-[#94A0B2]">
                <span>Rəng doyğunluğu</span>
                <span className="tabular-nums">{saturation}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={160}
                step={1}
                value={saturation}
                onChange={(e) => {
                  setSaturation(Number(e.target.value));
                  setActivePreset('original');
                }}
                className="h-2 w-full accent-[#1F5D6B] cursor-pointer dark:accent-[#4FA3B3]"
              />
            </label>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-2.5 border-t border-[#141A23]/[0.06] px-5 pt-3 pb-[calc(0.9rem+env(safe-area-inset-bottom))] dark:border-[#EEF2F6]/[0.07]">
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#141A23]/12 px-4 text-sm font-medium text-[#5B6472] transition-colors hover:bg-[#F7F8FA] hover:text-[#141A23] dark:border-[#EEF2F6]/12 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Sıfırla</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imageReady}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1F5D6B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#194D59] active:scale-[0.98] disabled:opacity-50 dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            <span>Tətbiq et</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
