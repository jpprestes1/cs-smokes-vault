import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { getUserProfile } from '../services/usersService';

export type UserRole = 'ADMIN' | 'CREATOR' | 'PLAYER' | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            setRole(profile.role);
          } else {
            setRole('PLAYER');
          }
        } catch (error) {
          console.error('Erro ao buscar a role do usuário:', error);
          setRole('PLAYER');
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, role, loading };
}
