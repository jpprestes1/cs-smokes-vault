export type PlatformType = 'youtube' | 'tiktok' | 'instagram';
export type MarkerSide = 'TERRORIST' | 'COUNTER-TERRORIST';
export type GrenadeType = 'SMOKE' | 'FLASH' | 'MOLOTOV';
export type DifficultyType = 'EASY' | 'MEDIUM' | 'HARD';

export interface VideoData {
  id: string;
  platform: PlatformType;
  title: string;
  thumbnail: string;
  embedUrl: string;
  throwX?: number;
  throwY?: number;
  author: string;
  difficulty?: DifficultyType | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarkerData {
  id: string;
  mapId: string;
  side: MarkerSide | string;
  type: GrenadeType;
  title: string;
  x: number | string;
  y: number | string;
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
  type: GrenadeType;
  endX: number;
  endY: number;
}

export interface ComboData {
  id: string;
  mapId: string;
  title: string;
  side: MarkerSide | string;
  startX: number;
  startY: number;
  targets: ComboTarget[];
  desc: string;
  videos: VideoData[];
  createdAt?: string;
  updatedAt?: string;
}

// DTOs para persistência e operações

export interface CreateVideoDTO {
  platform: PlatformType;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  throwX?: number;
  throwY?: number;
  author: string;
  difficulty?: DifficultyType | string;
}

export interface UpdateVideoDTO {
  platform?: PlatformType;
  title?: string;
  videoUrl?: string;
  thumbnail?: string;
  throwX?: number;
  throwY?: number;
  author?: string;
  difficulty?: DifficultyType | string;
}

export interface CreateMarkerDTO {
  mapId: string;
  title: string;
  type: GrenadeType;
  side: MarkerSide | string;
  x: number;
  y: number;
  desc: string;
  initialVideo?: CreateVideoDTO;
}

export interface UpdateMarkerDTO {
  title?: string;
  type?: GrenadeType;
  side?: MarkerSide | string;
  x?: number;
  y?: number;
  desc?: string;
}

export interface CreateComboDTO {
  mapId: string;
  title: string;
  side: MarkerSide | string;
  startX: number;
  startY: number;
  targets: ComboTarget[];
  desc: string;
  initialVideo?: CreateVideoDTO;
}

export interface UpdateComboDTO {
  title?: string;
  side?: MarkerSide | string;
  startX?: number;
  startY?: number;
  targets?: ComboTarget[];
  desc?: string;
}
