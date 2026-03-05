import { useState } from 'react';

export function Disclaimer() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`disclaimer ${collapsed ? 'disclaimer--collapsed' : ''}`}>
      {collapsed ? (
        <button className="disclaimer__expand" onClick={() => setCollapsed(false)}>
          Show disclaimer
        </button>
      ) : (
        <>
          <div className="disclaimer__text">
            Always confirm posted signs. This app is decision support only. Temporary restrictions,
            permit zone hours, and street sweeping schedule changes may not be reflected. You are
            responsible for verifying signage before parking.
          </div>
          <button className="disclaimer__close" onClick={() => setCollapsed(true)}>
            Got it
          </button>
        </>
      )}
      <div className="disclaimer__stub-banner">
        STUB DATA - Using offline mock data for development
      </div>
    </div>
  );
}
