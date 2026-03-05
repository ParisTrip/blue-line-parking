/**
 * STUB DATA -- replace with live Chicago Data Portal API calls.
 *
 * This stub provides structurally identical data to what the real APIs return,
 * covering the Jefferson Park bounding box. It includes:
 *   - GREEN segments (successful join, no restrictions)
 *   - YELLOW segments (failed join / partial match)
 *   - RED segments (known hard restriction)
 *   - Permit zone matches and failed matches
 *   - Street sweeping ward section
 *   - Snow route segments
 */

import type {
  CenterlineCollection,
  PermitZoneRecord,
  SweepingWardSection,
  SnowRouteSegment,
} from '../types';

// ---- Street Center Lines (subset within bounding box) ----

export const stubCenterlines: CenterlineCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        OBJECTID: 1,
        PRE_DIR: 'N',
        STREET_NAM: 'MILWAUKEE',
        STREET_TYP: 'AVE',
        L_F_ADD: 4900,
        L_T_ADD: 4998,
        R_F_ADD: 4901,
        R_T_ADD: 4999,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7600, 41.9695],
          [-87.7618, 41.9708],
          [-87.7635, 41.9720],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 2,
        PRE_DIR: 'N',
        STREET_NAM: 'MILWAUKEE',
        STREET_TYP: 'AVE',
        L_F_ADD: 5000,
        L_T_ADD: 5098,
        R_F_ADD: 5001,
        R_T_ADD: 5099,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7635, 41.9720],
          [-87.7652, 41.9732],
          [-87.7668, 41.9745],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 3,
        PRE_DIR: 'W',
        STREET_NAM: 'LAWRENCE',
        STREET_TYP: 'AVE',
        L_F_ADD: 4700,
        L_T_ADD: 4798,
        R_F_ADD: 4701,
        R_T_ADD: 4799,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7660, 41.9685],
          [-87.7690, 41.9685],
          [-87.7720, 41.9685],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 4,
        PRE_DIR: 'W',
        STREET_NAM: 'LAWRENCE',
        STREET_TYP: 'AVE',
        L_F_ADD: 4800,
        L_T_ADD: 4898,
        R_F_ADD: 4801,
        R_T_ADD: 4899,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7720, 41.9685],
          [-87.7745, 41.9685],
          [-87.7760, 41.9685],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 5,
        PRE_DIR: 'N',
        STREET_NAM: 'LONG',
        STREET_TYP: 'AVE',
        L_F_ADD: 4900,
        L_T_ADD: 4998,
        R_F_ADD: 4901,
        R_T_ADD: 4999,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7720, 41.9688],
          [-87.7720, 41.9705],
          [-87.7720, 41.9720],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 6,
        PRE_DIR: 'N',
        STREET_NAM: 'LONG',
        STREET_TYP: 'AVE',
        L_F_ADD: 5000,
        L_T_ADD: 5098,
        R_F_ADD: 5001,
        R_T_ADD: 5099,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7720, 41.9720],
          [-87.7720, 41.9738],
          [-87.7720, 41.9755],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 7,
        PRE_DIR: 'N',
        STREET_NAM: 'LOTUS',
        STREET_TYP: 'AVE',
        L_F_ADD: 4900,
        L_T_ADD: 4998,
        R_F_ADD: 4901,
        R_T_ADD: 4999,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7700, 41.9688],
          [-87.7700, 41.9705],
          [-87.7700, 41.9720],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 8,
        PRE_DIR: 'N',
        STREET_NAM: 'LOTUS',
        STREET_TYP: 'AVE',
        L_F_ADD: 5000,
        L_T_ADD: 5098,
        R_F_ADD: 5001,
        R_T_ADD: 5099,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7700, 41.9720],
          [-87.7700, 41.9738],
          [-87.7700, 41.9755],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 9,
        PRE_DIR: 'W',
        STREET_NAM: 'AINSLIE',
        STREET_TYP: 'ST',
        L_F_ADD: 4700,
        L_T_ADD: 4798,
        R_F_ADD: 4701,
        R_T_ADD: 4799,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7660, 41.9730],
          [-87.7690, 41.9730],
          [-87.7720, 41.9730],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 10,
        PRE_DIR: 'W',
        STREET_NAM: 'AINSLIE',
        STREET_TYP: 'ST',
        L_F_ADD: 4800,
        L_T_ADD: 4898,
        R_F_ADD: 4801,
        R_T_ADD: 4899,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7720, 41.9730],
          [-87.7745, 41.9730],
          [-87.7760, 41.9730],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 11,
        PRE_DIR: 'N',
        STREET_NAM: 'LARAMIE',
        STREET_TYP: 'AVE',
        L_F_ADD: 4900,
        L_T_ADD: 4998,
        R_F_ADD: 4901,
        R_T_ADD: 4999,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7740, 41.9688],
          [-87.7740, 41.9705],
          [-87.7740, 41.9720],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 12,
        PRE_DIR: 'N',
        STREET_NAM: 'LARAMIE',
        STREET_TYP: 'AVE',
        L_F_ADD: 5000,
        L_T_ADD: 5098,
        R_F_ADD: 5001,
        R_T_ADD: 5099,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7740, 41.9720],
          [-87.7740, 41.9738],
          [-87.7740, 41.9755],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 13,
        PRE_DIR: 'W',
        STREET_NAM: 'GALE',
        STREET_TYP: 'ST',
        L_F_ADD: 4700,
        L_T_ADD: 4798,
        R_F_ADD: 4701,
        R_T_ADD: 4799,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7660, 41.9710],
          [-87.7690, 41.9710],
          [-87.7720, 41.9710],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 14,
        PRE_DIR: 'N',
        STREET_NAM: 'LOCKWOOD',
        STREET_TYP: 'AVE',
        L_F_ADD: 4900,
        L_T_ADD: 4998,
        R_F_ADD: 4901,
        R_T_ADD: 4999,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7680, 41.9688],
          [-87.7680, 41.9705],
          [-87.7680, 41.9720],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        OBJECTID: 15,
        PRE_DIR: 'W',
        STREET_NAM: 'ARGYLE',
        STREET_TYP: 'ST',
        L_F_ADD: 4700,
        L_T_ADD: 4798,
        R_F_ADD: 4701,
        R_T_ADD: 4799,
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-87.7660, 41.9740],
          [-87.7690, 41.9740],
          [-87.7720, 41.9740],
        ],
      },
    },
  ],
};

// ---- Parking Permit Zones ----
// Includes one intentional name mismatch ("AINSLE" vs "AINSLIE") and
// one range mismatch (LONG 5100-5199 doesn't overlap any centerline).

export const stubPermitZones: PermitZoneRecord[] = [
  {
    ward_section: '45-1',
    street_direction: 'N',
    street_name: 'MILWAUKEE',
    street_type: 'AVE',
    from_address: 4900,
    to_address: 4999,
    odd_even: 'ODD',
    zone: '383',
  },
  {
    // Intentional typo: "AINSLE" instead of "AINSLIE" -- tests name mismatch fallback
    ward_section: '45-1',
    street_direction: 'W',
    street_name: 'AINSLE',
    street_type: 'ST',
    from_address: 4700,
    to_address: 4799,
    odd_even: 'EVEN',
    zone: '383',
  },
  {
    // Range mismatch: no centerline segment has addresses 5100-5199 for LONG
    ward_section: '45-1',
    street_direction: 'N',
    street_name: 'LONG',
    street_type: 'AVE',
    from_address: 5100,
    to_address: 5199,
    odd_even: 'ODD',
    zone: '383',
  },
  {
    ward_section: '45-1',
    street_direction: 'N',
    street_name: 'LARAMIE',
    street_type: 'AVE',
    from_address: 4900,
    to_address: 4999,
    odd_even: 'ODD',
    zone: '383',
  },
  {
    ward_section: '45-1',
    street_direction: 'W',
    street_name: 'GALE',
    street_type: 'ST',
    from_address: 4700,
    to_address: 4799,
    odd_even: 'BOTH',
    zone: '383',
  },
  {
    // Lotus has a record but for a non-overlapping range, so Lotus 4900-4999 is GREEN
    ward_section: '45-1',
    street_direction: 'N',
    street_name: 'LOTUS',
    street_type: 'AVE',
    from_address: 5200,
    to_address: 5299,
    odd_even: 'ODD',
    zone: '383',
  },
  {
    ward_section: '45-1',
    street_direction: 'N',
    street_name: 'LOCKWOOD',
    street_type: 'AVE',
    from_address: 4900,
    to_address: 4999,
    odd_even: 'EVEN',
    zone: '383',
  },
  {
    ward_section: '45-1',
    street_direction: 'W',
    street_name: 'LAWRENCE',
    street_type: 'AVE',
    from_address: 4700,
    to_address: 4799,
    odd_even: 'EVEN',
    zone: '383',
  },
  {
    ward_section: '45-1',
    street_direction: 'W',
    street_name: 'LAWRENCE',
    street_type: 'AVE',
    from_address: 4800,
    to_address: 4899,
    odd_even: 'ODD',
    zone: '383',
  },
];

// ---- Street Sweeping ----

export const stubSweepingWardSections: SweepingWardSection[] = [
  {
    id: '45-1',
    polygon: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-87.783, 41.968],
          [-87.772, 41.968],
          [-87.772, 41.976],
          [-87.783, 41.976],
          [-87.783, 41.968],
        ]],
      },
    },
    schedule: [
      {
        month_start: 4,
        month_end: 11,
        week_of_month: [1, 3],
        day_of_week: 2, // Tuesday
      },
    ],
  },
];

// ---- Snow Routes ----

export const stubSnowRoutes: SnowRouteSegment[] = [
  {
    street_direction: 'N',
    street_name: 'MILWAUKEE',
    street_type: 'AVE',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-87.7600, 41.9695],
        [-87.7668, 41.9745],
      ],
    },
  },
  {
    street_direction: 'W',
    street_name: 'LAWRENCE',
    street_type: 'AVE',
    geometry: {
      type: 'LineString',
      coordinates: [
        [-87.7660, 41.9685],
        [-87.7760, 41.9685],
      ],
    },
  },
];
