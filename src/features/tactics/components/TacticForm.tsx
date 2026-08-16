import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type MarkerData, type TacticFormData } from '../types';

import TacticFormSelector from './TacticFormSelector';
import TacticFormManualFields from './TacticFormManualFields';
import TacticFormVideoFields from './TacticFormVideoFields';

interface TacticFormProps {
  mapId?: string;
  markers: MarkerData[];
  coords: { x: number; y: number };
  onClose: () => void;
}

export default function TacticForm({ mapId, markers, coords, onClose }: TacticFormProps) {
  const isMobile = window.innerWidth < 768;

  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NOVO: Estado para controlar o Popup/Toast customizado
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<TacticFormData>({
    markerId: '',
    title: '',
    titleVideo: '',
    type: 'SMOKE',
    side: 'TERRORIST',
    x: isMobile ? coords.x.toString() : '',
    y: isMobile ? coords.y.toString() : '',
    throwX: '',
    throwY: '',
    desc: '',
    videoUrl: '',
    platform: 'youtube',
    author: '',
    difficulty: 'MEDIUM',
  });

  // Função utilitária para exibir o Toast e fechar automaticamente
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const formatEmbedUrl = (url: string, platform: string): string => {
    if (!url) return '';
    try {
      if (platform === 'youtube') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      } else if (platform === 'tiktok') {
        const regExp = /video\/(\d+)/;
        const match = url.match(regExp);
        const videoId = match ? match[1] : null;
        return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
      } else if (platform === 'instagram') {
        const regExp = /(?:p|reel)\/([a-zA-Z0-9_-]+)/;
        const match = url.match(regExp);
        const postId = match ? match[1] : null;
        return postId ? `https://www.instagram.com/p/${postId}/embed` : url;
      }
    } catch (error) {
      console.error('Erro ao formatar URL do vídeo:', error);
    }
    return url;
  };

  const handleSubmit = async () => {
    // 1. Validação dos Modos (Manual ou Dropdown)
    if (isManualEntry && (!formData.title || !formData.x || !formData.y)) {
      showToast('Please fill in the Title, X and Y coordinates.', 'error');
      return;
    }
    if (!isManualEntry && !formData.markerId) {
      showToast('Please select an existing tactic or click + to create a new one.', 'error');
      return;
    }

    // 2. NOVO: Validação Obrigatória do Vídeo e Coordenadas de Lançamento
    if (!formData.videoUrl || !formData.throwX || !formData.throwY) {
      showToast('Video URL and Throw Coordinates are mandatory.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 3. NOVO: Limpeza do campo author (remove o @ do início, se existir)
      const cleanAuthor = formData.author.replace(/^@+/, '').trim();

      // Como o vídeo agora é obrigatório, o objeto sempre será criado
      const newVideo = {
        id: crypto.randomUUID(),
        platform: formData.platform as 'youtube' | 'tiktok' | 'instagram',
        title: formData.titleVideo || formData.title, // Fallback se título do vídeo for vazio
        thumbnail: '',
        embedUrl: formatEmbedUrl(formData.videoUrl, formData.platform),
        throwX: Number(formData.throwX),
        throwY: Number(formData.throwY),
        author: cleanAuthor,
        difficulty: formData.difficulty || 'MEDIUM',
      };

      if (!isManualEntry) {
        // Modo Dropdown
        const markerRef = doc(db, 'markers', formData.markerId);
        await updateDoc(markerRef, { videos: arrayUnion(newVideo) });

        showToast('Video added to the existing tactic successfully!', 'success');
        setTimeout(() => onClose(), 1500); // Aguarda 1.5s para o usuário ler a mensagem antes de fechar
      } else {
        // Modo Manual
        const newX = Number(formData.x);
        const newY = Number(formData.y);

        const existingMarker = markers.find((m) => {
          if (m.type !== formData.type || m.side !== formData.side) return false;
          const mX = parseFloat(String(m.x).replace('%', ''));
          const mY = parseFloat(String(m.y).replace('%', ''));
          return Math.abs(mX - newX) <= 3 && Math.abs(mY - newY) <= 3;
        });

        if (existingMarker) {
          const markerRef = doc(db, 'markers', existingMarker.id);
          await updateDoc(markerRef, { videos: arrayUnion(newVideo) });

          showToast('A similar marker already exists! Video grouped with it.', 'success');
          setTimeout(() => onClose(), 1500);
        } else {
          await addDoc(collection(db, 'markers'), {
            mapId: mapId,
            title: formData.title,
            type: formData.type,
            side: formData.side,
            x: newX,
            y: newY,
            desc: formData.desc,
            videos: [newVideo], // Passamos diretamente o array com o novo vídeo obrigatório
          });

          showToast('New tactic published successfully!', 'success');
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (error) {
      showToast('Error saving to database.', 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* NOVO: Popup/Toast Customizado */}
      {toast && (
        <div
          className={`animate-in fade-in slide-in-from-top-4 absolute top-4 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center gap-2 rounded px-4 py-3 shadow-xl transition-all duration-300 ${
            toast.type === 'success'
              ? 'border-green-500/30 bg-green-900/95 text-green-400'
              : 'border-red-500/30 bg-red-900/95 text-red-400'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-data-label text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">add_location_alt</span> ADD TACTIC
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 items-center justify-center rounded p-1 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined p-1">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <TacticFormSelector
          markers={markers}
          formData={formData}
          setFormData={setFormData}
          isManualEntry={isManualEntry}
          setIsManualEntry={setIsManualEntry}
        />

        {isManualEntry && <TacticFormManualFields formData={formData} setFormData={setFormData} />}

        <TacticFormVideoFields
          formData={formData}
          setFormData={setFormData}
          isManualEntry={isManualEntry}
        />

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`font-headline-md mt-4 flex items-center justify-center gap-2 rounded-sm py-3 font-bold transition-transform ${
            isSubmitting
              ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>{' '}
              SAVING...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">publish</span> PUBLISH TACTIC
            </>
          )}
        </button>
      </div>
    </div>
  );
}
