import type { ParkedHere } from '../types';

interface Props {
  parkedHere: ParkedHere | null;
  onPark: () => void;
  onClear: () => void;
}

function navigateToCar(parked: ParkedHere) {
  const { lat, lng } = parked;
  // Try Apple Maps first (iOS), fall back to Google Maps
  const appleMaps = `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`;
  const googleMaps = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;

  // Attempt Apple Maps, fall back to Google
  const w = window.open(appleMaps, '_blank');
  if (!w) {
    window.open(googleMaps, '_blank');
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ParkedHereButton({ parkedHere, onPark, onClear }: Props) {
  if (parkedHere) {
    return (
      <div className="parked-here-controls">
        <div className="parked-here-info">
          Parked at {formatTime(parkedHere.timestamp)}
        </div>
        <button className="parked-btn parked-btn--navigate" onClick={() => navigateToCar(parkedHere)}>
          Navigate to Car
        </button>
        <button className="parked-btn parked-btn--clear" onClick={onClear}>
          Clear Pin
        </button>
      </div>
    );
  }

  return (
    <button className="parked-btn parked-btn--park" onClick={onPark}>
      Parked Here
    </button>
  );
}
