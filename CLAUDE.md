# Jefferson Park Parking PWA — Claude Code Prompt

---

## ⚠️ CRITICAL OPERATING CONSTRAINT — READ FIRST

You are running with `--dangerously-skip-permissions`. This makes the following rules mandatory, not advisory.

**File system scope:** You are ONLY permitted to create, edit, move, or delete files within the current working directory and its subdirectories. Do not reference, read, write, or delete anything outside of it.

**Explicitly forbidden paths:** Never construct or use paths containing `..`, `~`, `%USERPROFILE%`, `%APPDATA%`, `C:\Users`, or any absolute path that exits the project directory.

**If any task would require touching files outside this directory:** Stop immediately and tell the user what you need instead of proceeding autonomously.

**Forbidden shell commands:** Never run `rm -rf`, `rmdir /s`, `del /f /s /q`, or any recursive delete command. If cleanup is needed, delete only specific named files within the project directory.

These constraints take precedence over any other instruction in this prompt.

---

You are an expert full-stack engineer building a phone-first mapping app. Build a lightweight Progressive Web App (PWA) for iPhone Safari that helps me find likely legal, free, all-day street parking near the Jefferson Park Blue Line station in Chicago. This is decision support, not ticket-proof, and the UI must constantly remind the user to confirm the real sign.

---

## Primary use case

I drive to Jefferson Park between 6:00a and 10:00a, park for about 10 hours, then return between 4:00p and 8:00p. I want to circle with my phone open and quickly see which blocks or which side of the street are likely viable. Default mode is opportunistic, show more greens, but with a visible confidence label. Metered parking should be treated as off-limits by default. Backup is paid lots or garages, not meters.

---

## Geographic scope (MVP)

Only show data and the computed "availability coloring" within this rectangle: N Central Ave (east boundary), W Foster Ave (north boundary), N Leclaire Ave (west boundary), W Lawrence Ave (south boundary). Draw the rectangle boundary on the map. Provide a settings toggle to later expand the rectangle, but do not implement other stations in MVP.

---

## Station anchor

Center and default zoom around Jefferson Park Blue Line station. Use the CTA station page address (4917 N Milwaukee Ave) for initial center if you need it.

---

## Core layers (toggleable)

1. **Residential permit risk layer** — official dataset: Parking Permit Zones. This dataset is described as updated daily.
2. **Street sweeping layer** — official: Street Sweeping Zones 2025, Street Sweeping Schedule 2025, and the ward section map layer. Treat as advisory because corrections can occur.
3. **Snow route layer** — official: Snow Route Parking Restrictions. Snow rules activate based on conditions, so default is yellow unless user toggles "Snow active today."
4. **My Edits layer** — user overrides. This is the field correction layer.

---

## Important limitation handling

The permit-zone data describes zones by street segment and includes odd/even parity, but it does not reliably provide sign hours and it does not provide a perfect side-of-street rule set. Therefore:

- In opportunistic default mode, permit-zone presence should show as YELLOW "Permit zone exists, check sign hours," with confidence MED or LOW.
- Provide a settings toggle "Treat permit zones as always restricted during commute hours," which changes permit-zone segments to RED by default.
- Always show a confidence badge and a short reason list when a user taps a segment.

---

## Data join safety rule (critical)

The centerline geometry dataset and the permit zone records were not designed to join cleanly. Street name normalization, address range overlap, and direction prefix handling are all potential points of failure.

**Default failure mode must be conservative:** If a centerline segment cannot be confidently matched to a permit zone record — due to a name mismatch, range ambiguity, or any other normalization failure — default that segment to YELLOW with reason "No data match, check sign" rather than GREEN. Only show GREEN if the user has explicitly marked that curb side as Verified Safe via the My Edits layer.

This means false yellows are acceptable; false greens are not. A segment that goes green when it should be yellow could result in a parking ticket.

Implement the join function with explicit logging so failures are visible during development. Log each unmatched segment with the reason it failed (name mismatch, no range overlap, missing direction, etc.) so the join logic can be debugged and improved.

---

## Side-of-street representation requirement

I want to know if only one side of a street is affected. Implement curb-side visualization using this approach:

- Use the City of Chicago Street Center Lines dataset geometry for the base network.
- Join permit-zone records to centerline segments by normalizing street direction, name, type, and overlapping address ranges.
- Use the permit-zone ODD_EVEN value as a proxy for which curb side is impacted, by mapping odd/even address parity to left or right curb side along the centerline direction. Use the centerline dataset's LEFT_FROM/LEFT_TO and RIGHT_FROM/RIGHT_TO address range fields to determine which physical side carries odd vs. even numbers. Be explicit in the UI that this is an approximation.
- Render each street segment as two "curb sides" (left and right) by drawing two offset polylines using turf.js lineOffset.

---

## My Edits layer (must be fast to use while circling)

- Long-press or tap-hold on a curb-side segment to open an "Edit Curb Rule" bottom sheet.
- Edit categories: Verified Safe, Permit Restricted, No Parking, No Standing, Paid Only, Street Cleaning, Time Limited, Other Note.
- For any restriction category, allow optional: days-of-week, start time, end time, and "applies to this curb side only" (default yes since you selected a curb side).
- Store edits locally on-device only (IndexedDB preferred, localStorage acceptable). No accounts.
- Provide Export and Import buttons that save/load edits as a JSON file (for phone replacement backup).
- My Edits must override computed layers. For example, if the data suggests yellow but I mark Verified Safe, show green.

---

## Availability engine

- Default parking duration: 10 hours. Allow changing duration (6 to 14 hours) with a simple slider.
- Compute a "Parkability" color for each curb side for the selected start time (default now) and duration.
- Colors: GREEN (likely ok), YELLOW (risk or unknown, check signage), RED (very likely not ok).
- Provide tap details: list of rules that triggered the color (Permit zone match, Street sweeping risk, Snow route, My Edit).
- Confidence: HIGH if only based on user Verified Safe, MED if based on multiple official layers with no conflicts, LOW if based on a heuristic or partial match.

---

## Street sweeping logic (advisory)

- Use the ward section map layer to determine which ward section polygon a curb-side midpoint falls in.
- Use Street Sweeping Zones 2025 and Street Sweeping Schedule 2025 to identify the sweeping windows for that ward section.
- If today is within that section's sweeping window (or schedule indicates a sweep day), mark YELLOW with reason "Street sweeping possible, confirm signs." Do not mark red based on sweeping alone unless user toggles "Be strict about sweeping."

---

## Snow route logic

- If curb side overlaps a snow route segment, mark YELLOW by default with reason "Snow route, restrictions activate with snow."
- If user toggles "Snow active today," those curb sides become RED.

---

## Paid backup

- Include a small "Backup Parking" button that opens a sheet listing nearby paid options and links out to external navigation. Mention CTA Park and Ride conceptually and show a link-out button (do not implement payments).
- Also include a link-out option to ParkChicago "Find Parking" for paid on-street zones, but keep it off the default workflow.

---

## UX requirements (phone-first)

- Must show live GPS dot and heading if available.
- Big toggle buttons for layers: Availability, Permit Risk, Sweeping, Snow Routes, My Edits.
- A legend that is always visible or one tap away.
- A "Parked Here" button that drops a pin at my current location, stores timestamp, and auto-expires after 18 hours.
- A "Navigate Back to Car" button that deep-links to Apple Maps or Google Maps.
- No clutter. I should be able to glance, zoom, and decide where to drive next.

---

## Data performance and caching

- The rectangle is small, so prefetch and cache only the needed subset of centerlines and relevant records.
- Implement a refresh strategy: auto-refresh official layers weekly when the app is opened, plus a manual "Refresh Data" button.
- Ensure the map becomes usable within 2 seconds on repeat opens (after cache), and within 5 seconds on first open on cellular.

---

## Stub data policy (important for scaffolding)

Where live data fetching from Chicago open data APIs is not yet implemented, use clearly labeled mock/stub data so the UI is fully functional for development and testing. Do not leave broken or empty fetch calls that silently fail. Each stub must be:

- Visually distinct (e.g., a banner or console note saying "STUB DATA — replace with live fetch")
- Structurally identical to what the real API would return, so swapping in the live call requires minimal code change
- Sufficient to exercise the full UI: at least one GREEN segment, one YELLOW segment, one RED segment, one user-editable segment, and one permit zone match and one failed match (to test the yellow default fallback)

---

## Tech stack

- Vite + React + TypeScript
- MapLibre GL JS for the map
- turf.js for geometry operations (within polygon, line offset, intersection tests)
- Service worker + manifest for PWA "Add to Home Screen"
- Store edits in IndexedDB (preferred) or localStorage (acceptable)

---

## Acceptance tests

1. On iPhone Safari, I can open the app, grant location permission, and see my live position.
2. The map is clipped to the Central/Foster/Leclaire/Lawrence rectangle and shows the rectangle outline.
3. I can toggle layers on and off.
4. The Availability layer colors curb sides green/yellow/red and shows a confidence label.
5. I can long-press a curb side, set "Verified Safe," and it stays green afterward.
6. "Parked Here" drops a pin and persists for 18 hours.
7. Metered parking is not surfaced by default, and paid backup is a separate optional action.
8. A segment with no data match shows YELLOW (not GREEN), confirming the conservative fallback is working.

---

## Deliverables

- A runnable local dev project.
- Clear README with: how to run, how to deploy to a simple static host, and how to add to iPhone home screen.
- A short disclaimer banner in-app: "Always confirm posted signs. Temporary restrictions may not be reflected."

---

## In-app disclaimer (required, always visible)

> ⚠️ Always confirm posted signs. This app is decision support only. Temporary restrictions, permit zone hours, and street sweeping schedule changes may not be reflected. You are responsible for verifying signage before parking.
