import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { PlaceSubmission } from '../types/filter';

const PLACE_IMAGES_BUCKET = 'place-images';

interface PlaceRow {
  id: string;
  user_id: string | null;
  name: string;
  main_image_url: string | null;
  extra_image_urls: string[] | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  pin_x: number | null;
  pin_y: number | null;
  district_id: string | null;
  district_name: string | null;
  regions: string[] | null;
  place_types: string[] | null;
  companions: string[] | null;
  crowd_sizes: string[] | null;
  seasons: string[] | null;
  created_at: string;
}

function mapRowToPlace(row: PlaceRow): PlaceSubmission {
  const hasPin =
    (row.lat !== null && row.lng !== null) ||
    (row.pin_x !== null && row.pin_y !== null);

  return {
    id: row.id,
    name: row.name,
    mainImage: row.main_image_url,
    extraImages: row.extra_image_urls ?? [],
    pin: hasPin
      ? {
          lat: row.lat,
          lng: row.lng,
          address: row.address,
          x: row.pin_x,
          y: row.pin_y,
          districtId: row.district_id,
          districtName: row.district_name,
        }
      : null,
    filters: {
      regions: row.regions ?? [],
      places: row.place_types ?? [],
      companions: row.companions ?? [],
      crowdSize: row.crowd_sizes ?? [],
      seasons: row.seasons ?? [],
    },
    createdAt: new Date(row.created_at).getTime(),
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64Data] = dataUrl.split(',');
  const mimeMatch = header.match(/data:([^;]+);/);
  const mime = mimeMatch?.[1] ?? 'image/jpeg';
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function uploadImageIfDataUrl(
  src: string,
  userId: string,
  suffix: string
): Promise<string | null> {
  if (!src.startsWith('data:')) {
    return src;
  }

  const blob = dataUrlToBlob(src);
  const filePath = `${userId}/${Date.now()}-${suffix}.jpg`;

  const { error } = await supabase.storage
    .from(PLACE_IMAGES_BUCKET)
    .upload(filePath, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    return null;
  }

  const { data } = supabase.storage.from(PLACE_IMAGES_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function upsertUserProfile(user: User): Promise<void> {
  try {
    const fullName =
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name.trim()
        : '';

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        email: user.email ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // Silent fallback if profile sync is unavailable
  }
}

export async function fetchPlacesFromSupabase(): Promise<{
  places: PlaceSubmission[];
}> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { places: [] };
  }

  return {
    places: ((data as PlaceRow[] | null) ?? []).map(mapRowToPlace),
  };
}

export interface SavePlaceResult {
  savedPlace: PlaceSubmission;
  syncedToCloud: boolean;
  requiresAuth?: boolean;
  message?: string;
}

export async function savePlaceToSupabase(
  draft: PlaceSubmission
): Promise<SavePlaceResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;

  if (!user) {
    return {
      savedPlace: draft,
      syncedToCloud: false,
      requiresAuth: true,
      message: 'Məkanı hesabınızda saxlamaq üçün daxil olun.',
    };
  }

  let mainImageUrl = draft.mainImage;
  if (draft.mainImage) {
    const uploadedMain = await uploadImageIfDataUrl(draft.mainImage, user.id, 'main');
    if (uploadedMain) {
      mainImageUrl = uploadedMain;
    }
  }

  const extraImageUrls: string[] = [];
  for (let i = 0; i < draft.extraImages.length; i++) {
    const img = draft.extraImages[i];
    const uploadedExtra = await uploadImageIfDataUrl(img, user.id, `extra-${i}`);
    extraImageUrls.push(uploadedExtra ?? img);
  }

  const { data, error } = await supabase
    .from('places')
    .insert({
      user_id: user.id,
      name: draft.name,
      main_image_url: mainImageUrl,
      extra_image_urls: extraImageUrls,
      lat: draft.pin?.lat ?? null,
      lng: draft.pin?.lng ?? null,
      address: draft.pin?.address ?? null,
      pin_x: draft.pin?.x ?? null,
      pin_y: draft.pin?.y ?? null,
      district_id: draft.pin?.districtId ?? null,
      district_name: draft.pin?.districtName ?? null,
      regions: draft.filters.regions,
      place_types: draft.filters.places,
      companions: draft.filters.companions,
      crowd_sizes: draft.filters.crowdSize,
      seasons: draft.filters.seasons,
    })
    .select()
    .single();

  if (error) {
    return {
      savedPlace: draft,
      syncedToCloud: false,
      message: 'Məlumat bu cihazda saxlanıldı.',
    };
  }

  return {
    savedPlace: mapRowToPlace(data as PlaceRow),
    syncedToCloud: true,
  };
}
