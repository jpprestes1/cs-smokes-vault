import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TacticalBoardAuthLockProps {
  radarImage?: string;
  mapName?: string;
}

export default function TacticalBoardAuthLock({
  radarImage,
  mapName = 'TACTICAL MAP',
}: TacticalBoardAuthLockProps) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="bg-grid relative flex h-full w-full flex-1 items-center justify-center overflow-hidden p-4 select-none md:p-8">
      {/* Container Principal que ocupa a mesma proporção e espaço do mapa */}
      <div className="bg-surface-container-lowest border-outline-variant/40 glass-panel relative aspect-square w-full max-w-[min(90vw,78vh)] overflow-hidden rounded-lg border-2 shadow-2xl lg:max-w-[650px]">
        {/* Fundo do Radar com Blur Intenso e Grayscale */}
        {radarImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 grayscale filter blur-[3px]"
            style={{ backgroundImage: `url('${radarImage}')` }}
          />
        )}

        {/* Gradiente Escuro Superposto com Linhas de Mira Táticas */}
        <div className="absolute inset-0 bg-radial from-black/40 via-black/80 to-black/95" />

        {/* Linhas de Mira / Grid Tático decorativo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
          <div className="border-primary/40 h-full w-[1px] border-r border-dashed" />
          <div className="border-primary/40 absolute h-[1px] w-full border-b border-dashed" />
          <div className="border-primary/30 h-48 w-48 rounded-full border border-dashed" />
          <div className="border-primary/20 h-80 w-80 rounded-full border border-dashed" />
        </div>

        {/* Marcadores de Canto HUD */}
        <div className="border-primary/60 pointer-events-none absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2" />
        <div className="border-primary/60 pointer-events-none absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2" />
        <div className="border-primary/60 pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2" />
        <div className="border-primary/60 pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2" />

        {/* Header HUD do Painel */}
        <div className="font-data-label text-outline-variant absolute top-4 left-6 flex items-center gap-2 text-[10px] tracking-widest uppercase">
          <span className="bg-error inline-block h-1.5 w-1.5 rounded-full animate-pulse" />
          <span>MAP: {mapName.toUpperCase()} // SECTOR_LOCKED</span>
        </div>

        {/* Conteúdo Central de Bloqueio */}
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 text-center">
          {/* Ícone de Cadeado Tático com Alerta Pulsante */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10 shadow-[0_0_30px_rgba(246,174,45,0.25)]">
            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="bg-error absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" />
              <span className="bg-error relative inline-flex h-4 w-4 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </span>
          </div>

          {/* Título Principal */}
          <h2 className="font-headline-md text-primary mb-2 text-lg font-black tracking-wider uppercase sm:text-xl md:text-2xl">
            {t('tacticalBoard.authRequiredTitle', 'ACESSO RESTRITO // AGENTE NÃO AUTENTICADO')}
          </h2>

          {/* Descrição Tática */}
          <p className="font-body-base text-on-surface-variant mb-6 max-w-sm text-xs leading-relaxed sm:text-sm">
            {t(
              'tacticalBoard.authRequiredDesc',
              'O Strat Board é uma ferramenta tática avançada para desenho, simulação de rounds e criação de estratégias. Conecte-se para acessar o quadro interativo e salvar suas táticas.'
            )}
          </p>

          {/* Botões de Ação com Redirecionamento de Retorno */}
          <div className="flex w-full max-w-xs flex-col items-center gap-3 sm:flex-row">
            <Link
              to="/login"
              state={{ from: location }}
              className="bg-primary text-on-primary hover:shadow-[0_0_20px_rgba(246,174,45,0.5)] font-headline-md flex h-10 w-full items-center justify-center gap-2 rounded-sm text-xs font-black tracking-wider uppercase transition-all active:scale-95 sm:flex-1"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              {t('nav.login', 'Entrar')}
            </Link>

            <Link
              to="/register"
              state={{ from: location }}
              className="bg-surface-container-high border-outline-variant hover:border-primary text-on-surface hover:text-primary font-headline-md flex h-10 w-full items-center justify-center gap-2 rounded-sm border text-xs font-black tracking-wider uppercase transition-all active:scale-95 sm:flex-1"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              {t('nav.register', 'Cadastrar')}
            </Link>
          </div>

          {/* Rodapé Militar de Protocolo */}
          <div className="font-data-label text-outline-variant/60 mt-6 text-[9px] tracking-widest uppercase">
            [ PROTOCOLO DE SEGURANÇA // AUTENTICAÇÃO OBRIGATÓRIA ]
          </div>
        </div>
      </div>
    </div>
  );
}
