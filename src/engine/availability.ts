/**
 * Availability engine: computes parkability color for each curb side.
 *
 * Rules:
 *   - User edits override everything (HIGH confidence)
 *   - Join failure -> YELLOW (conservative default)
 *   - Permit zone matched -> YELLOW (opportunistic) or RED (strict)
 *   - Street sweeping risk -> YELLOW or RED (strict)
 *   - Snow route -> YELLOW or RED (snow active)
 *   - No restrictions found with successful join -> GREEN (MED confidence)
 */

import { booleanPointInPolygon, midpoint, point } from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import type {
  AppSettings,
  AvailabilityColor,
  Confidence,
  CurbEdit,
  CurbSide,
  CurbSideCollection,
  CurbSideFeatureProps,
  JoinResult,
  SnowRouteSegment,
  SweepingWardSection,
  CenterlineFeature,
} from '../types';
import type { CurbSideGeometry } from './curb-sides';

interface Rule {
  type: string;
  color: AvailabilityColor;
  reason: string;
}

function getEditColor(category: string): AvailabilityColor {
  switch (category) {
    case 'verified-safe':
      return 'green';
    case 'permit-restricted':
    case 'no-parking':
    case 'no-standing':
    case 'paid-only':
      return 'red';
    case 'street-cleaning':
    case 'time-limited':
    case 'other':
      return 'yellow';
    default:
      return 'yellow';
  }
}

function getMidpointCoords(geometry: LineString): [number, number] {
  const coords = geometry.coordinates;
  const mid = Math.floor(coords.length / 2);
  return coords[mid] as [number, number];
}

function isOnSnowRoute(
  centerline: CenterlineFeature,
  snowRoutes: SnowRouteSegment[]
): boolean {
  const props = centerline.properties;
  return snowRoutes.some(
    (sr) =>
      sr.street_direction === props.PRE_DIR &&
      sr.street_name === props.STREET_NAM &&
      sr.street_type === props.STREET_TYP
  );
}

function isSweepingRisk(
  midCoords: [number, number],
  sweepingSections: SweepingWardSection[],
  now: Date
): boolean {
  const month = now.getMonth() + 1;
  const pt = point(midCoords);

  for (const section of sweepingSections) {
    if (!booleanPointInPolygon(pt, section.polygon)) continue;

    for (const sched of section.schedule) {
      if (month >= sched.month_start && month <= sched.month_end) {
        return true;
      }
    }
  }
  return false;
}

export function computeAvailability(
  curbSides: CurbSideGeometry[],
  joinResults: JoinResult[],
  centerlines: CenterlineFeature[],
  sweepingSections: SweepingWardSection[],
  snowRoutes: SnowRouteSegment[],
  edits: CurbEdit[],
  settings: AppSettings,
  now: Date = new Date()
): CurbSideCollection {
  const joinMap = new Map<string, JoinResult>();
  for (const jr of joinResults) {
    joinMap.set(`${jr.segmentId}-${jr.side}`, jr);
  }

  const editMap = new Map<string, CurbEdit>();
  for (const e of edits) {
    editMap.set(e.id, e);
  }

  const centerlineMap = new Map<number, CenterlineFeature>();
  for (const cl of centerlines) {
    centerlineMap.set(cl.properties.OBJECTID, cl);
  }

  const features = curbSides.map((cs) => {
    const key = `${cs.segmentId}-${cs.side}`;
    const edit = editMap.get(key);
    const jr = joinMap.get(key);
    const cl = centerlineMap.get(cs.segmentId);

    // User edit overrides everything
    if (edit) {
      const color = getEditColor(edit.category);
      const props: CurbSideFeatureProps = {
        segmentId: cs.segmentId,
        side: cs.side,
        streetName: cs.streetName,
        color,
        confidence: 'HIGH',
        reasons: [`User edit: ${edit.category}${edit.note ? ' - ' + edit.note : ''}`],
        permitMatch: jr?.permitMatch ?? 'unmatched',
        hasPermitZone: jr?.permitMatch === 'matched',
        sweepingRisk: false,
        snowRoute: false,
        hasUserEdit: true,
        editCategory: edit.category,
      };
      return {
        type: 'Feature' as const,
        properties: props,
        geometry: cs.geometry,
      };
    }

    // Compute from data layers
    const rules: Rule[] = [];

    // Permit zone
    if (!jr || jr.permitMatch === 'unmatched') {
      rules.push({
        type: 'no-match',
        color: 'yellow',
        reason: 'No data match, check sign',
      });
    } else if (jr.permitMatch === 'matched') {
      if (settings.treatPermitAsRestricted) {
        rules.push({
          type: 'permit',
          color: 'red',
          reason: `Permit zone ${jr.permitZone?.zone ?? ''} - treated as restricted`,
        });
      } else {
        rules.push({
          type: 'permit',
          color: 'yellow',
          reason: `Permit zone ${jr.permitZone?.zone ?? ''} exists, check sign hours`,
        });
      }
    }
    // no-permit: no rule added (potential GREEN)

    // Sweeping
    const midCoords = getMidpointCoords(cs.geometry);
    const sweeping = isSweepingRisk(midCoords, sweepingSections, now);
    if (sweeping) {
      if (settings.strictSweeping) {
        rules.push({
          type: 'sweeping',
          color: 'red',
          reason: 'Street sweeping day - strict mode',
        });
      } else {
        rules.push({
          type: 'sweeping',
          color: 'yellow',
          reason: 'Street sweeping possible, confirm signs',
        });
      }
    }

    // Snow route
    const onSnowRoute = cl ? isOnSnowRoute(cl, snowRoutes) : false;
    if (onSnowRoute) {
      if (settings.snowActiveToday) {
        rules.push({
          type: 'snow',
          color: 'red',
          reason: 'Snow route - restrictions active',
        });
      } else {
        rules.push({
          type: 'snow',
          color: 'yellow',
          reason: 'Snow route, restrictions activate with snow',
        });
      }
    }

    // Determine final color
    let finalColor: AvailabilityColor = 'green';
    if (rules.some((r) => r.color === 'red')) {
      finalColor = 'red';
    } else if (rules.some((r) => r.color === 'yellow')) {
      finalColor = 'yellow';
    }

    // Determine confidence
    let confidence: Confidence = 'LOW';
    if (rules.length === 0 && jr?.permitMatch === 'no-permit') {
      confidence = 'MED';
    } else if (rules.length > 0 && !rules.some((r) => r.type === 'no-match')) {
      confidence = 'MED';
    }

    const props: CurbSideFeatureProps = {
      segmentId: cs.segmentId,
      side: cs.side,
      streetName: cs.streetName,
      color: finalColor,
      confidence,
      reasons: rules.length > 0 ? rules.map((r) => r.reason) : ['No restrictions found'],
      permitMatch: jr?.permitMatch ?? 'unmatched',
      hasPermitZone: jr?.permitMatch === 'matched',
      sweepingRisk: sweeping,
      snowRoute: onSnowRoute,
      hasUserEdit: false,
    };

    return {
      type: 'Feature' as const,
      properties: props,
      geometry: cs.geometry,
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
