import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import {
  AZERBAIJAN_DISTRICTS,
  AZERBAIJAN_MAP_VIEWBOX,
  type AzerbaijanDistrict,
} from '../data/azerbaijanDistricts';
import type { PlaceSubmission } from '../types/filter';

const MIN_SCALE = 1;
const MAX_SCALE = 3.6;

function getLabelFontSize(district: AzerbaijanDistrict): number {
  const len = district.name.length;
  if (district.radius <= 12) return 7.5;
  if (district.radius <= 17) return len >= 8 ? 8 : 9;
  if (district.radius <= 23) return len >= 9 ? 9.2 : 10.5;
  if (district.radius <= 30) return len >= 9 ? 10.5 : 11.5;
  return 12.5;
}

function getLabelCoords(district: AzerbaijanDistrict): { x: number; y: number } {
  // Slight optical tweak for Sumqayıt's narrow coastal strip so the name never crowds Abşeron
  if (district.id === 'sumqayit') {
    return { x: district.labelX + 18, y: district.labelY - 16 };
  }
  return { x: district.labelX, y: district.labelY };
}

function getFocusZoomScale(district: AzerbaijanDistrict): number {
  if (district.radius <= 16) return 3.15;
  if (district.radius <= 24) return 2.75;
  if (district.radius <= 32) return 2.45;
  return 2.25;
}

interface Point {
  x: number;
  y: number;
}

interface AzerbaijanMapProps {
  highlightedRegionIds?: string[];
  activeFilterCount?: number;
  pinnedPlaces?: PlaceSubmission[];
  onDistrictSelect?: (districtId: string) => void;
}

export const AzerbaijanMap: React.FC<AzerbaijanMapProps> = ({
  highlightedRegionIds = [],
  activeFilterCount = 0,
  pinnedPlaces = [],
  onDistrictSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusingId, setFocusingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const focusTimerRef = useRef<number | null>(null);
  const pointersRef = useRef<Map<number, Point>>(new Map());
  const dragStartRef = useRef<{
    x: number;
    y: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const pinchStartRef = useRef<{
    distance: number;
    scale: number;
    originX: number;
    originY: number;
    midX: number;
    midY: number;
  } | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current !== null) {
        window.clearTimeout(focusTimerRef.current);
      }
    };
  }, []);

  const selectedDistrict = selectedId
    ? AZERBAIJAN_DISTRICTS.find((d) => d.id === selectedId) ?? null
    : null;

  const clampOffset = useCallback((nextX: number, nextY: number, nextScale: number): Point => {
    if (nextScale <= 1.01) return { x: 0, y: 0 };
    const rect = containerRef.current?.getBoundingClientRect();
    const maxX = rect ? (rect.width * (nextScale - 1)) / 2 + 48 : 300;
    const maxY = rect ? (rect.height * (nextScale - 1)) / 2 + 48 : 260;
    return {
      x: Math.max(-maxX, Math.min(maxX, nextX)),
      y: Math.max(-maxY, Math.min(maxY, nextY)),
    };
  }, []);

  const zoomBy = useCallback(
    (factor: number) => {
      if (focusingId) return;
      setScale((prev) => {
        const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number((prev * factor).toFixed(2))));
        setOffset((cur) => clampOffset(cur.x, cur.y, next));
        return next;
      });
    },
    [clampOffset, focusingId]
  );

  const resetView = useCallback(() => {
    if (focusingId) return;
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [focusingId]);

  const handleDistrictSelect = useCallback(
    (district: AzerbaijanDistrict) => {
      if (suppressClickRef.current || focusingId) return;

      setSelectedId(district.id);

      if (!onDistrictSelect) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const containerEl = containerRef.current;
      const wrapperEl = wrapperRef.current;
      const pathEl = pathRefs.current.get(district.id);

      if (!prefersReducedMotion && containerEl && wrapperEl && pathEl) {
        const containerRect = containerEl.getBoundingClientRect();
        const wrapperRect = wrapperEl.getBoundingClientRect();
        const pathRect = pathEl.getBoundingClientRect();

        const containerCenterX = containerRect.left + containerRect.width / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;
        const wrapperCenterX = wrapperRect.left + wrapperRect.width / 2;
        const wrapperCenterY = wrapperRect.top + wrapperRect.height / 2;
        const pathCenterX = pathRect.left + pathRect.width / 2;
        const pathCenterY = pathRect.top + pathRect.height / 2;

        const targetScale = getFocusZoomScale(district);
        const ratio = targetScale / scale;
        const dxNew = (pathCenterX - wrapperCenterX) * ratio;
        const dyNew = (pathCenterY - wrapperCenterY) * ratio;

        const targetOffsetX = containerCenterX - wrapperCenterX + offset.x - dxNew;
        const targetOffsetY = containerCenterY - wrapperCenterY + offset.y - dyNew;

        setFocusingId(district.id);
        setIsInteracting(false);
        setScale(targetScale);
        setOffset({ x: targetOffsetX, y: targetOffsetY });

        if (focusTimerRef.current !== null) {
          window.clearTimeout(focusTimerRef.current);
        }
        focusTimerRef.current = window.setTimeout(() => {
          focusTimerRef.current = null;
          onDistrictSelect(district.id);
        }, 620);
      } else {
        onDistrictSelect(district.id);
      }
    },
    [focusingId, offset.x, offset.y, onDistrictSelect, scale]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (focusingId) return;
    if ((e.target as HTMLElement).closest('[data-map-control="true"]')) return;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 1) {
      suppressClickRef.current = false;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        originX: offset.x,
        originY: offset.y,
        moved: false,
      };
      pinchStartRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      pinchStartRef.current = {
        distance: Math.max(dist, 1),
        scale,
        originX: offset.x,
        originY: offset.y,
        midX: (p1.x + p2.x) / 2,
        midY: (p1.y + p2.y) / 2,
      };
      dragStartRef.current = null;
      suppressClickRef.current = true;
      setIsInteracting(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (focusingId || !pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const nextScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, pinchStartRef.current.scale * (dist / pinchStartRef.current.distance))
      );
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dx = midX - pinchStartRef.current.midX;
      const dy = midY - pinchStartRef.current.midY;
      setScale(nextScale);
      setOffset(
        clampOffset(
          pinchStartRef.current.originX + dx,
          pinchStartRef.current.originY + dy,
          nextScale
        )
      );
      return;
    }

    if (pointersRef.current.size === 1 && dragStartRef.current && scale > 1.01) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.hypot(dx, dy) > 6) {
        dragStartRef.current.moved = true;
        suppressClickRef.current = true;
        setIsInteracting(true);
      }
      if (dragStartRef.current.moved) {
        setOffset(
          clampOffset(
            dragStartRef.current.originX + dx,
            dragStartRef.current.originY + dy,
            scale
          )
        );
      }
    }
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) {
      pinchStartRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      dragStartRef.current = null;
      setIsInteracting(false);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (focusingId) return;
    if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
      const factor = e.deltaY < 0 ? 1.14 : 0.88;
      zoomBy(factor);
    }
  };

  const isFocusing = focusingId !== null;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerCancel={handlePointerUpOrCancel}
      onWheel={handleWheel}
      onClick={(e) => {
        if (!isFocusing && e.target === e.currentTarget && !suppressClickRef.current) {
          setSelectedId(null);
        }
      }}
      className="relative flex w-full flex-1 select-none items-center justify-center overflow-hidden touch-none bg-[#E7ECF2] px-2 py-4 transition-colors duration-200 sm:px-6 dark:bg-[#0E1116]"
    >
      {/* Subtle selected rayon or active filter indicator */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute top-3 inset-x-0 z-10 flex justify-center"
      >
        <span
          className={`font-display font-semibold tracking-tight text-[#1F5D6B] transition-all duration-300 dark:text-[#6BC0D1] ${
            isFocusing ? 'scale-110 text-base' : 'scale-100 text-sm'
          } ${selectedDistrict || activeFilterCount > 0 ? 'opacity-100' : 'opacity-0'}`}
        >
          {selectedDistrict
            ? selectedDistrict.name
            : activeFilterCount > 0
              ? `${activeFilterCount} filtr aktivdir`
              : '\u00A0'}
        </span>
      </div>

      {/* Centered floating Azerbaijan map with contour-hugging drop shadow */}
      <div
        ref={wrapperRef}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          transition: isInteracting
            ? 'none'
            : isFocusing
              ? 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)'
              : 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="w-full max-w-[920px] will-change-transform"
      >
        <svg
          viewBox={AZERBAIJAN_MAP_VIEWBOX}
          role="group"
          aria-label="Azərbaycan rayonları xəritəsi"
          className="mx-auto block h-auto max-h-[calc(100dvh-10.5rem)] w-full overflow-visible drop-shadow-[0_16px_28px_rgba(17,34,51,0.18)] drop-shadow-[0_4px_8px_rgba(17,34,51,0.10)] dark:drop-shadow-[0_20px_34px_rgba(0,0,0,0.72)] dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
        >
          {/* Pass 1: Clickable rayon polygon buttons */}
          <g>
            {AZERBAIJAN_DISTRICTS.map((district) => {
              const isSelected = selectedId === district.id;
              const isHovered = hoveredId === district.id;
              const isFiltered = highlightedRegionIds.includes(district.id);
              const isDimmedByFocus = isFocusing && focusingId !== district.id;

              return (
                <path
                  key={district.id}
                  ref={(el) => {
                    if (el) {
                      pathRefs.current.set(district.id, el);
                    } else {
                      pathRefs.current.delete(district.id);
                    }
                  }}
                  d={district.d}
                  role="button"
                  tabIndex={0}
                  aria-label={district.name}
                  aria-pressed={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDistrictSelect(district);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDistrictSelect(district);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!isFocusing) setHoveredId(district.id);
                  }}
                  onMouseLeave={() => setHoveredId((cur) => (cur === district.id ? null : cur))}
                  strokeLinejoin="round"
                  strokeWidth={isSelected || isFiltered ? 1.6 : 1.15}
                  className={`cursor-pointer transition-all duration-300 focus:outline-none focus-visible:stroke-[#1F5D6B] dark:focus-visible:stroke-[#6BC0D1] ${
                    isDimmedByFocus ? 'opacity-40' : 'opacity-100'
                  } ${
                    isSelected
                      ? 'fill-[#1F5D6B] stroke-[#15424D] dark:fill-[#2B7788] dark:stroke-[#5CB8C9]'
                      : isFiltered
                        ? 'fill-[#D7EAEE] stroke-[#1F5D6B] dark:fill-[#1D3741] dark:stroke-[#4FA3B3]'
                        : isHovered
                          ? 'fill-[#E2EFF2] stroke-[#84A7B2] dark:fill-[#22323E] dark:stroke-[#3F596B]'
                          : 'fill-white stroke-[#BCC9D6] dark:fill-[#1A222C] dark:stroke-[#2D3948]'
                  }`}
                />
              );
            })}
          </g>

          {/* Pass 2: Clean rayon name labels rendered above all borders so nothing clips */}
          <g className="pointer-events-none select-none">
            {AZERBAIJAN_DISTRICTS.map((district) => {
              const isSelected = selectedId === district.id;
              const isHovered = hoveredId === district.id;
              const isFiltered = highlightedRegionIds.includes(district.id);
              const isDimmedByFocus = isFocusing && focusingId !== district.id;
              const isExternalLabel = district.id === 'sumqayit';
              const { x, y } = getLabelCoords(district);
              const fontSize = getLabelFontSize(district);

              return (
                <text
                  key={`label-${district.id}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  className={`font-sans font-medium tracking-[-0.01em] transition-all duration-300 ${
                    isDimmedByFocus ? 'opacity-30' : 'opacity-100'
                  } ${
                    isSelected
                      ? isExternalLabel
                        ? 'fill-[#1F5D6B] font-semibold dark:fill-[#6BC0D1]'
                        : 'fill-white dark:fill-[#F7F8FA]'
                      : isHovered || isFiltered
                        ? 'fill-[#164855] dark:fill-[#EEF2F6]'
                        : 'fill-[#2B3544] dark:fill-[#C5D0DC]'
                  }`}
                >
                  {district.name}
                </text>
              );
            })}
          </g>

          {/* Pass 3: User-pinned places added from Yer əlavə et */}
          {pinnedPlaces.some(
            (place) =>
              place.pin !== null &&
              typeof place.pin.x === 'number' &&
              typeof place.pin.y === 'number'
          ) && (
            <g className="pointer-events-none select-none">
              {pinnedPlaces.map((place) => {
                if (
                  !place.pin ||
                  typeof place.pin.x !== 'number' ||
                  typeof place.pin.y !== 'number'
                ) {
                  return null;
                }
                const pinScale = Math.max(0.55, 0.9 / Math.sqrt(scale));
                return (
                  <g
                    key={place.id}
                    transform={`translate(${place.pin.x}, ${place.pin.y}) scale(${pinScale})`}
                  >
                    <ellipse cx="0" cy="2" rx="7" ry="2.8" fill="rgba(17,34,51,0.28)" />
                    <path
                      d="M0 0C-6.5-8.2-10-14-10-19C-10-24.5-5.5-29 0-29C5.5-29 10-24.5 10-19C10-14 6.5-8.2 0 0Z"
                      className="fill-[#1F5D6B] stroke-white dark:fill-[#3895A8] dark:stroke-[#0E1116]"
                      strokeWidth="2.2"
                    />
                    <circle cx="0" cy="-19" r="3.4" className="fill-white dark:fill-[#0E1116]" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Minimalist subtle zoom controls for comfortable tapping on mobile screens */}
      <div
        data-map-control="true"
        className={`absolute right-3 bottom-4 z-20 flex flex-col gap-1.5 transition-opacity duration-200 sm:right-5 sm:bottom-6 ${
          isFocusing ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        {scale > 1.05 && (
          <button
            type="button"
            onClick={resetView}
            aria-label="Xəritəni sıfırla"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#141A23]/[0.08] bg-white/90 text-[#4B5563] shadow-xs backdrop-blur-md transition-colors duration-150 hover:bg-white hover:text-[#141A23] active:scale-[0.96] dark:border-[#EEF2F6]/[0.09] dark:bg-[#161B22]/90 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={() => zoomBy(1.3)}
          disabled={scale >= MAX_SCALE}
          aria-label="Yaxınlaşdır"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#141A23]/[0.08] bg-white/90 text-[#4B5563] shadow-xs backdrop-blur-md transition-colors duration-150 hover:bg-white hover:text-[#141A23] active:scale-[0.96] disabled:opacity-40 dark:border-[#EEF2F6]/[0.09] dark:bg-[#161B22]/90 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.3)}
          disabled={scale <= MIN_SCALE}
          aria-label="Uzaqlaşdır"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#141A23]/[0.08] bg-white/90 text-[#4B5563] shadow-xs backdrop-blur-md transition-colors duration-150 hover:bg-white hover:text-[#141A23] active:scale-[0.96] disabled:opacity-40 dark:border-[#EEF2F6]/[0.09] dark:bg-[#161B22]/90 dark:text-[#94A0B2] dark:hover:bg-[#1E252F] dark:hover:text-[#EEF2F6] cursor-pointer"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
