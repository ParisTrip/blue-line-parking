/**
 * Data fetcher -- currently returns stub data.
 * Replace each function body with real Chicago Data Portal (Socrata) API calls.
 *
 * STUB DATA -- replace with live fetch
 */

import type {
  CenterlineCollection,
  PermitZoneRecord,
  SweepingWardSection,
  SnowRouteSegment,
} from '../types';
import {
  stubCenterlines,
  stubPermitZones,
  stubSweepingWardSections,
  stubSnowRoutes,
} from './stubs';

const STUB_BANNER = '[STUB DATA] Using offline stub data. Replace with live Chicago Data Portal fetch.';

export async function fetchCenterlines(): Promise<CenterlineCollection> {
  console.warn(STUB_BANNER);
  // Real implementation would fetch from:
  // https://data.cityofchicago.org/resource/6imu-meau.geojson?$where=...
  // filtered to bounding box
  return stubCenterlines;
}

export async function fetchPermitZones(): Promise<PermitZoneRecord[]> {
  console.warn(STUB_BANNER);
  // Real implementation would fetch from:
  // https://data.cityofchicago.org/resource/...
  return stubPermitZones;
}

export async function fetchSweepingData(): Promise<SweepingWardSection[]> {
  console.warn(STUB_BANNER);
  // Real implementation would fetch sweeping zones + schedule + ward section map
  return stubSweepingWardSections;
}

export async function fetchSnowRoutes(): Promise<SnowRouteSegment[]> {
  console.warn(STUB_BANNER);
  // Real implementation would fetch from:
  // https://data.cityofchicago.org/resource/...
  return stubSnowRoutes;
}
