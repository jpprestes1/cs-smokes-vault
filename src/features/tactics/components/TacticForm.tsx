import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type MarkerData, type TacticFormData, type VideoData } from '../types';
import TacticFormSelector from './TacticFormSelector';
import TacticFormManualFields from './TacticFormManualFields';
import TacticFormVideoFields from './TacticFormVideoFields';
import { formatEmbedUrl } from '../../../utils/videoFormatting';

interface TacticFormProps {
  mapId?: string;
  markers: MarkerData[];
  coords: { x: number; y: number };
  onClose: () => void;
  initialData?: MarkerData; // Propriedade de edição
}

export default function TacticForm({
  mapId,
  markers,
  coords,
  onClose,
  initialData,
}: TacticFormProps) {
  const { t } = useTranslation();
  const isMobile = window.innerWidth < 768;
  const [isManualEntry, setIsManualEntry] = useState(!!initialData); // Já abre manual se for edição
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<TacticFormData>({
    markerId: initialData?.id || '',
    title: initialData?.title || '',
    titleVideo: '',
    type: initialData?.type || 'SMOKE',
    side: initialData?.side || 'TERRORIST',
    x: initialData?.x.toString() || (isMobile ? coords.x.toString() : ''),
    y: initialData?.y.toString() || (isMobile ? coords.y.toString() : ''),
    throwX: '',
    throwY: '',
    desc: initialData?.desc || '',
    videoUrl: '',
    platform: 'youtube',
    author: '',
    difficulty: 'MEDIUM',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    // Validação básica do formulário manual
    if (isManualEntry && (!formData.title || !formData.x || !formData.y)) {
      showToast(t('tactics.formErrors.fillTitleXY'), 'error');
      return;
    }

    // Se NÃO for edição e NÃO estiver agrupando a um marcador existente, o vídeo é obrigatório
    if (
      !initialData &&
      !formData.markerId &&
      (!formData.videoUrl || !formData.throwX || !formData.throwY)
    ) {
      showToast(t('tactics.formErrors.videoAndThrowRequired'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanAuthor = formData.author.replace(/^@+/, '').trim();
      const now = new Date().toISOString();

      if (initialData) {
        const updatePayload: Record<string, unknown> = {
          title: formData.title,
          type: formData.type,
          side: formData.side,
          x: Number(formData.x),
          y: Number(formData.y),
          desc: formData.desc,
          updatedAt: now,
        };

        if (formData.videoUrl && formData.throwX && formData.throwY) {
          const videoToAdd: VideoData = {
            id: crypto.randomUUID(),
            platform: formData.platform as VideoData['platform'],
            title: formData.titleVideo || formData.title,
            thumbnail: '',
            embedUrl: formatEmbedUrl(formData.videoUrl, formData.platform),
            throwX: Number(formData.throwX),
            throwY: Number(formData.throwY),
            author: cleanAuthor,
            difficulty: formData.difficulty || 'MEDIUM',
            createdAt: now,
            updatedAt: now,
          };
          updatePayload.videos = arrayUnion(videoToAdd);
        }

        await updateDoc(doc(db, 'markers', initialData.id), updatePayload);
        showToast(t('tactics.formSuccess.tacticUpdated'), 'success');
        setTimeout(() => onClose(), 1500);
        return;
      }

      // MODO CRIAÇÃO ----------------------
      const newVideo: VideoData = {
        id: crypto.randomUUID(),
        platform: formData.platform as VideoData['platform'],
        title: formData.titleVideo || formData.title,
        thumbnail: '',
        embedUrl: formatEmbedUrl(formData.videoUrl, formData.platform),
        throwX: Number(formData.throwX),
        throwY: Number(formData.throwY),
        author: cleanAuthor,
        difficulty: formData.difficulty || 'MEDIUM',
        createdAt: now,
        updatedAt: now,
      };

      if (!isManualEntry) {
        // Agrupando vídeo a um marcador existente
        await updateDoc(doc(db, 'markers', formData.markerId), {
          videos: arrayUnion(newVideo),
          updatedAt: now,
        });
      } else {
        // Criando um marcador totalmente novo
        await addDoc(collection(db, 'markers'), {
          mapId: mapId,
          title: formData.title,
          type: formData.type,
          side: formData.side,
          x: Number(formData.x),
          y: Number(formData.y),
          desc: formData.desc,
          videos: [newVideo],
          createdAt: now,
          updatedAt: now,
        });
      }

      showToast(t('tactics.formSuccess.actionSuccess'), 'success');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      showToast(t('tactics.formErrors.saveDb'), 'error');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      {toast && (
        <div
          className={`absolute top-4 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center gap-2 rounded px-4 py-3 shadow-xl transition-all duration-300 ${toast.type === 'success' ? 'bg-green-900/95 text-green-400' : 'bg-red-900/95 text-red-400'}`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-data-label text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">
            {initialData ? 'edit' : 'add_location_alt'}
          </span>
          {initialData ? t('tactics.editTactic') : t('maps.addTactic')}
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 items-center justify-center rounded p-1 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined p-1">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        {/* Esconde o seletor se estivermos editando uma granada já existente */}
        {!initialData && (
          <TacticFormSelector
            markers={markers}
            formData={formData}
            setFormData={setFormData}
            isManualEntry={isManualEntry}
            setIsManualEntry={setIsManualEntry}
          />
        )}

        {isManualEntry && <TacticFormManualFields formData={formData} setFormData={setFormData} />}

        {!initialData && (
          <TacticFormVideoFields
            formData={formData}
            setFormData={setFormData}
            isManualEntry={isManualEntry}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`font-headline-md mt-4 flex items-center justify-center gap-2 rounded-sm py-3 font-bold transition-transform ${
            isSubmitting
              ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
              : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'
          }`}
        >
          {isSubmitting
            ? t('common.saving').toUpperCase()
            : initialData
              ? t('tactics.updateTactic')
              : t('tactics.publishTactic')}
        </button>
      </div>
    </div>
  );
}
