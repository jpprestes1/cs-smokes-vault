import { useState, useEffect } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { mapsDatabase } from '../data/maps';

export interface RankedMap {
  id: string;
  name: string;
  image: string;
  grenadesCount: number;
  combosCount: number;
  totalCount: number;
}

export function useRankedMaps() {
  const [rankedMaps, setRankedMaps] = useState<RankedMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const mapsWithCounts = await Promise.all(
          mapsDatabase.map(async (mapData) => {
            const mapSlug = mapData.name.toLowerCase().replace(/\s+/g, '-');

            // Executar as queries em paralelo para o mapa atual
            const [markersSnap, combosSnap] = await Promise.all([
              getCountFromServer(query(collection(db, 'markers'), where('mapId', '==', mapSlug))),
              getCountFromServer(query(collection(db, 'combos'), where('mapId', '==', mapSlug))),
            ]);

            const grenadesCount = markersSnap.data().count;
            const combosCount = combosSnap.data().count;

            return {
              ...mapData,
              grenadesCount,
              combosCount,
              totalCount: grenadesCount + combosCount,
            };
          })
        );

        // Ordenar de forma decrescente com base no totalCount
        const sorted = mapsWithCounts.sort((a, b) => b.totalCount - a.totalCount);
        setRankedMaps(sorted);
      } catch (error) {
        console.error('Error fetching map counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { rankedMaps, isLoading };
}
