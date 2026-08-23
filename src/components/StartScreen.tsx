import { useEffect, useState, type CSSProperties } from 'react';

export interface Registry {
  distanceWalked: number;
  timePlayed: number;
  jumps: number;
  sprints: number;
  food: number;
  discoveries: number;
  gamesPlayed: number;
  bestScore: number;
  memoryAwakening: boolean;
  memoryMandate: boolean;
  memoryDoubts: boolean;
  hasSeenAwakening: boolean;
  [key: string]: unknown;
}

interface Props {
  onStart: () => void;
}

type Page = 'main' | 'memories' | 'stats' | 'map';

const DEFAULT_REGISTRY: Registry = {
  distanceWalked: 0,
  timePlayed: 0,
  jumps: 0,
  sprints: 0,
  food: 0,
  discoveries: 0,
  gamesPlayed: 0,
  bestScore: 0,
  memoryAwakening: false,
  memoryMandate: false,
  memoryDoubts: false,
  hasSeenAwakening: false,
};

const MEMORIES: Array<{ key: string; title: string; desc: string; verse: string }> = [
  { key: 'memoryAwakening', title: 'El Despertar', desc: 'La primera mañana del hombre en el jardín del Edén.', verse: 'Génesis 2:7' },
  { key: 'memoryMandate', title: 'El Mandamiento', desc: 'Escuchaste la advertencia sobre el árbol prohibido.', verse: 'Génesis 2:16-17' },
  { key: 'memoryDoubts', title: 'Las Dudas de Adán', desc: 'Todos los pensamientos junto al árbol del conocimiento.', verse: 'Génesis 3:6' },
  { key: 'river-pishon', title: 'El Río Pisón', desc: 'El primer brazo que rodea la tierra rica en oro de Havila.', verse: 'Génesis 2:11' },
  { key: 'river-gihon', title: 'El Río Gihón', desc: 'El segundo cauce de aguas vivas que nutre la tierra de Cus.', verse: 'Génesis 2:13' },
  { key: 'river-hiddekel', title: 'El Río Hidekel', desc: 'La corriente impetuosa que fluye al oriente de Asiria.', verse: 'Génesis 2:14' },
  { key: 'river-perat', title: 'El Río Éufrates', desc: 'El gran río de bendición que riega el valle del Edén.', verse: 'Génesis 2:14' },
  { key: 'sanctuary-clay', title: 'El Altar del Polvo', desc: 'El santuario primitivo donde fue modelado el primer hombre.', verse: 'Génesis 2:7' },
  { key: 'sanctuary-summit', title: 'El Mirador de la Creación', desc: 'La cumbre excelsa desde donde se contempla toda la obra divina.', verse: 'Génesis 1:31' },
];

const MAP_LANDMARKS = [
  {
    id: 'tree',
    name: 'El Árbol del Conocimiento',
    region: 'Centro del Huerto',
    desc: 'Árbol sagrado en medio del jardín de donde emana la sabiduría del bien y del mal y la advertencia divina.',
    verse: 'Génesis 2:9',
    x: 50,
    y: 48,
  },
  {
    id: 'pishon',
    name: 'Río Pisón (Río de Oro)',
    region: 'Cuenca Occidental',
    desc: 'El primer brazo del río que rodea toda la tierra de Havila, donde abunda el oro puro, el bedelio y el ónice.',
    verse: 'Génesis 2:11',
    x: 26,
    y: 28,
  },
  {
    id: 'gihon',
    name: 'Río Gihón (Manantiales)',
    region: 'Meandro Norte',
    desc: 'El segundo río de aguas vivas que serpentea por las arboledas y fecunda toda la llanura de Cus.',
    verse: 'Génesis 2:13',
    x: 44,
    y: 34,
  },
  {
    id: 'hiddekel',
    name: 'Río Hidekel (Impetuoso)',
    region: 'Corriente Oriental',
    desc: 'El tercer río caudaloso que avanza veloz y cristalino hacia el oriente de Asiria.',
    verse: 'Génesis 2:14',
    x: 68,
    y: 28,
  },
  {
    id: 'perat',
    name: 'Río Éufrates (Fértil)',
    region: 'Vega de Levante',
    desc: 'El cuarto río de la abundancia y la fecundidad que nutre el gran valle sagrado de la vida.',
    verse: 'Génesis 2:14',
    x: 80,
    y: 42,
  },
  {
    id: 'altar',
    name: 'El Altar del Polvo',
    region: 'Claro del Suroeste',
    desc: 'Santuario primitivo de piedra y tierra donde Dios sopló en la nariz de Adán el aliento de vida.',
    verse: 'Génesis 2:7',
    x: 42,
    y: 64,
  },
  {
    id: 'summit',
    name: 'Mirador de la Creación',
    region: 'Cumbre Suroeste',
    desc: 'La cumbre más elevada de la montaña desde donde se divisa la totalidad del Edén y la obra del Creador.',
    verse: 'Génesis 1:31',
    x: 20,
    y: 76,
  },
];

const gold = (a: number) => `rgba(224,190,120,${a})`;
const SERIF_SHADOW = '0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)';

// Letras doradas elegantes: degradado + borde fino + brillo suave
const GOLD_TEXT: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fffbe6 0%, #ffe9a8 25%, #f5c34a 50%, #d99a1f 80%, #a8740e 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextStroke: '1px rgba(58,36,4,0.6)',
  filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.35))',
};

const FRAME_BORDER = '2px solid rgba(224,190,120,0.75)';
const FRAME_OUTLINE = '1px solid rgba(224,190,120,0.35)';

// Textura de papiro / pergamino antiguo de lujo
const PAPYRUS_MAP_BG: CSSProperties = {
  backgroundColor: '#f6f0dd',
  backgroundImage: `
    radial-gradient(ellipse at 50% 50%, rgba(255, 253, 246, 0.98) 0%, rgba(247, 239, 218, 0.95) 70%, rgba(226, 210, 178, 0.97) 100%),
    repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(160, 130, 90, 0.03) 3px, rgba(160, 130, 90, 0.03) 4px)
  `,
  boxShadow: 'inset 0 0 90px rgba(160, 120, 60, 0.28), 0 0 50px rgba(0,0,0,0.8)',
  border: '3px solid #5a3a18',
};

/** Esquina heráldica: filigrana de acanto en oro, espejada en las 4 esquinas. */
function FloralCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const place: CSSProperties = {
    tl: { top: -8, left: -8, transform: 'none' },
    tr: { top: -8, right: -8, transform: 'scaleX(-1)' },
    bl: { bottom: -8, left: -8, transform: 'scaleY(-1)' },
    br: { bottom: -8, right: -8, transform: 'scale(-1,-1)' },
  }[pos];
  const g = `flourish-${pos}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 140 140"
      className="pointer-events-none"
      style={{
        position: 'absolute',
        width: 'clamp(78px, 13vw, 124px)',
        height: 'clamp(78px, 13vw, 124px)',
        filter: 'drop-shadow(0 1px 1px rgba(20,10,0,0.7)) drop-shadow(0 0 8px rgba(255,210,90,0.35))',
        ...place,
      }}
    >
      <defs>
        <linearGradient id={`${g}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff6c4" />
          <stop offset="40%" stopColor="#f0c24a" />
          <stop offset="100%" stopColor="#9a6410" />
        </linearGradient>
      </defs>

      {/* Doble filete en L */}
      <path d="M16 16 H88" stroke={`url(#${g}-g)`} strokeWidth="2.4" strokeLinecap="square" />
      <path d="M16 16 V88" stroke={`url(#${g}-g)`} strokeWidth="2.4" strokeLinecap="square" />
      <path d="M16 22 H72" stroke="#ffe9a0" strokeWidth="0.55" opacity="0.55" />
      <path d="M22 16 V72" stroke="#ffe9a0" strokeWidth="0.55" opacity="0.55" />

      {/* Tallo principal horizontal, con voluta */}
      <path
        d="M30 34 C52 20 78 18 108 28 C120 32 126 42 118 50 C110 58 96 52 92 42 C88 32 98 26 108 30"
        fill="none"
        stroke={`url(#${g}-g)`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* Tallo principal vertical (espejo) */}
      <path
        d="M34 30 C20 52 18 78 28 108 C32 120 42 126 50 118 C58 110 52 96 42 92 C32 88 26 98 30 108"
        fill="none"
        stroke={`url(#${g}-g)`}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {/* Hojas de acanto — horizontales */}
      <path d="M48 26 C56 14 72 16 76 26 C66 28 56 30 48 26Z" fill={`url(#${g}-g)`} />
      <path d="M70 30 C82 18 98 22 100 34 C88 34 78 34 70 30Z" fill={`url(#${g}-g)`} opacity="0.9" />
      {/* Hojas de acanto — verticales */}
      <path d="M26 48 C14 56 16 72 26 76 C28 66 30 56 26 48Z" fill={`url(#${g}-g)`} />
      <path d="M30 70 C18 82 22 98 34 100 C34 88 34 78 30 70Z" fill={`url(#${g}-g)`} opacity="0.9" />

      {/* Lis / flor de 3 pétalos al final de cada brazo */}
      <g transform="translate(118 38)">
        <path d="M0 6 C-4 -2 0 -8 0 -2 C0 -8 4 -2 0 6Z" fill={`url(#${g}-g)`} />
        <path d="M0 6 C-8 2 -6 -2 -1 2" fill={`url(#${g}-g)`} />
        <path d="M0 6 C8 2 6 -2 1 2" fill={`url(#${g}-g)`} />
        <circle cy="6.5" r="1.4" fill="#fff4c8" />
      </g>
      <g transform="translate(38 118) rotate(90)">
        <path d="M0 6 C-4 -2 0 -8 0 -2 C0 -8 4 -2 0 6Z" fill={`url(#${g}-g)`} />
        <path d="M0 6 C-8 2 -6 -2 -1 2" fill={`url(#${g}-g)`} />
        <path d="M0 6 C8 2 6 -2 1 2" fill={`url(#${g}-g)`} />
        <circle cy="6.5" r="1.4" fill="#fff4c8" />
      </g>

      {/* Rosetón del vértice */}
      <circle cx="16" cy="16" r="9.5" fill={`url(#${g}-g)`} stroke="#4a2a08" strokeWidth="0.9" />
      <circle cx="16" cy="16" r="5.6" fill="none" stroke="#fff6c8" strokeWidth="0.6" />
      <g transform="translate(16 16)">
        <path d="M0 -5.2 C1.6 -2 1.6 2 0 5.2 C-1.6 2 -1.6 -2 0 -5.2Z" fill="#8e1e12" />
        <path d="M0 -5.2 C1.6 -2 1.6 2 0 5.2 C-1.6 2 -1.6 -2 0 -5.2Z" fill="#8e1e12" transform="rotate(90)" />
        <circle r="1.8" fill="#fff6c8" />
      </g>
    </svg>
  );
}

function readRegistry(): Registry {
  try {
    const saved = localStorage.getItem('edenRegistry');
    return saved ? { ...DEFAULT_REGISTRY, ...JSON.parse(saved) } : { ...DEFAULT_REGISTRY };
  } catch {
    return { ...DEFAULT_REGISTRY };
  }
}

/**
 * Letra G Decorada e Iluminada estilo manuscrito medieval
 */
function DecoratedLetterG() {
  return (
    <span className="relative inline-flex items-baseline shrink-0 select-none mr-0.5 align-baseline">
      <svg
        viewBox="0 0 100 115"
        className="w-[1.15em] h-[1.15em] inline-block align-baseline -mb-[0.14em]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.4))',
        }}
      >
        <defs>
          <linearGradient id="goldDecorG_v8" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="25%" stopColor="#ffe9a8" />
            <stop offset="50%" stopColor="#f5c34a" />
            <stop offset="80%" stopColor="#d99a1f" />
            <stop offset="100%" stopColor="#a8740e" />
          </linearGradient>
        </defs>

        {/* Enredaderas ornamentales de acanto */}
        <path
          d="M18,52 C8,24 38,6 64,8 C80,10 92,24 88,38 C84,50 72,54 62,48 C52,42 48,28 58,20 C66,14 78,18 74,28"
          stroke="#ffd875"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M52,90 C26,98 10,78 14,50 C18,28 36,14 60,14"
          stroke="#ffd875"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Rosetas de oro */}
        <circle cx="28" cy="24" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="78" cy="82" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="16" cy="74" r="4" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.2" />

        {/* Letra G Monumental */}
        <path
          d="M86,36 C82,24 72,16 54,16 C32,16 16,34 16,60 C16,84 32,100 58,100 C78,100 90,88 90,68 L56,68 L56,54 L98,54 L98,72 C98,96 78,108 54,108 C26,108 6,86 6,60 C6,30 26,6 56,6 C78,6 92,15 98,28 Z"
          fill="url(#goldDecorG_v8)"
          stroke="rgba(58,36,4,0.75)"
          strokeWidth="2"
        />

        {/* Florón frontal */}
        <polygon points="56,6 61,0 66,6 61,12" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <circle cx="77" cy="61" r="3.5" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
      </svg>
    </span>
  );
}

/**
 * Letra E Decorada e Iluminada estilo Uncial / Lombardo Medieval
 */
function DecoratedLetterE() {
  return (
    <span className="relative inline-flex items-baseline shrink-0 select-none mr-0.5 align-baseline">
      <svg
        viewBox="0 0 100 115"
        className="w-[1.15em] h-[1.15em] inline-block align-baseline -mb-[0.14em]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.4))',
        }}
      >
        <defs>
          <linearGradient id="goldDecorE_v8" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="25%" stopColor="#ffe9a8" />
            <stop offset="50%" stopColor="#f5c34a" />
            <stop offset="80%" stopColor="#d99a1f" />
            <stop offset="100%" stopColor="#a8740e" />
          </linearGradient>
        </defs>

        {/* Enredaderas de acanto */}
        <path
          d="M18,48 C8,22 36,4 62,6 C78,8 90,20 86,36 C82,48 70,52 60,46 C50,40 46,26 56,18 C64,12 76,16 72,26"
          stroke="#ffd875"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M50,86 C24,94 8,76 12,50 C16,28 34,14 58,14"
          stroke="#ffd875"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Rosetas de pan de oro */}
        <circle cx="26" cy="22" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="78" cy="82" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="16" cy="74" r="4" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.2" />

        {/* Cuerpo de la Letra E */}
        <path
          d="
            M 84,28
            C 76,16 62,12 46,12
            C 24,12 8,30 8,58
            C 8,86 24,104 48,104
            C 66,104 80,96 88,80
            L 74,74
            C 68,86 58,92 46,92
            C 30,92 20,78 20,58
            C 20,38 30,24 46,24
            C 58,24 68,30 74,38
            Z
          "
          fill="url(#goldDecorE_v8)"
          stroke="rgba(58,36,4,0.75)"
          strokeWidth="2"
        />

        {/* Barra central de la E */}
        <path
          d="M 18,52 L 68,52 C 74,48 84,52 88,58 C 84,64 74,68 68,64 L 18,64 Z"
          fill="url(#goldDecorE_v8)"
          stroke="rgba(58,36,4,0.75)"
          strokeWidth="1.8"
        />

        {/* Remates iluminados */}
        <polygon points="84,28 89,20 94,28 89,34" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <circle cx="78" cy="58" r="3.2" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <polygon points="88,80 93,72 98,80 93,86" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
      </svg>
    </span>
  );
}

export default function StartScreen({ onStart }: Props) {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState<Page>('main');
  const [registry] = useState<Registry>(readRegistry);
  const [selectedPinId, setSelectedPinId] = useState<string>('tree');

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const activeLandmark = MAP_LANDMARKS.find(l => l.id === selectedPinId) || MAP_LANDMARKS[0];

  return (
    <div
      className="absolute inset-0 z-30 select-none"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.62) 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}
    >
      {/* ── MARCO DE PANTALLA ORIGINAL ELEGANTE ── */}
      <div
        className="absolute inset-2 md:inset-4 pointer-events-none z-10"
        style={{
          border: FRAME_BORDER,
          outline: FRAME_OUTLINE,
          outlineOffset: '5px',
          boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55)',
        }}
      >
        <FloralCorner pos="tl" />
        <FloralCorner pos="tr" />
        <FloralCorner pos="bl" />
        <FloralCorner pos="br" />
      </div>

      {/* ── CABECERA SUPERIOR: PSYCODELICINSANE · 2026 (Todo seguido y centrado arriba) ── */}
      <div
        className="absolute top-5 sm:top-6 md:top-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-20 pointer-events-none select-none whitespace-nowrap"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease 0.2s' }}
      >
        <div className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-[#ffd166] to-transparent opacity-85" />
        <span
          className="text-xs sm:text-sm font-serif tracking-[0.32em] uppercase font-bold text-amber-200 whitespace-nowrap"
          style={{
            textShadow: '0 0 12px rgba(255, 215, 100, 0.8), 0 2px 4px rgba(0,0,0,0.95)',
          }}
        >
          PSYCODELICINSANE · 2026
        </span>
        <div className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-[#ffd166] to-transparent opacity-85" />
      </div>

      {/* ══════ PORTADA PRINCIPAL ══════ */}
      {page === 'main' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-12 pt-2">
          {visible && (
            <div
              className="text-center flex flex-col items-center mb-6 sm:mb-8"
              style={{
                transform: visible ? 'scale(1)' : 'scale(0.88)',
                opacity: visible ? 1 : 0,
                transition: 'all 1.4s cubic-bezier(0.16,1,0.3,1) 0.2s',
              }}
            >
              {/* ── TÍTULO GARDEN OF EDEN CON LETRAS DECORADAS ── */}
              <div className="px-4 py-1 flex flex-col items-center">
                {/* Garden */}
                <h2
                  className="inline-flex items-center justify-center"
                  style={{
                    fontSize: 'clamp(2.8rem, 9.5vw, 6.2rem)',
                    fontFamily: 'Georgia, "Palatino Linotype", serif',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '0.06em',
                    ...GOLD_TEXT,
                  }}
                >
                  <DecoratedLetterG />arden
                </h2>

                {/* of con líneas doradas */}
                <div
                  className="flex items-center justify-center gap-3.5 my-1 sm:my-2"
                  style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1s' }}
                >
                  <div
                    style={{
                      height: 2,
                      width: 50,
                      background: 'linear-gradient(90deg, transparent, #ffd166)',
                      boxShadow: '0 0 8px rgba(255, 209, 102, 0.8)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Georgia, "Palatino Linotype", serif',
                      fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      color: '#ffe599',
                      letterSpacing: '0.22em',
                      textShadow: '0 0 10px rgba(255, 209, 102, 0.9), 0 2px 4px rgba(0,0,0,0.95)',
                    }}
                  >
                    of
                  </span>
                  <div
                    style={{
                      height: 2,
                      width: 50,
                      background: 'linear-gradient(270deg, transparent, #ffd166)',
                      boxShadow: '0 0 8px rgba(255, 209, 102, 0.8)',
                    }}
                  />
                </div>

                {/* Eden */}
                <h2
                  className="inline-flex items-center justify-center"
                  style={{
                    fontSize: 'clamp(2.8rem, 9.5vw, 6.2rem)',
                    fontFamily: 'Georgia, "Palatino Linotype", serif',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '0.08em',
                    ...GOLD_TEXT,
                  }}
                >
                  <DecoratedLetterE />den
                </h2>
              </div>
            </div>
          )}

          {/* Ornamento sobre el botón */}
          <div
            className="flex items-center justify-center gap-3 my-2"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}
          >
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.5rem' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
          </div>

          {/* Botón principal transparente sobre las pestañas inferiores sin solaparse */}
          <button
            autoFocus
            aria-label="Iniciar partida"
            onClick={onStart}
            className="group relative min-w-[250px] overflow-hidden px-10 py-3.5
                     active:scale-95 hover:scale-[1.035] focus-visible:scale-[1.035] transition-transform cursor-pointer rounded-xs"
            style={{
              color: '#f7d77e',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 700,
              background: 'transparent',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,211,102,0.88)',
              outline: '1px solid rgba(224,190,120,0.35)',
              outlineOffset: 4,
              boxShadow: 'inset 0 0 15px rgba(255,220,100,0.1), 0 0 24px rgba(255,190,80,0.25)',
              textShadow: '0 0 8px rgba(255,198,79,0.75), 0 2px 4px rgba(0,0,0,0.95)',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 1.8s, transform 0.15s ease, filter 0.2s ease',
              animation: visible ? 'startPulse 2.2s ease-in-out 2.6s infinite' : 'none',
            }}
          >
            <span
              aria-hidden
              className="absolute inset-x-3 top-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,220,130,0.45), transparent)' }}
            />
            <span className="flex items-center justify-center gap-4">
              <span aria-hidden className="start-marker text-[10px]">◆</span>
              <span className="text-sm md:text-base tracking-[0.28em] whitespace-nowrap">PRESS START</span>
              <span aria-hidden className="start-marker text-[10px]">◆</span>
            </span>
            <span
              aria-hidden
              className="absolute inset-x-3 bottom-1 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,220,130,0.3), transparent)' }}
            />
          </button>

          {registry.bestScore > 0 && (
            <p
              className="mt-2 text-[10px] font-mono tracking-[0.3em]"
              style={{
                color: gold(0.45),
                textShadow: SERIF_SHADOW,
                opacity: visible ? 1 : 0,
                transition: 'opacity 1s ease 2.1s',
              }}
            >
              MEJOR SCORE — {registry.bestScore.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* ══════ REGISTROS - RECUERDOS ══════ */}
      {page === 'memories' && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <p
              className="text-center text-xs tracking-[0.5em] mb-5"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 500, color: gold(0.65), textShadow: SERIF_SHADOW }}
            >
              RECUERDOS
            </p>

            <div className="space-y-3 mb-6 max-h-[50vh] overflow-y-auto pr-1">
              {MEMORIES.filter(m => !!registry[m.key]).map((m, i) => (
                <div
                  key={i}
                  className="py-2.5 px-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p>
                    <span className="text-[11px]" style={{ color: 'rgba(255,230,180,0.85)' }}>
                      ✦{' '}
                    </span>
                    <span
                      className="text-[13px]"
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontWeight: 600,
                        color: 'rgba(255,240,210,0.9)',
                        textShadow: '0 0 2px rgba(0,0,0,0.6)',
                      }}
                    >
                      {m.title}
                    </span>
                  </p>
                  <p
                    className="text-[11px] italic ml-5"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: 'rgba(255,235,200,0.6)',
                      textShadow: '0 0 1px rgba(0,0,0,0.5)',
                    }}
                  >
                    {m.desc}
                  </p>
                </div>
              ))}
              {MEMORIES.filter(m => !!registry[m.key]).length === 0 && (
                <p
                  className="text-center text-[11px] italic py-4"
                  style={{ fontFamily: 'Georgia, serif', color: 'rgba(255,235,200,0.35)' }}
                >
                  Aún no hay recuerdos...
                </p>
              )}
            </div>

            {/* Score más alto */}
            <div
              className="text-center mb-5 py-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-[10px] tracking-[0.3em] mb-1" style={{ color: 'rgba(255,235,200,0.45)' }}>
                MEJOR SCORE
              </p>
              <p
                className="text-[14px] font-mono"
                style={{ color: 'rgba(255,240,210,0.85)', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
              >
                {registry.bestScore.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════ REGISTROS - DATOS ══════ */}
      {page === 'stats' && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-xs">
            <p
              className="text-center text-xs tracking-[0.5em] mb-5"
              style={{ fontFamily: 'Georgia, serif', fontWeight: 500, color: gold(0.65), textShadow: SERIF_SHADOW }}
            >
              DATOS
            </p>

            <div className="space-y-2 mb-5">
              {([
                ['Partidas', registry.gamesPlayed],
                ['Distancia', `${Math.floor(registry.distanceWalked)}m`],
                ['Tiempo jugado', `${Math.floor(registry.timePlayed / 60)}min`],
                ['Saltos', registry.jumps],
                ['Sprints', registry.sprints],
                ['Saciedad máx.', registry.food],
                ['Descubrimientos', registry.discoveries],
              ] as [string, string | number][]).map(([label, val], i) => (
                <p key={i} className="flex justify-between">
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: 'Georgia, serif', color: gold(0.45), textShadow: SERIF_SHADOW }}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: gold(0.65), textShadow: SERIF_SHADOW }}>
                    {val}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ CARTA GEOGRÁFICA DEL EDÉN EN PAPIRO ══════ */}
      {page === 'map' && (
        <div
          className="absolute inset-0 z-30 flex flex-col items-center justify-between p-3 md:p-6 select-none overflow-y-auto"
          style={PAPYRUS_MAP_BG}
        >
          {/* Cabecera Clásica en Papiro */}
          <div className="w-full max-w-4xl flex justify-between items-center px-2 py-1 border-b border-[#8a6838]/60 mb-2">
            <div>
              <span className="text-[10px] font-serif uppercase tracking-[0.35em] text-[#7c5828] font-bold">
                — Códice Cartográfico del Génesis —
              </span>
              <h2 className="text-xl md:text-2xl font-serif text-[#2c1a0c] font-normal tracking-wide">
                Carta Geográfica del Jardín del Edén y los Cuatro Ríos
              </h2>
            </div>

            <button
              onClick={() => setPage('main')}
              className="px-4 py-1.5 bg-[#8e1e12] hover:bg-[#a82517] text-[#fdf8ee] border border-[#d4af37] rounded-xs font-serif text-xs tracking-wider cursor-pointer shadow-md active:scale-95 transition-all"
            >
              ✕ VOLVER AL INICIO
            </button>
          </div>

          {/* Mapa Ilustrado Agrandado con Alta Definición */}
          <div className="relative flex-1 w-full max-h-[62vh] flex items-center justify-center p-1 my-auto">
            <div
              className="relative max-w-full max-h-full aspect-square overflow-hidden rounded-xs border-2 border-[#7a5828] shadow-2xl bg-[#2b190a]"
            >
              <img
                src="images/mapa-jardin-eden.png"
                alt="Mapa del jardín del Edén visto desde arriba"
                width={2048}
                height={2048}
                className="block w-full h-full object-contain sepia-[0.10]"
              />

              {/* Marcadores dorados sobre el mapa */}
              {MAP_LANDMARKS.map((lm) => {
                const isSelected = selectedPinId === lm.id;
                return (
                  <button
                    key={lm.id}
                    onClick={() => setSelectedPinId(lm.id)}
                    title={`${lm.name} (${lm.region})`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-2.5 group"
                    style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'bg-[#ffd166] border-[#8e1e12] scale-135 shadow-[0_0_12px_#ffd166] animate-pulse'
                          : 'bg-[#fffdf5] border-[#5a3a18] shadow-md group-hover:scale-125 group-hover:bg-[#ffd166]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tarjeta de Información Detallada del Lugar Seleccionado */}
          <div className="w-full max-w-4xl mt-3 p-3.5 rounded-xs bg-[#fffdf8]/90 border border-[#8a6838]/70 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#8e1e12] text-xs">❖</span>
                <h4 className="font-serif font-bold text-sm md:text-base text-[#2a1708]">
                  {activeLandmark.name}
                </h4>
                <span className="text-[10px] font-mono text-[#7c5828] bg-[#ede0c4] px-2 py-0.5 rounded-xs border border-[#c8b492]">
                  {activeLandmark.region}
                </span>
              </div>
              <p className="text-xs md:text-sm font-serif italic text-[#553c20] mt-1 ml-4 leading-relaxed">
                {activeLandmark.desc}
              </p>
            </div>
            <span className="text-xs font-mono italic text-[#8e1e12] font-semibold sm:text-right shrink-0">
              {activeLandmark.verse}
            </span>
          </div>

          {/* Selector de Lugares Sagrados */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-2 max-w-3xl">
            {MAP_LANDMARKS.map((lm) => (
              <button
                key={lm.id}
                onClick={() => setSelectedPinId(lm.id)}
                className={`px-3 py-1 rounded-xs font-serif text-[11px] md:text-xs transition-all cursor-pointer ${
                  selectedPinId === lm.id
                    ? 'bg-[#8e1e12] text-[#fff9ea] font-bold shadow-xs'
                    : 'bg-[#ede0c4]/80 text-[#5a3a18] border border-[#c8b492]/60 hover:bg-[#fffdf4]'
                }`}
              >
                {lm.name.replace('El ', '').replace('Río ', '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════ NAVEGACIÓN INFERIOR CLÁSICA ESPACIADA ══════ */}
      <div className="absolute bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 md:gap-8 z-20">
        <button
          onClick={() => setPage('main')}
          className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase transition-colors cursor-pointer"
          style={{
            color: gold(page === 'main' ? 0.95 : 0.4),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'main' ? `1px solid ${gold(0.7)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Inicio
        </button>
        <button
          onClick={() => setPage('memories')}
          className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase transition-colors cursor-pointer"
          style={{
            color: gold(page === 'memories' ? 0.95 : 0.4),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'memories' ? `1px solid ${gold(0.7)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Recuerdos
        </button>
        <button
          onClick={() => setPage('stats')}
          className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase transition-colors cursor-pointer"
          style={{
            color: gold(page === 'stats' ? 0.95 : 0.4),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'stats' ? `1px solid ${gold(0.7)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Datos
        </button>
        <button
          onClick={() => setPage('map')}
          className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase transition-colors cursor-pointer"
          style={{
            color: gold(page === 'map' ? 0.95 : 0.4),
            textShadow: SERIF_SHADOW,
            borderBottom: page === 'map' ? `1px solid ${gold(0.7)}` : '1px solid transparent',
            paddingBottom: 2,
          }}
        >
          Mapa
        </button>
      </div>

      <style>{`
        @keyframes startPulse {
          0%, 100% {
            box-shadow: inset 0 0 15px rgba(255,220,100,0.1), 0 0 20px rgba(255,190,80,0.2);
            filter: brightness(0.96);
          }
          50% {
            box-shadow: inset 0 0 20px rgba(255,230,120,0.2), 0 0 30px rgba(255,200,90,0.38);
            filter: brightness(1.1);
          }
        }
        @keyframes startMarkerBlink {
          0%, 35%, 100% { opacity: 0.95; }
          50%, 80% { opacity: 0.25; }
        }
        .start-marker {
          animation: startMarkerBlink 1.1s steps(1, end) infinite;
          color: #ffd166;
          text-shadow: 0 0 9px rgba(255,198,79,0.8);
        }
      `}</style>
    </div>
  );
}
