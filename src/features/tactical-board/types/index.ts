export type DrawingTool = 'pen' | 'line' | 'arrow' | 'eraser' | 'select' | 'pan';

export type EntityType =
  'PLAYER_T' | 'PLAYER_CT' | 'SMOKE' | 'FLASH' | 'MOLOTOV' | 'HE_GRENADE' | 'BOMB';

export interface BoardPoint {
  x: number; // 0 a 100 (%)
  y: number; // 0 a 100 (%)
}

export interface BoardPath {
  id: string;
  tool: 'pen' | 'line' | 'arrow';
  points: BoardPoint[];
  color: string;
  strokeWidth: number;
  isDashed?: boolean;
}

export interface BoardEntity {
  id: string;
  type: EntityType;
  x: number; // 0 a 100 (%)
  y: number; // 0 a 100 (%)
  label?: string;
  side?: 'TERRORIST' | 'COUNTER-TERRORIST';
}

export const TIMELINE_TIMESTAMPS = [0, 20, 40, 60, 80, 100] as const;
export type TimelineTimestamp = (typeof TIMELINE_TIMESTAMPS)[number];

export interface StratFrame {
  time: number; // 0, 20, 40, 60, 80, 100 (segundos decorridos no round)
  entities: BoardEntity[];
  paths: BoardPath[];
}

export interface StratPreset {
  id: string;
  title: string;
  mapId: string;
  description?: string;
  paths?: BoardPath[];
  entities?: BoardEntity[];
  frames?: StratFrame[];
  createdAt?: string;
}

export interface StratData {
  id: string;
  title: string;
  mapId: string;
  description?: string;
  side?: 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED' | string;
  frames?: StratFrame[];
  // Campos legados mantidos para compatibilidade retroativa
  paths: BoardPath[];
  entities: BoardEntity[];
  authorId?: string;
  authorEmail?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStratDTO {
  title: string;
  mapId: string;
  description?: string;
  side?: 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED' | string;
  frames?: StratFrame[];
  paths?: BoardPath[];
  entities?: BoardEntity[];
  authorId?: string;
  authorEmail?: string;
  isPublic?: boolean;
}

export interface UpdateStratDTO {
  title?: string;
  description?: string;
  side?: 'TERRORIST' | 'COUNTER-TERRORIST' | 'MIXED' | string;
  frames?: StratFrame[];
  paths?: BoardPath[];
  entities?: BoardEntity[];
  isPublic?: boolean;
}
