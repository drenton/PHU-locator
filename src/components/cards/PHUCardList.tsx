import type { NormalizedPHU, Language } from '../../types/phu';
import { PHUCard } from './PHUCard';
import { t } from '../../utils/i18n';

interface PHUCardListProps {
  filteredPHUs: NormalizedPHU[];
  lang: Language;
  selectedPHUId: number | null;
  onSelectPHU: (id: number) => void;
}

export function PHUCardList({ filteredPHUs, lang, selectedPHUId, onSelectPHU }: PHUCardListProps) {
  return (
    <div className="phu-results__list">
      {filteredPHUs.map((phu) => (
        <PHUCard
          key={phu.id}
          phu={phu}
          lang={lang}
          isSelected={selectedPHUId === phu.id}
          onSelect={onSelectPHU}
        />
      ))}
      {filteredPHUs.length === 0 && (
        <p className="phu-card-list__empty">{t('noResults', lang)}</p>
      )}
    </div>
  );
}
