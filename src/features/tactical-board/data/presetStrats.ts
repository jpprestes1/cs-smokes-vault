import type { StratPreset } from '../types';

export const presetStrats: StratPreset[] = [
  {
    id: 'mirage-a-execute',
    title: 'MIRAGE_A_EXEC',
    mapId: 'mirage',
    description:
      'Execução padrão no Bombsite A com 3 smokes (CT, Jungle, Stairs) e avanço Ramp/Palace.',
    paths: [
      {
        id: 'p-1',
        tool: 'arrow',
        color: '#f6ae2d',
        strokeWidth: 3,
        isDashed: true,
        points: [
          { x: 30, y: 70 },
          { x: 42, y: 56 },
          { x: 58, y: 46 },
        ],
      },
      {
        id: 'p-2',
        tool: 'arrow',
        color: '#f6ae2d',
        strokeWidth: 3,
        isDashed: true,
        points: [
          { x: 38, y: 82 },
          { x: 62, y: 64 },
          { x: 68, y: 48 },
        ],
      },
      {
        id: 'p-3',
        tool: 'arrow',
        color: '#0164b4',
        strokeWidth: 2,
        isDashed: true,
        points: [
          { x: 78, y: 24 },
          { x: 68, y: 38 },
        ],
      },
    ],
    entities: [
      { id: 'e-1', type: 'PLAYER_T', x: 28, y: 72, label: 'T1' },
      { id: 'e-2', type: 'PLAYER_T', x: 32, y: 76, label: 'T2' },
      { id: 'e-3', type: 'PLAYER_T', x: 36, y: 84, label: 'T3' },
      { id: 'e-4', type: 'PLAYER_CT', x: 76, y: 22, label: 'CT' },
      { id: 'e-5', type: 'PLAYER_CT', x: 62, y: 36, label: 'CT' },
      { id: 'e-6', type: 'SMOKE', x: 74, y: 34 },
      { id: 'e-7', type: 'SMOKE', x: 56, y: 36 },
      { id: 'e-8', type: 'SMOKE', x: 52, y: 46 },
      { id: 'e-9', type: 'MOLOTOV', x: 66, y: 44 },
      { id: 'e-10', type: 'FLASH', x: 48, y: 60 },
      { id: 'e-11', type: 'BOMB', x: 30, y: 78 },
    ],
  },
  {
    id: 'mirage-mid-control',
    title: 'MIRAGE_MID_CONTROL',
    mapId: 'mirage',
    description: 'Controle de Meio com Smoke na Janela, Molotov Conector e Flash Top Meio.',
    paths: [
      {
        id: 'pm-1',
        tool: 'arrow',
        color: '#f6ae2d',
        strokeWidth: 3,
        isDashed: true,
        points: [
          { x: 24, y: 52 },
          { x: 38, y: 46 },
          { x: 48, y: 44 },
        ],
      },
      {
        id: 'pm-2',
        tool: 'arrow',
        color: '#0164b4',
        strokeWidth: 2,
        isDashed: true,
        points: [
          { x: 62, y: 42 },
          { x: 54, y: 44 },
        ],
      },
    ],
    entities: [
      { id: 'em-1', type: 'PLAYER_T', x: 22, y: 54, label: 'AWP' },
      { id: 'em-2', type: 'PLAYER_T', x: 26, y: 48, label: 'T2' },
      { id: 'em-3', type: 'PLAYER_CT', x: 64, y: 40, label: 'CT' },
      { id: 'em-4', type: 'SMOKE', x: 52, y: 40 },
      { id: 'em-5', type: 'MOLOTOV', x: 54, y: 48 },
      { id: 'em-6', type: 'FLASH', x: 42, y: 46 },
    ],
  },
  {
    id: 'inferno-banana-take',
    title: 'INFERNO_BANANA_SPLIT',
    mapId: 'inferno',
    description:
      'Avanço coordenado na Banana com Smokes em Caixão e CT, limpando Carro com Molotov.',
    paths: [
      {
        id: 'pi-1',
        tool: 'arrow',
        color: '#f6ae2d',
        strokeWidth: 3,
        isDashed: true,
        points: [
          { x: 32, y: 78 },
          { x: 44, y: 64 },
          { x: 56, y: 48 },
        ],
      },
    ],
    entities: [
      { id: 'ei-1', type: 'PLAYER_T', x: 30, y: 80, label: 'T1' },
      { id: 'ei-2', type: 'PLAYER_T', x: 34, y: 82, label: 'T2' },
      { id: 'ei-3', type: 'PLAYER_CT', x: 62, y: 38, label: 'CT' },
      { id: 'ei-4', type: 'SMOKE', x: 64, y: 36 },
      { id: 'ei-5', type: 'SMOKE', x: 58, y: 34 },
      { id: 'ei-6', type: 'MOLOTOV', x: 48, y: 56 },
      { id: 'ei-7', type: 'FLASH', x: 46, y: 66 },
      { id: 'ei-8', type: 'BOMB', x: 32, y: 86 },
    ],
  },
];
