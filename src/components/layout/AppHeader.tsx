import { useLanguage } from '../../context/LanguageContext';
import { useMap } from '../../context/MapContext';
import { t } from '../../utils/i18n';

export function AppHeader() {
  const { language, toggleLanguage } = useLanguage();
  const { viewMode, setViewMode } = useMap();

  return (
    <div className="ontario-header__container ontario-application-header">
      <header className="ontario-application-header ontario-header" id="ontario-header">
        <div className="ontario-row">
          <div className="ontario-columns ontario-small-6 ontario-application-header__logo">
            <a href="https://www.ontario.ca/page/government-ontario">
              <img src="/ods/logos/ontario-logo--desktop.svg" alt="Ontario.ca homepage" />
            </a>
          </div>
          <div className="ontario-columns ontario-small-6 ontario-application-header__lang-toggle">
            <button
              onClick={toggleLanguage}
              className="ontario-header__language-toggler ontario-header-button ontario-header-button--without-outline"
              lang={language === 'en' ? 'fr' : 'en'}
            >
              {t('langToggle', language)}
            </button>
          </div>
        </div>
      </header>
      <div className="ontario-application-subheader-menu__container">
        <section className="ontario-application-subheader">
          <div className="ontario-row">
            <div className="ontario-columns ontario-small-12 ontario-application-subheader__container">
              <p className="ontario-application-subheader__heading">
                <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('locator'); }}>
                  {t('appTitle', language)}
                </a>
              </p>
              <div className="ontario-application-subheader__menu-container">
                <ul className="ontario-application-subheader__menu ontario-show-for-large">
                  <li>
                    <a
                      href="#"
                      className={viewMode === 'locator' ? 'active' : ''}
                    >
                      {t('findYourPHU', language)}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#directory"
                      className={viewMode === 'directory' ? 'active' : ''}
                    >
                      {t('browseAll', language)}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
