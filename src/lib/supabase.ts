import { createClient } from '@supabase/supabase-js';

const DEFAULT_PROJECT_REF = 'sjuwzzkppnxdrybrdgxx';
const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_a1E5WC81jsHClXBfjS3CbA_DEZDPndr';

function resolveSupabaseUrl(rawValue?: string): string {
  const trimmed = rawValue?.trim();
  if (!trimmed) {
    return `https://${DEFAULT_PROJECT_REF}.supabase.co`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed}.supabase.co`;
}

export const supabaseUrl = resolveSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function formatSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) {
    return 'Email və ya parol yanlışdır.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email ünvanınızı təsdiqləyin (gələn qutunu yoxlayın).';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Bu email artıq qeydiyyatdan keçib.';
  }
  if (lower.includes('password should be at least')) {
    return 'Parol ən azı 6 simvoldan ibarət olmalıdır.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Çox sayda cəhd edildi. Bir az sonra yenidən yoxlayın.';
  }
  if (lower.includes('invalid email')) {
    return 'Zəhmət olmasa düzgün email daxil edin.';
  }
  return 'Əməliyyat zamanı xəta baş verdi. Yenidən cəhd edin.';
}
