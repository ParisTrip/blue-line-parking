import type { AppSettings } from '../types';
import { exportEdits, importEdits } from '../store';
import type { CurbEdit } from '../types';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onEditsImported: (edits: CurbEdit[]) => void;
  onRefreshData: () => void;
  onClose: () => void;
}

export function Settings({ settings, onChange, onEditsImported, onRefreshData, onClose }: Props) {
  const update = (partial: Partial<AppSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const handleExport = async () => {
    const json = await exportEdits();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jp-parking-edits.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const edits = await importEdits(text);
        onEditsImported(edits);
      } catch (e) {
        alert('Failed to import edits: ' + (e instanceof Error ? e.message : String(e)));
      }
    };
    input.click();
  };

  return (
    <div className="bottom-sheet bottom-sheet--settings">
      <div className="bottom-sheet__header">
        <h3>Settings</h3>
        <button className="bottom-sheet__close" onClick={onClose}>Close</button>
      </div>
      <div className="bottom-sheet__body">
        <div className="setting-group">
          <h4>Parking Duration</h4>
          <div className="duration-slider">
            <input
              type="range"
              min={6}
              max={14}
              step={1}
              value={settings.parkingDuration}
              onChange={(e) => update({ parkingDuration: Number(e.target.value) })}
            />
            <span className="duration-value">{settings.parkingDuration} hours</span>
          </div>
        </div>

        <div className="setting-group">
          <h4>Restriction Modes</h4>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={settings.treatPermitAsRestricted}
              onChange={(e) => update({ treatPermitAsRestricted: e.target.checked })}
            />
            <span>Treat permit zones as always restricted</span>
          </label>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={settings.strictSweeping}
              onChange={(e) => update({ strictSweeping: e.target.checked })}
            />
            <span>Be strict about sweeping</span>
          </label>
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={settings.snowActiveToday}
              onChange={(e) => update({ snowActiveToday: e.target.checked })}
            />
            <span>Snow active today</span>
          </label>
        </div>

        <div className="setting-group">
          <h4>Data</h4>
          <button className="settings-btn" onClick={onRefreshData}>
            Refresh Data
          </button>
        </div>

        <div className="setting-group">
          <h4>My Edits</h4>
          <div className="settings-btn-row">
            <button className="settings-btn" onClick={handleExport}>
              Export Edits
            </button>
            <button className="settings-btn" onClick={handleImport}>
              Import Edits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
