import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Cartela } from './Cartela';

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
  { key: 'waterfall-source', title: 'El Nacedero', desc: 'De aquí sale el río que riega el jardín y luego se parte en cuatro.', verse: 'Génesis 2:10' },
  { key: 'sanctuary-clay', title: 'El Altar del Polvo', desc: 'El santuario primitivo donde fue modelado el primer hombre.', verse: 'Génesis 2:7' },
  { key: 'sanctuary-summit', title: 'El Mirador de la Creación', desc: 'La cumbre excelsa desde donde se contempla toda la obra divina.', verse: 'Génesis 1:31' },
];

/** Ancla: el pin cuelga fuera del agua, en el filo del marco pintado. */
type PinAnchor = 'center' | 'left' | 'right' | 'bottom';

/** Posiciones sobre la carta pintada (no sobre el mundo 3D). */
const MAP_LANDMARKS: Array<{
  id: string;
  name: string;
  region: string;
  desc: string;
  verse: string;
  x: number;
  y: number;
  pin: string;
  anchor: PinAnchor;
}> = [
  {
    id: 'tree',
    name: 'El Árbol del Conocimiento',
    region: 'Centro del Huerto',
    desc: 'Árbol sagrado en medio del jardín de donde emana la sabiduría del bien y del mal y la advertencia divina.',
    verse: 'Génesis 2:9',
    x: 50,
    y: 62,
    pin: 'Árbol',
    anchor: 'center',
  },
  {
    id: 'waterfall',
    name: 'El Nacedero',
    region: 'Noroeste del Huerto',
    desc: 'El manantial de donde nace el río que riega el jardín, antes de dividirse en cuatro cabezas.',
    verse: 'Génesis 2:10',
    x: 4.2,
    y: 22,
    pin: 'Nacedero',
    anchor: 'left',
  },
  {
    id: 'gihon',
    name: 'Río Gihón (Manantiales)',
    region: 'Desembocadura norte',
    desc: 'El segundo río de aguas vivas que serpentea por las arboledas y fecunda toda la llanura de Cus.',
    verse: 'Génesis 2:13',
    x: 96.4,
    y: 18.4,
    pin: 'Gihón',
    anchor: 'right',
  },
  {
    id: 'hiddekel',
    name: 'Río Hidekel (Impetuoso)',
    region: 'Desembocadura oriental',
    desc: 'El tercer río caudaloso que avanza veloz y cristalino hacia el oriente de Asiria.',
    verse: 'Génesis 2:14',
    x: 96.4,
    y: 24.6,
    pin: 'Hidekel',
    anchor: 'right',
  },
  {
    id: 'perat',
    name: 'Río Éufrates (Fértil)',
    region: 'Desembocadura de levante',
    desc: 'El cuarto río de la abundancia y la fecundidad que nutre el gran valle sagrado de la vida.',
    verse: 'Génesis 2:14',
    x: 96.4,
    y: 37.4,
    pin: 'Éufrates',
    anchor: 'right',
  },
  {
    id: 'pishon',
    name: 'Río Pisón (Río de Oro)',
    region: 'Desembocadura sureste',
    desc: 'El primer brazo del río que rodea toda la tierra de Havila, donde abunda el oro puro, el bedelio y el ónice.',
    verse: 'Génesis 2:11',
    x: 96.4,
    y: 45.0,
    pin: 'Pisón',
    anchor: 'right',
  },
  {
    id: 'altar',
    name: 'El Altar del Polvo',
    region: 'Claro del Suroeste',
    desc: 'Santuario primitivo de piedra y tierra donde Dios sopló en la nariz de Adán el aliento de vida.',
    verse: 'Génesis 2:7',
    x: 43,
    y: 88,
    pin: 'Altar',
    anchor: 'bottom',
  },
  {
    id: 'summit',
    name: 'Mirador de la Creación',
    region: 'Cumbre Suroeste',
    desc: 'La cumbre más elevada de la montaña desde donde se divisa la totalidad del Edén y la obra del Creador.',
    verse: 'Génesis 1:31',
    x: 4.2,
    y: 78,
    pin: 'Mirador',
    anchor: 'left',
  },
];

const PIN_TRANSFORM: Record<PinAnchor, string> = {
  center: 'translate(-50%, -50%)',
  left: 'translate(-8%, -50%)',
  right: 'translate(-92%, -50%)',
  bottom: 'translate(-50%, -18%)',
};

const gold = (a: number) => `rgba(224,190,120,${a})`;
const SERIF_SHADOW = '0 2px 8px rgba(0,0,0,0.85), 0 1px 2px rgba(0,0,0,0.9)';

const GOLD_TEXT: CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fffbe6 0%, #ffe9a8 25%, #f5c34a 50%, #d99a1f 80%, #a8740e 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextStroke: '1px rgba(58,36,4,0.6)',
  filter: 'drop-shadow(0 2px 1px rgba(40,24,2,0.85)) drop-shadow(0 0 16px rgba(255,195,80,0.35))',
};

const PAPYRUS_MAP_BG: CSSProperties = {
  backgroundColor: '#f3ead4',
  backgroundImage: 'radial-gradient(ellipse at 50% 42%, #fffaf0 0%, #f0e4c8 72%, #e2d2ae 100%)',
  boxShadow: 'inset 0 0 90px rgba(160, 120, 60, 0.22), 0 0 50px rgba(0,0,0,0.8)',
  border: '3px solid #5a3a18',
};

function CornerVineGlyph({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const place: CSSProperties = {
    tl: { top: 2, left: 2, transform: 'none' },
    tr: { top: 2, right: 2, transform: 'scaleX(-1)' },
    bl: { bottom: 2, left: 2, transform: 'scaleY(-1)' },
    br: { bottom: 2, right: 2, transform: 'scale(-1,-1)' },
  }[pos];
  const g = `vine-${pos}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 88 88"
      className="pointer-events-none"
      style={{
        position: 'absolute',
        width: 76,
        height: 76,
        zIndex: 4,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9)) drop-shadow(0 0 6px rgba(255,200,90,0.28))',
        ...place,
      }}
    >
      <defs>
        <linearGradient id={`${g}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff6c8" />
          <stop offset="45%" stopColor="#f0c24a" />
          <stop offset="100%" stopColor="#8a5610" />
        </linearGradient>
      </defs>
      <path
        d="M6 6 L72 6 C58 8 48 18 46 32 C44 48 28 58 8 56 L8 72"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M14 14 L54 14 C46 16 40 24 38 34 C36 46 24 54 14 52 L14 54"
        fill="none"
        stroke="#ffe08a"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M28 28 C40 22 52 30 48 40 C44 50 30 50 28 40 C26 32 34 30 38 34 C40 36 38 40 34 40"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M20 10 C18 18 12 22 8 20" fill="none" stroke="#e8c050" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 22 C18 20 24 26 22 34" fill="none" stroke="#e8c050" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 10 C56 16 64 18 70 14" fill="none" stroke="#d4a428" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 50 C16 56 14 66 8 70" fill="none" stroke="#d4a428" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16 16 C12 12 8 16 12 20 C16 18 18 16 16 16 Z" fill="#f0c24a" stroke="#3a2208" strokeWidth="0.5" />
      <path d="M58 18 C64 14 68 22 62 24 C58 22 56 20 58 18 Z" fill="#c49220" stroke="#3a2208" strokeWidth="0.5" />
      <path d="M18 48 C12 50 14 58 20 54 C22 50 20 48 18 48 Z" fill="#c49220" stroke="#3a2208" strokeWidth="0.5" />
      <circle cx="36" cy="38" r="3.2" fill="#fff6c4" stroke="#6a4010" strokeWidth="0.8" />
    </svg>
  );
}

function MapSideVines({ side }: { side: 'left' | 'right' }) {
  const flip = side === 'right';
  return (
    <svg
      aria-hidden
      viewBox="0 0 36 420"
      preserveAspectRatio="none"
      className="pointer-events-none hidden md:block h-full w-7 shrink-0"
      style={{
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(0 1px 2px rgba(40,20,4,0.45))',
      }}
    >
      <path
        d="M22 8 C 10 50, 30 90, 14 140 C 4 180, 28 220, 12 270 C 2 310, 26 350, 16 410"
        fill="none"
        stroke="#8a5a18"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M18 20 C 8 70, 26 110, 12 168 C 6 210, 24 250, 14 320 C 8 360, 22 390, 18 412"
        fill="none"
        stroke="#c49220"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {[40, 110, 185, 260, 335].map((y) => (
        <path
          key={y}
          d={`M16 ${y} C 6 ${y - 8}, 4 ${y + 6}, 14 ${y + 10} C 20 ${y + 4}, 22 ${y - 2}, 16 ${y} Z`}
          fill="#c49220"
          stroke="#4a2e10"
          strokeWidth="0.6"
        />
      ))}
      {[75, 150, 225, 300].map((y) => (
        <circle key={y} cx="20" cy={y} r="2.4" fill="#f0c24a" stroke="#5a3814" strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function ClassicFrame() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        border: '14px solid #8a5a12',
        boxShadow: `
          inset 0 0 0 3px #f0c24a,
          inset 0 0 0 6px #3a2208,
          inset 0 0 0 9px #c49220,
          inset 0 0 70px rgba(0,0,0,0.45)
        `,
      }}
    >
      <CornerVineGlyph pos="tl" />
      <CornerVineGlyph pos="tr" />
      <CornerVineGlyph pos="bl" />
      <CornerVineGlyph pos="br" />
    </div>
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
        <circle cx="28" cy="24" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="78" cy="82" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="16" cy="74" r="4" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.2" />
        <path
          d="M86,36 C82,24 72,16 54,16 C32,16 16,34 16,60 C16,84 32,100 58,100 C78,100 90,88 90,68 L56,68 L56,54 L98,54 L98,72 C98,96 78,108 54,108 C26,108 6,86 6,60 C6,30 26,6 56,6 C78,6 92,15 98,28 Z"
          fill="url(#goldDecorG_v8)"
          stroke="rgba(58,36,4,0.75)"
          strokeWidth="2"
        />
        <polygon points="56,6 61,0 66,6 61,12" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <circle cx="77" cy="61" r="3.5" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
      </svg>
    </span>
  );
}

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
        <circle cx="26" cy="22" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="78" cy="82" r="5" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.5" />
        <circle cx="16" cy="74" r="4" fill="#f5c34a" stroke="#4a2a06" strokeWidth="1.2" />
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
        <path
          d="M 18,52 L 68,52 C 74,48 84,52 88,58 C 84,64 74,68 68,64 L 18,64 Z"
          fill="url(#goldDecorE_v8)"
          stroke="rgba(58,36,4,0.75)"
          strokeWidth="1.8"
        />
        <polygon points="84,28 89,20 94,28 89,34" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <circle cx="78" cy="58" r="3.2" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
        <polygon points="88,80 93,72 98,80 93,86" fill="#fffbe6" stroke="#4a2a06" strokeWidth="1" />
      </svg>
    </span>
  );
}

function MapIllustration({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const host = hostRef.current;
    const img = imgRef.current;
    if (!host || !img || !img.naturalWidth) return;
    const hr = host.getBoundingClientRect();
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = hr.width / hr.height;
    let width: number;
    let height: number;
    if (ir > cr) {
      width = hr.width;
      height = hr.width / ir;
    } else {
      height = hr.height;
      width = hr.height * ir;
    }
    setBox({
      left: (hr.width - width) / 2,
      top: (hr.height - height) / 2,
      width,
      height,
    });
  }, []);

  useEffect(() => {
    measure();
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div ref={hostRef} className="relative h-full w-full min-h-0 min-w-0">
      <img
        ref={imgRef}
        src="/images/mapa-eden-sin-cartela.png"
        alt="Mapa del jardín del Edén visto desde arriba"
        className="absolute inset-0 h-full w-full object-contain"
        draggable={false}
        onLoad={measure}
      />
      <div
        className="absolute z-10"
        style={{ left: box.left, top: box.top, width: box.width, height: box.height }}
      >
        {MAP_LANDMARKS.map((lm) => (
          <button
            key={lm.id}
            onClick={() => onSelect(lm.id)}
            className="absolute z-10 cursor-pointer touch-manipulation"
            style={{ left: `${lm.x}%`, top: `${lm.y}%`, transform: PIN_TRANSFORM[lm.anchor] }}
            aria-pressed={selectedId === lm.id}
            aria-label={lm.name}
          >
            <Cartela size="pin" selected={selectedId === lm.id}>
              {lm.pin}
            </Cartela>
          </button>
        ))}
      </div>
    </div>
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
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <ClassicFrame />
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center px-4 pointer-events-none"
        style={{
          top: 'max(2.15rem, calc(1.35rem + env(safe-area-inset-top, 0px)))',
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease 0.15s',
        }}
      >
        <div className="flex items-center justify-center gap-3 select-none whitespace-nowrap">
          <div className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-[#ffd166] to-transparent opacity-85" />
          <span
            className="text-xs sm:text-sm font-serif tracking-[0.32em] uppercase font-bold text-amber-200 whitespace-nowrap"
            style={{ textShadow: '0 0 12px rgba(255, 215, 100, 0.8), 0 2px 4px rgba(0,0,0,0.95)' }}
          >
            PSYCODELICINSANE · 2026
          </span>
          <div className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent via-[#ffd166] to-transparent opacity-85" />
        </div>

        {page === 'main' && (
          <div className="mt-4 sm:mt-5 text-center flex flex-col items-center">
            <h2
              className="inline-flex items-center justify-center"
              style={{
                fontSize: 'clamp(2.4rem, 8.5vw, 5.4rem)',
                fontFamily: 'Georgia, "Palatino Linotype", serif',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '0.06em',
                ...GOLD_TEXT,
              }}
            >
              <DecoratedLetterG />arden
            </h2>
            <div className="flex items-center justify-center gap-3.5 my-1 sm:my-1.5">
              <div style={{ height: 2, width: 50, background: 'linear-gradient(90deg, transparent, #ffd166)', boxShadow: '0 0 8px rgba(255, 209, 102, 0.8)' }} />
              <span
                style={{
                  fontFamily: 'Georgia, "Palatino Linotype", serif',
                  fontSize: 'clamp(1rem, 3.2vw, 1.6rem)',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#ffe599',
                  letterSpacing: '0.22em',
                  textShadow: '0 0 10px rgba(255, 209, 102, 0.9), 0 2px 4px rgba(0,0,0,0.95)',
                }}
              >
                of
              </span>
              <div style={{ height: 2, width: 50, background: 'linear-gradient(270deg, transparent, #ffd166)', boxShadow: '0 0 8px rgba(255, 209, 102, 0.8)' }} />
            </div>
            <h2
              className="inline-flex items-center justify-center"
              style={{
                fontSize: 'clamp(2.4rem, 8.5vw, 5.4rem)',
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
        )}
      </div>

      {page === 'main' && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center px-4"
          style={{
            bottom: 'max(5.55rem, calc(4.35rem + env(safe-area-inset-bottom, 0px)))',
          }}
        >
          <div
            className="flex items-center justify-center gap-3 my-2"
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 1s ease 1.6s' }}
          >
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.5rem' }}>✦</span>
            <span style={{ color: gold(0.5), fontSize: '0.7rem', textShadow: '0 0 8px rgba(255,200,110,0.5)' }}>✦</span>
          </div>

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

      {page === 'memories' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-8" style={{ paddingBottom: '4.5rem' }}>
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

      {page === 'stats' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-8" style={{ paddingBottom: '4.5rem' }}>
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

      {page === 'map' && (
        <div
          className="absolute z-30 flex flex-col md:flex-row gap-2 md:gap-3 select-none overflow-hidden"
          style={{
            ...PAPYRUS_MAP_BG,
            top: 'max(1.15rem, calc(0.55rem + env(safe-area-inset-top, 0px)))',
            bottom: 'max(4.35rem, calc(3.15rem + env(safe-area-inset-bottom, 0px)))',
            left: 'max(1.05rem, calc(0.55rem + env(safe-area-inset-left, 0px)))',
            right: 'max(1.05rem, calc(0.55rem + env(safe-area-inset-right, 0px)))',
          }}
        >
          <MapSideVines side="left" />
          <div className="relative z-10 flex-1 min-h-0 min-w-0 overflow-hidden border-2 border-[#7a5828] bg-[#efe4c4] shadow-2xl">
            <MapIllustration selectedId={selectedPinId} onSelect={setSelectedPinId} />
          </div>

          <aside className="relative z-10 shrink-0 w-full md:w-[280px] lg:w-[320px] md:h-full max-h-[32vh] md:max-h-none overflow-y-auto rounded-xs border border-[#8a6838]/70 bg-[#fffdf8]/95 px-3 py-2.5 md:px-4 md:py-4">
            <p className="text-[9px] md:text-[10px] font-serif uppercase tracking-[0.28em] text-[#7c5828]">
              {activeLandmark.region}
            </p>
            <h3 className="mt-0.5 font-serif font-bold text-[#2a1708] text-sm md:text-lg leading-tight">
              {activeLandmark.name}
            </h3>
            <p className="mt-1.5 font-serif italic text-[#553c20] text-[11px] md:text-sm leading-relaxed">
              {activeLandmark.desc}
            </p>
            <p className="mt-2 text-[10px] md:text-xs font-mono italic text-[#8e1e12] font-semibold">
              {activeLandmark.verse}
            </p>
          </aside>
          <MapSideVines side="right" />
        </div>
      )}

      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 md:gap-8 z-40"
        style={{
          bottom: 'max(3.25rem, calc(2.1rem + env(safe-area-inset-bottom, 0px)))',
        }}
      >
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
