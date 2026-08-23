import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { StratData, CreateStratDTO, UpdateStratDTO, BoardPath, BoardEntity } from '../types';
import { sanitizeForFirestore } from '../../../utils/firestoreSanitizer';

const COLLECTION_NAME = 'strats';

function sanitizePaths(paths: BoardPath[] = []): BoardPath[] {
  return paths.map((path) => {
    const cleanPath: BoardPath = {
      id: path.id || crypto.randomUUID(),
      tool: path.tool || 'arrow',
      points: (path.points || []).map((pt) => ({
        x: Number(pt.x),
        y: Number(pt.y),
      })),
      color: path.color || '#f6ae2d',
      strokeWidth: Number(path.strokeWidth) || 2,
    };
    if (typeof path.isDashed === 'boolean') {
      cleanPath.isDashed = path.isDashed;
    }
    return cleanPath;
  });
}

function sanitizeEntities(entities: BoardEntity[] = []): BoardEntity[] {
  return entities.map((entity) => {
    const cleanEntity: BoardEntity = {
      id: entity.id || crypto.randomUUID(),
      type: entity.type,
      x: Number(entity.x),
      y: Number(entity.y),
    };
    if (entity.label) {
      cleanEntity.label = entity.label;
    }
    if (entity.side) {
      cleanEntity.side = entity.side;
    }
    return cleanEntity;
  });
}

/**
 * Cria uma nova estratégia tática no Firestore
 */
export async function createStrat(dto: CreateStratDTO): Promise<string> {
  const now = new Date().toISOString();

  const payload: Omit<StratData, 'id'> = {
    title: dto.title.trim(),
    mapId: dto.mapId,
    description: dto.description ? dto.description.trim() : '',
    side: dto.side || 'MIXED',
    paths: sanitizePaths(dto.paths),
    entities: sanitizeEntities(dto.entities),
    authorId: dto.authorId || '',
    authorEmail: dto.authorEmail || '',
    isPublic: dto.isPublic !== undefined ? dto.isPublic : true,
    createdAt: now,
    updatedAt: now,
  };

  const cleanPayload = sanitizeForFirestore(payload);
  const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanPayload);
  return docRef.id;
}

/**
 * Atualiza uma estratégia tática existente
 */
export async function updateStrat(stratId: string, dto: UpdateStratDTO): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    updatedAt: now,
  };

  if (dto.title !== undefined) updatePayload.title = dto.title.trim();
  if (dto.description !== undefined) updatePayload.description = dto.description.trim();
  if (dto.side !== undefined) updatePayload.side = dto.side;
  if (dto.paths !== undefined) updatePayload.paths = sanitizePaths(dto.paths);
  if (dto.entities !== undefined) updatePayload.entities = sanitizeEntities(dto.entities);
  if (dto.isPublic !== undefined) updatePayload.isPublic = dto.isPublic;

  const cleanPayload = sanitizeForFirestore(updatePayload);
  const docRef = doc(db, COLLECTION_NAME, stratId);
  await updateDoc(docRef, cleanPayload);
}

/**
 * Remove uma estratégia tática do Firestore
 */
export async function deleteStrat(stratId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, stratId);
  await deleteDoc(docRef);
}

/**
 * Busca uma estratégia tática específica por ID
 */
export async function getStratById(stratId: string): Promise<StratData | null> {
  const docRef = doc(db, COLLECTION_NAME, stratId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as StratData;
}

/**
 * Busca todas as estratégias de um mapa
 */
export async function getStratsByMap(mapId: string): Promise<StratData[]> {
  const q = query(collection(db, COLLECTION_NAME), where('mapId', '==', mapId));
  const querySnapshot = await getDocs(q);
  const strats: StratData[] = [];
  querySnapshot.forEach((d) => {
    strats.push({ id: d.id, ...d.data() } as StratData);
  });
  return strats;
}

/**
 * Escuta em tempo real as estratégias de um mapa específico
 */
export function subscribeToStratsByMap(
  mapId: string,
  callback: (strats: StratData[]) => void
): () => void {
  const q = query(collection(db, COLLECTION_NAME), where('mapId', '==', mapId));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const parsedStrats = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as StratData[];
      callback(parsedStrats);
    },
    (err) => {
      console.error('Erro ao escutar estratégias do mapa:', err);
    }
  );

  return unsubscribe;
}
