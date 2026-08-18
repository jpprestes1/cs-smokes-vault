import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-surface-container-lowest relative mt-4 flex h-[400px] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 shadow-2xl md:mt-0 md:h-[500px]">
      <div className="scanline-bg pointer-events-none absolute inset-0 z-10 opacity-20"></div>
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvY3d6YLTWL8AnJvOHL_VOpytmhu-0yoL9sTLPq9xX1nVolV6AlZVaJOpXb_xmvrLU-n1Zwu2aIrMLYC0BOxSbcKc0G0ET0WdULQFXQAFPAToztLTUCyKlCmX8B4GRk2wFnxZOSyrRiLvjJ3T1C3OHTj8u9MDDPrIfhl_hkLGi64MRqvbVYTF5Hagin-sBW3Jz_a0cEEHfDtCjLo2H-66qmciZXP0aqxDI_wkoYHfyU9v7THC1JlK5"
        alt="Hero background"
      />

      <div className="relative z-20 flex w-full max-w-3xl flex-col items-center px-4 text-center">
        <img
          alt="Logo"
          className="mb-4 h-20 w-20 drop-shadow-[0_0_15px_rgba(246,174,45,0.5)] md:mb-6 md:h-32 md:w-32"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB24cGLUDk2NLK1mEOZHGVKBjHb8yKGmIXKecUZf6tBo4DNe5z0OCmdU-98mXT6SYCflhln1SyF2E4GS9CQ0F6cetk3NpdIytBsreG81o4tWCjdr0hdtIglfLaQ87JtdtdFn_ueWfLbV1fp9RERoEPUp5z7w75S7uICmldv1tGuUIM5DhLJTtq1rQLsH4OnFPYR5qLN1YlYx0idPsoFz1jS8-J2p0ppdg-PUS3-qsZWOBsBL55N0mNI"
        />

        <h1 className="font-display-lg text-on-surface mb-2 text-3xl leading-tight tracking-tight uppercase md:mb-4 md:text-[48px]">
          {t('hero.title')}
        </h1>
        <p className="font-body-base text-on-surface-variant mb-6 max-w-xl text-sm md:mb-8 md:text-base">
          {t('hero.description')}
        </p>

        {/* Search Bar */}
        <div className="relative flex w-full max-w-2xl items-center">
          <span className="material-symbols-outlined text-primary-container absolute left-3 z-10 text-xl md:left-4 md:text-2xl">
            search
          </span>
          <input
            className="bg-surface-container-high border-outline-variant focus:border-primary-container text-on-surface font-data-label placeholder-on-surface-variant/50 w-full rounded-t-sm border-b py-3 pl-10 text-xs transition-colors outline-none focus:ring-0 md:py-4 md:pl-12 md:text-sm"
            placeholder={t('hero.searchPlaceholder')}
            type="text"
          />
          <button className="bg-primary-container text-on-primary-fixed font-data-label absolute right-1 rounded-sm px-3 py-2 text-xs font-bold hover:opacity-90 md:right-2 md:px-4 md:text-sm">
            {t('hero.execute').toUpperCase()}
          </button>
        </div>
      </div>
    </section>
  );
}
