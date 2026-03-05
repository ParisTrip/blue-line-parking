/**
 * Generate offset polylines for left and right curb sides of each centerline segment.
 * Clips geometry to the bounding box before offsetting to prevent visual overflow.
 */

import { lineOffset, bboxClip } from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import type { CenterlineFeature, CurbSide } from '../types';
import { BOUNDS, CURB_OFFSET_KM } from '../config';

export interface CurbSideGeometry {
  segmentId: number;
  side: CurbSide;
  streetName: string;
  geometry: LineString;
}

/** Small padding (in degrees) so clipped endpoints don't land exactly on the border */
const PAD = 0.0002;

const CLIP_BBOX: [number, number, number, number] = [
  BOUNDS.west - PAD,
  BOUNDS.south - PAD,
  BOUNDS.east + PAD,
  BOUNDS.north + PAD,
];

export function generateCurbSides(
  centerlines: CenterlineFeature[]
): CurbSideGeometry[] {
  const result: CurbSideGeometry[] = [];

  for (const feature of centerlines) {
    const props = feature.properties;
    const segId = props.OBJECTID;
    const streetName = `${props.PRE_DIR} ${props.STREET_NAM} ${props.STREET_TYP}`;

    try {
      // Clip geometry to bounding box to prevent lines extending beyond the visible area
      const clipped = bboxClip(feature, CLIP_BBOX);

      // bboxClip may return MultiLineString if the line crosses the bbox boundary
      let lines: number[][][];
      if (clipped.geometry.type === 'LineString') {
        lines = [clipped.geometry.coordinates];
      } else if (clipped.geometry.type === 'MultiLineString') {
        lines = clipped.geometry.coordinates;
      } else {
        continue;
      }

      for (const coords of lines) {
        if (coords.length < 2) continue;

        const lineFeature: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        };

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
      }
    } catch (e) {
      console.error(`[CURB] Failed to offset segment ${segId}:`, e);
    }
  }

  return result;
}
