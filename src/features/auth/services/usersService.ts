import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type UserRole } from '../hooks/useAuth';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

const COLLECTION_NAME = 'users';

/**
 * Cria o documento de perfil no Firestore após o cadastro na autenticação
 */
export async function createUserProfile(
  uid: string,
  email: string,
  role: UserRole = 'PLAYER'
): Promise<void> {
  const now = new Date().toISOString();
  await setDoc(doc(db, COLLECTION_NAME, uid), {
    email,
    role: role || 'PLAYER',
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Busca os dados de perfil e cargo (role) de um usuário específico
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDoc = await getDoc(doc(db, COLLECTION_NAME, uid));
  if (!userDoc.exists()) {
    return null;
  }
  return {
    id: userDoc.id,
    ...userDoc.data(),
  } as UserProfile;
}

/**
 * Lista todos os usuários cadastrados no sistema (para uso administrativo)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const usersList: UserProfile[] = [];
  querySnapshot.forEach((d) => {
    usersList.push({ id: d.id, ...d.data() } as UserProfile);
  });
  return usersList;
}

/**
 * Atualiza o cargo/permissão (role) de um usuário
 */
export async function updateUserRole(uid: string, newRole: UserRole): Promise<void> {
  const userRef = doc(db, COLLECTION_NAME, uid);
  const now = new Date().toISOString();
  await updateDoc(userRef, {
    role: newRole,
    updatedAt: now,
  });
}
