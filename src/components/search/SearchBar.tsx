import { useState, useRef } from 'react';
import type { SearchResult } from '../../utils/searchIndex';
import type { Language } from '../../types/phu';
import { t } from '../../utils/i18n';
import { SearchSuggestions } from './SearchSuggestions';

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  lang: Language;
  isLocating: boolean;
  isFiltered: boolean;
  postalCodeError: string | null;
  onSelect: (phuId: number) => void;
  onClear: () => void;
  onSearch: () => void;
  onUseLocation: () => void;
}

export function SearchBar({
  query,
  setQuery,
  results,
  lang,
  isLocating,
  isFiltered,
  postalCodeError,
  onSelect,
  onClear,
  onSearch,
  onUseLocation,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingPhuId, setPendingPhuId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showSuggestions = isFocused && results.length > 0 && query.length >= 2;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showSuggestions && activeIndex >= 0) {
        const item = results[activeIndex].item;
        setQuery(item.displayLabel);
        setPendingPhuId(item.phuId);
        setIsFocused(false);
      }
      if (pendingPhuId !== null) {
        onSelect(pendingPhuId);
        setPendingPhuId(null);
      } else {
        onSearch();
      }
      return;
    }

    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (phuId: number) => {
    const result = results.find(r => r.item.phuId === phuId);
    if (result) {
      setQuery(result.item.displayLabel);
      setPendingPhuId(phuId);
    }
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const handleSearchClick = () => {
    if (pendingPhuId !== null) {
      onSelect(pendingPhuId);
      setPendingPhuId(null);
    } else {
      onSearch();
    }
  };

  return (
    <div className="phu-search">
      <label className="ontario-label" htmlFor="phu-search-input">
        {t('searchLabel', lang)}
      </label>
      <p className="ontario-hint" id="phu-search-hint">
        {t('searchHint', lang)}
      </p>

      <div className="phu-search__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          name="search"
          id="phu-search-input"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={showSuggestions ? 'search-suggestions' : undefined}
          aria-expanded={showSuggestions}
          aria-describedby="phu-search-hint"
          className={`ontario-input ${isLocating ? 'phu-search__input--loading' : ''}`}
          placeholder={t('searchPlaceholder', lang)}
          value={query}
          readOnly={isLocating}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setIsFocused(true);
            setPendingPhuId(null);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {query && !isLocating && (
          <button
            type="button"
            className="phu-search__input-clear"
            aria-label={t('clearSearch', lang)}
            onClick={() => {
              setQuery('');
              setPendingPhuId(null);
              inputRef.current?.focus();
            }}
          >
            <svg className="ontario-icon" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
              <use xlinkHref="#ontario-icon-close" />
            </svg>
          </button>
        )}

        {showSuggestions && (
          <SearchSuggestions
            results={results}
            lang={lang}
            activeIndex={activeIndex}
            onSelect={handleSuggestionClick}
            query={query}
          />
        )}
      </div>

      <button
        type="button"
        className="phu-search__location-btn"
        onClick={onUseLocation}
        disabled={isLocating}
      >
        <svg className="ontario-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
          <use xlinkHref="#ontario-icon-location-on" />
        </svg>
        {t('useMyLocation', lang)}
      </button>

      <div className="phu-search__actions">
        <button
          type="button"
          className="ontario-button ontario-button--primary phu-search__btn"
          onClick={handleSearchClick}
        >
          {t('searchButton', lang)}
        </button>

        {isFiltered && (
          <button
            type="button"
            className="phu-search__clear-all"
            onClick={() => {
              onClear();
              setPendingPhuId(null);
            }}
          >
            <svg className="ontario-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
              <use xlinkHref="#ontario-icon-close" />
            </svg>
            {t('clearSearch', lang)}
          </button>
        )}
      </div>

      {postalCodeError && (
        <div className="ontario-alert ontario-alert--error phu-search__error" role="alert">
          <div className="ontario-alert__header">
            <div className="ontario-alert__header-icon">
              <svg className="ontario-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <use xlinkHref="#ontario-icon-alert-error" />
              </svg>
            </div>
            <h2 className="ontario-alert__header-title ontario-h4">
              {t('postalCodeErrorTitle', lang)}
            </h2>
          </div>
          <div className="ontario-alert__body">
            <p>{t(postalCodeError as any, lang)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
