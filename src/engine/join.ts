/**
 * Join permit-zone records to centerline segments.
 *
 * The join normalizes street names, checks address range overlap,
 * and uses ODD_EVEN + centerline left/right address ranges to determine
 * which physical side is affected.
 *
 * CRITICAL: If a segment cannot be confidently matched, it defaults to
 * YELLOW ("No data match, check sign") rather than GREEN.
 */

import type {
  CenterlineFeature,
  PermitZoneRecord,
  JoinResult,
  CurbSide,
} from '../types';

function normalizeStreetName(name: string): string {
  return name
    .toUpperCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

  // Determine which side has odd addresses
  const leftAvg = (props.L_F_ADD + props.L_T_ADD) / 2;
  const rightAvg = (props.R_F_ADD + props.R_T_ADD) / 2;
  const leftIsOdd = leftAvg % 2 !== 0;

  if (oddEven === 'ODD') {
    return leftIsOdd ? ['left'] : ['right'];
  }
  // EVEN
  return leftIsOdd ? ['right'] : ['left'];
}

export function joinPermitZones(
  centerlines: CenterlineFeature[],
  permitZones: PermitZoneRecord[]
): JoinResult[] {
  const results: JoinResult[] = [];

  for (const feature of centerlines) {
    const props = feature.properties;
    const segId = props.OBJECTID;
    const clDir = normalizeStreetName(props.PRE_DIR);
    const clName = normalizeStreetName(props.STREET_NAM);
    const clType = normalizeStreetName(props.STREET_TYP);

    // Find all permit zone records that match this centerline by name
    const nameMatches = permitZones.filter((pz) => {
      const pzDir = normalizeStreetName(pz.street_direction);
      const pzName = normalizeStreetName(pz.street_name);
      const pzType = normalizeStreetName(pz.street_type);
      return pzDir === clDir && pzName === clName && pzType === clType;
    });

    if (nameMatches.length === 0) {
      // No name match at all -- join failure
      const log = `Segment ${segId} (${clDir} ${clName} ${clType}): No permit zone records found with matching name. Defaulting to YELLOW.`;
      console.warn('[JOIN]', log);
      results.push({ segmentId: segId, side: 'left', permitMatch: 'unmatched', matchLog: log });
      results.push({ segmentId: segId, side: 'right', permitMatch: 'unmatched', matchLog: log });
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
      const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Name matched but no address range overlap in permit data. Treating as no-permit.`;
      console.info('[JOIN]', log);
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
        const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Permit zone ${matchedZone!.zone} matched on ${side} side.`;
        console.info('[JOIN]', log);
        results.push({
          segmentId: segId,
          side,
          permitMatch: 'matched',
          permitZone: matchedZone,
          matchLog: log,
        });
      } else {
        const log = `Segment ${segId} (${clDir} ${clName} ${clType} ${segFrom}-${segTo}): Permit zone exists but does not affect ${side} side.`;
        console.info('[JOIN]', log);
        results.push({
          segmentId: segId,
          side,
          permitMatch: 'no-permit',
          matchLog: log,
        });
      }
    }
  }

  return results;
}
