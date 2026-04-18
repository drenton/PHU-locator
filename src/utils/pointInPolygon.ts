import type { FeatureCollection, Feature, Polygon, MultiPolygon, Position } from 'geojson';

function pointInRing(point: [number, number], ring: Position[]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(point: [number, number], polygon: Position[][]): boolean {
  // First ring is the outer boundary, subsequent are holes
  if (!pointInRing(point, polygon[0])) return false;
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false; // Inside a hole
  }
  return true;
}

export function findPHUAtPoint(
  lon: number,
  lat: number,
  geojson: FeatureCollection
): Feature | null {
  const point: [number, number] = [lon, lat];

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (geom.type === 'Polygon') {
      if (pointInPolygon(point, (geom as Polygon).coordinates)) {
        return feature;
      }
    } else if (geom.type === 'MultiPolygon') {
      for (const polygon of (geom as MultiPolygon).coordinates) {
        if (pointInPolygon(point, polygon)) {
          return feature;
        }
      }
    }
  }

  return null;
}
