import type { PlaceSubmission } from '../types/filter';

type LandscapeScene =
  | 'alpine-lake'
  | 'mountain-village'
  | 'historic-courtyard'
  | 'snow-peaks'
  | 'old-city'
  | 'waterfall'
  | 'stone-lane'
  | 'candy-mountains'
  | 'tea-hills'
  | 'canyon-sea';

interface ScenePalette {
  skyTop: string;
  skyBottom: string;
  sun: string;
  farMountain: string;
  midMountain: string;
  nearTerrain: string;
  accent: string;
  water?: string;
}

const SCENE_PALETTES: Record<LandscapeScene, ScenePalette> = {
  'alpine-lake': {
    skyTop: '#C9DCE6',
    skyBottom: '#F1DFC8',
    sun: '#FFF5E1',
    farMountain: '#5E7F8F',
    midMountain: '#2F5563',
    nearTerrain: '#1D3B44',
    accent: '#498A99',
    water: '#1F5D6B',
  },
  'mountain-village': {
    skyTop: '#8FB2C9',
    skyBottom: '#E9D5B8',
    sun: '#FCECC9',
    farMountain: '#6A7B8A',
    midMountain: '#4B6357',
    nearTerrain: '#3B4F43',
    accent: '#C49A6C',
  },
  'historic-courtyard': {
    skyTop: '#BFD4E0',
    skyBottom: '#F3DFC1',
    sun: '#FFF2D6',
    farMountain: '#8A735C',
    midMountain: '#C9AE8B',
    nearTerrain: '#A88963',
    accent: '#1F5D6B',
  },
  'snow-peaks': {
    skyTop: '#7EA8C7',
    skyBottom: '#DCE9F2',
    sun: '#FFFFFF',
    farMountain: '#9BB5C9',
    midMountain: '#53738A',
    nearTerrain: '#2A4354',
    accent: '#F4F8FB',
  },
  'old-city': {
    skyTop: '#A6BFD1',
    skyBottom: '#F2CFA3',
    sun: '#FFE8BA',
    farMountain: '#B39370',
    midMountain: '#D4B58E',
    nearTerrain: '#9E7D58',
    accent: '#594230',
  },
  waterfall: {
    skyTop: '#B8D4CE',
    skyBottom: '#E3EFEA',
    sun: '#F7FBF8',
    farMountain: '#3E6B5E',
    midMountain: '#274F45',
    nearTerrain: '#1A3830',
    accent: '#D8F1F5',
    water: '#2F7D8C',
  },
  'stone-lane': {
    skyTop: '#9AB8C9',
    skyBottom: '#EAD7BE',
    sun: '#FDF1D6',
    farMountain: '#536D63',
    midMountain: '#7A6B5C',
    nearTerrain: '#594C42',
    accent: '#B87444',
  },
  'candy-mountains': {
    skyTop: '#8BB5D1',
    skyBottom: '#F4DFC8',
    sun: '#FFF4DC',
    farMountain: '#C2745D',
    midMountain: '#D99B7E',
    nearTerrain: '#A65442',
    accent: '#F2E5D5',
  },
  'tea-hills': {
    skyTop: '#C4D9D4',
    skyBottom: '#ECF2E6',
    sun: '#FFFDF2',
    farMountain: '#4E7A65',
    midMountain: '#3A6B52',
    nearTerrain: '#29523D',
    accent: '#6FA37A',
  },
  'canyon-sea': {
    skyTop: '#9BB9CC',
    skyBottom: '#F0CFA8',
    sun: '#FFECC7',
    farMountain: '#3D6E7D',
    midMountain: '#B58E69',
    nearTerrain: '#8A6748',
    accent: '#D9B896',
    water: '#2D6678',
  },
};

function createScenicCover(scene: LandscapeScene, variant = 0): string {
  const p = SCENE_PALETTES[scene];
  const sunX = variant % 2 === 0 ? 305 : 98;
  const sunY = variant % 2 === 0 ? 64 : 58;

  let detailMarkup = '';

  if (scene === 'alpine-lake') {
    detailMarkup = `
      <path d="M0 175 L75 102 L145 142 L225 78 L315 135 L400 94 L400 205 L0 205 Z" fill="${p.farMountain}" />
      <path d="M0 190 L60 135 L132 168 L205 118 L285 164 L365 126 L400 148 L400 212 L0 212 Z" fill="${p.midMountain}" />
      <rect x="0" y="196" width="400" height="104" fill="url(#waterGrad)" />
      <path d="M120 222 Q200 216 280 222" stroke="${p.sun}" stroke-opacity="0.32" stroke-width="2" fill="none" />
      <path d="M150 242 Q205 238 258 242" stroke="${p.sun}" stroke-opacity="0.22" stroke-width="1.6" fill="none" />
      <path d="M0 245 Q62 225 118 265 L145 300 L0 300 Z" fill="${p.nearTerrain}" />
      <path d="M400 240 Q332 226 276 272 L248 300 L400 300 Z" fill="${p.nearTerrain}" />
    `;
  } else if (scene === 'mountain-village') {
    detailMarkup = `
      <path d="M0 185 L85 95 L178 135 L275 72 L365 122 L400 105 L400 220 L0 220 Z" fill="${p.farMountain}" />
      <path d="M0 205 Q125 140 245 175 T400 165 L400 300 L0 300 Z" fill="${p.midMountain}" />
      <g fill="${p.accent}" stroke="#2B3630" stroke-opacity="0.28" stroke-width="1">
        <rect x="122" y="168" width="28" height="18" rx="1.5" />
        <rect x="155" y="162" width="32" height="20" rx="1.5" />
        <rect x="193" y="170" width="26" height="17" rx="1.5" />
        <rect x="140" y="184" width="30" height="19" rx="1.5" />
        <rect x="176" y="186" width="34" height="20" rx="1.5" />
        <rect x="216" y="182" width="28" height="18" rx="1.5" />
      </g>
      <path d="M0 232 Q115 200 235 238 T400 224 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
    `;
  } else if (scene === 'historic-courtyard') {
    detailMarkup = `
      <rect x="44" y="110" width="312" height="145" rx="4" fill="${p.midMountain}" />
      <path d="M36 112 L200 84 L364 112 Z" fill="${p.farMountain}" />
      <g fill="${p.accent}" fill-opacity="0.82">
        <path d="M78 210 L78 156 Q102 132 126 156 L126 210 Z" />
        <path d="M170 210 L170 148 Q200 120 230 148 L230 210 Z" />
        <path d="M274 210 L274 156 Q298 132 322 156 L322 210 Z" />
      </g>
      <g stroke="#F7E7CE" stroke-opacity="0.65" stroke-width="1.2" fill="none">
        <path d="M102 144 L102 210 M78 178 L126 178" />
        <path d="M200 134 L200 210 M170 172 L230 172" />
        <path d="M298 144 L298 210 M274 178 L322 178" />
      </g>
      <rect x="0" y="210" width="400" height="90" fill="${p.nearTerrain}" />
      <rect x="132" y="236" width="136" height="32" rx="16" fill="#2A6D7A" fill-opacity="0.85" />
    `;
  } else if (scene === 'snow-peaks') {
    detailMarkup = `
      <path d="M0 205 L92 84 L158 140 L246 58 L334 134 L400 92 L400 230 L0 230 Z" fill="${p.farMountain}" />
      <path d="M92 84 L120 124 L102 118 L86 132 L72 114 Z" fill="${p.accent}" />
      <path d="M246 58 L286 116 L262 108 L244 126 L224 106 L206 118 Z" fill="${p.accent}" />
      <path d="M0 228 Q110 172 220 206 T400 190 L400 300 L0 300 Z" fill="${p.midMountain}" />
      <path d="M0 250 Q140 214 275 246 T400 236 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
      <polygon points="154,230 174,214 194,230 194,248 154,248" fill="#8C5E3C" />
      <rect x="169" y="234" width="10" height="10" fill="#FFE6A8" />
    `;
  } else if (scene === 'old-city') {
    detailMarkup = `
      <path d="M0 150 L95 150 L95 245 L0 245 Z" fill="${p.midMountain}" />
      <path d="M292 135 L400 135 L400 245 L292 245 Z" fill="${p.midMountain}" />
      <rect x="158" y="92" width="84" height="156" rx="14" fill="${p.farMountain}" />
      <rect x="152" y="88" width="96" height="12" rx="3" fill="${p.nearTerrain}" />
      <path d="M186 248 L186 196 Q200 180 214 196 L214 248 Z" fill="${p.accent}" />
      <rect x="16" y="170" width="54" height="28" rx="2" fill="${p.accent}" fill-opacity="0.72" />
      <rect x="318" y="160" width="60" height="30" rx="2" fill="${p.accent}" fill-opacity="0.72" />
      <path d="M0 244 L400 244 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
    `;
  } else if (scene === 'waterfall') {
    detailMarkup = `
      <path d="M0 155 Q85 95 162 128 L162 240 L0 240 Z" fill="${p.farMountain}" />
      <path d="M400 140 Q315 88 236 124 L236 240 L400 240 Z" fill="${p.farMountain}" />
      <path d="M160 112 L240 112 L254 244 L146 244 Z" fill="${p.midMountain}" />
      <path d="M182 112 Q186 175 178 242 L222 242 Q216 175 218 112 Z" fill="${p.accent}" fill-opacity="0.9" />
      <path d="M196 112 L204 242" stroke="#FFFFFF" stroke-width="3" stroke-opacity="0.8" />
      <rect x="0" y="236" width="400" height="64" fill="url(#waterGrad)" />
      <ellipse cx="200" cy="244" rx="58" ry="12" fill="#FFFFFF" fill-opacity="0.45" />
      <path d="M0 248 Q68 228 112 270 L132 300 L0 300 Z" fill="${p.nearTerrain}" />
      <path d="M400 246 Q332 230 286 272 L268 300 L400 300 Z" fill="${p.nearTerrain}" />
    `;
  } else if (scene === 'stone-lane') {
    detailMarkup = `
      <path d="M0 164 Q105 92 210 132 T400 112 L400 220 L0 220 Z" fill="${p.farMountain}" />
      <path d="M0 140 L132 168 L132 265 L0 288 Z" fill="${p.midMountain}" />
      <path d="M400 132 L268 168 L268 265 L400 288 Z" fill="${p.midMountain}" />
      <path d="M132 265 L178 188 L222 188 L268 265 L325 300 L75 300 Z" fill="${p.nearTerrain}" />
      <rect x="28" y="182" width="46" height="32" rx="2" fill="${p.accent}" fill-opacity="0.8" />
      <rect x="322" y="178" width="48" height="32" rx="2" fill="${p.accent}" fill-opacity="0.8" />
    `;
  } else if (scene === 'candy-mountains') {
    detailMarkup = `
      <path d="M0 205 L78 116 L154 156 L236 88 L322 148 L400 106 L400 300 L0 300 Z" fill="${p.farMountain}" />
      <path d="M0 222 L82 146 L156 184 L238 122 L326 176 L400 138 L400 156 L326 194 L238 140 L156 202 L82 164 L0 240 Z" fill="${p.accent}" fill-opacity="0.82" />
      <path d="M0 245 L92 178 L175 212 L264 162 L352 210 L400 184 L400 300 L0 300 Z" fill="${p.midMountain}" />
      <path d="M0 264 L96 202 L180 234 L270 186 L356 232 L400 210 L400 224 L356 246 L270 200 L180 248 L96 216 L0 278 Z" fill="${p.accent}" fill-opacity="0.72" />
      <path d="M0 274 Q145 232 285 268 T400 256 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
    `;
  } else if (scene === 'tea-hills') {
    detailMarkup = `
      <path d="M0 175 Q95 108 195 144 T400 128 L400 240 L0 240 Z" fill="${p.farMountain}" />
      <path d="M0 202 Q118 148 232 184 T400 166 L400 300 L0 300 Z" fill="${p.midMountain}" />
      <path d="M0 228 Q125 186 248 214 T400 198" stroke="${p.accent}" stroke-width="5" fill="none" stroke-opacity="0.7" />
      <path d="M0 250 Q135 210 260 238 T400 224" stroke="${p.accent}" stroke-width="5" fill="none" stroke-opacity="0.65" />
      <path d="M0 262 Q130 226 268 256 T400 246 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
    `;
  } else {
    detailMarkup = `
      <rect x="0" y="176" width="400" height="46" fill="url(#waterGrad)" />
      <path d="M0 212 L88 158 L164 182 L248 162 L338 188 L400 166 L400 300 L0 300 Z" fill="${p.midMountain}" />
      <path d="M0 246 Q85 198 172 232 T340 224 L400 238 L400 300 L0 300 Z" fill="${p.nearTerrain}" />
      <path d="M56 238 Q78 206 112 222 Q122 246 86 254 Z" fill="${p.accent}" fill-opacity="0.45" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.skyTop}" />
        <stop offset="100%" stop-color="${p.skyBottom}" />
      </linearGradient>
      <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${p.water ?? p.accent}" />
        <stop offset="100%" stop-color="${p.nearTerrain}" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#skyGrad)" />
    <circle cx="${sunX}" cy="${sunY}" r="26" fill="${p.sun}" fill-opacity="0.88" />
    <circle cx="${sunX}" cy="${sunY}" r="48" fill="${p.sun}" fill-opacity="0.22" />
    ${detailMarkup}
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const BASE_TIME = Date.UTC(2026, 10, 24, 12, 0, 0);
const HOUR = 3_600_000;

export const SAMPLE_PLACES: PlaceSubmission[] = [
  {
    id: 'place-goygol-milli-parki',
    name: 'Göygöl Milli Parkı',
    mainImage: createScenicCover('alpine-lake', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'goygol', districtName: 'Göygöl' },
    filters: {
      regions: ['goygol'],
      places: ['Təbiət'],
      companions: ['Ailə ilə', 'Sevgili ilə', 'Dostlarla'],
      crowdSize: ['Çox'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 1 * HOUR,
  },
  {
    id: 'place-xinaliq-kendi',
    name: 'Xınalıq kəndi',
    mainImage: createScenicCover('mountain-village', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'quba', districtName: 'Quba' },
    filters: {
      regions: ['quba'],
      places: ['Təbiət', 'Macəra', 'Gizli yerlər'],
      companions: ['Dostlarla', 'Tək'],
      crowdSize: ['Az'],
      seasons: ['Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 2 * HOUR,
  },
  {
    id: 'place-seki-xan-sarayi',
    name: 'Şəki Xan Sarayı',
    mainImage: createScenicCover('historic-courtyard', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'seki', districtName: 'Şəki' },
    filters: {
      regions: ['seki'],
      places: ['Yemək', 'Qonaqlama'],
      companions: ['Ailə ilə', 'Sevgili ilə', 'Dostlarla'],
      crowdSize: ['Çox'],
      seasons: ['Yaz', 'Yay', 'Payız', 'Qış'],
    },
    createdAt: BASE_TIME - 3 * HOUR,
  },
  {
    id: 'place-sahdag-kompleksi',
    name: 'Şahdağ Dağ Kurortu',
    mainImage: createScenicCover('snow-peaks', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qusar', districtName: 'Qusar' },
    filters: {
      regions: ['qusar'],
      places: ['Macəra', 'Qonaqlama'],
      companions: ['Dostlarla', 'Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Çox'],
      seasons: ['Qış', 'Yay'],
    },
    createdAt: BASE_TIME - 4 * HOUR,
  },
  {
    id: 'place-iceriseher',
    name: 'İçərişəhər və Qız Qalası',
    mainImage: createScenicCover('old-city', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'baki', districtName: 'Bakı' },
    filters: {
      regions: ['baki'],
      places: ['Yemək', 'Qonaqlama'],
      companions: ['Tək', 'Dostlarla', 'Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Çox'],
      seasons: ['Yaz', 'Yay', 'Payız', 'Qış'],
    },
    createdAt: BASE_TIME - 5 * HOUR,
  },
  {
    id: 'place-yeddi-gozel-selalesi',
    name: 'Yeddi Gözəl şəlaləsi',
    mainImage: createScenicCover('waterfall', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qebele', districtName: 'Qəbələ' },
    filters: {
      regions: ['qebele'],
      places: ['Təbiət', 'Yemək'],
      companions: ['Ailə ilə', 'Dostlarla'],
      crowdSize: ['Çox'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 6 * HOUR,
  },
  {
    id: 'place-lahic-qesebesi',
    name: 'Lahıc tarixi qəsəbəsi',
    mainImage: createScenicCover('stone-lane', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'ismayilli', districtName: 'İsmayıllı' },
    filters: {
      regions: ['ismayilli'],
      places: ['Yemək', 'Gizli yerlər'],
      companions: ['Dostlarla', 'Sevgili ilə', 'Ailə ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 7 * HOUR,
  },
  {
    id: 'place-xizi-altiagac',
    name: 'Altıağac Rəngli Dağlar',
    mainImage: createScenicCover('candy-mountains', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'xizi', districtName: 'Xızı' },
    filters: {
      regions: ['xizi'],
      places: ['Təbiət', 'Macəra'],
      companions: ['Tək', 'Dostlarla', 'Sevgili ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Payız'],
    },
    createdAt: BASE_TIME - 8 * HOUR,
  },
  {
    id: 'place-hirkan-cay-baglari',
    name: 'Hirkan Meşəsi və Çay bağları',
    mainImage: createScenicCover('tea-hills', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'lenkeran', districtName: 'Lənkəran' },
    filters: {
      regions: ['lenkeran'],
      places: ['Təbiət', 'Yemək', 'Qonaqlama'],
      companions: ['Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 9 * HOUR,
  },
  {
    id: 'place-qobustan-qorugu',
    name: 'Qobustan Qayaüstü Qoruğu',
    mainImage: createScenicCover('canyon-sea', 0),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qobustan', districtName: 'Qobustan' },
    filters: {
      regions: ['qobustan'],
      places: ['Macəra', 'Təbiət'],
      companions: ['Tək', 'Dostlarla', 'Ailə ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Payız', 'Qış'],
    },
    createdAt: BASE_TIME - 10 * HOUR,
  },
  {
    id: 'place-nohurgol',
    name: 'Nohurgöl',
    mainImage: createScenicCover('alpine-lake', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qebele', districtName: 'Qəbələ' },
    filters: {
      regions: ['qebele'],
      places: ['Təbiət', 'Yemək', 'Qonaqlama'],
      companions: ['Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Çox'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 11 * HOUR,
  },
  {
    id: 'place-ilisu-kendi',
    name: 'İlisu dağ kəndi',
    mainImage: createScenicCover('mountain-village', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qax', districtName: 'Qax' },
    filters: {
      regions: ['qax'],
      places: ['Təbiət', 'Qonaqlama', 'Gizli yerlər'],
      companions: ['Ailə ilə', 'Dostlarla'],
      crowdSize: ['Az'],
      seasons: ['Yay', 'Payız', 'Qış'],
    },
    createdAt: BASE_TIME - 12 * HOUR,
  },
  {
    id: 'place-susa-cidir-duzu',
    name: 'Cıdır düzü',
    mainImage: createScenicCover('candy-mountains', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'susa', districtName: 'Şuşa' },
    filters: {
      regions: ['susa'],
      places: ['Təbiət', 'Macəra'],
      companions: ['Dostlarla', 'Ailə ilə', 'Tək'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 13 * HOUR,
  },
  {
    id: 'place-tufandag',
    name: 'Tufandağ Kanat Yolu',
    mainImage: createScenicCover('snow-peaks', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'qebele', districtName: 'Qəbələ' },
    filters: {
      regions: ['qebele'],
      places: ['Macəra', 'Qonaqlama'],
      companions: ['Dostlarla', 'Sevgili ilə', 'Ailə ilə'],
      crowdSize: ['Çox'],
      seasons: ['Qış', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 14 * HOUR,
  },
  {
    id: 'place-afurca-selalesi',
    name: 'Afurca şəlaləsi',
    mainImage: createScenicCover('waterfall', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'quba', districtName: 'Quba' },
    filters: {
      regions: ['quba'],
      places: ['Təbiət', 'Gizli yerlər'],
      companions: ['Dostlarla', 'Tək'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay'],
    },
    createdAt: BASE_TIME - 15 * HOUR,
  },
  {
    id: 'place-samaxi-pirqulu',
    name: 'Pirqulu rəsədxanası və meşəsi',
    mainImage: createScenicCover('tea-hills', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'samaxi', districtName: 'Şamaxı' },
    filters: {
      regions: ['samaxi'],
      places: ['Təbiət', 'Qonaqlama'],
      companions: ['Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay', 'Payız', 'Qış'],
    },
    createdAt: BASE_TIME - 16 * HOUR,
  },
  {
    id: 'place-lerik-relax',
    name: 'Lerik dağ terrasları',
    mainImage: createScenicCover('stone-lane', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'lerik', districtName: 'Lerik' },
    filters: {
      regions: ['lerik'],
      places: ['Qonaqlama', 'Yemək', 'Gizli yerlər'],
      companions: ['Ailə ilə', 'Sevgili ilə'],
      crowdSize: ['Az'],
      seasons: ['Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 17 * HOUR,
  },
  {
    id: 'place-besbarmaq-dagi',
    name: 'Beşbarmaq dağı',
    mainImage: createScenicCover('canyon-sea', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'siyezen', districtName: 'Siyəzən' },
    filters: {
      regions: ['siyezen'],
      places: ['Macəra', 'Təbiət'],
      companions: ['Tək', 'Dostlarla'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Payız'],
    },
    createdAt: BASE_TIME - 18 * HOUR,
  },
  {
    id: 'place-ordubad-kohne-seher',
    name: 'Ordubad tarixi məhəllələri',
    mainImage: createScenicCover('historic-courtyard', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'ordubad', districtName: 'Ordubad' },
    filters: {
      regions: ['ordubad'],
      places: ['Yemək', 'Gizli yerlər'],
      companions: ['Tək', 'Ailə ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Payız'],
    },
    createdAt: BASE_TIME - 19 * HOUR,
  },
  {
    id: 'place-batabat-golu',
    name: 'Batabat gölü',
    mainImage: createScenicCover('old-city', 1),
    extraImages: [],
    pin: { x: null, y: null, districtId: 'sahbuz', districtName: 'Şahbuz' },
    filters: {
      regions: ['sahbuz'],
      places: ['Təbiət', 'Gizli yerlər'],
      companions: ['Ailə ilə', 'Dostlarla', 'Sevgili ilə'],
      crowdSize: ['Az'],
      seasons: ['Yaz', 'Yay', 'Payız'],
    },
    createdAt: BASE_TIME - 20 * HOUR,
  },
];
