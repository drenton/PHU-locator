import { useCallback, useMemo } from 'react';
import { PageLayout } from './components/layout/PageLayout';
import { SearchBar } from './components/search/SearchBar';
import { PHUCardList } from './components/cards/PHUCardList';
import { PHUCard } from './components/cards/PHUCard';
import { PHUMap } from './components/map/PHUMap';
import { PHUDirectory } from './components/directory/PHUDirectory';
import { RegionFilter } from './components/directory/RegionFilter';
import { MapProvider, useMap } from './context/MapContext';
import { useLanguage } from './context/LanguageContext';
import { usePHUs } from './context/PHUContext';
import { useBoundaryData } from './hooks/useBoundaryData';
import { useSearch } from './hooks/useSearch';
import { t } from './utils/i18n';
import './styles/layout.css';
import './styles/cards.css';
import './styles/map.css';
import './styles/search.css';

function LocatorView() {
  const { language } = useLanguage();
  const { phus, isLoading: phusLoading } = usePHUs();
  const { selectedPHUId, hoveredPHUId, resultView, selectedRegion, setSelectedPHU, setHoveredPHU, setResultView, setSelectedRegion } = useMap();
  const { geojson, boundaryToData } = useBoundaryData(phus);

  const onSelectPHU = useCallback((id: number) => {
    setSelectedPHU(id);
    setResultView('map');
  }, [setSelectedPHU, setResultView]);

  const {
    query,
    setQuery,
    results,
    isLocating,
    postalCodeError,
    handleSelect,
    handleSearch,
    handleUseLocation,
    clearSearch,
  } = useSearch(phus, language, geojson, boundaryToData, onSelectPHU);

  const filteredPHUs = useMemo(() => {
    let filtered = phus;
    if (selectedPHUId !== null) {
      return phus.filter((p) => p.id === selectedPHUId);
    }
    if (selectedRegion) {
      filtered = filtered.filter((p) => {
        const region = language === 'fr' ? p.region_fr : p.region_en;
        return region === selectedRegion;
      });
    }
    return filtered;
  }, [phus, selectedPHUId, selectedRegion, language]);

  const handleClear = () => {
    clearSearch();
    setSelectedPHU(null);
  };

  if (phusLoading) {
    return (
      <div className="phu-loading">
        <p>{t('loading', language)}</p>
      </div>
    );
  }

  return (
    <div className="phu-locator">
      {/* Page Heading */}
      <div className="phu-hero">
        <div className="ontario-row">
          <div className="ontario-columns ontario-small-12">
            <h1 className="ontario-h1">{t('pageHeading', language)}</h1>
            <p className="phu-hero__description">{t('pageDescription', language)}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="phu-search-section">
        <div className="ontario-row">
          <div className="ontario-columns ontario-small-12 ontario-large-8">
            <SearchBar
              query={query}
              setQuery={setQuery}
              results={results}
              lang={language}
              isLocating={isLocating}
              isFiltered={selectedPHUId !== null}
              postalCodeError={postalCodeError}
              onSelect={handleSelect}
              onClear={handleClear}
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
            />
          </div>
        </div>
      </div>

      {/* Results Header: count + view toggle */}
      <div className="phu-results-header">
        <div className="ontario-row">
          <div className="ontario-columns ontario-small-12">
            <div className="phu-results-header__inner">
              <p className="phu-results-header__count">
                {filteredPHUs.length === 1
                  ? t('showingOne', language)
                  : t('showing', language, { count: filteredPHUs.length, total: phus.length })}
              </p>
              <div className="phu-view-toggle">
                <button
                  className={`phu-view-toggle__btn ${resultView === 'list' ? 'phu-view-toggle__btn--active' : ''}`}
                  onClick={() => setResultView('list')}
                >
                  {t('listView', language)}
                </button>
                <button
                  className={`phu-view-toggle__btn ${resultView === 'map' ? 'phu-view-toggle__btn--active' : ''}`}
                  onClick={() => setResultView('map')}
                >
                  {t('mapView', language)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results: List or Map+Panel */}
      {resultView === 'list' ? (
        <div className="phu-results">
          <div className="ontario-row">
            <div className="ontario-columns ontario-small-12">
              {selectedPHUId === null && (
                <RegionFilter
                  phus={phus}
                  lang={language}
                  selectedRegion={selectedRegion}
                  onSelectRegion={setSelectedRegion}
                />
              )}
              <PHUCardList
                filteredPHUs={filteredPHUs}
                lang={language}
                selectedPHUId={selectedPHUId}
                onSelectPHU={onSelectPHU}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="phu-map-section">
          {/* Left panel over map */}
          <div className="phu-map-panel">
            <p className="phu-map-panel__count">
              {filteredPHUs.length === 1
                ? t('showingOne', language)
                : t('showing', language, { count: filteredPHUs.length, total: phus.length })}
            </p>
            <div className="phu-map-panel__list">
              {filteredPHUs.map((phu) => (
                <PHUCard
                  key={phu.id}
                  phu={phu}
                  lang={language}
                  isSelected={selectedPHUId === phu.id}
                  onSelect={onSelectPHU}
                />
              ))}
              {filteredPHUs.length === 0 && (
                <p className="phu-card-list__empty">{t('noResults', language)}</p>
              )}
            </div>
          </div>
          {/* Map fills the area */}
          <div className="phu-map-area">
            <PHUMap
              geojson={geojson}
              boundaryToData={boundaryToData}
              selectedPHUId={selectedPHUId}
              hoveredPHUId={hoveredPHUId}
              lang={language}
              onSelectPHU={onSelectPHU}
              onHoverPHU={setHoveredPHU}
            />
          </div>
          {/* Mobile bottom carousel */}
          <div className="phu-carousel">
            {filteredPHUs.map((phu) => (
              <div key={phu.id} className="phu-carousel__item">
                <PHUCard
                  phu={phu}
                  lang={language}
                  isSelected={selectedPHUId === phu.id}
                  onSelect={onSelectPHU}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppContent() {
  const { language } = useLanguage();
  const { phus } = usePHUs();
  const { viewMode } = useMap();

  return (
    <PageLayout>
      {viewMode === 'locator' ? (
        <LocatorView />
      ) : (
        <PHUDirectory
          phus={phus}
          lang={language}
        />
      )}
    </PageLayout>
  );
}

export default function App() {
  const { phus } = usePHUs();

  return (
    <MapProvider phus={phus}>
      <AppContent />
    </MapProvider>
  );
}
