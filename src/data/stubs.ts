/**
 * STUB DATA -- replace with live Chicago Data Portal API calls.
 *
 * Focused on the Jefferson Park area north of the Kennedy Expressway,
 * south of W Foster Ave, between N Long Ave and N Lovejoy Ave.
 *
 * Geocoded coordinates from OpenStreetMap Nominatim:
 *   N Long Ave    ~ lon -87.7630
 *   N Lotus Ave   ~ lon -87.7640
 *   N Lovejoy Ave ~ lon -87.7647
 *   W Carmen Ave  ~ lat 41.9735
 *   W Winona St   ~ lat 41.9744
 *
 * Segments:
 *   1. Carmen Ave, Long to Lotus       — GREEN (no permit, successful join)
 *   2. Carmen Ave, Lotus to Lovejoy    — YELLOW (permit zone match)
 *   3. Winona St, Long to Lotus        — GREEN (no permit, successful join)
 *   4. Winona St, Lotus to Lovejoy     — RED (known no-parking restriction)
 *   5. Long Ave, Carmen to Winona      — YELLOW (no data match / join failure)
 */

import type {
  CenterlineCollection,
  PermitZoneRecord,
  SweepingWardSection,
  SnowRouteSegment,
} from '../types';

// ---- Street Center Lines ----

export const stubCenterlines: CenterlineCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. W Carmen Ave — N Long Ave to N Lotus Ave (GREEN)
    {
      type: 'Feature',
      properties: {
        OBJECTID: 1,
        PRE_DIR: 'W',
        STREET_NAM: 'CARMEN',
        STREET_TYP: 'AVE',
        L_F_ADD: 5300,
        L_T_ADD: 5398,
        R_F_ADD: 5301,
        R_T_ADD: 5399,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7630, 41.9735],
          [-87.7635, 41.9735],
          [-87.7640, 41.9735],
        ],
      },
    },
    // 2. W Carmen Ave — N Lotus Ave to N Lovejoy Ave (YELLOW via permit zone)
    {
      type: 'Feature',
      properties: {
        OBJECTID: 2,
        PRE_DIR: 'W',
        STREET_NAM: 'CARMEN',
        STREET_TYP: 'AVE',
        L_F_ADD: 5400,
        L_T_ADD: 5448,
        R_F_ADD: 5401,
        R_T_ADD: 5449,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7640, 41.9735],
          [-87.7644, 41.9735],
          [-87.7647, 41.9735],
        ],
      },
    },
    // 3. W Winona St — N Long Ave to N Lotus Ave (GREEN)
    {
      type: 'Feature',
      properties: {
        OBJECTID: 3,
        PRE_DIR: 'W',
        STREET_NAM: 'WINONA',
        STREET_TYP: 'ST',
        L_F_ADD: 5300,
        L_T_ADD: 5398,
        R_F_ADD: 5301,
        R_T_ADD: 5399,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7630, 41.9744],
          [-87.7635, 41.9744],
          [-87.7640, 41.9744],
        ],
      },
    },
    // 4. W Winona St — N Lotus Ave to N Lovejoy Ave (RED via known restriction)
    {
      type: 'Feature',
      properties: {
        OBJECTID: 4,
        PRE_DIR: 'W',
        STREET_NAM: 'WINONA',
        STREET_TYP: 'ST',
        L_F_ADD: 5400,
        L_T_ADD: 5448,
        R_F_ADD: 5401,
        R_T_ADD: 5449,
        known_restriction: 'no-parking',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7640, 41.9744],
          [-87.7644, 41.9744],
          [-87.7647, 41.9744],
        ],
      },
    },
    // 5. N Long Ave — W Carmen Ave to W Winona St (YELLOW via join failure)
    {
      type: 'Feature',
      properties: {
        OBJECTID: 5,
        PRE_DIR: 'N',
        STREET_NAM: 'LONG',
        STREET_TYP: 'AVE',
        L_F_ADD: 5100,
        L_T_ADD: 5148,
        R_F_ADD: 5101,
        R_T_ADD: 5149,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7630, 41.9735],
          [-87.7630, 41.9740],
          [-87.7630, 41.9744],
        ],
      },
    },
  ],
};

// ---- Parking Permit Zones (STUB) ----
// Covers a sample of real streets in the bounding box.
// Streets not listed here will fail the join → YELLOW (conservative default).

export const stubPermitZones: PermitZoneRecord[] = [
  // Fallback stubs — only used if live API fails
  {
    zone: '101',
    street_direction: 'W',
    street_name: 'CARMEN',
    street_type: 'AVE',
    from_address: 5300,
    to_address: 5358,
    odd_even: 'EVEN',
    ward: '45',
  },
  {
    zone: '101',
    street_direction: 'W',
    street_name: 'CARMEN',
    street_type: 'AVE',
    from_address: 5301,
    to_address: 5357,
    odd_even: 'ODD',
    ward: '45',
  },
];

// ---- Street Sweeping (empty for this focused area) ----

export const stubSweepingWardSections: SweepingWardSection[] = [];

// ---- Snow Routes (empty for this focused area) ----

export const stubSnowRoutes: SnowRouteSegment[] = [];
