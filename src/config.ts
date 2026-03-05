import type { AppSettings, LayerVisibility } from './types';
import type { Feature, Polygon } from 'geojson';

export const JEFFERSON_PARK_STATION = {
  lat: 41.9706,
  lng: -87.7649,
};

export const BOUNDS = {
  north: 41.9814,
  south: 41.9689,
  east: -87.7651,
  west: -87.7797,
};

export const BOUNDS_POLYGON: Feature<Polygon> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [BOUNDS.west, BOUNDS.south],
      [BOUNDS.east, BOUNDS.south],
      [BOUNDS.east, BOUNDS.north],
      [BOUNDS.west, BOUNDS.north],
      [BOUNDS.west, BOUNDS.south],
    ]],
  },
};

export const DEFAULT_ZOOM = 15;
export const CURB_OFFSET_KM = 0.007;
export const LONG_PRESS_MS = 500;

export const DEFAULT_SETTINGS: AppSettings = {
  treatPermitAsRestricted: false,
  snowActiveToday: false,
  strictSweeping: false,
  parkingDuration: 10,
  expandedBounds: false,
};

export const DEFAULT_LAYERS: LayerVisibility = {
  availability: true,
  permitRisk: false,
  sweeping: false,
  snowRoutes: false,
  myEdits: true,
};
