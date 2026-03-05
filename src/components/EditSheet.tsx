import { useState } from 'react';
import type { CurbSideFeatureProps, EditCategory, CurbEdit } from '../types';
import { EDIT_CATEGORY_LABELS } from '../types';

interface Props {
  segment: CurbSideFeatureProps;
  existingEdit?: CurbEdit;
  onSave: (edit: CurbEdit) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CATEGORIES = Object.entries(EDIT_CATEGORY_LABELS) as [EditCategory, string][];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EditSheet({ segment, existingEdit, onSave, onDelete, onClose }: Props) {
  const [category, setCategory] = useState<EditCategory>(existingEdit?.category ?? 'verified-safe');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(existingEdit?.daysOfWeek ?? []);
  const [startTime, setStartTime] = useState(existingEdit?.startTime ?? '');
  const [endTime, setEndTime] = useState(existingEdit?.endTime ?? '');
  const [note, setNote] = useState(existingEdit?.note ?? '');

  const editId = `${segment.segmentId}-${segment.side}`;

  const handleSave = () => {
    const edit: CurbEdit = {
      id: editId,
      segmentId: segment.segmentId,
      side: segment.side,
      category,
      timestamp: Date.now(),
    };
    if (daysOfWeek.length > 0) edit.daysOfWeek = daysOfWeek;
    if (startTime) edit.startTime = startTime;
    if (endTime) edit.endTime = endTime;
    if (note) edit.note = note;
    onSave(edit);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="bottom-sheet bottom-sheet--edit">
      <div className="bottom-sheet__header">
        <h3>Edit: {segment.streetName} ({segment.side})</h3>
        <button className="bottom-sheet__close" onClick={onClose}>Cancel</button>
      </div>
      <div className="bottom-sheet__body">
        <div className="edit-field">
          <label>Category</label>
          <div className="edit-categories">
            {CATEGORIES.map(([key, label]) => (
              <button
                key={key}
                className={`category-btn ${category === key ? 'category-btn--active' : ''}`}
                onClick={() => setCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="edit-field">
          <label>Days (optional)</label>
          <div className="edit-days">
            {DAYS.map((d, i) => (
              <button
                key={i}
                className={`day-btn ${daysOfWeek.includes(i) ? 'day-btn--active' : ''}`}
                onClick={() => toggleDay(i)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="edit-field edit-field--row">
          <div>
            <label>Start time</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <label>End time</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="edit-field">
          <label>Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
          />
        </div>

        <div className="edit-actions">
          <button className="save-btn" onClick={handleSave}>Save Edit</button>
          {existingEdit && (
            <button className="delete-btn" onClick={() => onDelete(editId)}>
              Remove Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
