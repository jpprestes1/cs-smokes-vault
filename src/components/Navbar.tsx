import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../features/auth/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, loading, role } = useAuth();
  const navItems = [
    { key: 'nav.maps', path: '/maps' },
    { key: 'nav.tactics', path: '/strat-board' },
    { key: 'nav.proStrats', path: '/pro-strats' },
    { key: 'nav.training', path: '/training' },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Gera um avatar temporário único baseado no email caso o usuário não tenha foto
  const getAvatarUrl = () => {
    if (user?.photoURL) return user.photoURL;
    const seed = user?.email || 'agent';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=f6ae2d`;
  };

  return (
    <nav className="bg-surface-container/80 fixed top-0 z-50 w-full border-b border-white/10 shadow-[0_0_20px_rgba(246,174,45,0.1)] backdrop-blur-md">
      <div className="max-w-container-max md:px-margin-desktop mx-auto flex h-16 w-full items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link
            to="/"
            className="font-headline-md text-headline-md text-primary-container flex items-center gap-2 font-black tracking-tighter"
          >
            <img
              alt="TACTICAL VAULT Logo"
              className="h-8 w-8 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB24cGLUDk2NLK1mEOZHGVKBjHb8yKGmIXKecUZf6tBo4DNe5z0OCmdU-98mXT6SYCflhln1SyF2E4GS9CQ0F6cetk3NpdIytBsreG81o4tWCjdr0hdtIglfLaQ87JtdtdFn_ueWfLbV1fp9RERoEPUp5z7w75S7uICmldv1tGuUIM5DhLJTtq1rQLsH4OnFPYR5qLN1YlYx0idPsoFz1jS8-J2p0ppdg-PUS3-qsZWOBsBL55N0mNI"
            />
            <span className="hidden sm:block">TACTICAL VAULT</span>
          </Link>

          {/* Links Desktop */}
          <div className="hidden gap-6 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`border-b-2 pb-1 transition-all duration-300 ease-in-out active:scale-95 ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'text-on-surface-variant hover:border-primary/50 hover:text-primary border-transparent font-medium'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Área da Direita: Autenticação & Menu Hamburger */}
        <div className="flex items-center gap-4 md:gap-6">
          {!loading && (
            <div className="hidden items-center gap-4 md:flex">
              {user ? (
                <div className="flex items-center gap-4">
                  {role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="text-on-surface-variant hover:text-primary transition-colors"
                      title={t('nav.adminDashboard')}
                    >
                      <span className="material-symbols-outlined text-[20px]">settings</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="text-on-surface-variant hover:text-error font-data-label text-xs font-bold transition-colors"
                  >
                    {t('nav.logout').toUpperCase()}
                  </button>
                  <div
                    className="border-primary h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 transition-all hover:shadow-[0_0_10px_rgba(246,174,45,0.4)]"
                    title={user.email || t('nav.profile')}
                  >
                    <img
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                      src={getAvatarUrl()}
                    />
                  </div>
                </div>
              ) : (
                // Usuário Deslogado (Desktop)
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-on-surface hover:text-primary font-data-label text-xs font-bold transition-colors"
                  >
                    {t('nav.login').toUpperCase()}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary text-on-primary font-data-label rounded px-4 py-2 text-xs font-bold transition-transform active:scale-95"
                  >
                    {t('nav.register').toUpperCase()}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {/* Botão Menu Mobile */}
          <button
            className="text-primary-container flex items-center md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <div
        className={`bg-surface-container-highest flex flex-col overflow-hidden border-b border-white/10 shadow-xl transition-all duration-300 ease-in-out md:hidden ${
          isMenuOpen
            ? 'max-h-[400px] px-4 py-2 opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        {/* Links Principais Mobile */}
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.key}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2 border-b border-white/5 py-3 transition-all duration-300 ${
                isActive
                  ? 'text-primary translate-x-2 font-bold'
                  : 'text-on-surface-variant hover:text-primary font-medium hover:translate-x-1'
              }`}
            >
              {isActive && (
                <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full"></span>
              )}
              {t(item.key)}
            </Link>
          );
        })}

        {/* Área de Autenticação Mobile */}
        {!loading && (
          <div className="mt-2 flex flex-col gap-2 pt-2 pb-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-on-surface-variant hover:text-error font-data-label text-xs font-bold transition-colors"
                >
                  {t('nav.logout').toUpperCase()}
                </button>
                {role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="text-on-surface-variant hover:text-primary transition-colors"
                    title={t('nav.adminDashboard')}
                  >
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-surface-variant/50 text-on-surface font-data-label rounded py-2 text-center text-xs font-bold"
                >
                  {t('nav.login').toUpperCase()}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-primary text-on-primary font-data-label rounded py-2 text-center text-xs font-bold"
                >
                  {t('nav.register').toUpperCase()}
                </Link>
              </div>
            )}

            <div className="pt-1">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
