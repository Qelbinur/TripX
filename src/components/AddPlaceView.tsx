import React, { useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { AZERBAIJAN_REGIONS } from '../data/azerbaijanRegions';
import {
  COMPANION_OPTIONS,
  CROWD_OPTIONS,
  EMPTY_FILTER_STATE,
  PLACE_OPTIONS,
  SEASON_OPTIONS,
  type FilterState,
  type MapPinPoint,
  type PlaceSubmission,
} from '../types/filter';
import { ImageEditorModal } from './ImageEditorModal';
import { MapPinPicker } from './MapPinPicker';
import { RegionPickerModal } from './RegionPickerModal';

interface AddPlaceViewProps {
  onSubmitPlace: (place: PlaceSubmission) => void;
  onViewMap: () => void;
  isDatabaseConnected?: boolean;
}

type EditorSession =
  | { kind: 'main'; src: string }
  | { kind: 'extra-new'; src: string }
  | { kind: 'extra-edit'; index: number; src: string };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Fayl oxunmadı'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('Fayl oxuma xətası'));
    reader.readAsDataURL(file);
  });
}

function toggleArrayItem(items: string[], target: string): string[] {
  return items.includes(target)
    ? items.filter((item) => item !== target)
    : [...items, target];
}

export const AddPlaceView: React.FC<AddPlaceViewProps> = ({
  onSubmitPlace,
  onViewMap,
  isDatabaseConnected = false,
}) => {
  const [name, setName] = useState('');
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [pin, setPin] = useState<MapPinPoint | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTER_STATE);
  const [isRegionPickerOpen, setIsRegionPickerOpen] = useState(false);
  const [editorSession, setEditorSession] = useState<EditorSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedPlace, setSubmittedPlace] = useState<PlaceSubmission | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  const selectedRegionNames = useMemo(() => {
    const map = new Map(AZERBAIJAN_REGIONS.map((r) => [r.id, r.name]));
    return filters.regions.map((id) => map.get(id)).filter((n): n is string => Boolean(n));
  }, [filters.regions]);

  const toggleFilter = (key: keyof FilterState, item: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: toggleArrayItem(prev[key], item),
    }));
  };

  const handlePinChange = (nextPin: MapPinPoint | null) => {
    setPin(nextPin);
    if (nextPin?.districtId) {
      const districtId = nextPin.districtId;
      setFilters((prev) =>
        prev.regions.includes(districtId)
          ? prev
          : { ...prev, regions: [...prev.regions, districtId] }
      );
    }
  };

  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setEditorSession({ kind: 'main', src: dataUrl });
      setError(null);
    } catch {
      setError('Şəkil yüklənərkən xəta baş verdi.');
    }
  };

  const handleExtraFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    try {
      const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
      setError(null);
      if (dataUrls.length === 1) {
        setEditorSession({ kind: 'extra-new', src: dataUrls[0] });
      } else {
        setExtraImages((prev) => [...prev, ...dataUrls]);
      }
    } catch {
      setError('Şəkillər yüklənərkən xəta baş verdi.');
    }
  };

  const handleEditorSave = (editedDataUrl: string) => {
    if (!editorSession) return;
    if (editorSession.kind === 'main') {
      setMainImage(editedDataUrl);
    } else if (editorSession.kind === 'extra-new') {
      setExtraImages((prev) => [...prev, editedDataUrl]);
    } else if (editorSession.kind === 'extra-edit') {
      setExtraImages((prev) =>
        prev.map((img, idx) => (idx === editorSession.index ? editedDataUrl : img))
      );
    }
    setEditorSession(null);
  };

  const resetForm = () => {
    setName('');
    setMainImage(null);
    setExtraImages([]);
    setPin(null);
    setFilters(EMPTY_FILTER_STATE);
    setError(null);
    setSubmittedPlace(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Zəhmət olmasa məkanın adını yazın.');
      return;
    }
    if (!isDatabaseConnected) {
      setError('Verilənlər bazası ilə əlaqə yoxdur. Məkanı qeydə almaq mümkün olmadı.');
      return;
    }

    setError(null);

    const draft: PlaceSubmission = {
      id: `${Date.now()}`,
      name: trimmedName,
      mainImage,
      extraImages,
      pin,
      filters,
      createdAt: Date.now(),
    };

    onSubmitPlace(draft);
    setSubmittedPlace(draft);
  };

  const renderMultiSelectGroup = (
    title: string,
    key: Exclude<keyof FilterState, 'regions'>,
    options: readonly string[]
  ) => {
    const selected = filters[key];

    return (
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
            {title}
          </h2>
          {selected.length > 0 && (
            <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
              {selected.length} seçilib
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleFilter(key, option)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.97] whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'border-[#1F5D6B] bg-[#1F5D6B] text-white shadow-xs dark:border-[#3A8A9C] dark:bg-[#2B7788] dark:text-[#F7F8FA]'
                    : 'border-[#141A23]/10 bg-[#F7F8FA] text-[#2B3544] hover:border-[#141A23]/20 hover:bg-white dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:text-[#C5D0DC] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1E252F]'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const hasAnyDraftContent =
    name.trim().length > 0 ||
    mainImage !== null ||
    extraImages.length > 0 ||
    pin !== null ||
    filters.regions.length > 0 ||
    filters.places.length > 0 ||
    filters.companions.length > 0 ||
    filters.crowdSize.length > 0 ||
    filters.seasons.length > 0;

  if (submittedPlace) {
    const regionMap = new Map(AZERBAIJAN_REGIONS.map((r) => [r.id, r.name]));
    const summaryParts = [
      submittedPlace.filters.regions.map((id) => regionMap.get(id)).filter(Boolean).join(', '),
      submittedPlace.filters.places.join(', '),
      submittedPlace.pin?.districtName && !submittedPlace.filters.regions.length
        ? submittedPlace.pin.districtName
        : '',
    ].filter(Boolean);

    return (
      <section
        aria-label="Yer əlavə edildi"
        className="tripx-enter mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-4 py-6 sm:px-6"
      >
        <div className="w-full rounded-3xl border border-[#141A23]/[0.07] bg-white p-6 text-center shadow-[0_12px_32px_rgba(17,34,51,0.06)] sm:p-7 dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F0F3] text-[#1F5D6B] dark:bg-[#1D323A] dark:text-[#6BC0D1]">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>

          <h1 className="mt-4 font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
            {submittedPlace.name}
          </h1>

          <p className="mt-1.5 text-sm text-[#5B6472] dark:text-[#94A0B2]">
            Məkan əlavə edildi.
          </p>

          {summaryParts.length > 0 && (
            <p className="mt-2 text-xs text-[#6B7482] dark:text-[#8A95A5]">
              {summaryParts.join(' · ')}
            </p>
          )}

          {submittedPlace.mainImage && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#141A23]/8 dark:border-[#EEF2F6]/10">
              <img
                src={submittedPlace.mainImage}
                alt={submittedPlace.name}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-[#141A23]/12 px-4 text-sm font-medium text-[#141A23] transition-colors hover:bg-[#F7F8FA] active:scale-[0.98] dark:border-[#EEF2F6]/14 dark:text-[#EEF2F6] dark:hover:bg-[#1E252F] cursor-pointer"
            >
              Yeni yer əlavə et
            </button>
            <button
              type="button"
              onClick={onViewMap}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-[#1F5D6B] px-4 text-sm font-medium text-white transition-colors hover:bg-[#194D59] active:scale-[0.98] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
            >
              Xəritəyə bax
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Yer əlavə et"
      className="tripx-enter mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-5 sm:px-6"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-[#141A23]/[0.07] bg-white p-5 shadow-[0_12px_32px_rgba(17,34,51,0.06)] transition-colors duration-200 sm:p-6 dark:border-[#EEF2F6]/[0.08] dark:bg-[#161B22] dark:shadow-[0_16px_36px_rgba(0,0,0,0.42)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#141A23]/[0.06] pb-4 dark:border-[#EEF2F6]/[0.07]">
          <h1 className="font-display text-xl font-semibold tracking-tight text-[#141A23] dark:text-[#EEF2F6]">
            Yer əlavə et
          </h1>

          <button
            type="button"
            onClick={resetForm}
            disabled={!hasAnyDraftContent}
            className="min-h-[44px] px-2 text-xs font-medium text-[#1F5D6B] transition-opacity duration-150 hover:text-[#164652] disabled:opacity-35 dark:text-[#6BC0D1] dark:hover:text-[#8FD1DE] cursor-pointer disabled:cursor-default"
          >
            Təmizlə
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* 1. Məkanın adı */}
          <div className="space-y-2">
            <label
              htmlFor="place-name"
              className="block text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]"
            >
              Məkanın adı
            </label>
            <input
              id="place-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Məsələn: Göygöl, Xınalıq şəlaləsi"
              className="h-12 w-full rounded-xl border border-[#141A23]/12 bg-[#F7F8FA] px-3.5 text-sm text-[#141A23] placeholder:text-[#8A94A3] transition-colors duration-150 focus:border-[#1F5D6B] focus:bg-white focus:outline-none dark:border-[#EEF2F6]/12 dark:bg-[#0E1116] dark:text-[#EEF2F6] dark:placeholder:text-[#5F6B7A] dark:focus:border-[#4FA3B3] dark:focus:bg-[#11161D]"
            />
          </div>

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {/* 2. Şəkillər (1 əsas + bir neçə əlavə, redaktə dəstəyi ilə) */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
                  Əsas şəkil
                </h2>
                <span className="text-xs text-[#6B7482] dark:text-[#8A95A5]">
                  1 şəkil · redaktə edilə bilər
                </span>
              </div>

              <input
                ref={mainInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainFileSelect}
                className="sr-only"
              />

              {mainImage ? (
                <div className="relative overflow-hidden rounded-2xl border border-[#141A23]/10 bg-[#F7F8FA] dark:border-[#EEF2F6]/10 dark:bg-[#0E1116]">
                  <img
                    src={mainImage}
                    alt="Əsas şəkil önizləməsi"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="flex items-center justify-end gap-2 border-t border-[#141A23]/[0.06] bg-white/95 px-3 py-2 dark:border-[#EEF2F6]/[0.07] dark:bg-[#161B22]/95">
                    <button
                      type="button"
                      onClick={() => setEditorSession({ kind: 'main', src: mainImage })}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[#1F5D6B] transition-colors hover:bg-[#E4F0F3]/60 dark:text-[#6BC0D1] dark:hover:bg-[#1D323A]/60 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Redaktə et</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => mainInputRef.current?.click()}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[#4B5563] transition-colors hover:bg-[#F0F2F5] dark:text-[#C5D0DC] dark:hover:bg-[#1E252F] cursor-pointer"
                    >
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Dəyiş</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainImage(null)}
                      aria-label="Əsas şəkli sil"
                      className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#6B7482] transition-colors hover:bg-[#FEE2E2]/60 hover:text-[#B91C1C] dark:text-[#8A95A5] dark:hover:bg-[#7F1D1D]/30 dark:hover:text-[#F87171] cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainInputRef.current?.click()}
                  className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#141A23]/18 bg-[#F7F8FA] px-4 text-center transition-colors duration-150 hover:border-[#1F5D6B]/50 hover:bg-white active:scale-[0.99] dark:border-[#EEF2F6]/16 dark:bg-[#0E1116] dark:hover:border-[#4FA3B3]/50 dark:hover:bg-[#1B222C] cursor-pointer"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1F5D6B] shadow-xs dark:bg-[#161B22] dark:text-[#6BC0D1]">
                    <Camera className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-[#141A23] dark:text-[#EEF2F6]">
                    Əsas şəkil seçin
                  </span>
                  <span className="text-xs text-[#6B7482] dark:text-[#8A95A5]">
                    Seçdikdən sonra kəsmə və rəng tənzimləməsi açılır
                  </span>
                </button>
              )}
            </div>

            {/* Additional photos */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
                  Əlavə şəkillər
                </h2>
                {extraImages.length > 0 && (
                  <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
                    {extraImages.length} şəkil
                  </span>
                )}
              </div>

              <input
                ref={extraInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraFilesSelect}
                className="sr-only"
              />

              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {extraImages.map((imgSrc, idx) => (
                  <div
                    key={`${idx}-${imgSrc.slice(0, 32)}`}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] dark:border-[#EEF2F6]/10 dark:bg-[#0E1116]"
                  >
                    <img
                      src={imgSrc}
                      alt={`Əlavə şəkil ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 via-black/40 to-transparent p-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditorSession({ kind: 'extra-edit', index: idx, src: imgSrc })
                        }
                        aria-label={`Əlavə şəkil ${idx + 1} redaktə et`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-[#141A23] transition-transform active:scale-95 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setExtraImages((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))
                        }
                        aria-label={`Əlavə şəkil ${idx + 1} sil`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/65 text-white transition-transform active:scale-95 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => extraInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#141A23]/18 bg-[#F7F8FA] p-2 text-center transition-colors duration-150 hover:border-[#1F5D6B]/50 hover:bg-white active:scale-[0.97] dark:border-[#EEF2F6]/16 dark:bg-[#0E1116] dark:hover:border-[#4FA3B3]/50 dark:hover:bg-[#1B222C] cursor-pointer"
                >
                  <ImagePlus
                    className="h-5 w-5 text-[#1F5D6B] dark:text-[#6BC0D1]"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-medium text-[#4B5563] dark:text-[#94A0B2]">
                    Əlavə et
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {/* 3. Xəritədə yerin pinlənməsi */}
          <MapPinPicker value={pin} onChange={handlePinChange} />

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {/* 4. Filterlərə uyğun bölmələr */}
          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold tracking-wide text-[#5B6472] dark:text-[#94A0B2]">
                Bölgə
              </h2>
              {selectedRegionNames.length > 0 && (
                <span className="text-xs font-medium text-[#1F5D6B] tabular-nums dark:text-[#6BC0D1]">
                  {selectedRegionNames.length} seçilib
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsRegionPickerOpen(true)}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl border border-[#141A23]/10 bg-[#F7F8FA] px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#141A23]/20 hover:bg-white active:scale-[0.99] dark:border-[#EEF2F6]/10 dark:bg-[#0E1116] dark:hover:border-[#EEF2F6]/20 dark:hover:bg-[#1B222C] cursor-pointer"
            >
              <span
                className={`truncate text-sm ${
                  selectedRegionNames.length > 0
                    ? 'font-medium text-[#141A23] dark:text-[#EEF2F6]'
                    : 'text-[#6B7482] dark:text-[#8A95A5]'
                }`}
              >
                {selectedRegionNames.length > 0
                  ? selectedRegionNames.join(', ')
                  : 'Rayon və ya şəhər seçin'}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#6B7482] dark:text-[#8A95A5]" aria-hidden="true" />
            </button>

            {selectedRegionNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {filters.regions.map((regionId) => {
                  const region = AZERBAIJAN_REGIONS.find((r) => r.id === regionId);
                  if (!region) return null;
                  return (
                    <button
                      key={region.id}
                      type="button"
                      onClick={() => toggleFilter('regions', region.id)}
                      aria-label={`${region.name} seçimini sil`}
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-[#E4F0F3] px-2.5 py-1 text-xs font-medium text-[#164652] transition-colors hover:bg-[#D5E9EE] dark:bg-[#1E333B] dark:text-[#A8DCE6] dark:hover:bg-[#26424C] cursor-pointer"
                    >
                      <span>{region.name}</span>
                      <X className="h-3.5 w-3.5 opacity-75" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {renderMultiSelectGroup('Məkan', 'places', PLACE_OPTIONS)}

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {renderMultiSelectGroup('Kimlə', 'companions', COMPANION_OPTIONS)}

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {renderMultiSelectGroup('İnsan sayı', 'crowdSize', CROWD_OPTIONS)}

          <div className="border-t border-[#141A23]/[0.06] dark:border-[#EEF2F6]/[0.07]" />

          {renderMultiSelectGroup('Mövsüm', 'seasons', SEASON_OPTIONS)}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 text-xs font-medium text-[#B91C1C] dark:text-[#F87171]"
          >
            {error}
          </p>
        )}

        {/* Submit button */}
        <div className="mt-7 border-t border-[#141A23]/[0.06] pt-4 dark:border-[#EEF2F6]/[0.07]">
          <button
            type="submit"
            className="flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1F5D6B] px-4 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#194D59] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D6B] dark:bg-[#2B7788] dark:hover:bg-[#358A9D] cursor-pointer"
          >
            Yeri əlavə et
          </button>
        </div>
      </form>

      <RegionPickerModal
        isOpen={isRegionPickerOpen}
        selectedIds={filters.regions}
        onToggle={(regionId) => toggleFilter('regions', regionId)}
        onClear={() => setFilters((prev) => ({ ...prev, regions: [] }))}
        onClose={() => setIsRegionPickerOpen(false)}
      />

      <ImageEditorModal
        imageSrc={editorSession?.src ?? null}
        title={editorSession?.kind === 'main' ? 'Əsas şəkli redaktə et' : 'Şəkli redaktə et'}
        defaultAspect={editorSession?.kind === 'main' ? '4:3' : '1:1'}
        onCancel={() => setEditorSession(null)}
        onSave={handleEditorSave}
      />
    </section>
  );
};
