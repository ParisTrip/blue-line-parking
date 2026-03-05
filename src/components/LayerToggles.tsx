import type { LayerVisibility } from '../types';

interface Props {
  layers: LayerVisibility;
  onChange: (layers: LayerVisibility) => void;
  onSettingsClick: () => void;
  onBackupClick: () => void;
}

const LAYER_LABELS: { key: keyof LayerVisibility; label: string }[] = [
  { key: 'availability', label: 'Availability' },
  { key: 'permitRisk', label: 'Permit Risk' },
  { key: 'sweeping', label: 'Sweeping' },
  { key: 'snowRoutes', label: 'Snow Routes' },
  { key: 'myEdits', label: 'My Edits' },
];

export function LayerToggles({ layers, onChange, onSettingsClick, onBackupClick }: Props) {
  const toggle = (key: keyof LayerVisibility) => {
    onChange({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className="layer-toggles">
      <div className="layer-toggles__buttons">
        {LAYER_LABELS.map(({ key, label }) => (
          <button
            key={key}
            className={`layer-toggle ${layers[key] ? 'layer-toggle--active' : ''}`}
            onClick={() => toggle(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="layer-toggles__actions">
        <button className="action-btn" onClick={onSettingsClick}>
          Settings
        </button>
        <button className="action-btn action-btn--backup" onClick={onBackupClick}>
          Backup Parking
        </button>
      </div>
    </div>
  );
}
