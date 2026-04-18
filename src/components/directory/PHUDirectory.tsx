import { useState, useMemo } from 'react';
import type { NormalizedPHU, Language } from '../../types/phu';
import { PHUCard } from '../cards/PHUCard';
import { RegionFilter } from './RegionFilter';
import { t } from '../../utils/i18n';
import { slugify } from '../../utils/slugify';

interface PHUDirectoryProps {
  phus: NormalizedPHU[];
  lang: Language;
}

export function PHUDirectory({ phus, lang }: PHUDirectoryProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!selectedRegion) return phus;
    return phus.filter((p) => p.region_en === selectedRegion);
  }, [phus, selectedRegion]);

  return (
    <div className="phu-directory">
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12">
          <h1 className="ontario-h1">{t('browseAll', lang)}</h1>
          <RegionFilter
            phus={phus}
            lang={lang}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
          />
          <p className="phu-directory__count">
            {t('showing', lang, { count: filtered.length, total: phus.length })}
          </p>
          <div className="phu-directory__grid">
            {filtered.map((phu) => (
              <a key={phu.id} href={`#phu/${slugify(phu.name_en)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <PHUCard
                  phu={phu}
                  lang={lang}
                  isSelected={false}
                  onSelect={() => {}}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
