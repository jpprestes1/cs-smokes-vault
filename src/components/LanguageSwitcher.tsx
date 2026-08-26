import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'pt', labelKey: 'language.pt' },
  { code: 'en', labelKey: 'language.en' },
  { code: 'es', labelKey: 'language.es' },
] as const;

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const activeLanguage = i18n.resolvedLanguage?.split('-')[0] || 'pt';

  return (
    <div className="flex items-center gap-1" aria-label={t('language.changeLanguage')}>
      {languages.map((language) => {
        const isActive = activeLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => i18n.changeLanguage(language.code)}
            className={`rounded px-2 py-1 text-[10px] font-bold tracking-wide transition-colors ${
              isActive
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/30'
            }`}
          >
            {t(language.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
