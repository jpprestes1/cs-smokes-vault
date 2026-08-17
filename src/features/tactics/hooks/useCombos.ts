import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type ComboData } from '../types';

export function useCombos(mapId?: string) {
  const [combos, setCombos] = useState<ComboData[]>([]);
  const [isLoadingCombos, setIsLoadingCombos] = useState(true);

  useEffect(() => {
    if (!mapId) return;

    // Busca na coleção 'combos'
    const q = query(collection(db, 'combos'), where('mapId', '==', mapId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const parsedData: ComboData[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ComboData[];
        setCombos(parsedData);
        setIsLoadingCombos(false);
      },
      (err) => {
        console.error('Erro ao buscar combos:', err);
        setIsLoadingCombos(false);
      }
    );

    return () => unsubscribe();
  }, [mapId]);

  return { combos, isLoadingCombos };
}
