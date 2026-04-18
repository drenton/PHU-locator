import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
  setSelectedPHU: (id: number | null) => void;
  setHoveredPHU: (id: number | null) => void;
  setBoundaryGeoJSON: (geojson: FeatureCollection) => void;
  setViewMode: (mode: ViewMode) => void;
  setResultView: (view: ResultView) => void;
}

function parseHash(phus: NormalizedPHU[]): { view: ViewMode; phuId: number | null } {
  const hash = window.location.hash.slice(1);
  if (hash === 'directory') return { view: 'directory', phuId: null };
  if (hash.startsWith('phu/')) {
    const slug = hash.slice(4);
    const phu = phus.find(p => slugify(p.name_en) === slug);
    if (phu) return { view: 'locator', phuId: phu.id };
  }
  return { view: 'locator', phuId: null };
}

const MapContext = createContext<MapContextValue>({
  selectedPHUId: null,
  hoveredPHUId: null,
  boundaryGeoJSON: null,
  viewMode: 'locator',
  resultView: 'list',
  setSelectedPHU: () => {},
  setHoveredPHU: () => {},
  setBoundaryGeoJSON: () => {},
  setViewMode: () => {},
  setResultView: () => {},
});

export function MapProvider({ children, phus }: { children: ReactNode; phus: NormalizedPHU[] }) {
  const [selectedPHUId, setSelectedPHUId] = useState<number | null>(null);
  const [hoveredPHUId, setHoveredPHUId] = useState<number | null>(null);
  const [boundaryGeoJSON, setBoundaryGeoJSONState] = useState<FeatureCollection | null>(null);
  const [viewMode, setViewModeState] = useState<ViewMode>('locator');
  const [resultView, setResultView] = useState<ResultView>('map');

  // Parse hash once PHUs are loaded
  useEffect(() => {
    if (phus.length === 0) return;
    const { view, phuId } = parseHash(phus);
    setViewModeState(view);
    setSelectedPHUId(phuId);
  }, [phus]);

  const setSelectedPHU = useCallback((id: number | null) => {
    setSelectedPHUId(id);
    if (id !== null) {
      const phu = phus.find(p => p.id === id);
      if (phu) {
        window.location.hash = `phu/${slugify(phu.name_en)}`;
      }
    } else {
      window.location.hash = '';
    }
  }, [phus]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (mode === 'directory') {
      window.location.hash = 'directory';
    } else {
      window.location.hash = '';
    }
  }, []);

  // Listen for hash changes (back/forward)
  useEffect(() => {
    if (phus.length === 0) return;
    const onHashChange = () => {
      const { view, phuId } = parseHash(phus);
      setViewModeState(view);
      setSelectedPHUId(phuId);
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
      setSelectedPHU,
      setHoveredPHU,
      setBoundaryGeoJSON,
      setViewMode,
      setResultView,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  return useContext(MapContext);
}
