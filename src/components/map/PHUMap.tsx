import { useCallback, useRef, useEffect, useState } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import type { FeatureCollection } from 'geojson';
import type { Language } from '../../types/phu';
import { getRelatedBoundaryIds } from '../../utils/boundaryMapping';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
// Ontario bounds: SW corner to NE corner
const ONTARIO_BOUNDS: [[number, number], [number, number]] = [[-95.2, 41.7], [-74.3, 56.9]];

interface PHUMapProps {
  geojson: FeatureCollection | null;
  boundaryToData: Map<number, number>;
  selectedPHUId: number | null;
  hoveredPHUId: number | null;
  lang: Language;
  onSelectPHU: (id: number) => void;
  onHoverPHU: (id: number | null) => void;
}

export function PHUMap({
  geojson,
  boundaryToData,
  selectedPHUId,
  hoveredPHUId: _hoveredPHUId,
  lang,
  onSelectPHU,
  onHoverPHU,
}: PHUMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupInfo, setPopupInfo] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const hoveredFeatureId = useRef<number | null>(null);
  const didFitInitial = useRef(false);

  // Fit to Ontario bounds on load
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map || didFitInitial.current) return;
    didFitInitial.current = true;
    const isDesktop = window.innerWidth >= 640;
    map.fitBounds(ONTARIO_BOUNDS, {
      padding: { top: 20, bottom: 20, left: isDesktop ? 440 : 20, right: 20 },
      duration: 0,
    });
    setMapReady(true);
  }, []);

  // Zoom to selected PHU boundary
  useEffect(() => {
    if (!mapReady || !mapRef.current || !geojson) return;

    // Clear all selections and zoom back to Ontario when nothing is selected
    if (selectedPHUId === null) {
      const map = mapRef.current.getMap();
      if (map.getSource('phu-boundaries')) {
        for (const feature of geojson.features) {
          const fid = feature.properties?.PHU_ID;
          if (fid == null) continue;
          map.setFeatureState(
            { source: 'phu-boundaries', id: fid },
            { selected: false }
          );
        }
      }
      const isDesktop = window.innerWidth >= 640;
      map.fitBounds(ONTARIO_BOUNDS, {
        padding: { top: 20, bottom: 20, left: isDesktop ? 440 : 20, right: 20 },
        duration: 800,
      });
      return;
    }

    const map = mapRef.current.getMap();
    const relatedIds = getRelatedBoundaryIds(selectedPHUId, boundaryToData);

    // Find bounds of all related features
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const feature of geojson.features) {
      const phuId = feature.properties?.PHU_ID;
      if (!relatedIds.includes(phuId)) continue;

      const coords = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates.flat()
        : feature.geometry.type === 'MultiPolygon'
          ? feature.geometry.coordinates.flat(2)
          : [];

      for (const [lng, lat] of coords as [number, number][]) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    }

    if (minLng !== Infinity) {
      const isDesktop = window.innerWidth >= 640;
      map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
        padding: { top: 60, bottom: 60, left: isDesktop ? 480 : 60, right: 60 },
        maxZoom: 10,
        duration: 800,
      });
    }

    // Update feature state for selection — poll until source exists
    let cancelled = false;
    const applySelection = () => {
      if (cancelled) return;
      if (!map.getSource('phu-boundaries')) {
        requestAnimationFrame(applySelection);
        return;
      }
      for (const feature of geojson.features) {
        const fid = feature.properties?.PHU_ID;
        if (fid == null) continue;
        const dataId = boundaryToData.get(fid);
        map.setFeatureState(
          { source: 'phu-boundaries', id: fid },
          { selected: dataId === selectedPHUId }
        );
      }
    };
    applySelection();

    return () => { cancelled = true; };
  }, [selectedPHUId, geojson, boundaryToData, mapReady]);

  const onMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const phuId = feature.properties?.PHU_ID;

      // Clear previous hover
      if (hoveredFeatureId.current !== null && hoveredFeatureId.current !== phuId) {
        map.setFeatureState(
          { source: 'phu-boundaries', id: hoveredFeatureId.current },
          { hover: false }
        );
      }

      hoveredFeatureId.current = phuId;
      map.setFeatureState(
        { source: 'phu-boundaries', id: phuId },
        { hover: true }
      );

      const dataId = boundaryToData.get(phuId);
      if (dataId !== undefined) onHoverPHU(dataId);

      const name = lang === 'fr'
        ? feature.properties?.NAME_FR
        : feature.properties?.NAME_ENG;

      setPopupInfo({ lng: e.lngLat.lng, lat: e.lngLat.lat, name: name || '' });
      map.getCanvas().style.cursor = 'pointer';
    }
  }, [boundaryToData, lang, onHoverPHU]);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    if (hoveredFeatureId.current !== null) {
      map.setFeatureState(
        { source: 'phu-boundaries', id: hoveredFeatureId.current },
        { hover: false }
      );
      hoveredFeatureId.current = null;
    }
    onHoverPHU(null);
    setPopupInfo(null);
    map.getCanvas().style.cursor = '';
  }, [onHoverPHU]);

  const onClick = useCallback((e: MapLayerMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const phuId = e.features[0].properties?.PHU_ID;
      const dataId = boundaryToData.get(phuId);
      if (dataId !== undefined) onSelectPHU(dataId);
    }
  }, [boundaryToData, onSelectPHU]);

  return (
    <div className="phu-map">
      <Map
        ref={mapRef}
        initialViewState={{
          bounds: ONTARIO_BOUNDS,
          fitBoundsOptions: { padding: 20 },
        }}
        onLoad={onMapLoad}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={geojson ? ['phu-fill'] : []}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <NavigationControl position="top-right" />

        {geojson && (
          <Source
            id="phu-boundaries"
            type="geojson"
            data={geojson}
            promoteId="PHU_ID"
          >
            <Layer
              id="phu-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  '#79b7b7',
                  ['boolean', ['feature-state', 'hover'], false],
                  'rgba(51, 153, 153, 0.25)',
                  '#b3d6d5',
                ],
                'fill-opacity': 1,
              }}
            />
            <Layer
              id="phu-border"
              type="line"
              paint={{
                'line-color': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  '#339999',
                  '#8dc1c1',
                ],
                'line-width': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  5,
                  1,
                ],
              }}
            />
            <Layer
              id="phu-label"
              type="symbol"
              minzoom={7}
              layout={{
                'text-field': lang === 'fr' ? ['get', 'NAME_FR'] : ['get', 'NAME_ENG'],
                'text-size': 12,
                'text-anchor': 'center',
                'text-max-width': 10,
              }}
              paint={{
                'text-color': '#1a1a1a',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5,
              }}
            />
          </Source>
        )}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            className="phu-map__popup"
          >
            <strong>{popupInfo.name}</strong>
          </Popup>
        )}
      </Map>
    </div>
  );
}
