# Ontario Public Health Unit Locator

A modern prototype for finding Ontario's 34 Public Health Units (PHUs) by municipality, postal code, or current location. Built to demo as a replacement for the legacy ASP.NET page at phdapps.health.gov.on.ca.

This prototype was built during a live coding session on March 9, 2026 with the OPS Product Management Community of Practice.

For this project we started with three data files the ontario_public_health_units.json scraped from phdapps.health.gov.on.ca. From that file we derived tow more files (Ontario_municipalities_EN.json and Ontario_municipalities_FR.json). [Data folder](./src/data) 

The remaning required data and inputs (map boundaries/shape data, the ontario design system, the FSA file) were created during the build process. 

## Features

- **Autocomplete search** — type-ahead across 1,500+ municipalities, cities, towns, and regions
- **Postal code lookup** — FSA and full postal codes geocoded via static lookup (no external API)
- **"Use my current location"** — browser geolocation with reverse geocoding to show place name
- **Interactive map** — MapLibre GL JS with PHU boundary polygons, hover/click/highlight
- **Rich contact cards** — clickable phone numbers, structured addresses, website links
- **EN/FR bilingual** — full language toggle using parallel bilingual data
- **Browse all** — directory view of all 34 PHUs, filterable by Ontario Health region
- **Mobile responsive** — horizontal swipable card carousel below map on mobile
- **Hash routing** — shareable URLs (`#phu/toronto-public-health`, `#directory`)

## Tech Stack

- **React 19** + TypeScript + Vite
- **Ontario Design System (ODS) v2.4.0** — CSS loaded directly (not the React/Stencil wrapper)
- **MapLibre GL JS** via `react-map-gl` — open-source map rendering
- **No additional libraries** for search, i18n, routing, state management, or geometry

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Data Sources

| Source | Purpose |
|--------|---------|
| `src/data/ontario_public_health_units.json` | 34 PHUs: names, contacts, municipalities, addresses (EN/FR) |
| `src/data/ontario_fsa.json` | 527 Ontario FSA → coordinate lookup for postal code geocoding |
| `src/data/phu_boundaries.json` | PHU boundary GeoJSON polygons (cached from ArcGIS) |
| ArcGIS FeatureServer `MOH_PHU_BOUNDARY` | PHU boundary GeoJSON polygons (fetched at runtime) |
| Nominatim (OpenStreetMap) | Reverse geocoding only (lat/lon → place name for "Use my location") |
| CartoDB Positron | Basemap tiles |

## Project Structure

```
src/
├── components/
│   ├── layout/        AppHeader, AppFooter, PageLayout
│   ├── search/        SearchBar, SearchSuggestions
│   ├── map/           PHUMap
│   ├── cards/         PHUCard, PHUCardList
│   └── directory/     PHUDirectory, RegionFilter
├── context/           LanguageContext, PHUContext, MapContext
├── hooks/             useSearch, useBoundaryData
├── utils/             searchIndex, geocode, pointInPolygon, i18n, slugify, normalizeData, boundaryMapping
├── types/             phu.ts
├── styles/            layout.css, cards.css, map.css, search.css
└── data/              ontario_public_health_units.json, ontario_fsa.json, phu_boundaries.json, municipality files
```

## External Services

| Service | When Called | Purpose |
|---------|-----------|---------|
| ArcGIS FeatureServer | Once on map load | Fetch PHU boundary polygons |
| Nominatim reverse | Only on "Use my location" | Convert coordinates to place name |
| CartoDB tile server | Map rendering | Basemap tiles |

No analytics, no tracking, no cookies, no user data stored server-side.

## Dependency Audit

See [DEPENDENCIES.md](./DEPENDENCIES.md) for a full audit of all third-party libraries including risk assessment, maintainer info, and justification.
