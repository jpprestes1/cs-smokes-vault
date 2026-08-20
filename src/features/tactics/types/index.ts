export interface VideoData {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  title: string;
  thumbnail: string;
  embedUrl: string;
  throwX?: number; // <-- Adicionado
  throwY?: number; // <-- Adicionado
  author: string;
  difficulty?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkerData {
  id: string; // O Firestore usa strings dinâmicas (Hashes) como ID padrão
  mapId: string;
  side: string;
  type: 'SMOKE' | 'FLASH' | 'MOLOTOV';
  title: string;
  x: string;
  y: string;
  desc: string;
  videos: VideoData[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TacticFormData {
  markerId: string;
  title: string;
  titleVideo: string;
  type: string;
  side: string;
  x: string;
  y: string;
  throwX: string;
  throwY: string;
  desc: string;
  videoUrl: string;
  platform: string;
  author: string;
  difficulty?: string;
}

export interface ComboTarget {
  type: 'SMOKE' | 'FLASH' | 'MOLOTOV';
  endX: number;
  endY: number;
}

export interface ComboData {
  id: string;
  mapId: string;
  title: string;
  side: string;
  startX: number; // Posição de onde o jogador vai lançar
  startY: number;
  targets: ComboTarget[]; // Lista de granadas que compõem o combo
  desc: string;
  videos: VideoData[];
  createdAt?: string;
  updatedAt?: string;
}
