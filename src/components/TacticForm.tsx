import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type MarkerData } from '../data/markers'; // Importando a tipagem

interface TacticFormProps {
  mapId?: string;
  markers: MarkerData[];
  coords: { x: number; y: number }; // Adicionado para receber as granadas atuais e comparar distância
  onClose: () => void;
}

interface FormData {
  title: string;
  type: string;
  side: string;
  diff: string;
  x: string;
  y: string;
  throwX: string;
  throwY: string;
  desc: string;
  videoUrl: string;
  platform: string;
}

export default function TacticForm({ mapId, markers, coords, onClose }: TacticFormProps) {
  const isMobile = window.innerWidth < 768;
  const [formData, setFormData] = useState<FormData>({
    title: '',
    type: 'SMOKE',
    side: 'TERRORIST',
    diff: 'MEDIUM',
    x: isMobile ? coords.x.toString() : '',
    y: isMobile ? coords.y.toString() : '',
    throwX: '',
    throwY: '',
    desc: '',
    videoUrl: '',
    platform: 'youtube',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para converter links normais em links de iframe (Embed)
  const formatEmbedUrl = (url: string, platform: string): string => {
    if (!url) return '';

    try {
      if (platform === 'youtube') {
        // Pega links: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;

        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      } else if (platform === 'tiktok') {
        // Pega links: tiktok.com/@usuario/video/123456789
        const regExp = /video\/(\d+)/;
        const match = url.match(regExp);
        const videoId = match ? match[1] : null;

        return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;
      } else if (platform === 'instagram') {
        // Pega links: instagram.com/p/ID ou instagram.com/reel/ID
        const regExp = /(?:p|reel)\/([a-zA-Z0-9_-]+)/;
        const match = url.match(regExp);
        const postId = match ? match[1] : null;

        // O Instagram aceita apenas adicionar /embed no final da URL do post
        return postId ? `https://www.instagram.com/p/${postId}/embed` : url;
      }
    } catch (error) {
      console.error('Erro ao formatar URL do vídeo:', error);
    }

    // Se a regex falhar ou a URL já for um embed, retorna a própria URL
    return url;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.x || !formData.y) {
      alert('Please fill in the Title, X and Y coordinates.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Cria o objeto do vídeo avulso (se o usuário tiver preenchido a URL)
      const newVideo = formData.videoUrl
        ? {
            id: crypto.randomUUID(),
            platform: formData.platform as 'youtube' | 'tiktok' | 'instagram',
            title: formData.title, // Usa o título da form para o vídeo
            thumbnail: '',
            embedUrl: formatEmbedUrl(formData.videoUrl, formData.platform),
            throwX: Number(formData.throwX),
            throwY: Number(formData.throwY),
          }
        : null;

      const newX = Number(formData.x);
      const newY = Number(formData.y);

      // PROCURA SE JÁ EXISTE UMA GRANADA PRÓXIMA (Raio de 3%)
      const existingMarker = markers.find((m) => {
        // Tem que ser do mesmo tipo (Smoke com Smoke) e lado (TR com TR)
        if (m.type !== formData.type || m.side !== formData.side) return false;

        // Remove o símbolo de % caso o banco ainda tenha dados antigos em string e converte para número
        const mX = parseFloat(String(m.x).replace('%', ''));
        const mY = parseFloat(String(m.y).replace('%', ''));

        // Verifica se a diferença absoluta de X e Y é menor ou igual a 3
        return Math.abs(mX - newX) <= 3 && Math.abs(mY - newY) <= 3;
      });

      if (existingMarker) {
        // ======= ATUALIZA A GRANADA EXISTENTE =======
        if (newVideo) {
          const markerRef = doc(db, 'markers', existingMarker.id);

          // arrayUnion adiciona o vídeo à lista existente de forma segura
          await updateDoc(markerRef, {
            videos: arrayUnion(newVideo),
          });
          alert('Um marcador próximo já existia! Seu vídeo foi agrupado com sucesso.');
        } else {
          alert(
            'Já existe um marcador nesse local, mas você não inseriu uma URL de vídeo para adicionar.'
          );
        }
      } else {
        // ======= CRIA UMA NOVA GRANADA =======
        await addDoc(collection(db, 'markers'), {
          mapId: mapId,
          title: formData.title,
          type: formData.type,
          side: formData.side,
          diff: formData.diff,
          x: newX, // Mantido como Number conforme sua alteração
          y: newY, // Mantido como Number conforme sua alteração
          desc: formData.desc,
          videos: newVideo ? [newVideo] : [],
        });
        alert('Nova tática publicada com sucesso!');
      }

      onClose();
    } catch (error) {
      alert('Error saving to database.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
        <h3 className="font-headline-md text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">add_location_alt</span> ADD NEW TACTIC
        </h3>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:text-primary bg-surface-variant/30 rounded p-1 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-6">
        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">TITLE</span>
          <input
            type="text"
            placeholder="Ex: CT Ticket Booth Smoke"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">TYPE</span>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
            >
              <option value="SMOKE">SMOKE</option>
              <option value="FLASH">FLASH</option>
              <option value="MOLOTOV">MOLOTOV</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">SIDE</span>
            <select
              value={formData.side}
              onChange={(e) => setFormData({ ...formData, side: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container rounded border border-white/10 p-2 text-sm outline-none"
            >
              <option value="TERRORIST">TERRORIST</option>
              <option value="COUNTER-TERRORIST">CT</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">COORD X (%)</span>
            <input
              type="number"
              placeholder="Ex: 45"
              value={formData.x}
              onChange={(e) => setFormData({ ...formData, x: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">COORD Y (%)</span>
            <input
              type="number"
              placeholder="Ex: 50"
              value={formData.y}
              onChange={(e) => setFormData({ ...formData, y: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              THROW COORD X (%)
            </span>
            <input
              type="number"
              placeholder="Ex: 45"
              value={formData.throwX}
              onChange={(e) => setFormData({ ...formData, throwX: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-on-surface-variant font-data-label text-xs">
              THROW COORD Y (%)
            </span>
            <input
              type="number"
              placeholder="Ex: 50"
              value={formData.throwY}
              onChange={(e) => setFormData({ ...formData, throwY: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary rounded border border-white/10 p-2 text-sm outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-on-surface-variant font-data-label text-xs">DESCRIPTION</span>
          <textarea
            rows={3}
            placeholder="Lineup instructions..."
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            className="bg-surface-variant/20 text-on-surface focus:border-primary resize-none rounded border border-white/10 p-2 text-sm outline-none"
          />
        </label>

        <div className="mt-2 border-t border-white/10 pt-4">
          <span className="text-on-surface-variant font-data-label mb-2 block text-xs">
            ATTACH VIDEO (OPTIONAL)
          </span>
          <div className="flex gap-2">
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary [&>option]:bg-surface-container w-1/3 rounded border border-white/10 p-2 text-sm outline-none"
            >
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Insta</option>
            </select>
            <input
              type="text"
              placeholder="Embed URL"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              className="bg-surface-variant/20 text-on-surface focus:border-primary flex-1 rounded border border-white/10 p-2 text-sm outline-none"
            />
          </div>
        </div>

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
