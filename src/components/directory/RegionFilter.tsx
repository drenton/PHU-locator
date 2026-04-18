import { useMemo } from 'react';
import type { NormalizedPHU, Language } from '../../types/phu';
import { t } from '../../utils/i18n';

interface RegionFilterProps {
  phus: NormalizedPHU[];
  lang: Language;
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

export function RegionFilter({ phus, lang, selectedRegion, onSelectRegion }: RegionFilterProps) {
  // Build list of regions: { key: english name (stable), label: localized name }
  const regions = useMemo(() => {
    const seen = new Set<string>();
    const list: { key: string; label: string }[] = [];
    for (const p of phus) {
      if (!seen.has(p.region_en)) {
        seen.add(p.region_en);
        list.push({ key: p.region_en, label: lang === 'fr' ? p.region_fr : p.region_en });
      }
    }
    return list.sort((a, b) => a.label.localeCompare(b.label));
  }, [phus, lang]);

  return (
    <div className="phu-region-filter" role="group" aria-label={t('filterByRegion', lang)}>
      <p className="phu-region-filter__label">{t('filterByRegion', lang)}</p>
      <div className="phu-region-filter__buttons">
        <button
          className={`ontario-badge ${selectedRegion === null ? 'ontario-badge--default-heavy' : 'ontario-badge--neutral-light'} phu-filter-badge`}
          onClick={() => onSelectRegion(null)}
          aria-pressed={selectedRegion === null}
        >
          {t('allRegions', lang)}
        </button>
        {regions.map(({ key, label }) => (
          <button
            key={key}
            className={`ontario-badge ${selectedRegion === key ? 'ontario-badge--default-heavy' : 'ontario-badge--neutral-light'} phu-filter-badge`}
            onClick={() => onSelectRegion(key)}
            aria-pressed={selectedRegion === key}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
