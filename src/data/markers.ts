// Tipagem para os vídeos
export interface VideoData {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  title: string;
  thumbnail: string;
  embedUrl: string;
}

// Tipagem para os marcadores (Smokes, Flashes, etc)
export interface MarkerData {
  id: string;
  mapId: string; // Adicionamos mapId para no futuro filtrar os marcadores por mapa
  side: string;
  type: 'SMOKE' | 'FLASH' | 'MOLOTOV';
  title: string;
  diff: string;
  tick: string;
  y: string;
  x: string;
  desc: string;
  videos: VideoData[];
}

// Banco de dados provisório das granadas
export const tacticalMarkers: MarkerData[] = [
  {
    id: 'a-jungle',
    mapId: 'mirage',
    side: 'COUNTER-TERRORIST',
    type: 'SMOKE',
    title: 'A Site Jungle Smoke',
    diff: 'MEDIUM',
    tick: '64/128 TICK',
    y: '30%',
    x: '75%',
    desc: 'Crucial smoke to block vision from Jungle and Connector when executing A Site.',
    videos: [
      {
        id: 'v1',
        platform: 'youtube',
        title: 'Pro Lineup 64 Tick',
        thumbnail:
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300&h=533',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      {
        id: 'v2',
        platform: 'tiktok',
        title: 'Quick Jumpthrow',
        thumbnail:
          'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&q=80&w=300&h=533',
        embedUrl: 'https://www.tiktok.com/embed/v2/7049442031173668102',
      },
      {
        id: 'v3',
        platform: 'instagram',
        title: 'Navi Setup',
        thumbnail:
          'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=300&h=533',
        embedUrl: 'https://www.instagram.com/p/C123456789/embed',
      },
    ],
  },
  {
    id: 'mid-window',
    mapId: 'mirage',
    side: 'TERRORIST',
    type: 'SMOKE',
    title: 'Mid Window Smoke',
    diff: 'HARD',
    tick: '128 TICK ONLY',
    y: '46%',
    x: '40%',
    desc: 'Essential map control smoke. Blocks Sniper nest completely.',
    videos: [
      {
        id: 'v4',
        platform: 'youtube',
        title: 'Instant Window Smoke',
        thumbnail:
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=300&h=533',
        embedUrl: 'https://www.youtube.com/embed/BnlcY4U2ktE',
      },
    ],
  },
  {
    id: 'b-market',
    mapId: 'mirage',
    side: 'TERRORIST',
    type: 'SMOKE',
    title: 'B Market Window Smoke',
    diff: 'EASY',
    tick: '64/128 TICK',
    y: '65%',
    x: '25%',
    desc: 'Standard execution smoke to isolate B site players from Market rotations. Stand at the trash can outside B apps, aim at the corner of the tower, left click throw.',
    videos: [],
  },
];
