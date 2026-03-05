/**
 * Join permit-zone records to centerline segments.
 *
 * The join normalizes street names, checks address range overlap,
 * and uses ODD_EVEN + centerline left/right address ranges to determine
 * which physical side is affected.
 *
 * Three outcomes per curb side:
 *   - 'matched'   → a permit zone covers this address range + side (YELLOW)
 *   - 'no-permit' → street name found, but no zone for this block (GREEN)
 *   - 'unmatched' → street name could not be resolved at all (BLUE)
 */

import type {
  CenterlineFeature,
  PermitZoneRecord,
  JoinResult,
  CurbSide,
} from '../types';

/** Canonical street type abbreviations */
const TYPE_ALIASES: Record<string, string> = {
  AVENUE: 'AVE',
  STREET: 'ST',
  BOULEVARD: 'BLVD',
  DRIVE: 'DR',
  PLACE: 'PL',
  COURT: 'CT',
  ROAD: 'RD',
  HIGHWAY: 'HWY',
  PARKWAY: 'PKWY',
  LANE: 'LN',
  TERRACE: 'TER',
  CIRCLE: 'CIR',
  EXPRESSWAY: 'EXPY',
};

function normalizeToken(s: string): string {
  return s.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
}

function normalizeType(typ: string): string {
  const t = normalizeToken(typ);
  return TYPE_ALIASES[t] ?? t;
}

const DIRECTIONS = new Set(['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW']);

function stripDirection(name: string): string {
  const parts = name.split(' ');
  if (parts.length > 1 && DIRECTIONS.has(parts[0])) {
    return parts.slice(1).join(' ');
  }
  return name;
}

function rangesOverlap(
  aFrom: number, aTo: number,
  bFrom: number, bTo: number
): boolean {
  const aMin = Math.min(aFrom, aTo);
  const aMax = Math.max(aFrom, aTo);
  const bMin = Math.min(bFrom, bTo);
  const bMax = Math.max(bFrom, bTo);
  return aMin <= bMax && bMin <= aMax;
}

/**
 * Determine which physical side (left/right of centerline direction)
 * carries odd vs even addresses, using the centerline's address range fields.
 */
function getSideForParity(
  props: CenterlineFeature['properties'],
  oddEven: 'ODD' | 'EVEN' | 'BOTH'
): CurbSide[] {
  if (oddEven === 'BOTH') return ['left', 'right'];

  const leftAvg = (props.L_F_ADD + props.L_T_ADD) / 2;
  const leftIsOdd = leftAvg % 2 !== 0;

  if (oddEven === 'ODD') {
    return leftIsOdd ? ['left'] : ['right'];
  }
  // EVEN
  return leftIsOdd ? ['right'] : ['left'];
}

/** Build a lookup key from street name + type (normalized, no direction) */
function makeKey(name: string, typ: string): string {
  return `${normalizeToken(name)}|${normalizeType(typ)}`;
}

/** Build a lookup key with direction */
function makeDirKey(dir: string, name: string, typ: string): string {
  return `${normalizeToken(dir)}|${normalizeToken(name)}|${normalizeType(typ)}`;
}

export function joinPermitZones(
  centerlines: CenterlineFeature[],
  permitZones: PermitZoneRecord[]
): JoinResult[] {
  const results: JoinResult[] = [];

  // Build permit zone indexes for fast lookup
  // Index by dir+name+type (exact) and by name+type (no direction)
  const byDirNameType = new Map<string, PermitZoneRecord[]>();
  const byNameType = new Map<string, PermitZoneRecord[]>();

  for (const pz of permitZones) {
    const dk = makeDirKey(pz.street_direction, pz.street_name, pz.street_type);
    if (!byDirNameType.has(dk)) byDirNameType.set(dk, []);
    byDirNameType.get(dk)!.push(pz);

    const nk = makeKey(pz.street_name, pz.street_type);
    if (!byNameType.has(nk)) byNameType.set(nk, []);
    byNameType.get(nk)!.push(pz);
  }

  // Track stats
  let matched = 0;
  let noPermit = 0;
  let unmatched = 0;

  for (const feature of centerlines) {
    const props = feature.properties;
    const segId = props.OBJECTID;
    const clDir = normalizeToken(props.PRE_DIR);
    const clName = normalizeToken(props.STREET_NAM);
    const clType = normalizeType(props.STREET_TYP);

    // Try exact match first (dir + name + type), then name + type only
    const dk = `${clDir}|${clName}|${clType}`;
    const nk = `${clName}|${clType}`;
    let nameMatches = byDirNameType.get(dk);

    if (!nameMatches || nameMatches.length === 0) {
      // Try without direction
      nameMatches = byNameType.get(nk);
    }

    if (!nameMatches || nameMatches.length === 0) {
      // Also try stripping direction from the street name itself
      // (e.g., centerline has "N MILWAUKEE" as street_nam)
      const strippedName = stripDirection(clName);
      if (strippedName !== clName) {
        const altNk = `${strippedName}|${clType}`;
        nameMatches = byNameType.get(altNk);
      }
    }

    if (!nameMatches || nameMatches.length === 0) {
      // No permit zone records for this street at all.
      // This is expected for streets that simply have no permit zones
      // (arterials, expressways, small residential streets, etc.)
      // Treat as no-permit (GREEN) — not a join failure.
      const log = `Segment ${segId} (${clDir} ${clName} ${clType}): No permit zone records for this street. Treating as no-permit.`;
      noPermit++;
      results.push({ segmentId: segId, side: 'left', permitMatch: 'no-permit', matchLog: log });
      results.push({ segmentId: segId, side: 'right', permitMatch: 'no-permit', matchLog: log });
      continue;
    }

    // Check for address range overlap
    const leftFrom = Math.min(props.L_F_ADD, props.L_T_ADD);
    const leftTo = Math.max(props.L_F_ADD, props.L_T_ADD);
    const rightFrom = Math.min(props.R_F_ADD, props.R_T_ADD);
    const rightTo = Math.max(props.R_F_ADD, props.R_T_ADD);
    const segFrom = Math.min(leftFrom, rightFrom);
    const segTo = Math.max(leftTo, rightTo);

    const rangeMatches = nameMatches.filter((pz) =>
      rangesOverlap(segFrom, segTo, pz.from_address, pz.to_address)
    );

    if (rangeMatches.length === 0) {
      // Name matched but no address range overlap -- no permit for this block
      const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Street has permit zones elsewhere, but not on this block.`;
      noPermit++;
      results.push({ segmentId: segId, side: 'left', permitMatch: 'no-permit', matchLog: log });
      results.push({ segmentId: segId, side: 'right', permitMatch: 'no-permit', matchLog: log });
      continue;
    }

    // We have matches -- determine which sides are affected
    const affectedSides = new Set<CurbSide>();
    let matchedZone: PermitZoneRecord | undefined;

    for (const pz of rangeMatches) {
      const sides = getSideForParity(props, pz.odd_even);
      for (const s of sides) affectedSides.add(s);
      matchedZone = pz;
    }

    for (const side of ['left', 'right'] as CurbSide[]) {
      if (affectedSides.has(side)) {
        matched++;
        const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Permit zone ${matchedZone!.zone} matched on ${side} side.`;
        results.push({
          segmentId: segId,
          side,
          permitMatch: 'matched',
          permitZone: matchedZone,
          matchLog: log,
        });
      } else {
        noPermit++;
        const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Permit zone exists but does not affect ${side} side.`;
        results.push({
          segmentId: segId,
          side,
          permitMatch: 'no-permit',
          matchLog: log,
        });
      }
    }
  }

  const total = centerlines.length;
  console.log(`[JOIN] Results: ${total} segments → ${matched} permit-matched sides, ${noPermit} no-permit sides, ${unmatched} unmatched sides`);

  return results;
}
