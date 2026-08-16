import { useState, useEffect } from 'react';
import { collection, getCountFromServer, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type MarkerData } from '../types';

export function useMapMarkerCount(mapId: string) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!mapId) return;

    const fetchCount = async () => {
      try {
        const q = query(collection(db, 'markers'), where('mapId', '==', mapId));
        // getCountFromServer vai no Firebase e conta os documentos sem baixá-los!
        const snapshot = await getCountFromServer(q);
        setCount(snapshot.data().count);
      } catch (error) {
        console.error(`Erro ao buscar contagem do mapa ${mapId}:`, error);
        setCount(0);
      }
    };

    fetchCount();
  }, [mapId]);

  return count;
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
