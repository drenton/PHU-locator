import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { NormalizedPHU, Language } from '../types/phu';
import { buildSearchIndex, search, isPostalCode, type SearchResult } from '../utils/searchIndex';
import { geocodePostalCode, reverseGeocode } from '../utils/geocode';
import { findPHUAtPoint } from '../utils/pointInPolygon';
import { t } from '../utils/i18n';
import type { FeatureCollection } from 'geojson';

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isLocating: boolean;
  postalCodeError: string | null;
  handleSelect: (phuId: number) => void;
  handleSearch: () => void;
  handleUseLocation: () => void;
  clearSearch: () => void;
}

export function useSearch(
  phus: NormalizedPHU[],
  lang: Language,
  boundaryGeoJSON: FeatureCollection,
  boundaryToData: Map<number, number>,
  onSelectPHU: (phuId: number) => void
): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const locationResultRef = useRef<{ dataId: number; coords: { lat: number; lon: number } } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const index = useMemo(() => buildSearchIndex(phus, lang), [phus, lang]);

  // Typeahead: only text search (not postal codes, not while locating)
  useEffect(() => {
    if (isLocating) return;
    setPostalCodeError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || isPostalCode(query.trim())) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const searchResults = search(query, index);
      setResults(searchResults);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, index, isLocating]);

  // Select a PHU (from suggestion click → then search button)
  const handleSelect = useCallback((phuId: number) => {
    setResults([]);
    onSelectPHU(phuId);
  }, [onSelectPHU]);

  // Search button click: handle postal codes and pending location results
  const handleSearch = useCallback(() => {
    const q = query.trim();
    if (!q) return;

    setPostalCodeError(null);

    // If "Use my location" already resolved a PHU, select it now
    if (locationResultRef.current) {
      const { dataId } = locationResultRef.current;
      locationResultRef.current = null;
      onSelectPHU(dataId);
      return;
    }

    if (isPostalCode(q)) {
      const coords = geocodePostalCode(q);
      if (!coords) {
        setPostalCodeError('postalCodeError');
        return;
      }

      const feature = findPHUAtPoint(coords.lon, coords.lat, boundaryGeoJSON);
      if (!feature) {
        setPostalCodeError('postalCodeNotOntario');
        return;
      }

      const phuBoundaryId = feature.properties?.PHU_ID;
      const dataId = boundaryToData.get(phuBoundaryId);
      if (dataId !== undefined) {
        onSelectPHU(dataId);
      }
    }
  }, [query, boundaryGeoJSON, boundaryToData, onSelectPHU]);

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPostalCodeError('locationNotSupported');
      return;
    }

    setPostalCodeError(null);
    setIsLocating(true);
    setQuery(t('locating', lang));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        const feature = findPHUAtPoint(longitude, latitude, boundaryGeoJSON);
        if (!feature) {
          setIsLocating(false);
          setQuery('');
          setPostalCodeError('locationNotOntario');
          return;
        }
        const phuBoundaryId = feature.properties?.PHU_ID;
        const dataId = boundaryToData.get(phuBoundaryId);
        if (dataId !== undefined) {
          // Reverse geocode to get a place name, store result for Search button
          const placeName = await reverseGeocode(latitude, longitude);
          locationResultRef.current = { dataId, coords: { lat: latitude, lon: longitude } };
          setIsLocating(false);
          setQuery(placeName || t('yourLocation', lang));
        } else {
          setIsLocating(false);
          setQuery('');
        }
      },
      (error) => {
        setIsLocating(false);
        setQuery('');
        if (error.code === error.PERMISSION_DENIED) {
          setPostalCodeError('locationDenied');
        } else {
          setPostalCodeError('locationError');
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, [boundaryGeoJSON, boundaryToData, lang]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setPostalCodeError(null);
    locationResultRef.current = null;
  }, []);

  return { query, setQuery, results, isLocating, postalCodeError, handleSelect, handleSearch, handleUseLocation, clearSearch };
}
