import { useState } from 'react';

export function Legend() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`legend ${open ? 'legend--open' : ''}`}>
      <button className="legend__toggle" onClick={() => setOpen(!open)}>
        {open ? 'Hide Legend' : 'Legend'}
      </button>
      {open && (
        <div className="legend__content">
          <div className="legend__item">
            <span className="legend__swatch legend__swatch--green" />
            <span>No permit zone found (verify sign)</span>
          </div>
          <div className="legend__item">
            <span className="legend__swatch legend__swatch--yellow" />
            <span>Permit zone exists - check sign hours</span>
          </div>
          <div className="legend__item">
            <span className="legend__swatch legend__swatch--red" />
            <span>Known restriction</span>
          </div>
          <div className="legend__item">
            <span className="legend__swatch legend__swatch--blue" />
            <span>No data - street not matched</span>
          </div>
          <div className="legend__item">
            <span className="legend__swatch legend__swatch--boundary" />
            <span>Coverage boundary</span>
          </div>
          <div className="legend__note">
            Confidence: HIGH = user verified, MED = data consistent, LOW = heuristic
          </div>
          <div className="legend__note">
            Side-of-street coloring is an approximation based on address parity.
          </div>
        </div>
      )}
    </div>
  );
}
