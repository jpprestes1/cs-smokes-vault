import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { auth } from '../lib/firebase';
import { createUserProfile } from '../features/auth/services/usersService';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await createUserProfile(
        userCredential.user.uid,
        userCredential.user.email || email,
        'PLAYER'
      );

      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.createAccountFailed');
      setError(errorMessage || t('auth.createAccountFailed'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex min-h-[60vh] w-full items-center justify-center duration-500">
      <div className="tactical-glass border-outline-variant w-full max-w-md rounded-lg border p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-4xl">
            person_add
          </span>
          <h1 className="font-display-lg text-primary text-3xl tracking-tight uppercase">
            {t('auth.enlist')}
          </h1>
          <p className="font-body-base text-on-surface-variant text-sm">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500/30 bg-red-900/50 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs">
              {t('auth.email')}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:border-primary bg-surface-variant/20 text-on-surface rounded border border-white/10 p-3 text-sm transition-colors outline-none"
              placeholder="agent@cs2.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs">
              {t('auth.password')}
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:border-primary bg-surface-variant/20 text-on-surface rounded border border-white/10 p-3 text-sm transition-colors outline-none"
              placeholder="••••••••"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs">
              {t('auth.confirmPassword')}
            </span>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="focus:border-primary bg-surface-variant/20 text-on-surface rounded border border-white/10 p-3 text-sm transition-colors outline-none"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className={`font-headline-md mt-4 flex items-center justify-center gap-2 rounded py-3 text-sm font-bold tracking-wide uppercase transition-all ${
              isLoading
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
                : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'
            }`}
          >
            {isLoading ? t('auth.enlisting') : t('auth.createAccount')}
          </button>
        </form>

        <p className="font-data-label text-on-surface-variant mt-6 text-center text-xs">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-primary hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
