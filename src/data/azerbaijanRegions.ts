import { AZERBAIJAN_DISTRICTS } from './azerbaijanDistricts';

export interface RegionOption {
  id: string;
  name: string;
  mapId?: string;
}

const AZ_ALPHABET_ORDER =
  'AaBbCcÇçDdEeƏəFfGgĞğHhXxIıİiJjKkQqLlMmNnOoÖöPpRrSsŞşTtUuÜüVvYyZz';

const CHAR_RANK = new Map<string, number>();
Array.from(AZ_ALPHABET_ORDER).forEach((ch, index) => {
  CHAR_RANK.set(ch, index);
});

export function compareAzerbaijani(a: string, b: string): number {
  const charsA = Array.from(a);
  const charsB = Array.from(b);
  const minLen = Math.min(charsA.length, charsB.length);

  for (let i = 0; i < minLen; i++) {
    const ca = charsA[i];
    const cb = charsB[i];
    if (ca === cb) continue;

    const ra = CHAR_RANK.get(ca);
    const rb = CHAR_RANK.get(cb);
    if (ra !== undefined && rb !== undefined) {
      const baseA = Math.floor(ra / 2);
      const baseB = Math.floor(rb / 2);
      if (baseA !== baseB) return baseA - baseB;
      return ra - rb;
    }
    const cmp = ca.localeCompare(cb, 'az');
    if (cmp !== 0) return cmp;
  }

  return charsA.length - charsB.length;
}

const REPUBLIC_CITIES: RegionOption[] = [
  { id: 'gence', name: 'Gəncə', mapId: 'goygol' },
  { id: 'mingecevir', name: 'Mingəçevir', mapId: 'yevlax' },
  { id: 'naftalan', name: 'Naftalan', mapId: 'goranboy' },
  { id: 'naxcivan-city', name: 'Naxçıvan', mapId: 'babek' },
  { id: 'sirvan', name: 'Şirvan', mapId: 'haciqabul' },
  { id: 'xankendi', name: 'Xankəndi', mapId: 'xocali' },
];

const districtOptions: RegionOption[] = AZERBAIJAN_DISTRICTS.map((d) => ({
  id: d.id,
  name: d.name,
  mapId: d.id,
}));

export const AZERBAIJAN_REGIONS: RegionOption[] = [...districtOptions, ...REPUBLIC_CITIES].sort(
  (a, b) => compareAzerbaijani(a.name, b.name)
);
