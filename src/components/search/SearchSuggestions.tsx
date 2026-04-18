import type { SearchResult } from '../../utils/searchIndex';
import type { Language } from '../../types/phu';
import { t } from '../../utils/i18n';

interface SearchSuggestionsProps {
  results: SearchResult[];
  lang: Language;
  activeIndex: number;
  onSelect: (phuId: number) => void;
  query: string;
}

function highlightMatch(text: string, query: string): React.ReactElement {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}

function typeBadge(type: string, lang: Language) {
  const labels: Record<string, string> = {
    municipality: t('municipality', lang),
    phu: t('healthUnit', lang),
    region: t('region', lang),
  };
  return <span className={`search-suggestion__badge search-suggestion__badge--${type}`}>{labels[type] || type}</span>;
}

export function SearchSuggestions({ results, lang, activeIndex, onSelect, query }: SearchSuggestionsProps) {
  if (results.length === 0) return null;

  return (
    <ul className="search-suggestions" role="listbox" id="search-suggestions">
      {results.map((result, index) => (
        <li
          key={`${result.item.phuId}-${result.item.text}`}
          role="option"
          aria-selected={index === activeIndex}
          className={`search-suggestions__item ${index === activeIndex ? 'search-suggestions__item--active' : ''}`}
          onClick={() => onSelect(result.item.phuId)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="search-suggestions__content">
            <span className="search-suggestions__text">
              {highlightMatch(result.item.displayLabel, query)}
            </span>
            {result.item.type === 'municipality' && (
              <span className="search-suggestions__phu-name">{result.item.phuName}</span>
            )}
          </div>
          {typeBadge(result.item.type, lang)}
        </li>
      ))}
    </ul>
  );
}
