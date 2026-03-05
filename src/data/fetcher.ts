/**
 * Data fetcher — live Chicago Data Portal API for centerlines,
 * stub data for permit zones / sweeping / snow routes.
 */

import type {
  CenterlineCollection,
  CenterlineFeature,
  PermitZoneRecord,
  SweepingWardSection,
  SnowRouteSegment,
} from '../types';
import { BOUNDS } from '../config';
import {
  stubCenterlines,
  stubPermitZones,
  stubSweepingWardSections,
  stubSnowRoutes,
} from './stubs';

const STUB_BANNER = '[STUB DATA] Using offline stub data for this layer.';

// Streets to exclude (expressways, ramps — can't park on these)
const EXCLUDED_STREETS = new Set(['KENNEDY EXPY', 'KENNEDY CENTRAL AV XR', 'KENNEDY LAWRENCE AV XR']);

/** Socrata resource ID for Street Center Lines (the underlying data table) */
const CENTERLINES_RESOURCE = 'pr57-gg9e';

export async function fetchCenterlines(): Promise<CenterlineCollection> {
  try {
    const where = `within_box(the_geom,${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east})`;
    const url = `https://data.cityofchicago.org/resource/${CENTERLINES_RESOURCE}.json?$limit=500&$where=${encodeURIComponent(where)}`;

    console.log('[DATA] Fetching centerlines from Chicago Data Portal...');
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const rows: Record<string, unknown>[] = await resp.json();
    console.log(`[DATA] Received ${rows.length} centerline records`);

    const features: CenterlineFeature[] = [];
    let skipped = 0;

    for (const row of rows) {
      const streetNam = String(row.street_nam ?? '');
      const preDir = String(row.pre_dir ?? '');
      const streetTyp = String(row.street_typ ?? '');
      const fullName = `${streetNam} ${streetTyp}`.trim();

      // Skip expressways and ramps
      if (EXCLUDED_STREETS.has(fullName) || EXCLUDED_STREETS.has(`${preDir} ${fullName}`.trim())) {
        skipped++;
        continue;
      }

      // Parse geometry — API returns MultiLineString, we need LineString
      const geom = row.the_geom as { type: string; coordinates: number[][][] } | undefined;
      if (!geom || !geom.coordinates || geom.coordinates.length === 0) {
        skipped++;
        continue;
      }
      // Take the first line from the MultiLineString
      const coords = geom.coordinates[0];
      if (!coords || coords.length < 2) {
        skipped++;
        continue;
      }

      features.push({
        type: 'Feature',
        properties: {
          OBJECTID: parseInt(String(row.objectid ?? '0'), 10),
          PRE_DIR: preDir,
          STREET_NAM: streetNam,
          STREET_TYP: streetTyp,
          L_F_ADD: parseInt(String(row.l_f_add ?? '0'), 10),
          L_T_ADD: parseInt(String(row.l_t_add ?? '0'), 10),
          R_F_ADD: parseInt(String(row.r_f_add ?? '0'), 10),
          R_T_ADD: parseInt(String(row.r_t_add ?? '0'), 10),
        },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      });
    }

    console.log(`[DATA] Converted ${features.length} centerline features (skipped ${skipped})`);

    return { type: 'FeatureCollection', features };
  } catch (err) {
    console.error('[DATA] Failed to fetch centerlines, falling back to stub data:', err);
    return stubCenterlines;
  }
}

export async function fetchPermitZones(): Promise<PermitZoneRecord[]> {
  console.warn(STUB_BANNER);
  return stubPermitZones;
}

export async function fetchSweepingData(): Promise<SweepingWardSection[]> {
  console.warn(STUB_BANNER);
  return stubSweepingWardSections;
}

export async function fetchSnowRoutes(): Promise<SnowRouteSegment[]> {
  console.warn(STUB_BANNER);
  return stubSnowRoutes;
}
