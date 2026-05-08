// Approximate UTC offsets (no DST handling). Good enough for the
// "how many overlapping working hours with São Paulo" indicator.

const BRAZIL_OFFSET = -3;
const SP_WORK_START = 9;
const SP_WORK_END = 18;

const REGION_OFFSETS: Record<string, number> = {
  "West Coast": -8,
  "East Coast": -5,
  South: -6,
  Midwest: -6,
  Mountain: -7,
  Hawaii: -10,
  Alaska: -9,
};

const COUNTRY_OFFSETS: Record<string, number> = {
  "United States": -5,
  "United Kingdom": 0,
  Germany: 1,
  France: 1,
  Spain: 1,
  Netherlands: 1,
  Switzerland: 1,
  Sweden: 1,
  Finland: 2,
  Poland: 1,
  "Czech Republic": 1,
  Hungary: 1,
  Bulgaria: 2,
  Romania: 2,
  Canada: -5,
  Australia: 10,
  Singapore: 8,
  Japan: 9,
  Brazil: -3,
  Portugal: 0,
  Ireland: 0,
};

export const getCityOffset = (
  country: string,
  region?: string
): number | null => {
  if (region && REGION_OFFSETS[region] !== undefined) {
    return REGION_OFFSETS[region];
  }
  if (COUNTRY_OFFSETS[country] !== undefined) {
    return COUNTRY_OFFSETS[country];
  }
  return null;
};

export interface WorkingHourOverlap {
  hours: number;
  spStart: number;
  spEnd: number;
  clientStart: number;
  clientEnd: number;
}

export const computeOverlap = (
  clientOffset: number,
  workStart = SP_WORK_START,
  workEnd = SP_WORK_END
): WorkingHourOverlap => {
  const diff = clientOffset - BRAZIL_OFFSET;
  const clientStart = workStart;
  const clientEnd = workEnd;
  const spOpen = workStart - diff;
  const spClose = workEnd - diff;
  const overlapStart = Math.max(clientStart, spOpen);
  const overlapEnd = Math.min(clientEnd, spClose);
  const hours = Math.max(0, overlapEnd - overlapStart);
  return {
    hours,
    spStart: overlapStart + diff,
    spEnd: overlapEnd + diff,
    clientStart: overlapStart,
    clientEnd: overlapEnd,
  };
};
