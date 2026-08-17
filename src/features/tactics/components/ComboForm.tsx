import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { type ComboTarget } from '../types';
import { formatEmbedUrl } from '../../../utils/videoFormatting';

interface ComboFormProps {
  mapId?: string;
  coords?: { x: number; y: number }; // Mantido na tipagem apenas para não quebrar propriedades passadas pelo pai
  onClose: () => void;
}

export default function ComboForm({ mapId, onClose }: ComboFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [title, setTitle] = useState('');
  const [side, setSide] = useState('TERRORIST');
  const [desc, setDesc] = useState('');

  // Coordenadas iniciais agora usam string temporariamente para permitir inputs vazios antes de enviar
  const [startX, setStartX] = useState('');
  const [startY, setStartY] = useState('');

  // Targets com endX e endY como string para lidar melhor com o input nativo
  const [targets, setTargets] = useState<
    Array<{ type: 'SMOKE' | 'FLASH' | 'MOLOTOV'; endX: string; endY: string }>
  >([]);

  // Campos do Vídeo
  const [videoUrl, setVideoUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [author, setAuthor] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddTarget = (e: React.MouseEvent) => {
    e.preventDefault();
    setTargets([...targets, { type: 'SMOKE', endX: '', endY: '' }]);
  };

  const handleRemoveTarget = (index: number) => {
    setTargets(targets.filter((_, i) => i !== index));
  };

  const handleTargetChange = (index: number, field: string, value: string) => {
    const updated = [...targets];
    updated[index] = { ...updated[index], [field]: value } as any;
    setTargets(updated);
  };

  const handleSubmit = async () => {
    if (!title || !startX || !startY || targets.length === 0 || !videoUrl) {
      showToast('Preencha título, posição inicial, alvos e vídeo.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newVideo = {
        id: crypto.randomUUID(),
        platform: platform as any,
        title: title,
        thumbnail: '',
        embedUrl: formatEmbedUrl(videoUrl, platform),
        author: author.replace(/^@+/, '').trim(),
      };

      // Converte as strings dos inputs de volta para números antes de salvar
      const formattedTargets: ComboTarget[] = targets.map((t) => ({
        type: t.type,
        endX: Number(t.endX),
        endY: Number(t.endY),
      }));

      await addDoc(collection(db, 'combos'), {
        mapId,
        title,
        side,
        startX: Number(startX),
        startY: Number(startY),
        targets: formattedTargets,
        desc,
        videos: [newVideo],
      });

      showToast('Combo publicado com sucesso!', 'success');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error(error);
      showToast('Erro ao salvar combo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col">
      {toast && (
        <div
          className={`absolute top-4 left-1/2 z-50 flex w-[95%] -translate-x-1/2 items-center gap-2 rounded px-4 py-3 shadow-xl transition-all ${toast.type === 'success' ? 'bg-green-900/95 text-green-400' : 'bg-red-900/95 text-red-400'}`}
        >
          <span className="font-data-label text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">strategy</span> ADD COMBO
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors"
        >
          <span className="material-symbols-outlined p-1">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">TITLE</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder="Ex: A Site Execute"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">SIDE</span>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            >
              <option value="TERRORIST">TERRORIST</option>
              <option value="COUNTER-TERRORIST">CT</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              START COORD X (%)
            </span>
            <input
              type="number"
              value={startX}
              onChange={(e) => setStartX(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder="Ex: 45"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              START COORD Y (%)
            </span>
            <input
              type="number"
              value={startY}
              onChange={(e) => setStartY(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
              placeholder="Ex: 50"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">DESCRIPTION</span>
          <textarea
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            placeholder="Execution details..."
          ></textarea>
        </label>

        <div className="border-t border-white/10 pt-4">
          <span className="text-on-surface-variant font-data-label mb-2 block text-xs">
            ATTACH VIDEO
          </span>
          <div className="mb-4 flex gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary w-1/3 rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            >
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL"
              className="bg-surface-variant/20 text-on-surface focus:border-primary flex-1 rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">CREATOR</span>
            <input
              type="text"
              placeholder="Ex: @LidesUT"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm transition-colors outline-none"
            />
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <span className="text-primary font-data-label mb-3 block text-xs font-bold uppercase">
            TARGET GRENADES
          </span>

          <div className="flex flex-col gap-3">
            {targets.map((target, idx) => (
              <div
                key={idx}
                className="bg-surface-container flex items-center gap-2 rounded border border-white/10 p-2"
              >
                <select
                  value={target.type}
                  onChange={(e) => handleTargetChange(idx, 'type', e.target.value)}
                  className="bg-transparent text-xs outline-none focus:ring-0"
                >
                  <option value="SMOKE">SMOKE</option>
                  <option value="FLASH">FLASH</option>
                  <option value="MOLOTOV">MOLOTOV</option>
                </select>

                <div className="flex flex-1 gap-2">
                  <input
                    type="number"
                    placeholder="X %"
                    value={target.endX}
                    onChange={(e) => handleTargetChange(idx, 'endX', e.target.value)}
                    className="bg-surface-variant/20 text-on-surface focus:border-primary w-full rounded border border-white/10 p-1.5 text-xs transition-colors outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Y %"
                    value={target.endY}
                    onChange={(e) => handleTargetChange(idx, 'endY', e.target.value)}
                    className="bg-surface-variant/20 text-on-surface focus:border-primary w-full rounded border border-white/10 p-1.5 text-xs transition-colors outline-none"
                  />
                </div>

                <button
                  onClick={() => handleRemoveTarget(idx)}
                  className="text-error hover:bg-error/20 rounded p-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTarget}
            className="text-on-surface hover:text-primary mt-3 flex w-full items-center justify-center gap-1 rounded border border-dashed border-white/20 p-2 text-xs font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span> ADD TARGET
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`font-headline-md mt-4 flex justify-center gap-2 rounded py-3 font-bold transition-transform ${isSubmitting ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary hover:shadow-[0_0_15px_rgba(246,174,45,0.4)] active:scale-95'}`}
        >
          {isSubmitting ? 'SAVING...' : 'PUBLISH COMBO'}
        </button>
      </div>
    </div>
  );
}
