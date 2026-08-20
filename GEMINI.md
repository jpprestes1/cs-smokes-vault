# GEMINI.md - CS:GO / CS2 Tactical Vault

## 📖 Visão Geral do Projeto

**CS Smokes Vault (Tactical Vault)** é uma aplicação web moderna e interativa desenvolvida para jogadores e times de **Counter-Strike 2 (CS2)**. A plataforma funciona como um cofre tático interativo contendo lineups de granadas (*Smokes*, *Flashes*, *Molotovs*) e jogadas táticas coordenadas (*Executes/Combos*) mapeadas diretamente sobre os radares 2D oficiais dos mapas competitivos.

### Principais Funcionalidades
- **Radar 2D Interativo**: Navegação tática no radar com suporte a Zoom e Pan (arrasto), mapeamento percentual de coordenadas (0 a 100%) e visualização de trajetórias animadas em SVG.
- **Lineups Granulares e Combos/Executes**:
  - *Grenades View*: Exibição de granadas individuais agrupadas por posição, filtradas por lado (CT / TR / All Sides).
  - *Combos/Executes View*: Marcação de rotas táticas completas com múltiplos alvos disparados a partir de um ponto inicial de execução.
- **Suporte Multimídia**: Pré-visualização e reprodução embutida (*embed*) de vídeos de plataformas externas (**YouTube**, **TikTok**, **Instagram**) com detecção de dificuldade (*EASY*, *MEDIUM*, *HARD*).
- **Internacionalização (i18n)**: Suporte completo e dinâmico a 3 idiomas: **Português (`pt`)**, **Inglês (`en`)** e **Espanhol (`es`)**.
- **Autenticação & Controle de Acesso (RBAC)**:
  - `PLAYER`: Visualização pública de lineups e combos.
  - `CREATOR`: Criação e edição de lineups, vídeos e combos táticos.
  - `ADMIN`: Gestão total da plataforma, incluindo gerenciamento de papéis (*roles*) de usuários via painel administrativo (`/admin`).
- **Persistência em Tempo Real**: Integração reativa com Cloud Firestore via `onSnapshot` e Firebase Authentication.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| **Linguagem & Core** | React 19 (`react`, `react-dom`), TypeScript 6, Node.js |
| **Build & Bundler** | Vite 8 (`@vitejs/plugin-react`), Code Splitting manual (`manualChunks`) |
| **Estilização** | Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`), CSS Variables, Glassmorphism, Google Material Symbols |
| **Roteamento** | React Router v7 (`react-router-dom`), Lazy loading com `React.Suspense` |
| **Backend & Dados** | Firebase v12 (Cloud Firestore, Firebase Authentication) |
| **Internacionalização**| `i18next`, `react-i18next`, `i18next-browser-languagedetector` |
| **Qualidade & Lint** | ESLint 10 (Flat Config), Prettier + `prettier-plugin-tailwindcss` |

---

## 📁 Estrutura do Repositório

```text
cs-smokes-vault/
├── public/                     # Assets estáticos e imagens públicas
├── src/
│   ├── assets/                 # SVGs, ícones e assets importados no bundle
│   ├── components/             # Componentes globais e de layout
│   │   ├── shared/
│   │   │   └── VideoCard.tsx   # Card reutilizável de vídeo com badges e controles
│   │   ├── FeaturedMaps.tsx    # Seção de mapas em destaque na Home
│   │   ├── Footer.tsx          # Rodapé com branding e créditos
│   │   ├── Hero.tsx            # Seção Hero com CTA tático
│   │   ├── LanguageSwitcher.tsx# Seletor de idioma (PT, EN, ES)
│   │   ├── MobileMenu.tsx      # Menu tático deslizante para mobile
│   │   └── Navbar.tsx          # Barra de navegação com status de autenticação e avatar
│   ├── features/               # Módulos baseados em recursos (Feature-Sliced)
│   │   ├── auth/               # Autenticação e Autorização
│   │   │   ├── components/     # Componentes de rota protegida (ex: AdminRoutes.tsx)
│   │   │   └── hooks/          # Hook useAuth.ts (usuário atual, role, status)
│   │   ├── maps/               # Domínio dos Mapas de CS2
│   │   │   ├── components/     # MapCard.tsx, MapSideNav.tsx
│   │   │   ├── data/           # maps.ts (banco estático com metadados dos mapas e radares)
│   │   │   └── hooks/          # useRankedMaps.tsx (agregação de contagens)
│   │   └── tactics/            # Motor Tático (Lineups, Radar, Combos)
│   │       ├── components/     # RadarCanvas, ComboCanvas, TacticalMarker, TacticalPanel,
│   │       │                   # ComboDetails, ComboForm, TacticForm, TacticVideoPlayer, etc.
│   │       ├── hooks/          # useMapData.tsx (Firestore real-time & count), useCombos.ts
│   │       └── types/          # Tipos e interfaces TypeScript (MarkerData, ComboData, etc.)
│   ├── hooks/                  # Hooks utilitários globais (ex: usePanZoom.tsx)
│   │   └── usePanZoom.tsx      # Lógica de controle de zoom, arrasto e cálculo de (X, Y) no radar
│   ├── i18n/                   # Configuração do i18next e dicionários de tradução
│   │   ├── resources/          # pt.ts, en.ts, es.ts
│   │   └── index.ts            # Inicialização e detecção de idioma
│   ├── lib/                    # SDKs e clientes externos
│   │   └── firebase.ts         # Inicialização do Firebase App, Firestore (db) e Auth
│   ├── pages/                  # Componentes de páginas principais
│   │   ├── AdminDashboard.tsx  # Gestão administrativa de usuários e roles
│   │   ├── Home.tsx            # Landing page
│   │   ├── Login.tsx           # Tela de autenticação
│   │   ├── MapDetail.tsx       # Tela central do radar (Grenades e Combos)
│   │   ├── MapsView.tsx        # Catálogo de todos os mapas competitivos
│   │   └── Register.tsx        # Cadastro de novos agentes/usuários
│   ├── utils/                  # Funções utilitárias puras
│   │   └── videoFormatting.ts  # Parsing de URLs e conversão para embeds (YouTube, TikTok, IG)
│   ├── App.css
│   ├── App.tsx                 # Configuração de rotas e Suspense fallback
│   ├── index.css               # Design tokens Tailwind v4, estilos HUD, temas e animações
│   └── main.tsx                # Ponto de entrada React montando no DOM
├── .env                        # Variáveis de ambiente locais (Firebase config)
├── eslint.config.js            # Configuração do ESLint Flat
├── index.html                  # HTML base com fontes Google (Chivo, JetBrains Mono, Inter, Material Symbols)
├── package.json
├── tsconfig.json               # Configurações TypeScript
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json                 # Configurações de rotas SPA para deploy no Vercel
└── vite.config.ts              # Configuração Vite com Tailwind v4 e chunking de dependências
```

---

## 📊 Modelos de Dados & Esquemas (Firestore)

### 1. `users` (Coleção)
Armazena perfis e permissões dos usuários autenticados.
- **ID do Documento**: `uid` do Firebase Auth
- **Campos**:
  - `id`: `string`
  - `email`: `string`
  - `role`: `'ADMIN' | 'CREATOR' | 'PLAYER'`

### 2. `markers` (Coleção)
Registra posições individuais de granadas no mapa.
- **Campos**:
  - `id`: `string` (Hash dinâmico do Firestore)
  - `mapId`: `string` (ex: `'mirage'`, `'inferno'`, `'dust-2'`)
  - `side`: `'TERRORIST' | 'COUNTER-TERRORIST'`
  - `type`: `'SMOKE' | 'FLASH' | 'MOLOTOV'`
  - `title`: `string` (ex: "Janela do Meio")
  - `x`: `string` (coordenada horizontal em %, de "0" a "100")
  - `y`: `string` (coordenada vertical em %, de "0" a "100")
  - `desc`: `string` (descrição tática / instruções de alinhamento)
  - `createdAt?`: `string` (ISO 8601 timestamp da criação)
  - `updatedAt?`: `string` (ISO 8601 timestamp da última edição)
  - `videos`: `VideoData[]`
    - `id`: `string`
    - `platform`: `'youtube' | 'tiktok' | 'instagram'`
    - `title`: `string`
    - `thumbnail`: `string`
    - `embedUrl`: `string`
    - `throwX?`: `number` (posição no radar de onde a granada é arremessada)
    - `throwY?`: `number`
    - `author`: `string`
    - `difficulty?`: `'EASY' | 'MEDIUM' | 'HARD'`
    - `createdAt?`: `string` (ISO 8601 timestamp)
    - `updatedAt?`: `string` (ISO 8601 timestamp)

### 3. `combos` (Coleção)
Registra jogadas compostas (*executes* com múltiplas granadas coordenadas).
- **Campos**:
  - `id`: `string`
  - `mapId`: `string`
  - `title`: `string` (ex: "Execute Bombsite A")
  - `side`: `'TERRORIST' | 'COUNTER-TERRORIST'`
  - `startX`: `number` (posição inicial do jogador/executante em %)
  - `startY`: `number`
  - `targets`: `ComboTarget[]` (lista de granadas que compõem o combo)
    - `type`: `'SMOKE' | 'FLASH' | 'MOLOTOV'`
    - `endX`: `number`
    - `endY`: `number`
  - `desc`: `string`
  - `createdAt?`: `string` (ISO 8601 timestamp da criação)
  - `updatedAt?`: `string` (ISO 8601 timestamp da última edição)
  - `videos`: `VideoData[]`

---

## 🎨 Sistema de Design & Identidade Visual

O projeto adota uma estética **Tactical Military HUD / Cyber-Dark**:
- **Cores Principais**:
  - *Primary (Ouro / Âmbar Tático)*: `--color-primary` (`#ffd08b`), `--color-primary-container` (`#f6ae2d`)
  - *Secondary (Azul CT)*: `--color-secondary` (`#a4c9ff`), `--color-secondary-container` (`#0164b4`)
  - *Terrorist Side*: Acentos âmbar/dourados (`#f6ae2d`)
  - *Counter-Terrorist Side*: Acentos azulados táticos (`#a4c9ff`)
  - *Superfícies Escuras*: `--color-surface` (`#131313`), `--color-surface-container` (`#201f1f`)
- **Tipografia**:
  - `Chivo`: Headings, títulos militares e displays.
  - `JetBrains Mono`: Coordenadas (X, Y), labels táticos e status de metadados.
  - `Inter`: Textos corridos, formulários e interface geral.
- **Efeitos Especiais & Utilitários CSS (`src/index.css`)**:
  - `.tactical-glass`: Fundo translúcido com `backdrop-blur(12px)` e bordas sutis.
  - `.radar-grid`: Linhas de grade milimétricas de radar.
  - `.animate-dash-flow`: Trajetórias de granada com linhas tracejadas animadas em SVG.
  - `.radar-ping`: Efeito pulsante de radar.

---

## ⚙️ Variáveis de Ambiente (`.env`)

Para o correto funcionamento do Firebase, configure o arquivo `.env` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🚀 Comandos e Scripts de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento local
npm run dev

# Executar verificação de tipos e compilar para produção
npm run build

# Executar linter ESLint em todo o código
npm run lint

# Formatar arquivos com Prettier
npm run format

# Verificar formatação de código
npm run format:check

# Visualizar o build de produção localmente
npm run preview
```

---

## 📐 Padrões de Código & Boas Práticas

1. **Separação por Recursos (*Feature Folders*)**:
   - Todo código específico de uma funcionalidade deve residir sob `src/features/<feature_name>/` (contendo seus próprios `components/`, `hooks/`, `types/`, `data/`).
2. **Tipagem Estrita**:
   - Manter contratos explícitos em `types/index.ts`. Evitar o uso de `any`.
3. **Internacionalização Obrigatória**:
   - Todos os textos visíveis ao usuário devem ser gerenciados através do hook `useTranslation()` e registrados nos 3 arquivos de idioma (`src/i18n/resources/{pt,en,es}.ts`).
4. **Tratamento de Coordenadas de Radar**:
   - Coordenadas de tela são sempre normalizadas entre `0` e `100` (percentuais relativos ao tamanho do container do radar). O hook `usePanZoom` é o ponto único para manipulação de coordenadas e zoom.
5. **Roteamento & Performance**:
   - Novas páginas devem ser carregadas via `lazy(() => import('./pages/...'))` dentro de `src/App.tsx` com `Suspense` para otimização de bundle.
