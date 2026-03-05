/**
 * Data fetcher — live Chicago Data Portal API for centerlines and
 * permit zones; stub data for sweeping / snow routes.
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

// Streets known to have metered parking in the Jefferson Park area.
// Chicago's meter data is managed by a private company and is not on the
// open data portal, so we tag these arterials/collectors explicitly.
const METERED_STREETS = new Set(['MILWAUKEE', 'FOSTER', 'CENTRAL', 'LAWRENCE']);

/** Socrata resource ID for Street Center Lines */
const CENTERLINES_RESOURCE = 'pr57-gg9e';

/** Socrata resource ID for Parking Permit Zones */
const PERMIT_ZONES_RESOURCE = 'u9xt-hiju';

export async function fetchCenterlines(): Promise<CenterlineCollection> {
  try {
    const where = `within_box(the_geom,${BOUNDS.south},${BOUNDS.west},${BOUNDS.north},${BOUNDS.east})`;
    const url = `https://data.cityofchicago.org/resource/${CENTERLINES_RESOURCE}.json?$limit=500&$where=${encodeURIComponent(where)}`;

    console.log('[DATA] Fetching centerlines from Chicago Data Portal…');
    console.log('[DATA] URL:', url);
    const resp = await fetch(url);
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${body}`);
    }
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

      // Tag known metered streets (arterials/collectors class 2-3)
      const streetClass = String(row.class ?? '');
      const isMetered = METERED_STREETS.has(streetNam) && (streetClass === '2' || streetClass === '3');

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
          ...(isMetered ? { known_restriction: 'metered' as const } : {}),
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
    console.error('[DATA] Failed to fetch centerlines, falling back to stub data.');
    console.error('[DATA] Error details:', err instanceof Error ? err.message : err);
    console.error('[DATA] This may be a CORS or network issue. Full error:', err);
    return stubCenterlines;
  }
}

/** Map API odd_even values (O/E/B) to our normalized form */
function normalizeOddEven(val: string): 'ODD' | 'EVEN' | 'BOTH' {
  switch (val?.toUpperCase()) {
    case 'O': return 'ODD';
    case 'E': return 'EVEN';
    case 'B': return 'BOTH';
    default: return 'BOTH';
  }
}

export async function fetchPermitZones(): Promise<PermitZoneRecord[]> {
  try {
    // Fetch all active permit zones in ward 45 (Jefferson Park) with address
    // ranges that overlap our bounding box area (roughly 5000–5700 W)
    const where = `status='ACTIVE' AND ward_low=45 AND address_range_low>=5000 AND address_range_low<=5700`;
    const url = `https://data.cityofchicago.org/resource/${PERMIT_ZONES_RESOURCE}.json?$limit=500&$where=${encodeURIComponent(where)}`;

    console.log('[DATA] Fetching permit zones from Chicago Data Portal…');
    console.log('[DATA] URL:', url);
    const resp = await fetch(url);
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status}: ${body}`);
    }
    const rows: Record<string, unknown>[] = await resp.json();
    console.log(`[DATA] Received ${rows.length} permit zone records`);

    const records: PermitZoneRecord[] = rows.map((row) => ({
      zone: String(row.zone ?? ''),
      street_direction: String(row.street_direction ?? ''),
      street_name: String(row.street_name ?? ''),
      street_type: String(row.street_type ?? ''),
      from_address: parseInt(String(row.address_range_low ?? '0'), 10),
      to_address: parseInt(String(row.address_range_high ?? '0'), 10),
      odd_even: normalizeOddEven(String(row.odd_even ?? '')),
      ward: String(row.ward_low ?? ''),
    }));

    return records;
  } catch (err) {
    console.error('[DATA] Failed to fetch permit zones, falling back to stub data.');
    console.error('[DATA] Error details:', err instanceof Error ? err.message : err);
    return stubPermitZones;
  }
}

export async function fetchSweepingData(): Promise<SweepingWardSection[]> {
  console.warn(STUB_BANNER);
  return stubSweepingWardSections;
}

export async function fetchSnowRoutes(): Promise<SnowRouteSegment[]> {
  console.warn(STUB_BANNER);
  return stubSnowRoutes;
}
