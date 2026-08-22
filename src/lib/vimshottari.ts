/**
 * VIMSHOTTARI CALCULATION ENGINE — STRICT / DETERMINISTIC
 * Implements the user's procedure EXACTLY:
 *   Palatmak = Ghati * 60 + Pal
 *   Q1,R1 = divmod(BhayatPal * DashaYears, BhabhogPal)
 *   Q2,R2 = divmod(R1 * 12, BhabhogPal)
 *   Q3,R3 = divmod(R2 * 30, BhabhogPal)
 *   Bhukt = Q1 years, Q2 months, Q3 days
 *   Bhogya = (DashaYears,0,0) - Bhukt   [12 months/year, 30 days/month]
 * No decimals, no floating point, no external algorithm.
 */

export type PlanetKey =
  | "Ketu"
  | "Shukra"
  | "Surya"
  | "Chandra"
  | "Mangal"
  | "Rahu"
  | "Guru"
  | "Shani"
  | "Budh";

export interface Planet {
  key: PlanetKey;
  hi: string;
  years: number;
  symbol: string;
}

/** DO NOT CHANGE THIS ORDER */
export const DASHA_SEQUENCE: Planet[] = [
  { key: "Ketu", hi: "केतु", years: 7, symbol: "☋" },
  { key: "Shukra", hi: "शुक्र", years: 20, symbol: "♀" },
  { key: "Surya", hi: "सूर्य", years: 6, symbol: "☉" },
  { key: "Chandra", hi: "चंद्र", years: 10, symbol: "☽" },
  { key: "Mangal", hi: "मंगल", years: 7, symbol: "♂" },
  { key: "Rahu", hi: "राहु", years: 18, symbol: "☊" },
  { key: "Guru", hi: "गुरु", years: 16, symbol: "♃" },
  { key: "Shani", hi: "शनि", years: 19, symbol: "♄" },
  { key: "Budh", hi: "बुध", years: 17, symbol: "☿" },
];

export interface Nakshatra {
  index: number;
  hi: string;
  en: string;
  lord: PlanetKey;
}

export const NAKSHATRAS: Nakshatra[] = [
  { index: 1, hi: "अश्विनी", en: "Ashwini", lord: "Ketu" },
  { index: 2, hi: "भरणी", en: "Bharani", lord: "Shukra" },
  { index: 3, hi: "कृत्तिका", en: "Krittika", lord: "Surya" },
  { index: 4, hi: "रोहिणी", en: "Rohini", lord: "Chandra" },
  { index: 5, hi: "मृगशीर्ष", en: "Mrigashira", lord: "Mangal" },
  { index: 6, hi: "आर्द्रा", en: "Ardra", lord: "Rahu" },
  { index: 7, hi: "पुनर्वसु", en: "Punarvasu", lord: "Guru" },
  { index: 8, hi: "पुष्य", en: "Pushya", lord: "Shani" },
  { index: 9, hi: "आश्लेषा", en: "Ashlesha", lord: "Budh" },
  { index: 10, hi: "मघा", en: "Magha", lord: "Ketu" },
  { index: 11, hi: "पूर्वा फाल्गुनी", en: "Purva Phalguni", lord: "Shukra" },
  { index: 12, hi: "उत्तरा फाल्गुनी", en: "Uttara Phalguni", lord: "Surya" },
  { index: 13, hi: "हस्त", en: "Hasta", lord: "Chandra" },
  { index: 14, hi: "चित्रा", en: "Chitra", lord: "Mangal" },
  { index: 15, hi: "स्वाति", en: "Swati", lord: "Rahu" },
  { index: 16, hi: "विशाखा", en: "Vishakha", lord: "Guru" },
  { index: 17, hi: "अनुराधा", en: "Anuradha", lord: "Shani" },
  { index: 18, hi: "ज्येष्ठा", en: "Jyeshtha", lord: "Budh" },
  { index: 19, hi: "मूल", en: "Mula", lord: "Ketu" },
  { index: 20, hi: "पूर्वाषाढ़ा", en: "Purva Ashadha", lord: "Shukra" },
  { index: 21, hi: "उत्तराषाढ़ा", en: "Uttara Ashadha", lord: "Surya" },
  { index: 22, hi: "श्रवण", en: "Shravana", lord: "Chandra" },
  { index: 23, hi: "धनिष्ठा", en: "Dhanishta", lord: "Mangal" },
  { index: 24, hi: "शतभिषा", en: "Shatabhisha", lord: "Rahu" },
  { index: 25, hi: "पूर्वा भाद्रपद", en: "Purva Bhadrapada", lord: "Guru" },
  { index: 26, hi: "उत्तरा भाद्रपद", en: "Uttara Bhadrapada", lord: "Shani" },
  { index: 27, hi: "रेवती", en: "Revati", lord: "Budh" },
];

export function getPlanet(key: PlanetKey): Planet {
  const p = DASHA_SEQUENCE.find((x) => x.key === key);
  if (!p) throw new Error("Unknown planet: " + key);
  return p;
}

export function palatmak(ghati: number, pal: number): number {
  return ghati * 60 + pal;
}

export interface YMD {
  years: number;
  months: number;
  days: number;
}

export interface BhuktResult {
  bhayatPal: number;
  bhabhogPal: number;
  dashaYears: number;
  product: number; // bhayatPal * dashaYears
  q1: number;
  r1: number;
  r1x12: number;
  q2: number;
  r2: number;
  r2x30: number;
  q3: number;
  r3: number;
  bhukt: YMD;
  bhogya: YMD;
}

/** Integer quotient & remainder (non-negative inputs) */
function divmod(a: number, b: number): { q: number; r: number } {
  const q = Math.floor(a / b);
  return { q, r: a - q * b };
}

export function calculateBhukt(
  bhayatPal: number,
  bhabhogPal: number,
  dashaYears: number,
): BhuktResult {
  if (bhabhogPal <= 0) throw new Error("भभोग पलात्मक मान शून्य नहीं हो सकता");

  const product = bhayatPal * dashaYears;
  const s1 = divmod(product, bhabhogPal);
  const r1x12 = s1.r * 12;
  const s2 = divmod(r1x12, bhabhogPal);
  const r2x30 = s2.r * 30;
  const s3 = divmod(r2x30, bhabhogPal);

  const bhukt: YMD = { years: s1.q, months: s2.q, days: s3.q };
  const bhogya = calculateBhogya(dashaYears, bhukt);

  return {
    bhayatPal,
    bhabhogPal,
    dashaYears,
    product,
    q1: s1.q,
    r1: s1.r,
    r1x12,
    q2: s2.q,
    r2: s2.r,
    r2x30,
    q3: s3.q,
    r3: s3.r,
    bhukt,
    bhogya,
  };
}

/** Bhogya = (dashaYears, 0, 0) - bhukt using 12 months/year, 30 days/month */
export function calculateBhogya(dashaYears: number, bhukt: YMD): YMD {
  let years = dashaYears;
  let months = 0;
  let days = 0;

  days -= bhukt.days;
  months -= bhukt.months;
  years -= bhukt.years;

  while (days < 0) {
    days += 30;
    months -= 1;
  }

  while (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

export function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

export function formatYMD(d: YMD): string {
  return `${pad2(d.years)} वर्ष ${pad2(d.months)} माह ${pad2(d.days)} दिन`;
}

/* ------------------------- DATE HANDLING ------------------------- */

/** Add years, then months (clamped to month end), then calendar days. */
export function addDuration(date: Date, d: YMD): Date {
  const y = date.getFullYear() + d.years;
  const targetMonth = date.getMonth() + d.months;
  const yy = y + Math.floor(targetMonth / 12);
  const mm = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  const day = Math.min(date.getDate(), lastDay);
  const result = new Date(yy, mm, day);
  result.setDate(result.getDate() + d.days);
  return result;
}

const HI_MONTHS = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितम्बर",
  "अक्टूबर",
  "नवम्बर",
  "दिसम्बर",
];

export function formatDate(d: Date): string {
  return `${pad2(d.getDate())} ${HI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function parseDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;

  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
  );

  if (isNaN(d.getTime())) return null;

  return d;
}

export interface TimelineRow {
  planet: Planet;
  durationLabel: string;
  duration: YMD;
  isBhogya: boolean;
  start: Date;
  end: Date;
}

export function calculateDashaTimeline(
  birthDate: Date,
  lord: PlanetKey,
  bhogya: YMD,
  totalPlanets: number,
): TimelineRow[] {
  const startIdx = DASHA_SEQUENCE.findIndex((p) => p.key === lord);
  const rows: TimelineRow[] = [];

  let cursor = birthDate;

  const first = DASHA_SEQUENCE[startIdx];

  let end = addDuration(cursor, bhogya);

  /*
   * ONLY FIX:
   * Bhogya ki samapti date inclusive calculation ke according
   * 1 din aage hogi.
   *
   * Example:
   * 28 अक्टूबर 2018 + 06 वर्ष 02 माह 14 दिन
   * = 12 जनवरी 2025
   *
   * Iske baad next Mahadasha bhi isi 12 जनवरी 2025
   * se start hogi.
   */
  end.setDate(end.getDate() + 1);

  rows.push({
    planet: first,
    durationLabel: `भोग्य — ${formatYMD(bhogya)}`,
    duration: bhogya,
    isBhogya: true,
    start: cursor,
    end,
  });

  cursor = end;

  for (let i = 1; i <= totalPlanets; i++) {
    const p = DASHA_SEQUENCE[(startIdx + i) % 9];

    const dur: YMD = {
      years: p.years,
      months: 0,
      days: 0,
    };

    end = addDuration(cursor, dur);

    rows.push({
      planet: p,
      durationLabel: `${p.years} वर्ष`,
      duration: dur,
      isBhogya: false,
      start: cursor,
      end,
    });

    cursor = end;
  }

  return rows;
}