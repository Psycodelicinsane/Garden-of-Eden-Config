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

function MedievalIlluminatedCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const place: CSSProperties = {
    tl: { top: 0, left: 0, transform: 'none' },
    tr: { top: 0, right: 0, transform: 'scaleX(-1)' },
    bl: { bottom: 0, left: 0, transform: 'scaleY(-1)' },
    br: { bottom: 0, right: 0, transform: 'scale(-1,-1)' },
  }[pos];
  const g = `gothic-${pos}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 150 150"
      className="pointer-events-none"
      style={{
        position: 'absolute',
        width: 'clamp(95px, 13vw, 150px)',
        height: 'clamp(95px, 13vw, 150px)',
        zIndex: 5,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.95)) drop-shadow(0 0 12px rgba(240,194,74,0.4))',
        ...place,
      }}
    >
      <defs>
        {/* Gradiente de oro pulido medieval */}
        <linearGradient id={`${g}-gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#fff2b2" />
          <stop offset="45%" stopColor="#f3c242" />
          <stop offset="75%" stopColor="#c28816" />
          <stop offset="100%" stopColor="#543006" />
        </linearGradient>
        {/* Gradiente de oro profundo sombreado */}
        <linearGradient id={`${g}-darkgold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd76a" />
          <stop offset="50%" stopColor="#b67c13" />
          <stop offset="100%" stopColor="#3d1e03" />
        </linearGradient>
        {/* Joya de rubí iluminado */}
        <radialGradient id={`${g}-ruby`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ff7b92" />
          <stop offset="40%" stopColor="#e01238" />
          <stop offset="85%" stopColor="#800418" />
          <stop offset="100%" stopColor="#3a0008" />
        </radialGradient>
        {/* Joya de esmeralda iluminada */}
        <radialGradient id={`${g}-emerald`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7bf0ad" />
          <stop offset="40%" stopColor="#1bb860" />
          <stop offset="85%" stopColor="#0b582b" />
          <stop offset="100%" stopColor="#032611" />
        </radialGradient>
      </defs>

      {/* ── 1. RAMA PRINCIPAL DE ACANTO HORIZONTAL (BORDE SUPERIOR) ── */}
      <path
        d="M14 14 C40 10, 75 22, 105 12 C122 6, 136 14, 148 8"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <path
        d="M16 16 C42 12, 74 24, 104 14 C120 8, 134 16, 146 10"
        fill="none"
        stroke="#fff9db"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Hojas de acanto superior lobuladas y dentadas */}
      <path
        d="M50 14 C42 2, 60 -2, 66 8 C72 -2, 88 4, 82 16 C92 10, 104 16, 98 26 C90 24, 82 22, 76 18 C68 24, 56 22, 50 14 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />
      <path
        d="M95 12 C92 2, 108 0, 114 8 C120 0, 134 4, 130 14 C138 10, 146 16, 140 24 C132 20, 124 20, 118 16 C112 20, 102 18, 95 12 Z"
        fill={`url(#${g}-darkgold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />
      {/* Zarcillos y brotes de hiedra superior */}
      <path d="M78 18 C86 28, 76 38, 66 34 C60 30, 64 22, 72 24" fill="none" stroke={`url(#${g}-gold)`} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M120 16 C128 26, 120 34, 112 30" fill="none" stroke={`url(#${g}-gold)`} strokeWidth="1.8" strokeLinecap="round" />

      {/* ── 2. RAMA PRINCIPAL DE ACANTO VERTICAL (BORDE LATERAL) ── */}
      <path
        d="M14 14 C10 40, 22 75, 12 105 C6 122, 14 136, 8 148"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <path
        d="M16 16 C12 42, 24 74, 14 104 C8 120, 16 134, 10 146"
        fill="none"
        stroke="#fff9db"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* Hojas de acanto lateral lobuladas y dentadas */}
      <path
        d="M14 50 C2 42, -2 60, 8 66 C-2 72, 4 88, 16 82 C10 92, 16 104, 26 98 C24 90, 22 82, 18 76 C24 68, 22 56, 14 50 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />
      <path
        d="M12 95 C2 92, 0 108, 8 114 C0 120, 4 134, 14 130 C10 138, 16 146, 24 140 C20 132, 20 124, 16 118 C20 112, 18 102, 12 95 Z"
        fill={`url(#${g}-darkgold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />
      {/* Zarcillos y brotes de hiedra lateral */}
      <path d="M18 78 C28 86, 38 76, 34 66 C30 60, 22 64, 24 72" fill="none" stroke={`url(#${g}-gold)`} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 120 C26 128, 34 120, 30 112" fill="none" stroke={`url(#${g}-gold)`} strokeWidth="1.8" strokeLinecap="round" />

      {/* ── 3. VOLUTA DIAGONAL INTERIOR CON ROSAS Y FLORES MEDIEVALES ── */}
      <path
        d="M26 26 C46 38, 62 58, 54 78 C48 92, 32 86, 36 72 C40 60, 56 66, 50 76"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M26 26 C38 46, 58 62, 78 54 C92 48, 86 32, 72 36 C60 40, 66 56, 76 50"
        fill="none"
        stroke={`url(#${g}-gold)`}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Hojas de hiedra dorada y tréboles */}
      <path d="M62 38 C68 28, 80 32, 76 42 C72 48, 64 44, 62 38 Z" fill={`url(#${g}-gold)`} stroke="#2c1604" strokeWidth="0.6" />
      <path d="M38 62 C28 68, 32 80, 42 76 C48 72, 44 64, 38 62 Z" fill={`url(#${g}-gold)`} stroke="#2c1604" strokeWidth="0.6" />
      <path d="M84 46 C92 40, 98 50, 92 56 C86 60, 80 52, 84 46 Z" fill={`url(#${g}-darkgold)`} stroke="#2c1604" strokeWidth="0.6" />
      <path d="M46 84 C40 92, 50 98, 56 92 C60 86, 52 80, 46 84 Z" fill={`url(#${g}-darkgold)`} stroke="#2c1604" strokeWidth="0.6" />

      {/* ── 4. FLORÓN CENTRAL HERALDICO Y FLOR DE LIS DE LA ESQUINA ── */}
      {/* Pétalo central de la flor de lis */}
      <path
        d="M24 6 C18 18, 16 30, 24 40 C32 30, 30 18, 24 6 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.9"
      />
      {/* Pétalo izquierdo curvado */}
      <path
        d="M18 28 C8 24, 2 34, 8 42 C16 46, 22 38, 22 32 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.9"
      />
      {/* Pétalo derecho curvado */}
      <path
        d="M28 18 C24 8, 34 2, 42 8 C46 16, 38 22, 32 22 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.9"
      />
      {/* Anillo de unión de la flor de lis */}
      <path
        d="M12 36 Q26 42 40 32 L36 38 Q24 46 10 40 Z"
        fill={`url(#${g}-darkgold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />
      {/* Base de la flor de lis */}
      <path
        d="M18 40 C14 50, 22 56, 26 60 C30 56, 38 48, 34 38 Z"
        fill={`url(#${g}-gold)`}
        stroke="#2c1604"
        strokeWidth="0.8"
      />

      {/* ── 5. JOYAS Y PERLAS GÓTICAS ENCAST次第AS ── */}
      {/* Gran rubí central en la flor de lis */}
      <circle cx="25" cy="31" r="4.2" fill={`url(#${g}-ruby)`} stroke="#ffd700" strokeWidth="0.9" />
      <circle cx="23.5" cy="29.5" r="1.2" fill="#ffffff" opacity="0.8" />

      {/* Esmeraldas y rubíes en los nudos del acanto */}
      <circle cx="68" cy="17" r="3.2" fill={`url(#${g}-emerald)`} stroke="#ffd700" strokeWidth="0.7" />
      <circle cx="17" cy="68" r="3.2" fill={`url(#${g}-emerald)`} stroke="#ffd700" strokeWidth="0.7" />
      <circle cx="114" cy="11" r="2.8" fill={`url(#${g}-ruby)`} stroke="#ffd700" strokeWidth="0.6" />
      <circle cx="11" cy="114" r="2.8" fill={`url(#${g}-ruby)`} stroke="#ffd700" strokeWidth="0.6" />

      {/* Roseta de cinco pétalos iluminada en la voluta interior */}
      <g transform="translate(56, 56)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="0"
            cy="-5.2"
            rx="2.6"
            ry="4.2"
            transform={`rotate(${deg})`}
            fill={`url(#${g}-gold)`}
            stroke="#2c1604"
            strokeWidth="0.5"
          />
        ))}
        <circle cx="0" cy="0" r="3.0" fill={`url(#${g}-ruby)`} stroke="#ffd700" strokeWidth="0.6" />
        <circle cx="-0.8" cy="-0.8" r="0.9" fill="#ffffff" opacity="0.85" />
      </g>

      {/* Perlas doradas de remate */}
      {[
        [90, 30], [30, 90], [136, 22], [22, 136], [74, 52], [52, 74]
      ].map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="2.2" fill="#fff7d1" stroke="#8a5a12" strokeWidth="0.6" />
      ))}
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
      <MedievalIlluminatedCorner pos="tl" />
      <MedievalIlluminatedCorner pos="tr" />
      <MedievalIlluminatedCorner pos="bl" />
      <MedievalIlluminatedCorner pos="br" />
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
    <span className="relative inline-flex items-baseline shrink-0 select-none mr-1 align-baseline">
      <svg
        viewBox="0 0 110 125"
        className="w-[1.25em] h-[1.25em] inline-block align-baseline -mb-[0.16em]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 3px 2px rgba(40,20,4,0.95)) drop-shadow(0 0 16px rgba(255,200,80,0.5))',
        }}
      >
        <defs>
          <linearGradient id="gothicGoldG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#fff4b5" />
            <stop offset="45%" stopColor="#f5c242" />
            <stop offset="78%" stopColor="#c48814" />
            <stop offset="100%" stopColor="#4e2b03" />
          </linearGradient>
          <linearGradient id="gothicDarkGoldG" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd96a" />
            <stop offset="55%" stopColor="#b57a10" />
            <stop offset="100%" stopColor="#3d1b02" />
          </linearGradient>
          <radialGradient id="rubyG" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff7b92" />
            <stop offset="45%" stopColor="#dc143c" />
            <stop offset="90%" stopColor="#7a0416" />
            <stop offset="100%" stopColor="#350006" />
          </radialGradient>
        </defs>

        {/* ── VOLUTAS Y ZARCILLOS EXTERIORES DE ACANTO ── */}
        <path
          d="M18 60 C4 28, 32 8, 62 10 C82 12, 98 26, 94 44 C90 56, 76 60, 64 54 C52 48, 48 30, 60 22 C70 14, 82 18, 78 30"
          fill="none"
          stroke="url(#gothicGoldG)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M56 102 C28 110, 8 88, 12 56 C16 32, 36 16, 64 16 C84 16, 98 28, 104 42"
          fill="none"
          stroke="url(#gothicGoldG)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Hojas de acanto y brotes de hiedra */}
        <path d="M28 22 C20 12, 34 8, 40 18 C36 24, 28 24, 28 22 Z" fill="url(#gothicGoldG)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M86 28 C96 20, 102 32, 94 38 C88 38, 84 32, 86 28 Z" fill="url(#gothicGoldG)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M84 92 C96 90, 102 102, 92 108 C84 106, 82 98, 84 92 Z" fill="url(#gothicGoldG)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M20 84 C10 88, 12 100, 22 96 C26 90, 24 84, 20 84 Z" fill="url(#gothicDarkGoldG)" stroke="#2c1604" strokeWidth="0.6" />

        {/* ── CUERPO PRINCIPAL DE LA G LOMBARDICA / GÓTICA ILUMINADA ── */}
        <path
          d="
            M 92,34
            C 86,20 74,12 56,12
            C 28,12 10,34 10,64
            C 10,92 28,112 58,112
            C 82,112 98,98 100,74
            L 100,58
            L 58,58
            L 58,70
            L 86,70
            C 84,86 74,98 58,98
            C 38,98 24,84 24,64
            C 24,42 38,26 56,26
            C 70,26 80,32 86,42
            Z
          "
          fill="url(#gothicGoldG)"
          stroke="#2c1604"
          strokeWidth="2.2"
        />

        {/* Remate superior con florón gótico */}
        <path d="M86 36 L100 24 L104 36 L94 44 Z" fill="url(#gothicDarkGoldG)" stroke="#2c1604" strokeWidth="1.2" />
        {/* Espolón y remate del travesaño */}
        <path d="M96 56 L106 58 L104 74 L96 72 Z" fill="url(#gothicDarkGoldG)" stroke="#2c1604" strokeWidth="1.2" />

        {/* ── JOYAS ENCAST次第AS Y PERLAS ── */}
        <circle cx="58" cy="64" r="3.8" fill="url(#rubyG)" stroke="#ffd700" strokeWidth="0.8" />
        <circle cx="56.8" cy="62.8" r="1.1" fill="#ffffff" opacity="0.85" />
        <circle cx="100" cy="24" r="2.6" fill="#fff7d1" stroke="#8a5a12" strokeWidth="0.6" />
        <circle cx="104" cy="74" r="2.6" fill="#fff7d1" stroke="#8a5a12" strokeWidth="0.6" />
        <circle cx="16" cy="64" r="3.0" fill="url(#rubyG)" stroke="#ffd700" strokeWidth="0.7" />
      </svg>
    </span>
  );
}

function DecoratedLetterE() {
  return (
    <span className="relative inline-flex items-baseline shrink-0 select-none mr-1 align-baseline">
      <svg
        viewBox="0 0 110 125"
        className="w-[1.25em] h-[1.25em] inline-block align-baseline -mb-[0.16em]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 3px 2px rgba(40,20,4,0.95)) drop-shadow(0 0 16px rgba(255,200,80,0.5))',
        }}
      >
        <defs>
          <linearGradient id="gothicGoldE" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#fff4b5" />
            <stop offset="45%" stopColor="#f5c242" />
            <stop offset="78%" stopColor="#c48814" />
            <stop offset="100%" stopColor="#4e2b03" />
          </linearGradient>
          <linearGradient id="gothicDarkGoldE" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd96a" />
            <stop offset="55%" stopColor="#b57a10" />
            <stop offset="100%" stopColor="#3d1b02" />
          </linearGradient>
          <radialGradient id="emeraldE" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#7bf0ad" />
            <stop offset="45%" stopColor="#1bb860" />
            <stop offset="90%" stopColor="#0b582b" />
            <stop offset="100%" stopColor="#032611" />
          </radialGradient>
        </defs>

        {/* ── VOLUTAS Y ZARCILLOS EXTERIORES DE ACANTO ── */}
        <path
          d="M18 58 C4 26, 32 6, 62 8 C80 10, 96 22, 92 40 C88 52, 74 56, 62 50 C50 44, 46 28, 58 20 C68 12, 80 16, 76 28"
          fill="none"
          stroke="url(#gothicGoldE)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M54 100 C26 108, 8 86, 12 56 C16 32, 34 16, 62 16 C82 16, 96 26, 102 38"
          fill="none"
          stroke="url(#gothicGoldE)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Hojas de acanto y brotes */}
        <path d="M26 20 C18 10, 32 6, 38 16 C34 22, 26 22, 26 20 Z" fill="url(#gothicGoldE)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M84 26 C94 18, 100 30, 92 36 C86 36, 82 30, 84 26 Z" fill="url(#gothicGoldE)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M88 88 C98 84, 104 96, 94 102 C86 100, 84 92, 88 88 Z" fill="url(#gothicGoldE)" stroke="#2c1604" strokeWidth="0.6" />
        <path d="M18 82 C8 86, 10 98, 20 94 C24 88, 22 82, 18 82 Z" fill="url(#gothicDarkGoldE)" stroke="#2c1604" strokeWidth="0.6" />

        {/* ── CUERPO PRINCIPAL DE LA E LOMBARDICA / UNCIAL ILUMINADA ── */}
        <path
          d="
            M 92,26
            C 84,14 70,10 52,10
            C 26,10 8,30 8,62
            C 8,90 26,110 54,110
            C 72,110 86,102 94,86
            L 80,80
            C 74,92 64,98 52,98
            C 34,98 22,82 22,62
            C 22,40 34,24 52,24
            C 64,24 74,30 80,40
            Z
          "
          fill="url(#gothicGoldE)"
          stroke="#2c1604"
          strokeWidth="2.2"
        />

        {/* Brazo central de la E con remate de florón */}
        <path
          d="M 20,56 L 68,56 C 76,50 88,54 92,62 C 88,70 76,74 68,68 L 20,68 Z"
          fill="url(#gothicGoldE)"
          stroke="#2c1604"
          strokeWidth="1.8"
        />

        {/* Remates trilobulados de los brazos superior e inferior */}
        <path d="M88 24 L100 16 L102 28 L94 34 Z" fill="url(#gothicDarkGoldE)" stroke="#2c1604" strokeWidth="1.2" />
        <path d="M90 88 L102 96 L98 106 L88 98 Z" fill="url(#gothicDarkGoldE)" stroke="#2c1604" strokeWidth="1.2" />

        {/* ── JOYAS ENCAST次第AS Y PERLAS ── */}
        <circle cx="78" cy="62" r="3.8" fill="url(#emeraldE)" stroke="#ffd700" strokeWidth="0.8" />
        <circle cx="76.8" cy="60.8" r="1.1" fill="#ffffff" opacity="0.85" />
        <circle cx="100" cy="16" r="2.6" fill="#fff7d1" stroke="#8a5a12" strokeWidth="0.6" />
        <circle cx="100" cy="104" r="2.6" fill="#fff7d1" stroke="#8a5a12" strokeWidth="0.6" />
        <circle cx="15" cy="62" r="3.0" fill="url(#emeraldE)" stroke="#ffd700" strokeWidth="0.7" />
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
