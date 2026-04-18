// Maps ArcGIS PHU_ID values to our normalized PHU data indices.
// PHU_IDs come from the MOH_PHU_BOUNDARY FeatureServer.
// We need to build this mapping dynamically by matching NAME_ENG from ArcGIS
// to ontario_ca_name or phu_locator_names in our data.

import type { NormalizedPHU } from '../types/phu';

function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function buildBoundaryToDataMap(
  phus: NormalizedPHU[],
  boundaryFeatures: Array<{ properties: { PHU_ID: number; NAME_ENG: string } }>
): Map<number, number> {
  const map = new Map<number, number>();

  for (const feature of boundaryFeatures) {
    const { PHU_ID, NAME_ENG } = feature.properties;
    const nameNorm = normalizeForMatch(NAME_ENG);

    // Try direct match on ontario_ca_name
    let matched = false;
    for (const phu of phus) {
      if (normalizeForMatch(phu.name_en) === nameNorm) {
        map.set(PHU_ID, phu.id);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try matching against phu_locator_names (for merged PHUs)
      for (const phu of phus) {
        for (const altName of phu.phu_locator_names) {
          if (normalizeForMatch(altName) === nameNorm) {
            map.set(PHU_ID, phu.id);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }

    if (!matched) {
      // Try partial match - boundary name contained in PHU name or vice versa
      for (const phu of phus) {
        const phuNorm = normalizeForMatch(phu.name_en);
        if (phuNorm.includes(nameNorm) || nameNorm.includes(phuNorm)) {
          map.set(PHU_ID, phu.id);
          matched = true;
          break;
        }
        // Check if boundary name matches a "Formerly ..." portion
        for (const altName of phu.phu_locator_names) {
          const altNorm = normalizeForMatch(altName);
          if (altNorm.includes(nameNorm) || nameNorm.includes(altNorm)) {
            map.set(PHU_ID, phu.id);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }
  }

  return map;
}

// Reverse map: given a PHU data id, find all boundary PHU_IDs
export function getRelatedBoundaryIds(
  phuDataId: number,
  boundaryToData: Map<number, number>
): number[] {
  const ids: number[] = [];
  for (const [boundaryId, dataId] of boundaryToData) {
    if (dataId === phuDataId) {
      ids.push(boundaryId);
    }
  }
  return ids;
}
