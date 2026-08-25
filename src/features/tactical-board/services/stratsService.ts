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
import type {
  StratData,
  CreateStratDTO,
  UpdateStratDTO,
  BoardPath,
  BoardEntity,
  StratFrame,
} from '../types';
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

export function sanitizeFrames(frames: StratFrame[] = []): StratFrame[] {
  return frames.map((frame) => ({
    time: Number(frame.time) || 0,
    entities: sanitizeEntities(frame.entities || []),
    paths: sanitizePaths(frame.paths || []),
  }));
}

function normalizeStrat(id: string, rawData: Record<string, unknown>): StratData {
  const rootPaths = sanitizePaths((rawData.paths as BoardPath[]) || []);
  const rootEntities = sanitizeEntities((rawData.entities as BoardEntity[]) || []);

  const frames: StratFrame[] =
    Array.isArray(rawData.frames) && rawData.frames.length > 0
      ? sanitizeFrames(rawData.frames as StratFrame[])
      : [
          {
            time: 0,
            entities: rootEntities,
            paths: rootPaths,
          },
        ];

  return {
    id,
    title: (rawData.title as string) || 'UNTITLED_STRAT',
    mapId: (rawData.mapId as string) || 'mirage',
    description: (rawData.description as string) || '',
    side: (rawData.side as string) || 'MIXED',
    frames,
    paths: frames[0]?.paths || rootPaths,
    entities: frames[0]?.entities || rootEntities,
    authorId: (rawData.authorId as string) || '',
    authorEmail: (rawData.authorEmail as string) || '',
    isPublic: rawData.isPublic !== undefined ? Boolean(rawData.isPublic) : true,
    createdAt: (rawData.createdAt as string) || new Date().toISOString(),
    updatedAt: (rawData.updatedAt as string) || new Date().toISOString(),
  };
}

/**
 * Cria uma nova estratégia tática no Firestore
 */
export async function createStrat(dto: CreateStratDTO): Promise<string> {
  const now = new Date().toISOString();

  const sanitizedFrames =
    dto.frames && dto.frames.length > 0
      ? sanitizeFrames(dto.frames)
      : [
          {
            time: 0,
            entities: sanitizeEntities(dto.entities || []),
            paths: sanitizePaths(dto.paths || []),
          },
        ];

  const primaryPaths = sanitizedFrames[0]?.paths || sanitizePaths(dto.paths || []);
  const primaryEntities = sanitizedFrames[0]?.entities || sanitizeEntities(dto.entities || []);

  const payload: Omit<StratData, 'id'> = {
    title: dto.title.trim(),
    mapId: dto.mapId,
    description: dto.description ? dto.description.trim() : '',
    side: dto.side || 'MIXED',
    frames: sanitizedFrames,
    paths: primaryPaths,
    entities: primaryEntities,
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

  if (dto.frames !== undefined) {
    const cleanFrames = sanitizeFrames(dto.frames);
    updatePayload.frames = cleanFrames;
    if (cleanFrames.length > 0) {
      updatePayload.paths = cleanFrames[0].paths;
      updatePayload.entities = cleanFrames[0].entities;
    }
  } else {
    if (dto.paths !== undefined) updatePayload.paths = sanitizePaths(dto.paths);
    if (dto.entities !== undefined) updatePayload.entities = sanitizeEntities(dto.entities);
  }

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

  return normalizeStrat(docSnap.id, docSnap.data() as Record<string, unknown>);
}

/**
 * Busca todas as estratégias de um mapa
 */
export async function getStratsByMap(mapId: string): Promise<StratData[]> {
  const q = query(collection(db, COLLECTION_NAME), where('mapId', '==', mapId));
  const querySnapshot = await getDocs(q);
  const strats: StratData[] = [];
  querySnapshot.forEach((d) => {
    strats.push(normalizeStrat(d.id, d.data() as Record<string, unknown>));
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
      const parsedStrats = snapshot.docs.map((d) =>
        normalizeStrat(d.id, d.data() as Record<string, unknown>)
      );
      callback(parsedStrats);
    },
    (err) => {
      console.error('Erro ao escutar estratégias do mapa:', err);
    }
  );

  return unsubscribe;
}
