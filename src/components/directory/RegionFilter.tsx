import type { NormalizedPHU, Language } from '../../types/phu';
import { t } from '../../utils/i18n';

interface RegionFilterProps {
  phus: NormalizedPHU[];
  lang: Language;
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

export function RegionFilter({ phus, lang, selectedRegion, onSelectRegion }: RegionFilterProps) {
  const regions = Array.from(
    new Set(phus.map((p) => (lang === 'fr' ? p.region_fr : p.region_en)))
  ).sort();

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
        {regions.map((region) => (
          <button
            key={region}
            className={`ontario-badge ${selectedRegion === region ? 'ontario-badge--default-heavy' : 'ontario-badge--neutral-light'} phu-filter-badge`}
            onClick={() => onSelectRegion(region)}
            aria-pressed={selectedRegion === region}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}
