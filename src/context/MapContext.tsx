import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { FeatureCollection } from 'geojson';
import type { NormalizedPHU } from '../types/phu';
import { slugify } from '../utils/slugify';

type ViewMode = 'locator' | 'directory';
type ResultView = 'list' | 'map';

interface MapContextValue {
  selectedPHUId: number | null;
  hoveredPHUId: number | null;
  boundaryGeoJSON: FeatureCollection | null;
  viewMode: ViewMode;
  resultView: ResultView;
  selectedRegion: string | null;
  setSelectedPHU: (id: number | null) => void;
  setHoveredPHU: (id: number | null) => void;
  setBoundaryGeoJSON: (geojson: FeatureCollection) => void;
  setViewMode: (mode: ViewMode) => void;
  setResultView: (view: ResultView) => void;
  setSelectedRegion: (region: string | null) => void;
}

interface ParsedHash {
  view: ViewMode;
  resultView: ResultView;
  phuId: number | null;
  region: string | null;
}

function parseHash(phus: NormalizedPHU[]): ParsedHash {
  const raw = window.location.hash.slice(1);
  // Split on '?' to separate path from query params
  const [path, queryString] = raw.split('?');
  const params = new URLSearchParams(queryString || '');
  const region = params.get('region') || null;

  if (path === 'directory') return { view: 'directory', resultView: 'list', phuId: null, region: null };
  if (path.startsWith('phu/')) {
    const slug = path.slice(4);
    const phu = phus.find(p => slugify(p.name_en) === slug);
    if (phu) return { view: 'locator', resultView: 'map', phuId: phu.id, region: null };
  }
  if (path === 'list') return { view: 'locator', resultView: 'list', phuId: null, region };
  // '', 'map', or anything else → map view (default)
  return { view: 'locator', resultView: 'map', phuId: null, region };
}

function buildHash(resultView: ResultView, selectedPHUId: number | null, region: string | null, phus: NormalizedPHU[]): string {
  // Specific PHU selected → #phu/slug (takes priority)
  if (selectedPHUId !== null) {
    const phu = phus.find(p => p.id === selectedPHUId);
    if (phu) return `phu/${slugify(phu.name_en)}`;
  }
  // Always use explicit #map or #list so links are shareable
  const path = resultView === 'list' ? 'list' : 'map';
  if (region) return `${path}?region=${encodeURIComponent(region)}`;
  return path;
}

const MapContext = createContext<MapContextValue>({
  selectedPHUId: null,
  hoveredPHUId: null,
  boundaryGeoJSON: null,
  viewMode: 'locator',
  resultView: 'list',
  selectedRegion: null,
  setSelectedPHU: () => {},
  setHoveredPHU: () => {},
  setBoundaryGeoJSON: () => {},
  setViewMode: () => {},
  setResultView: () => {},
  setSelectedRegion: () => {},
});

export function MapProvider({ children, phus }: { children: ReactNode; phus: NormalizedPHU[] }) {
  const [selectedPHUId, setSelectedPHUId] = useState<number | null>(null);
  const [hoveredPHUId, setHoveredPHUId] = useState<number | null>(null);
  const [boundaryGeoJSON, setBoundaryGeoJSONState] = useState<FeatureCollection | null>(null);
  const [viewMode, setViewModeState] = useState<ViewMode>('locator');
  const [resultView, setResultViewState] = useState<ResultView>('list');
  const [selectedRegion, setSelectedRegionState] = useState<string | null>(null);

  // Guard to prevent hash → state → hash feedback loops
  const updatingFromHash = useRef(false);

  function applyHash(parsed: ParsedHash) {
    updatingFromHash.current = true;
    setViewModeState(parsed.view);
    setResultViewState(parsed.resultView);
    setSelectedPHUId(parsed.phuId);
    setSelectedRegionState(parsed.region);
    // Reset guard after React processes the state batch
    queueMicrotask(() => { updatingFromHash.current = false; });
  }

  // Sync hash → state on initial load
  useEffect(() => {
    if (phus.length === 0) return;
    applyHash(parseHash(phus));
  }, [phus]);

  // Sync state → hash (skipped when change originated from hash)
  useEffect(() => {
    if (phus.length === 0 || updatingFromHash.current) return;
    if (viewMode === 'directory') {
      window.location.hash = 'directory';
    } else {
      window.location.hash = buildHash(resultView, selectedPHUId, selectedRegion, phus);
    }
  }, [resultView, selectedPHUId, selectedRegion, viewMode, phus]);

  const setSelectedPHU = useCallback((id: number | null) => {
    setSelectedPHUId(id);
    if (id !== null) setSelectedRegionState(null);
  }, []);

  const setResultView = useCallback((view: ResultView) => {
    setResultViewState(view);
  }, []);

  const setSelectedRegion = useCallback((region: string | null) => {
    setSelectedRegionState(region);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
  }, []);

  // Listen for hash changes (back/forward)
  useEffect(() => {
    if (phus.length === 0) return;
    const onHashChange = () => {
      applyHash(parseHash(phus));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [phus]);

  const setHoveredPHU = useCallback((id: number | null) => setHoveredPHUId(id), []);
  const setBoundaryGeoJSON = useCallback((geojson: FeatureCollection) => setBoundaryGeoJSONState(geojson), []);

  return (
    <MapContext.Provider value={{
      selectedPHUId,
      hoveredPHUId,
      boundaryGeoJSON,
      viewMode,
      resultView,
      selectedRegion,
      setSelectedPHU,
      setHoveredPHU,
      setBoundaryGeoJSON,
      setViewMode,
      setResultView,
      setSelectedRegion,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  return useContext(MapContext);
}
