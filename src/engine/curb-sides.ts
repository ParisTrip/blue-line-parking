/**
 * Generate offset polylines for left and right curb sides of each centerline segment.
 */

import { lineOffset } from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import type { CenterlineFeature, CurbSide } from '../types';
import { CURB_OFFSET_KM } from '../config';

export interface CurbSideGeometry {
  segmentId: number;
  side: CurbSide;
  streetName: string;
  geometry: LineString;
}

export function generateCurbSides(
  centerlines: CenterlineFeature[]
): CurbSideGeometry[] {
  const result: CurbSideGeometry[] = [];

  for (const feature of centerlines) {
    const props = feature.properties;
    const segId = props.OBJECTID;
    const streetName = `${props.PRE_DIR} ${props.STREET_NAM} ${props.STREET_TYP}`;

    const lineFeature: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: feature.geometry,
    };

    try {
      // Positive offset = left side, Negative offset = right side
      const leftOffset = lineOffset(lineFeature, CURB_OFFSET_KM, { units: 'kilometers' });
      const rightOffset = lineOffset(lineFeature, -CURB_OFFSET_KM, { units: 'kilometers' });

      result.push({
        segmentId: segId,
        side: 'left',
        streetName,
        geometry: leftOffset.geometry,
      });
      result.push({
        segmentId: segId,
        side: 'right',
        streetName,
        geometry: rightOffset.geometry,
      });
    } catch (e) {
      console.error(`[CURB] Failed to offset segment ${segId}:`, e);
    }
  }

  return result;
}
