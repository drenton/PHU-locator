import type { NormalizedPHU, Language } from '../../types/phu';
import { t } from '../../utils/i18n';

interface PHUCardProps {
  phu: NormalizedPHU;
  lang: Language;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

function formatAddress(address: string): string[] {
  // Split on ", ON " to separate street parts from province+postal
  const onSplit = address.split(/, ON /i);
  if (onSplit.length < 2) return [address];
  const streetParts = onSplit[0].split(', ');
  const provPostal = 'ON ' + onSplit[1];
  // Line 1: street, Line 2+ : PO Box/suite/city, Last line: city, ON POSTAL
  // The last part of streetParts is the city
  if (streetParts.length === 1) {
    return [streetParts[0], provPostal];
  }
  const city = streetParts.pop()!;
  return [...streetParts, `${city}, ${provPostal}`];
}

export function PHUCard({ phu, lang, isSelected, onSelect }: PHUCardProps) {
  const name = lang === 'fr' ? phu.name_fr : phu.name_en;
  const address = lang === 'fr' ? phu.address_fr : phu.address_en;
  const addressLines = address ? formatAddress(address) : [];
  const region = lang === 'fr' ? phu.region_fr : phu.region_en;

  // If after-hours is same as phone, show "All hours" note instead of duplicating
  const afterHoursSameAsPhone = phu.after_hours && phu.after_hours === phu.phone;

  return (
    <div
      className={`phu-card ${isSelected ? 'phu-card--selected' : ''}`}
      onClick={() => onSelect(phu.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(phu.id); }}
      aria-label={name}
    >
      <div className="phu-card__header">
        <h3 className="phu-card__name">{name}</h3>
        <span className="phu-card__region">{region}</span>
      </div>

      <div className="phu-card__contact">
        {phu.phone && (
          <div className="phu-card__field phu-card__field--phone">
            <span className="phu-card__label">{t('phone', lang)}{afterHoursSameAsPhone && <span className="phu-card__note"> — {t('allHours', lang)}</span>}</span>
            <div className="phu-card__numbers">
              <a href={`tel:${phu.phone.replace(/[^\d+]/g, '')}`} className="phu-card__phone-link">
                {phu.phone}
              </a>
              {phu.phone_alt && (
                <a href={`tel:${phu.phone_alt.replace(/[^\d+]/g, '')}`} className="phu-card__phone-link">
                  {phu.phone_alt}
                </a>
              )}
            </div>
          </div>
        )}

        {phu.toll_free && (
          <div className="phu-card__field">
            <span className="phu-card__label">{t('tollFree', lang)}</span>
            <a href={`tel:${phu.toll_free.replace(/[^\d+]/g, '')}`}>{phu.toll_free}</a>
          </div>
        )}

        {!afterHoursSameAsPhone && phu.after_hours && (
          <div className="phu-card__field phu-card__field--after-hours">
            <span className="phu-card__label">{t('afterHours', lang)}</span>
            <div className="phu-card__numbers">
              <span>
                <a href={`tel:${phu.after_hours.replace(/[^\d+]/g, '')}`}>{phu.after_hours}</a>
                {phu.after_hours_note && <span className="phu-card__note"> ({phu.after_hours_note})</span>}
              </span>
              {phu.after_hours_alt && (
                <a href={`tel:${phu.after_hours_alt.replace(/[^\d+]/g, '')}`}>{phu.after_hours_alt}</a>
              )}
              {phu.after_hours_toll_free && (
                <a href={`tel:${phu.after_hours_toll_free.replace(/[^\d+]/g, '')}`}>{phu.after_hours_toll_free}</a>
              )}
            </div>
          </div>
        )}

        {addressLines.length > 0 && (
          <div className="phu-card__field">
            <span className="phu-card__label">{t('address', lang)}</span>
            <span>{addressLines.map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}</span>
          </div>
        )}

        {phu.website && (
          <div className="phu-card__field">
            <a href={phu.website} target="_blank" rel="noopener noreferrer" className="phu-card__website">
              {t('visitWebsite', lang)}
              <svg className="ontario-icon phu-card__external-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <use xlinkHref="#ontario-icon-new-window" />
              </svg>
            </a>
          </div>
        )}

        {phu.fax && (
          <div className="phu-card__field phu-card__field--secondary">
            <span className="phu-card__label">{t('fax', lang)}</span>
            <span>{phu.fax}</span>
          </div>
        )}

        {phu.fax_animal_exposure && (
          <div className="phu-card__field phu-card__field--secondary">
            <span className="phu-card__label">{t('faxAnimalExposure', lang)}</span>
            <span>{phu.fax_animal_exposure}</span>
          </div>
        )}

        {phu.moh && (
          <div className="phu-card__field phu-card__field--secondary">
            <span className="phu-card__label">{t('moh', lang)}</span>
            <span>{phu.moh}</span>
          </div>
        )}
      </div>
    </div>
  );
}
