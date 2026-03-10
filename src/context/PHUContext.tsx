import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { NormalizedPHU } from '../types/phu';
import { normalizePHUs } from '../utils/normalizeData';
import rawData from '../data/ontario_public_health_units.json';

interface PHUContextValue {
  phus: NormalizedPHU[];
  isLoading: boolean;
  error: string | null;
}

const PHUContext = createContext<PHUContextValue>({
  phus: [],
  isLoading: false,
  error: null,
});

export function PHUProvider({ children }: { children: ReactNode }) {
  const phus = useMemo(() => normalizePHUs((rawData as any).public_health_units), []);

  return (
    <PHUContext.Provider value={{ phus, isLoading: false, error: null }}>
      {children}
    </PHUContext.Provider>
  );
}

export function usePHUs() {
  return useContext(PHUContext);
}
