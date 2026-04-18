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
    <div className="phu-region-filter">
      <p className="phu-region-filter__label">{t('filterByRegion', lang)}</p>
      <div className="phu-region-filter__buttons">
        <button
          className={`phu-filter-btn ${selectedRegion === null ? 'phu-filter-btn--active' : ''}`}
          onClick={() => onSelectRegion(null)}
        >
          {t('allRegions', lang)}
        </button>
        {regions.map((region) => (
          <button
            key={region}
            className={`phu-filter-btn ${selectedRegion === region ? 'phu-filter-btn--active' : ''}`}
            onClick={() => onSelectRegion(region)}
          >
            {region}
          </button>
        ))}
      </div>
    </div>
  );
}
