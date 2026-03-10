import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';

export function AppFooter() {
  const { language } = useLanguage();

  return (
    <footer className="ontario-footer ontario-footer--default">
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12">
          <ul className="ontario-footer__links-container ontario-footer__links-container--inline">
            <li>
              <a className="ontario-footer__link" href="https://www.ontario.ca/page/accessibility">
                {t('accessibility', language)}
              </a>
            </li>
            <li>
              <a className="ontario-footer__link" href="https://www.ontario.ca/page/privacy-statement">
                {t('privacy', language)}
              </a>
            </li>
            <li>
              <a className="ontario-footer__link" href="#">
                {t('contactUs', language)}
              </a>
            </li>
          </ul>
          <div className="ontario-footer__copyright">
            <a className="ontario-footer__link" href="https://www.ontario.ca/page/copyright-information">
              &copy; {t('copyright', language)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
