import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Maps', path: '/maps' },
    { name: 'Tactics', path: '/tactics' },
    { name: 'Pro Strats', path: '/pro-strats' },
    { name: 'Training', path: '/training' },
  ];

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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`border-b-2 pb-1 transition-all duration-300 ease-in-out active:scale-95 ${
                    isActive
                      ? 'border-primary text-primary font-bold'
                      : 'text-on-surface-variant hover:border-primary/50 hover:text-primary border-transparent font-medium'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Botões da direita (Upload removido daqui) */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="border-outline-variant hover:border-primary h-8 w-8 cursor-pointer overflow-hidden rounded-full border transition-colors">
            <img
              alt="User Profile Avatar"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuByk1i2N8K3KHHoJIJvFLMGVucxZU2JGfmowFN4jGl8b3M1QxVd3U0q-yEXS5iOJqsPPRIeg1KdLUCPmMnsIENyotOFIhQN8KcMHDb3yBqUJsEHPhC8UokDJJ-1M-30Q77hpG8VSmmVrlCaPbG8JVVdAaf7QRjZpSpOOx0DnAMXx02Q8fVTGbMyz0qNb9XZQpGEcW7nhfPPnVOeiC2bj4rYp1R6cqV1oyGzti60bWCIAoi9_JeQIVpx"
            />
          </div>
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
          isMenuOpen ? 'max-h-64 px-4 py-2 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-2 border-b border-white/5 py-2 transition-all duration-300 ${
                isActive
                  ? 'text-primary translate-x-2 font-bold'
                  : 'text-on-surface-variant hover:text-primary font-medium hover:translate-x-1'
              }`}
            >
              {isActive && (
                <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full"></span>
              )}
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
