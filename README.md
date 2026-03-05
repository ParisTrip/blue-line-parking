# Jefferson Park Parking PWA

A phone-first Progressive Web App that helps find likely legal, free, all-day street parking near the Jefferson Park Blue Line station in Chicago.

**This is decision support, not legal advice. Always confirm posted signs.**

## Quick Start

```bash
npm install
npm run dev
```

Open the URL shown in terminal (usually `http://localhost:5173`) on your phone or desktop browser.

## Deploy to Static Host

```bash
npm run build
```

Upload the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc.). The app is a single-page application with a service worker for offline caching.

For HTTPS (required for PWA features like geolocation and Add to Home Screen), use a host that provides free SSL.

## Add to iPhone Home Screen

1. Open the deployed URL in Safari on iPhone
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. The app will run in standalone mode (no browser chrome)

## Features

- **Curb-side availability coloring**: GREEN (likely OK), YELLOW (risk/unknown), RED (likely restricted)
- **Side-of-street rendering**: Left and right curbs shown separately using address parity heuristic
- **Layer toggles**: Availability, Permit Risk, Sweeping, Snow Routes, My Edits
- **Confidence badges**: HIGH (user verified), MED (data consistent), LOW (heuristic)
- **My Edits**: Long-press any curb side to mark it (Verified Safe, No Parking, etc.). Stored locally in IndexedDB
- **Export/Import edits**: Back up your field corrections as JSON
- **Parked Here pin**: Drops a pin at current location, auto-expires after 18 hours
- **Navigate to Car**: Deep-links to Apple Maps or Google Maps for walking directions
- **Backup Parking**: Links to CTA Park & Ride, ParkChicago, SpotHero
- **Settings**: Parking duration slider (6-14 hrs), strict permit mode, snow active toggle, strict sweeping mode
- **GPS tracking**: Live position dot with heading indicator
- **PWA**: Add to home screen, offline-capable via service worker

## Data Status

Currently uses **stub data** for development. The stub data is visually flagged with an orange banner and console warnings. Replace with live Chicago Data Portal (Socrata) API calls in `src/data/fetcher.ts`.

Datasets to integrate:
- Street Center Lines (geometry + address ranges)
- Parking Permit Zones (zone records)
- Street Sweeping Zones/Schedule 2025
- Snow Route Parking Restrictions

## Architecture

```
src/
  types.ts          - TypeScript type definitions
  config.ts         - Constants, bounds, defaults
  store.ts          - IndexedDB (edits) + localStorage (settings, parked pin)
  data/
    stubs.ts        - Stub data (structurally matches real API responses)
    fetcher.ts      - Data fetching functions (swap stubs for live API)
  engine/
    join.ts         - Join permit zones to centerlines (with logging)
    curb-sides.ts   - Generate offset polylines via turf.lineOffset
    availability.ts - Compute GREEN/YELLOW/RED + confidence for each curb
  components/
    MapView.tsx     - MapLibre GL map with all layers
    Disclaimer.tsx  - Required disclaimer banner
    LayerToggles.tsx- Layer on/off buttons
    Legend.tsx       - Color legend
    SegmentDetails.tsx - Tap details bottom sheet
    EditSheet.tsx   - Edit curb rule bottom sheet
    ParkedHereButton.tsx - Park pin / navigate buttons
    BackupParking.tsx    - Paid parking alternatives
    Settings.tsx    - App settings + data management
  App.tsx           - Root component, state management
  main.tsx          - Entry point, service worker registration
```

## Conservative Default

The data join between centerlines and permit zones can fail due to name mismatches, address range gaps, or normalization issues. **Failed joins default to YELLOW** ("No data match, check sign"), never GREEN. This means false yellows are acceptable; false greens are not.

The join function logs every unmatched segment with the specific failure reason to the browser console.
