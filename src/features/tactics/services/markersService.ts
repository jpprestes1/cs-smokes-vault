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
  type MarkerData,
  type VideoData,
  type CreateMarkerDTO,
  type UpdateMarkerDTO,
  type CreateVideoDTO,
  type UpdateVideoDTO,
} from '../types';
import { formatEmbedUrl } from '../../../utils/videoFormatting';
import { sanitizeForFirestore } from '../../../utils/firestoreSanitizer';

const COLLECTION_NAME = 'markers';

/**
 * Sanitiza o nome do autor removendo arrobas iniciais e espaços em branco
 */
export function sanitizeAuthor(author: string): string {
  return author.replace(/^@+/, '').trim();
}

/**
 * Constrói um objeto VideoData formatado e pronto para persistência
 */
export function buildVideoData(videoDto: CreateVideoDTO): VideoData {
  const now = new Date().toISOString();
  const video: VideoData = {
    id: crypto.randomUUID(),
    platform: videoDto.platform,
    title: videoDto.title,
    thumbnail: videoDto.thumbnail || '',
    embedUrl: formatEmbedUrl(videoDto.videoUrl, videoDto.platform),
    author: sanitizeAuthor(videoDto.author),
    difficulty: videoDto.difficulty || 'MEDIUM',
    createdAt: now,
    updatedAt: now,
  };

  if (
    videoDto.throwX !== undefined &&
    videoDto.throwX !== null &&
    !isNaN(Number(videoDto.throwX))
  ) {
    video.throwX = Number(videoDto.throwX);
  }

  if (
    videoDto.throwY !== undefined &&
    videoDto.throwY !== null &&
    !isNaN(Number(videoDto.throwY))
  ) {
    video.throwY = Number(videoDto.throwY);
  }

  return sanitizeForFirestore(video);
}

/**
 * Cria um novo marcador de granada no mapa com vídeo inicial
 */
export async function createMarker(dto: CreateMarkerDTO): Promise<string> {
  const now = new Date().toISOString();

  const videos: VideoData[] = [];
  if (dto.initialVideo) {
    videos.push(buildVideoData(dto.initialVideo));
  }

  const payload: Omit<MarkerData, 'id'> = {
    mapId: dto.mapId,
    title: dto.title.trim(),
    type: dto.type,
    side: dto.side,
    x: Number(dto.x),
    y: Number(dto.y),
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
 * Atualiza os dados cadastrais de um marcador de granada
 */
export async function updateMarker(markerId: string, dto: UpdateMarkerDTO): Promise<void> {
  const now = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    updatedAt: now,
  };

  if (dto.title !== undefined) updatePayload.title = dto.title.trim();
  if (dto.type !== undefined) updatePayload.type = dto.type;
  if (dto.side !== undefined) updatePayload.side = dto.side;
  if (dto.x !== undefined) updatePayload.x = Number(dto.x);
  if (dto.y !== undefined) updatePayload.y = Number(dto.y);
  if (dto.desc !== undefined) updatePayload.desc = dto.desc.trim();

  const cleanPayload = sanitizeForFirestore(updatePayload);
  const docRef = doc(db, COLLECTION_NAME, markerId);
  await updateDoc(docRef, cleanPayload);
}

/**
 * Exclui um marcador de granada e todos os vídeos associados
 */
export async function deleteMarker(markerId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, markerId);
  await deleteDoc(docRef);
}

/**
 * Adiciona uma nova lineup de vídeo a um marcador existente
 */
export async function addVideoToMarker(
  markerId: string,
  videoDto: CreateVideoDTO
): Promise<VideoData> {
  const now = new Date().toISOString();
  const newVideo = buildVideoData(videoDto);

  const docRef = doc(db, COLLECTION_NAME, markerId);
  await updateDoc(docRef, {
    videos: arrayUnion(newVideo),
    updatedAt: now,
  });

  return newVideo;
}

/**
 * Atualiza um vídeo existente em um marcador de granada
 */
export async function updateVideoInMarker(
  markerId: string,
  videoId: string,
  videoDto: UpdateVideoDTO
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, markerId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Marcador ${markerId} não encontrado.`);
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
 * Remove um vídeo específico de um marcador de granada
 */
export async function deleteVideoFromMarker(markerId: string, videoId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, markerId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error(`Marcador ${markerId} não encontrado.`);
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
 * Busca um marcador pelo ID
 */
export async function getMarkerById(markerId: string): Promise<MarkerData | null> {
  const docRef = doc(db, COLLECTION_NAME, markerId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as MarkerData;
}
