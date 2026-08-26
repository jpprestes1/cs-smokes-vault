import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { StratData } from '../types';
import { mapsDatabase } from '../../maps/data/maps';

interface StratCardProps {
  strat: StratData;
  currentUserId?: string;
  isAdmin?: boolean;
  onOpen: (strat: StratData) => void;
  onShare: (strat: StratData) => void;
  onDelete?: (stratId: string, title: string) => void;
}

export default function StratCard({
  strat,
  currentUserId,
  isAdmin = false,
  onOpen,
  onShare,
  onDelete,
}: StratCardProps) {
  const { t, i18n } = useTranslation();

  const isOwner = Boolean(currentUserId && strat.authorId === currentUserId);
  const canDelete = isOwner || isAdmin;

  const mapInfo = useMemo(() => {
    return (
      mapsDatabase.find((m) => m.id.toLowerCase() === strat.mapId.toLowerCase()) || {
        id: strat.mapId,
        name: strat.mapId.toUpperCase(),
        image: '',
        radarImage: '',
      }
    );
  }, [strat.mapId]);

  // Contagem acumulada de entidades e utilitários nos frames
  const stats = useMemo(() => {
    const frames = strat.frames && strat.frames.length > 0 ? strat.frames : [];
    let playersT = 0;
    let playersCt = 0;
    let smokes = 0;
    let flashes = 0;
    let molotovs = 0;
    let heGrenades = 0;

    if (frames.length > 0) {
      for (const frame of frames) {
        for (const ent of frame.entities || []) {
          if (ent.type === 'PLAYER_T') playersT++;
          else if (ent.type === 'PLAYER_CT') playersCt++;
          else if (ent.type === 'SMOKE') smokes++;
          else if (ent.type === 'FLASH') flashes++;
          else if (ent.type === 'MOLOTOV') molotovs++;
          else if (ent.type === 'HE_GRENADE') heGrenades++;
        }
      }
    } else {
      for (const ent of strat.entities || []) {
        if (ent.type === 'PLAYER_T') playersT++;
        else if (ent.type === 'PLAYER_CT') playersCt++;
        else if (ent.type === 'SMOKE') smokes++;
        else if (ent.type === 'FLASH') flashes++;
        else if (ent.type === 'MOLOTOV') molotovs++;
        else if (ent.type === 'HE_GRENADE') heGrenades++;
      }
    }

    const totalFrames = frames.length > 0 ? frames.length : 1;
    return { playersT, playersCt, smokes, flashes, molotovs, heGrenades, totalFrames };
  }, [strat]);

  const formattedDate = useMemo(() => {
    if (!strat.createdAt) return '';
    try {
      const date = new Date(strat.createdAt);
      return new Intl.DateTimeFormat(i18n.language || 'pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return '';
    }
  }, [strat.createdAt, i18n.language]);

  const avatarUrl = useMemo(() => {
    const seed = strat.authorEmail || strat.authorId || 'tactical';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=f6ae2d`;
  }, [strat.authorEmail, strat.authorId]);

  const authorDisplayName = useMemo(() => {
    if (strat.authorEmail) {
      return strat.authorEmail.split('@')[0];
    }
    return t('common.creator', 'Operador');
  }, [strat.authorEmail, t]);

  const sideBadgeConfig = useMemo(() => {
    switch (strat.side) {
      case 'TERRORIST':
        return {
          label: t('maps.sideT', 'Terrorista (TR)'),
          badgeClass: 'bg-primary/15 text-primary border-primary/40',
          dotClass: 'bg-primary',
        };
      case 'COUNTER-TERRORIST':
        return {
          label: t('maps.sideCt', 'Contra-Terrorista (CT)'),
          badgeClass: 'bg-secondary/15 text-secondary border-secondary/40',
          dotClass: 'bg-secondary',
        };
      default:
        return {
          label: t('tacticalBoard.bothSides', 'Misto / Ambos'),
          badgeClass: 'bg-white/10 text-white/80 border-white/20',
          dotClass: 'bg-neutral-400',
        };
    }
  }, [strat.side, t]);

  return (
    <div className="bg-surface-container/70 hover:border-primary/50 tactical-glass group relative flex flex-col justify-between overflow-hidden rounded-lg border border-white/10 shadow-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(246,174,45,0.12)]">
      {/* Background Radar Sutil com Gradiente Overlay */}
      {mapInfo.radarImage && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
          <img
            src={mapInfo.radarImage}
            alt={mapInfo.name}
            className="h-full w-full object-cover object-center contrast-125 grayscale filter"
          />
          <div className="from-surface-container via-surface-container/90 to-surface-container/95 absolute inset-0 bg-gradient-to-t" />
        </div>
      )}

      {/* Conteúdo Superior */}
      <div className="p-5">
        {/* Cabeçalho do Card: Mapa + Lado + Marcos de Tempo */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {/* Tag Mapa */}
            <span className="font-data-label text-on-surface bg-surface-variant/40 rounded-sm border border-white/10 px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              {mapInfo.name}
            </span>

            {/* Tag Lado */}
            <span
              className={`font-data-label flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${sideBadgeConfig.badgeClass}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${sideBadgeConfig.dotClass}`}
              />
              {sideBadgeConfig.label}
            </span>

            {/* Tag Visibilidade (se for privada ou se for o proprietário) */}
            {strat.isPublic === false ? (
              <span className="font-data-label text-on-surface-variant flex items-center gap-1 rounded-sm border border-neutral-700 bg-neutral-800/80 px-2 py-0.5 text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                {t('tacticalBoard.private', 'Privada')}
              </span>
            ) : isOwner ? (
              <span className="font-data-label flex items-center gap-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                <span className="material-symbols-outlined text-[12px]">public</span>
                {t('tacticalBoard.public', 'Pública')}
              </span>
            ) : null}
          </div>

          {/* Tag Marcos Temporais / Timeline */}
          <div className="font-data-label text-on-surface-variant flex items-center gap-1 text-[11px]">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span>
              {stats.totalFrames > 1
                ? `${stats.totalFrames} ${t('tacticalBoard.timeline.step', 'FRAMES')}`
                : `1:40`}
            </span>
          </div>
        </div>

        {/* Título da Estratégia */}
        <h3
          onClick={() => onOpen(strat)}
          className="font-display-lg group-hover:text-primary mt-3 line-clamp-1 cursor-pointer text-base font-bold tracking-wide text-white uppercase transition-colors"
          title={strat.title}
        >
          {strat.title}
        </h3>

        {/* Descrição / Notas */}
        <p className="font-body-base text-on-surface-variant mt-1 line-clamp-2 min-h-[38px] text-xs leading-relaxed">
          {strat.description ||
            t('tacticalBoard.noDescription', 'Estratégia sem descrição cadastrada.')}
        </p>

        {/* Pílulas de Conteúdo Tático (Jogadores, Utilitários, Trajetórias) */}
        <div className="font-data-label mt-4 flex flex-wrap items-center gap-1.5 text-[10px]">
          {(stats.playersT > 0 || stats.playersCt > 0) && (
            <span className="bg-surface-variant/30 text-on-surface flex items-center gap-1 rounded-sm border border-white/5 px-2 py-0.5 font-medium">
              <span className="material-symbols-outlined text-[13px]">person</span>
              {stats.playersT + stats.playersCt}
            </span>
          )}

          {stats.smokes > 0 && (
            <span className="flex items-center gap-1 rounded-sm border border-neutral-500/20 bg-neutral-500/10 px-2 py-0.5 font-medium text-neutral-300">
              <span className="material-symbols-outlined text-[13px]">cloud</span>
              {stats.smokes} Smoke{stats.smokes > 1 ? 's' : ''}
            </span>
          )}

          {stats.flashes > 0 && (
            <span className="flex items-center gap-1 rounded-sm border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-medium text-amber-300">
              <span className="material-symbols-outlined text-[13px]">flash_on</span>
              {stats.flashes} Flash{stats.flashes > 1 ? 'es' : ''}
            </span>
          )}

          {stats.molotovs > 0 && (
            <span className="flex items-center gap-1 rounded-sm border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-medium text-red-300">
              <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
              {stats.molotovs} Molotov{stats.molotovs > 1 ? 's' : ''}
            </span>
          )}

          {stats.heGrenades > 0 && (
            <span className="flex items-center gap-1 rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-300">
              <span className="material-symbols-outlined text-[13px]">sports_volleyball</span>
              {stats.heGrenades} HE{stats.heGrenades > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Rodapé do Card com Autor e Ações */}
      <div className="bg-surface-container-high/40 flex items-center justify-between border-t border-white/5 px-5 py-3">
        {/* Informações do Autor e Data */}
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          <img
            src={avatarUrl}
            alt={authorDisplayName}
            className="border-primary/40 h-6 w-6 rounded-full border object-cover"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-data-label text-on-surface truncate text-xs font-bold">
              {authorDisplayName}
              {isOwner && (
                <span className="bg-primary/20 text-primary border-primary/30 py-0.2 ml-1 rounded-xs border px-1 text-[9px] font-bold">
                  {t('common.you', 'VOCÊ')}
                </span>
              )}
            </span>
            {formattedDate && (
              <span className="text-on-surface-variant font-data-label text-[10px]">
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-1.5">
          {/* Botão Compartilhar */}
          <button
            onClick={() => onShare(strat)}
            className="text-on-surface-variant hover:text-primary rounded p-1.5 transition-colors hover:bg-white/5"
            title={t('tacticalBoard.shareStrat', 'Copiar Link / Compartilhar')}
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>

          {/* Botão Excluir (se proprietário ou admin) */}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(strat.id, strat.title)}
              className="text-on-surface-variant hover:text-error hover:bg-error/15 rounded p-1.5 transition-colors"
              title={t('common.delete', 'Excluir Tática')}
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}

          {/* Botão Principal: Abrir no Strat Board */}
          <button
            onClick={() => onOpen(strat)}
            className="bg-primary text-on-primary font-headline-md hover:bg-primary/90 flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[15px]">draw</span>
            <span>{t('tacticalBoard.openInBoardShort', 'ABRIR')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
