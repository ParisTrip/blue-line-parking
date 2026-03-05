import type { Feature, FeatureCollection, LineString, Polygon } from 'geojson';

export interface CenterlineProperties {
  OBJECTID: number;
  PRE_DIR: string;
  STREET_NAM: string;
  STREET_TYP: string;
  L_F_ADD: number;
  L_T_ADD: number;
  R_F_ADD: number;
  R_T_ADD: number;
  known_restriction?: 'no-parking' | 'no-standing' | 'metered';
}

export type CenterlineFeature = Feature<LineString, CenterlineProperties>;
export type CenterlineCollection = FeatureCollection<LineString, CenterlineProperties>;

export interface PermitZoneRecord {
  zone: string;
  street_direction: string;
  street_name: string;
  street_type: string;
  from_address: number;
  to_address: number;
  odd_even: 'ODD' | 'EVEN' | 'BOTH';
  ward: string;
}

export interface SweepingWardSection {
  id: string;
  polygon: Feature<Polygon>;
  schedule: SweepingScheduleEntry[];
}

export interface SweepingScheduleEntry {
  month_start: number;
  month_end: number;
  week_of_month: number[];
  day_of_week: number;
}

export interface SnowRouteSegment {
  street_direction: string;
  street_name: string;
  street_type: string;
  geometry: LineString;
}

export type CurbSide = 'left' | 'right';
export type AvailabilityColor = 'green' | 'yellow' | 'red';
export type Confidence = 'HIGH' | 'MED' | 'LOW';

export interface CurbSideFeatureProps {
  segmentId: number;
  side: CurbSide;
  streetName: string;
  color: AvailabilityColor;
  confidence: Confidence;
  reasons: string[];
  permitMatch: 'matched' | 'unmatched' | 'no-permit';
  hasPermitZone: boolean;
  sweepingRisk: boolean;
  snowRoute: boolean;
  hasUserEdit: boolean;
  editCategory?: string;
}

export type CurbSideFeature = Feature<LineString, CurbSideFeatureProps>;
export type CurbSideCollection = FeatureCollection<LineString, CurbSideFeatureProps>;

export type EditCategory =
  | 'verified-safe'
  | 'permit-restricted'
  | 'no-parking'
  | 'no-standing'
  | 'paid-only'
  | 'street-cleaning'
  | 'time-limited'
  | 'other';

export const EDIT_CATEGORY_LABELS: Record<EditCategory, string> = {
  'verified-safe': 'Verified Safe',
  'permit-restricted': 'Permit Restricted',
  'no-parking': 'No Parking',
  'no-standing': 'No Standing',
  'paid-only': 'Paid Only',
  'street-cleaning': 'Street Cleaning',
  'time-limited': 'Time Limited',
  'other': 'Other Note',
};

export interface CurbEdit {
  id: string;
  segmentId: number;
  side: CurbSide;
  category: EditCategory;
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  note?: string;
  timestamp: number;
}

export interface ParkedHere {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface AppSettings {
  treatPermitAsRestricted: boolean;
  snowActiveToday: boolean;
  strictSweeping: boolean;
  parkingDuration: number;
  expandedBounds: boolean;
}

export interface LayerVisibility {
  availability: boolean;
  permitRisk: boolean;
  sweeping: boolean;
  snowRoutes: boolean;
  myEdits: boolean;
}

export interface JoinResult {
  segmentId: number;
  side: CurbSide;
  permitMatch: 'matched' | 'unmatched' | 'no-permit';
  permitZone?: PermitZoneRecord;
  matchLog: string;
}
