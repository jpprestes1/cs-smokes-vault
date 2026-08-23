import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import {
  type ComboData,
  type VideoData,
  type CreateComboDTO,
  type UpdateComboDTO,
  type CreateVideoDTO,
  type UpdateVideoDTO,
} from '../types';
import { buildVideoData, sanitizeAuthor } from './markersService';
import { formatEmbedUrl } from '../../../utils/videoFormatting';
import { sanitizeForFirestore } from '../../../utils/firestoreSanitizer';

const COLLECTION_NAME = 'combos';

/**
 * Cria um novo execute/combo tático com vídeo inicial
 */
export async function createCombo(dto: CreateComboDTO): Promise<string> {
  const now = new Date().toISOString();

  const videos: VideoData[] = [];
  if (dto.initialVideo) {
    videos.push(buildVideoData(dto.initialVideo));
  }

  const formattedTargets = dto.targets.map((t) => ({
    type: t.type,
    endX: Number(t.endX),
    endY: Number(t.endY),
  }));

  const payload: Omit<ComboData, 'id'> = {
    mapId: dto.mapId,
    title: dto.title.trim(),
    side: dto.side,
    startX: Number(dto.startX),
    startY: Number(dto.startY),
    targets: formattedTargets,
    desc: dto.desc ? dto.desc.trim() : '',
    videos,
    createdAt: now,
    updatedAt: now,
  };

  const cleanPayload = sanitizeForFirestore(payload);
  const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanPayload);
  return docRef.id;
}

/**
 * Atualiza os dados de um combo/execute tático
 */
export async function updateCombo(comboId: string, dto: UpdateComboDTO): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    updatedAt: now,
  };

  if (dto.title !== undefined) updatePayload.title = dto.title.trim();
  if (dto.side !== undefined) updatePayload.side = dto.side;
  if (dto.startX !== undefined) updatePayload.startX = Number(dto.startX);
  if (dto.startY !== undefined) updatePayload.startY = Number(dto.startY);
  if (dto.desc !== undefined) updatePayload.desc = dto.desc.trim();

  if (dto.targets !== undefined) {
    updatePayload.targets = dto.targets.map((t) => ({
      type: t.type,
      endX: Number(t.endX),
      endY: Number(t.endY),
    }));
  }

  const cleanPayload = sanitizeForFirestore(updatePayload);
  const docRef = doc(db, COLLECTION_NAME, comboId);
  await updateDoc(docRef, cleanPayload);
}

/**
 * Remove um combo/execute do banco de dados
 */
export async function deleteCombo(comboId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, comboId);
  await deleteDoc(docRef);
}

/**
 * Adiciona um vídeo demonstrativo a um combo existente
 */
export async function addVideoToCombo(
  comboId: string,
  videoDto: CreateVideoDTO
): Promise<VideoData> {
  const now = new Date().toISOString();
  const newVideo = buildVideoData(videoDto);

  const docRef = doc(db, COLLECTION_NAME, comboId);
  await updateDoc(docRef, {
    videos: arrayUnion(newVideo),
    updatedAt: now,
  });

  return newVideo;
}

/**
 * Atualiza um vídeo existente dentro de um combo
 */
export async function updateVideoInCombo(
  comboId: string,
  videoId: string,
  videoDto: UpdateVideoDTO
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, comboId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Combo ${comboId} não encontrado.`);
  }

  const currentVideos: VideoData[] = docSnap.data().videos || [];
  const now = new Date().toISOString();

  const updatedVideos = currentVideos.map((video) => {
    if (video.id !== videoId) return video;

    const platform = videoDto.platform || video.platform;
    let embedUrl = video.embedUrl;
    if (videoDto.videoUrl) {
      embedUrl = formatEmbedUrl(videoDto.videoUrl, platform);
    }

    const updated: VideoData = {
      ...video,
      platform,
      embedUrl,
      title: videoDto.title !== undefined ? videoDto.title.trim() : video.title,
      thumbnail: videoDto.thumbnail !== undefined ? videoDto.thumbnail : video.thumbnail,
      author: videoDto.author !== undefined ? sanitizeAuthor(videoDto.author) : video.author,
      difficulty: videoDto.difficulty !== undefined ? videoDto.difficulty : video.difficulty,
      updatedAt: now,
    };

    if (
      videoDto.throwX !== undefined &&
      videoDto.throwX !== null &&
      !isNaN(Number(videoDto.throwX))
    ) {
      updated.throwX = Number(videoDto.throwX);
    } else if (video.throwX !== undefined) {
      updated.throwX = video.throwX;
    }

    if (
      videoDto.throwY !== undefined &&
      videoDto.throwY !== null &&
      !isNaN(Number(videoDto.throwY))
    ) {
      updated.throwY = Number(videoDto.throwY);
    } else if (video.throwY !== undefined) {
      updated.throwY = video.throwY;
    }

    return sanitizeForFirestore(updated);
  });

  await updateDoc(docRef, {
    videos: updatedVideos,
    updatedAt: now,
  });
}

/**
 * Remove um vídeo de um combo específico
 */
export async function deleteVideoFromCombo(comboId: string, videoId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, comboId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Combo ${comboId} não encontrado.`);
  }

  const currentVideos: VideoData[] = docSnap.data().videos || [];
  const updatedVideos = currentVideos.filter((v) => v.id !== videoId);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    videos: updatedVideos,
    updatedAt: now,
  });
}

/**
 * Busca um combo pelo ID
 */
export async function getComboById(comboId: string): Promise<ComboData | null> {
  const docRef = doc(db, COLLECTION_NAME, comboId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as ComboData;
}
