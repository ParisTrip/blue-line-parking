import type { CurbSideFeatureProps } from '../types';
import { EDIT_CATEGORY_LABELS } from '../types';

interface Props {
  segment: CurbSideFeatureProps;
  onClose: () => void;
  onEdit: () => void;
}

const COLOR_LABELS: Record<string, string> = {
  green: 'No Permit Zone Found',
  yellow: 'Permit Zone Exists',
  red: 'Known Restriction',
  blue: 'No Data - Unmatched Street',
};

export function SegmentDetails({ segment, onClose, onEdit }: Props) {
  return (
    <div className="bottom-sheet">
      <div className="bottom-sheet__header">
        <h3>{segment.streetName}</h3>
        <button className="bottom-sheet__close" onClick={onClose}>Close</button>
      </div>
      <div className="bottom-sheet__body">
        <div className={`segment-status segment-status--${segment.color}`}>
          <span className="segment-status__color">{COLOR_LABELS[segment.color]}</span>
          <span className="segment-status__confidence">Confidence: {segment.confidence}</span>
        </div>
        <div className="segment-meta">
          <span>Side: {segment.side}</span>
          <span>Segment ID: {segment.segmentId}</span>
        </div>
        <div className="segment-reasons">
          <strong>Reasons:</strong>
          <ul>
            {segment.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="segment-flags">
          {segment.hasPermitZone && <span className="flag flag--permit">Permit Zone</span>}
          {segment.sweepingRisk && <span className="flag flag--sweep">Sweeping Risk</span>}
          {segment.snowRoute && <span className="flag flag--snow">Snow Route</span>}
          {segment.hasUserEdit && (
            <span className="flag flag--edit">
              Edit: {EDIT_CATEGORY_LABELS[segment.editCategory as keyof typeof EDIT_CATEGORY_LABELS] ?? segment.editCategory}
            </span>
          )}
        </div>
        <button className="edit-btn" onClick={onEdit}>
          Edit This Curb Side
        </button>
      </div>
    </div>
  );
}
