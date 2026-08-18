import { useState, useEffect } from 'react';
import { collection, getCountFromServer, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export function useMapData<T>(collectionName: string, mapId?: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapId) return;
    const q = query(collection(db, collectionName), where('mapId', '==', mapId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(parsedData);
        setIsLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Falha ao conectar com o servidor.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mapId, collectionName]);

  return { data, isLoading, error };
}

// NOVO: Contador genérico (agora aceita collectionName)
export function useMapItemCount(collectionName: string, mapId: string) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!mapId) return;
    const fetchCount = async () => {
      try {
        const q = query(collection(db, collectionName), where('mapId', '==', mapId));
        const snapshot = await getCountFromServer(q);
        setCount(snapshot.data().count);
      } catch (error) {
        console.error(
          `Erro ao buscar contagem da coleção ${collectionName} do mapa ${mapId}:`,
          error
        );
        setCount(0);
      }
    };
    fetchCount();
  }, [mapId, collectionName]);

  return count;
}
