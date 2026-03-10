import type { NormalizedPHU, SearchItem, Language } from '../types/phu';

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function buildSearchIndex(phus: NormalizedPHU[], lang: Language): SearchItem[] {
  const items: SearchItem[] = [];
  const seenRegions = new Set<string>();

  for (const phu of phus) {
    const phuName = lang === 'fr' ? phu.name_fr : phu.name_en;
    const municipalities = lang === 'fr' ? phu.municipalities_fr : phu.municipalities_en;
    const region = lang === 'fr' ? phu.region_fr : phu.region_en;

    // Add PHU name
    items.push({
      text: phuName,
      textNormalized: normalize(phuName),
      type: 'phu',
      phuId: phu.id,
      displayLabel: phuName,
      phuName,
    });

    // Add alternate/locator names
    for (const altName of phu.phu_locator_names) {
      if (normalize(altName) !== normalize(phuName)) {
        items.push({
          text: altName,
          textNormalized: normalize(altName),
          type: 'phu',
          phuId: phu.id,
          displayLabel: `${altName} (${phuName})`,
          phuName,
        });
      }
    }

    // Add municipalities
    for (const muni of municipalities) {
      items.push({
        text: muni,
        textNormalized: normalize(muni),
        type: 'municipality',
        phuId: phu.id,
        displayLabel: muni,
        phuName,
      });
    }

    // Add region (once per unique region)
    if (!seenRegions.has(region)) {
      seenRegions.add(region);
      // Region maps to multiple PHUs, but we'll show all matches
      items.push({
        text: region,
        textNormalized: normalize(region),
        type: 'region',
        phuId: phu.id,
        displayLabel: region,
        phuName,
      });
    }
  }

  return items;
}

export interface SearchResult {
  item: SearchItem;
  matchType: 'prefix' | 'word-boundary' | 'contains';
}

export function search(query: string, index: SearchItem[], maxResults = 8): SearchResult[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];

  const prefixMatches: SearchResult[] = [];
  const wordBoundaryMatches: SearchResult[] = [];
  const containsMatches: SearchResult[] = [];
  const seen = new Set<string>();

  for (const item of index) {
    // Dedup by display label + phuId
    const key = `${item.displayLabel}::${item.phuId}`;
    if (seen.has(key)) continue;

    if (item.textNormalized.startsWith(q)) {
      seen.add(key);
      prefixMatches.push({ item, matchType: 'prefix' });
    } else if (item.textNormalized.split(/[\s,\-()]+/).some(word => word.startsWith(q))) {
      seen.add(key);
      wordBoundaryMatches.push({ item, matchType: 'word-boundary' });
    } else if (item.textNormalized.includes(q)) {
      seen.add(key);
      containsMatches.push({ item, matchType: 'contains' });
    }
  }

  // Sort each group alphabetically, then combine
  const sortAlpha = (a: SearchResult, b: SearchResult) => a.item.text.localeCompare(b.item.text);
  prefixMatches.sort(sortAlpha);
  wordBoundaryMatches.sort(sortAlpha);
  containsMatches.sort(sortAlpha);

  return [...prefixMatches, ...wordBoundaryMatches, ...containsMatches].slice(0, maxResults);
}

export function isPostalCode(input: string): boolean {
  const s = input.trim();
  // Match FSA (e.g. "M5V") or full postal code (e.g. "M5V 2T6")
  return /^[A-Za-z]\d[A-Za-z](\s?\d[A-Za-z]\d)?$/.test(s);
}
