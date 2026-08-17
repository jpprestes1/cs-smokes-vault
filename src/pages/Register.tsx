import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
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
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: 'PLAYER', // Cargo padrão
        createdAt: new Date().toISOString(),
      });

      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
          <h1 className="font-display-lg text-primary text-3xl tracking-tight uppercase">Enlist</h1>
          <p className="font-body-base text-on-surface-variant text-sm">
            Join the tactical database
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-500/30 bg-red-900/50 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-data-label text-on-surface-variant text-xs">EMAIL</span>
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
            <span className="font-data-label text-on-surface-variant text-xs">PASSWORD</span>
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
              CONFIRM PASSWORD
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
            {isLoading ? 'ENLISTING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="font-data-label text-on-surface-variant mt-6 text-center text-xs">
          ALREADY HAVE AN ACCOUNT?{' '}
          <Link to="/login" className="text-primary hover:underline">
            LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
