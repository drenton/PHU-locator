import { useMemo } from 'react';
import type { FeatureCollection } from 'geojson';
import type { NormalizedPHU } from '../types/phu';
import { buildBoundaryToDataMap } from '../utils/boundaryMapping';
import boundaryData from '../data/phu_boundaries.json';

interface UseBoundaryReturn {
  geojson: FeatureCollection;
  boundaryToData: Map<number, number>;
  isLoading: boolean;
  error: string | null;
}

export function useBoundaryData(phus: NormalizedPHU[]): UseBoundaryReturn {
  const geojson = boundaryData as unknown as FeatureCollection;

  const boundaryToData = useMemo(() => {
    if (phus.length === 0) return new Map<number, number>();
    return buildBoundaryToDataMap(phus, geojson.features as any);
  }, [phus, geojson]);

  return {
    geojson,
    boundaryToData,
    isLoading: false,
    error: null,
  };
}
