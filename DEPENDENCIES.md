# Dependency Audit — PHU Locator

Last audited: 2026-03-10
`npm audit`: **0 vulnerabilities**

## Summary

| Category | Count |
|----------|-------|
| Runtime dependencies | 4 |
| Dev-only dependencies | 10 |
| Total transitive (runtime) | ~25 |
| Known vulnerabilities | 0 |

This project deliberately minimizes third-party dependencies. Search, i18n, routing, state management, and point-in-polygon geometry are all implemented in-house (~200 lines total) rather than pulling in libraries.

---

## Runtime Dependencies

These ship to the browser in the production bundle.

### 1. react / react-dom — v19.2

| Attribute | Assessment |
|-----------|-----------|
| **Maintainer** | Meta (Facebook) open-source team |
| **Weekly downloads** | ~25M |
| **License** | MIT |
| **Supply chain risk** | Very Low — published by Meta's verified npm org |
| **CVE history** | Rare; quickly patched |
| **Risk score** | 1/5 (Very Low) |

**Why we use it:** Core UI framework. Industry standard for component-based web applications. Required.

**What it pulls in:** `scheduler` (1 transitive dep, also by Meta). Minimal footprint.

---

### 2. maplibre-gl — v5.19

| Attribute | Assessment |
|-----------|-----------|
| **Maintainer** | MapLibre community (open-source fork of Mapbox GL JS) |
| **Weekly downloads** | ~200K |
| **License** | BSD-3-Clause |
| **Supply chain risk** | Low — governed by MapLibre organization with multiple maintainers |
| **CVE history** | None known |
| **Risk score** | 2/5 (Low) |

**Why we use it:** Renders interactive vector tile maps with boundary polygon layers. The only viable open-source option for this (Leaflet doesn't support vector tiles natively). Alternatives would be Mapbox GL JS (proprietary, requires API key + billing) or Google Maps (proprietary, costly).

**What it pulls in:** ~22 transitive deps — mostly small Mapbox utilities (`@mapbox/point-geometry`, `@mapbox/vector-tile`, `@mapbox/tiny-sdf`, etc.), geometry libraries (`earcut`, `gl-matrix`, `kdbush`, `supercluster`), and protocol buffers (`pbf`). All are well-established, single-purpose libraries from the geospatial ecosystem.

**Note:** MapLibre is the community-maintained fork created after Mapbox changed their license to proprietary. It is used by AWS Location Service, Microsoft, Meta, and multiple government mapping platforms.

---

### 3. react-map-gl — v8.1

| Attribute | Assessment |
|-----------|-----------|
| **Maintainer** | vis.gl / OpenJS Foundation (Urban Computing Foundation) |
| **Weekly downloads** | ~300K |
| **License** | MIT |
| **Supply chain risk** | Low — maintained by vis.gl team under Linux Foundation governance |
| **CVE history** | None known |
| **Risk score** | 2/5 (Low) |

**Why we use it:** Provides React bindings for MapLibre GL JS. Without it, we'd need to manually manage map lifecycle, DOM refs, and state synchronization between React and the imperative MapLibre API. This is the standard integration layer (~7,800 GitHub stars, used alongside MapLibre in most React projects).

**What it pulls in:** `@vis.gl/react-maplibre` (the MapLibre-specific adapter). Minimal.

---

## Dev-Only Dependencies

These are **never shipped to users**. They run only on developer machines during build/lint.

| Package | Purpose | Maintainer | Risk |
|---------|---------|-----------|------|
| `vite` v7.3 | Build tool, dev server, HMR | Evan You / Vite team | 1/5 |
| `@vitejs/plugin-react` v5.1 | React fast refresh in dev | Vite team | 1/5 |
| `typescript` v5.9 | Static type checking | Microsoft | 1/5 |
| `eslint` v9.39 | Code linting | OpenJS Foundation | 1/5 |
| `typescript-eslint` v8.48 | TypeScript lint rules | typescript-eslint org | 1/5 |
| `eslint-plugin-react-hooks` v7 | React hooks lint rules | Meta | 1/5 |
| `eslint-plugin-react-refresh` v0.4 | Fast refresh lint rules | Community | 2/5 |
| `globals` v16 | Global variable definitions for ESLint | Sindre Sorhus | 1/5 |
| `@eslint/js` v9.39 | ESLint core JS config | OpenJS Foundation | 1/5 |
| `@types/*` (4 packages) | TypeScript type definitions | DefinitelyTyped community | 1/5 |

---

## Risk Scoring

| Score | Meaning | Criteria |
|-------|---------|----------|
| 1/5 | Very Low | Major corporate/foundation maintainer, millions of downloads, long track record |
| 2/5 | Low | Active community, established project, broad adoption, good governance |
| 3/5 | Moderate | Smaller maintainer team, fewer downloads, but well-tested |
| 4/5 | Elevated | Single maintainer, limited adoption, or history of issues |
| 5/5 | High | Unmaintained, known vulnerabilities, or opaque supply chain |

---

## What We Avoided (and Why)

| Avoided Library | What We Did Instead | Lines of Code |
|----------------|-------------------|---------------|
| Fuse.js / Lunr (search) | Custom prefix/contains matcher | ~60 lines (`searchIndex.ts`) |
| react-i18next (i18n) | Translation object + `t()` function | ~110 lines (`i18n.ts`) |
| React Router (routing) | Hash-based routing in context | ~40 lines (`MapContext.tsx`) |
| Turf.js (geometry) | Raycasting point-in-polygon | ~50 lines (`pointInPolygon.ts`) |
| Zustand/Redux (state) | React Context + useState | Built into React |
| axios (HTTP) | Native `fetch()` | Built into browser |

Total custom code replacing 6 libraries: **~260 lines**. This eliminates ~500KB of bundle size and 6 additional supply chain risks.

---

## External Services (Not Dependencies)

These are runtime HTTP calls, not npm packages:

| Service | Data Sent | Privacy |
|---------|-----------|---------|
| ArcGIS FeatureServer (Ontario GIS) | None (GET request for boundary polygons) | No PII |
| Nominatim (OpenStreetMap) | Latitude/longitude only, on explicit user action | No PII, no API key |
| CartoDB tile server | Map viewport coordinates | No PII, no API key |

No analytics. No cookies. No user data leaves the browser except the above.

---

## Recommendations for Production

1. **Lock dependency versions** — Use `npm ci` with a committed `package-lock.json`
2. **Enable npm audit in CI** — Fail builds on moderate+ vulnerabilities
3. **Consider Subresource Integrity (SRI)** — For any CDN-loaded assets
4. **Pin ODS assets** — Currently loaded from `public/ods/`; version should be tracked
5. **Review quarterly** — Re-run `npm audit` and check for major version updates
