import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface VideoData {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  title: string;
  thumbnail: string;
  embedUrl: string;
}

export interface MarkerData {
  id: string; // O Firestore usa strings dinâmicas (Hashes) como ID padrão
  mapId: string;
  side: string;
  type: 'SMOKE' | 'FLASH' | 'MOLOTOV';
  title: string;
  diff: string;
  x: string;
  y: string;
  desc: string;
  videos: VideoData[];
}

// Hook agora aceita o mapId para baixar apenas as granadas do mapa atual (economiza leituras do Firebase!)
export function useMarkers(mapId?: string) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapId) return;

    // Cria uma query: "Me dê todos os marcadores ONDE o mapId seja igual ao mapa atual"
    const q = query(collection(db, 'markers'), where('mapId', '==', mapId));

    // onSnapshot cria um túnel em tempo real. Se alguém adicionar ou apagar no banco, essa função roda na hora.
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsedData: MarkerData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MarkerData[];

        setMarkers(parsedData);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Falha ao conectar com o servidor.');
        setIsLoading(false);
      }
    );

    // Limpa a conexão quando o usuário sair da página
    return () => unsubscribe();
  }, [mapId]);

  return { markers, isLoading, error };
}
