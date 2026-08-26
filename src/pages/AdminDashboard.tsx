import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type UserRole } from '../features/auth/hooks/useAuth';
import {
  type UserProfile,
  getAllUsers,
  updateUserRole,
} from '../features/auth/services/usersService';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await getAllUsers();
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);

      // Atualiza o estado local para refletir a mudança instantaneamente
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error('Error updating role:', error);
      alert(t('admin.updateRoleFailed'));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex w-full flex-col gap-6 duration-500">
      <div className="flex items-center gap-3 border-b border-white/5 pb-2">
        <span className="material-symbols-outlined text-primary-container text-3xl">
          admin_panel_settings
        </span>
        <h1 className="font-display-lg text-on-surface text-3xl tracking-tight uppercase">
          {t('admin.title')}
        </h1>
      </div>

      <div className="tactical-glass border-outline-variant w-full overflow-hidden rounded-lg border shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-variant/50 font-data-label text-on-surface-variant text-xs uppercase">
              <tr>
                <th className="px-6 py-4">{t('admin.userEmail')}</th>
                <th className="px-6 py-4">{t('admin.currentRole')}</th>
                <th className="px-6 py-4">{t('admin.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    {t('admin.loadingOperatives')}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-white/5">
                    <td className="font-body-base px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-data-label rounded px-2 py-1 text-xs font-bold tracking-wider ${
                          user.role === 'ADMIN'
                            ? 'bg-red-500/20 text-red-400'
                            : user.role === 'CREATOR'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || 'PLAYER'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="font-data-label focus:border-primary bg-surface-container text-on-surface rounded border border-white/10 p-2 text-xs outline-none"
                      >
                        <option value="PLAYER">PLAYER</option>
                        <option value="CREATOR">CREATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
