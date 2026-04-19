# Results Page — Dynamic Filters Spec

**Goal:** The selector results page (Step 5) shows ALL solutions from SystemDesigner, with client-side filter chips that let users narrow down by measurement type, range, mode, and tier.

## Architecture

The engine generates all valid solutions for the selected gas + voltage + ATEX + location + points. No pre-filtering upstream. The results page displays everything, with instant client-side filters.

## Filter Axes

### 1. Measurement Type
- Chips: `[All] [ppm] [%LFL] [%Vol]`
- Extracted dynamically from the `range` field of solutions' detectors
- Logic: parse range string → detect unit (ppm, LFL/LEL, vol)
- Only show chips for units that exist in current results

### 2. Range Level
- Chips: `[All] [0-100] [0-500] [0-1000] [0-5000] [0-10000]` etc.
- Extracted dynamically from detector `range` field
- Only show ranges that exist in current results after measurement type filter
- Updates when measurement type filter changes

### 3. Mode
- Chips: `[All] [Standalone] [Centralized]`
- Filters on `solution.mode`
- Always show both (engine generates both)

### 4. Tier
- Chips: `[All] [Premium] [Standard] [Economic]`
- Filters on `solution.tier`
- Only show tiers that exist in current results

## Filter Behavior

- All filters default to "All" (no filtering)
- Filters are **AND** — selecting ppm + Standalone + Premium shows only solutions matching all three
- When a filter reduces options to zero, show "No solutions match these filters" with a reset button
- Filter chips show count: `[ppm (4)] [%Vol (2)]`
- Changing one filter updates the available options in other filters (cascading)

## Display Order

Filters bar at top, then solutions grouped by the 2x2 matrix:

```
┌─────────────────────────────────────────────────────┐
│ Measurement: [All] [ppm (6)] [%Vol (2)]             │
│ Range:       [All] [0-1000 (3)] [0-5000 (3)] [0-5%] │
│ Mode:        [All] [Standalone (4)] [Centralized (4)]│
│ Tier:        [All] [Premium (4)] [Standard (4)]      │
└─────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┐
│ Premium          │ Premium          │
│ Standalone       │ Centralized      │
│                  │                  │
│ MIDI IR CO2      │ MIDI IR CO2      │
│ 0-10000 ppm      │ + GC10           │
│ 673€/unit        │ Total: 5688€     │
├──────────────────┼──────────────────┤
│ Standard         │ Standard         │
│ Standalone       │ Centralized      │
│                  │                  │
│ X5 CO2 5000ppm   │ X5 CO2 + GC10    │
│ 1019€/unit       │ Total: 7072€     │
└──────────────────┴──────────────────┘
```

## Solution Card Content

Each solution card shows:
- **Detector:** name, family, image, range, sensor tech
- **Controller:** name, qty (if centralized)
- **Alerts:** beacon + siren names, qty
- **Accessories:** power adapter, duct/pipe adapters (if any)
- **Price breakdown:** detector subtotal + controller subtotal + alerts + accessories = total
- **Optional items:** calibration kit, magnetic wand (collapsible)
- **Connection label:** "4-20mA analog" or "Direct mount Port A/B"

## Example: User selects R717, 6 points, 24V, Non-ATEX, ambient

Engine returns ~14 solutions. Results page:

```
Measurement: [All (14)] [ppm (14)]
Range:       [All (14)] [0-100 (4)] [0-500 (2)] [0-1000 (4)] [0-5000 (4)]
Mode:        [All (14)] [Standalone (7)] [Centralized (7)]
Tier:        [All (14)] [Premium (0)] [Standard (14)]
```

User clicks [0-1000] → 4 solutions remain:
- MIDI EC NH3 1000ppm Integrated — Standalone
- MIDI EC NH3 1000ppm Remote — Standalone
- MIDI EC NH3 1000ppm Integrated — Centralized (+ GC10)
- MIDI EC NH3 1000ppm Remote — Centralized (+ GC10)

## Technical Notes

- All filtering is client-side (no API calls)
- `parseRange(range: string)` helper to extract unit and level
- Solution[] array from SystemDesigner stored in state, filters applied via useMemo
- Filter state: `{ measType: string, range: string, mode: string, tier: string }`
