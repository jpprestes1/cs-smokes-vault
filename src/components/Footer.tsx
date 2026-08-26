import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface-container-lowest border-outline-variant md:px-margin-desktop mt-auto flex w-full flex-col items-center gap-4 border-t px-4 py-8 text-center">
      <span className="font-headline-md text-headline-md text-on-surface">{t('footer.brand')}</span>
      <div className="font-data-label text-data-label flex flex-wrap justify-center gap-4 md:gap-6">
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          {t('footer.communityDiscord')}
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          {t('footer.steamWorkshop')}
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          {t('footer.submitTactic')}
        </a>
        <a
          className="text-on-surface-variant hover:text-primary-container transition-opacity hover:opacity-80"
          href="#"
        >
          {t('footer.privacyPolicy')}
        </a>
      </div>
      <p className="font-data-label text-data-label text-on-surface-variant/50 mt-4 text-xs md:text-sm">
        {t('footer.copyright')}
      </p>
    </footer>
  );
}
