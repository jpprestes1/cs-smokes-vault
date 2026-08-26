export default function MapCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="tactical-glass tactical-shimmer bg-surface-container/40 relative h-48 w-full overflow-hidden rounded-sm border border-white/5 select-none"
    >
      {/* Grade de radar sutil de fundo */}
      <div className="radar-grid absolute inset-0 opacity-20" />

      {/* Gradiente escuro inferior */}
      <div className="from-surface-container-lowest pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent opacity-80" />

      {/* Indicador tático de sincronização no canto superior direito */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-50">
        <span className="bg-primary-container/80 h-1.5 w-1.5 animate-ping rounded-full" />
        <span className="font-data-label text-on-surface-variant text-[10px] tracking-widest uppercase">
          SYNC
        </span>
      </div>

      {/* Conteúdo inferior simulando título e contagens */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        {/* Placeholder do nome do mapa */}
        <div className="bg-primary-container/20 h-5 w-28 animate-pulse rounded-xs" />

        {/* Placeholder dos contadores (granadas e combos) */}
        <div className="flex items-center gap-2">
          <div className="bg-surface-variant/80 h-3 w-16 animate-pulse rounded-xs" />
          <span className="text-on-surface-variant/30 text-[10px]">●</span>
          <div className="bg-surface-variant/80 h-3 w-14 animate-pulse rounded-xs" />
        </div>
      </div>
    </div>
  );
}
