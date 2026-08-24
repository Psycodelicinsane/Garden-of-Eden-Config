export interface RiverControlPoint {
  x: number;
  z: number;
}

export interface MountainPeak {
  x: number;
  z: number;
  height: number;
  radius: number;
}

export interface EdenLandmark {
  id: string;
  name: string;
  description: string;
  verse: string;
  x: number;
  z: number;
  type: 'river' | 'sanctuary' | 'mountain' | 'waterfall';
}

export interface RiverBranch {
  id: string;
  halfWidth: number;
  points: readonly RiverControlPoint[];
}

export interface RiverHit {
  dist: number;
  x: number;
  z: number;
  tx: number;
  tz: number;
  halfWidth: number;
  id: string;
}

/**
 * Cascada al oeste (izquierda del mapa). Un cauce riega el jardín al norte
 * del Árbol y, al oriente, se parte en cuatro cabezas que siguen hacia el este.
 * +Z = norte, +X = este. Gn 2:10-14.
 */
/**
 * Al mirar al norte, la izquierda de la pantalla es +X y la derecha es −X.
 * La brújula marca E hacia −X. Cascada a la izquierda (+X), cuatro cabezas
 * a la derecha (−X), corriente hacia el este de la brújula.
 */
export const WATERFALL = {
  x: 620,
  z: 140,
  lipX: 708,
  width: 78,
  height: 128,
} as const;

export const RIVER_STEM: readonly RiverControlPoint[] = [
  { x: 620, z: 140 },
  { x: 300, z: 122 },
  { x: 0, z: 110 },
  { x: -280, z: 108 },
  { x: -520, z: 110 },
  { x: -720, z: 112 },
] as const;

export const RIVER_FORK = { x: -720, z: 112 } as const;

export const RIVER_GIHON: readonly RiverControlPoint[] = [
  RIVER_FORK,
  { x: -980, z: 220 },
  { x: -1280, z: 280 },
  { x: -1580, z: 310 },
  { x: -1760, z: 320 },
] as const;

export const RIVER_HIDDEKEL: readonly RiverControlPoint[] = [
  RIVER_FORK,
  { x: -1000, z: 150 },
  { x: -1320, z: 170 },
  { x: -1600, z: 182 },
  { x: -1780, z: 188 },
] as const;

export const RIVER_PERAT: readonly RiverControlPoint[] = [
  RIVER_FORK,
  { x: -1020, z: 60 },
  { x: -1340, z: 20 },
  { x: -1620, z: -10 },
  { x: -1800, z: -20 },
] as const;

export const RIVER_PISHON: readonly RiverControlPoint[] = [
  RIVER_FORK,
  { x: -1000, z: 10 },
  { x: -1300, z: -80 },
  { x: -1560, z: -150 },
  { x: -1760, z: -190 },
] as const;

/** Compat: el cauce que riega el huerto, de oeste a este. */
export const RIVER_PATH = RIVER_STEM;

export const RIVER_HALF_WIDTH = 26;
export const RIVER_SURFACE_Y = 3.4;

export const RIVER_BRANCHES: readonly RiverBranch[] = [
  { id: 'stem', halfWidth: 26, points: RIVER_STEM },
  { id: 'pishon', halfWidth: 16, points: RIVER_PISHON },
  { id: 'gihon', halfWidth: 16, points: RIVER_GIHON },
  { id: 'hiddekel', halfWidth: 16, points: RIVER_HIDDEKEL },
  { id: 'perat', halfWidth: 18, points: RIVER_PERAT },
] as const;

/** Corriente hacia el este de la brújula (−X). */
export function eastwardFlow(tx: number, tz: number): { x: number; z: number } {
  let x = tx;
  let z = tz;
  if (x > 0) {
    x = -x;
    z = -z;
  }
  if (x > -0.5) {
    x = -0.92;
    z *= 0.25;
  }
  const len = Math.hypot(x, z) || 1;
  return { x: x / len, z: z / len };
}

/** Centro del cauce (el tronco puede ir de +X a −X). */
export function riverCenterZ(x: number): number {
  const path = RIVER_STEM;
  const first = path[0];
  const last = path[path.length - 1];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const lo = Math.min(a.x, b.x);
    const hi = Math.max(a.x, b.x);
    if (x < lo || x > hi) continue;
    const span = b.x - a.x || 1;
    return a.z + (b.z - a.z) * ((x - a.x) / span);
  }
  return Math.abs(x - first.x) < Math.abs(x - last.x) ? first.z : last.z;
}

export function nearestRiver(x: number, z: number): RiverHit {
  let best: RiverHit = { dist: 1e9, x, z, tx: 1, tz: 0, halfWidth: RIVER_HALF_WIDTH, id: 'stem' };
  for (const branch of RIVER_BRANCHES) {
    const pts = branch.points;
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = pts[i].x;
      const az = pts[i].z;
      const bx = pts[i + 1].x;
      const bz = pts[i + 1].z;
      const dx = bx - ax;
      const dz = bz - az;
      const len2 = dx * dx + dz * dz || 1;
      let t = ((x - ax) * dx + (z - az) * dz) / len2;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      const cx = ax + t * dx;
      const cz = az + t * dz;
      const dist = Math.hypot(x - cx, z - cz);
      if (dist < best.dist) {
        const len = Math.sqrt(len2);
        const flow = eastwardFlow(dx / len, dz / len);
        best = {
          dist,
          x: cx,
          z: cz,
          tx: flow.x,
          tz: flow.z,
          halfWidth: branch.halfWidth,
          id: branch.id,
        };
      }
    }
  }
  return best;
}

export function riverDistance(x: number, z: number): number {
  return nearestRiver(x, z).dist;
}

export function isWaterfallZone(x: number, z: number): boolean {
  const dx = x - WATERFALL.x;
  const dz = z - WATERFALL.z;
  return dx > -70 && dx < 220 && Math.abs(dz) < 90;
}

/** Cima del nacedero: no se alcanza a pie (solo vuelo admin). */
export function isUnreachableHighland(x: number, z: number): boolean {
  return x > WATERFALL.lipX - 6 && Math.abs(z - WATERFALL.z) < 118;
}

/** Colinas laterales + meseta alta del nacedero. */
export const MOUNTAIN_PEAKS: readonly MountainPeak[] = [
  { x: -560, z: -480, height: 24, radius: 180 },
  { x: 820, z: 148, height: 168, radius: 175 },
] as const;

export function mountainHeight(x: number, z: number): number {
  // El risco de la cascada no entra en el cauce (hacia −X).
  let height = 0;
  for (const peak of MOUNTAIN_PEAKS) {
    if (peak.z > 0 && x < WATERFALL.x + 14) continue;
    const nx = (x - peak.x) / peak.radius;
    const nz = (z - peak.z) / peak.radius;
    const distanceSq = nx * nx + nz * nz;
    if (distanceSq >= 1) continue;
    const falloff = 1 - distanceSq;
    height += peak.height * falloff * falloff;
  }
  return height;
}

export function isMountainCore(x: number, z: number): boolean {
  return MOUNTAIN_PEAKS.some(peak => {
    const nx = (x - peak.x) / peak.radius;
    const nz = (z - peak.z) / peak.radius;
    return nx * nx + nz * nz < 0.32;
  });
}

export const FOREST_TREE_COUNT = 540;
export const BERRY_BUSH_COUNT = 150;

/** Claro del Árbol, como el prado de la carta. */
export function isMeadow(x: number, z: number): boolean {
  return Math.hypot(x, z) < 96;
}

/** Pinar denso del suroeste (carta: abetos a la izquierda abajo). */
export function isPineGrove(x: number, z: number): boolean {
  return x < -70 && z < -110 && x > -720 && z > -700;
}

/** Palmeras del sureste (carta: palmas a la derecha abajo). */
export function isPalmGrove(x: number, z: number): boolean {
  return x > 90 && z < -70 && x < 620 && z > -620;
}

export function isFruitTreeIndex(index: number): boolean {
  return index % 3 === 0;
}

export const RABBIT_COUNT = 20;
export const RABBIT_NEAR_TREE = 8;

function rabbitRand(seed: { n: number }) {
  seed.n = (seed.n * 16807) % 2147483647;
  return (seed.n - 1) / 2147483646;
}

export function pickRabbitSpawns(
  count: number,
  isBlocked: (x: number, z: number) => boolean,
): Array<{ x: number; z: number; coat: number; heading: number }> {
  const seed = { n: 91 };
  const out: Array<{ x: number; z: number; coat: number; heading: number }> = [];
  const near = Math.min(RABBIT_NEAR_TREE, count);
  let guard = 0;
  while (out.length < near && guard < near * 80) {
    guard++;
    const ang = rabbitRand(seed) * Math.PI * 2;
    const rad = 10 + rabbitRand(seed) * 12;
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    if (riverDistance(x, z) < 18) continue;
    if (isBlocked(x, z)) continue;
    out.push({
      x,
      z,
      coat: Math.floor(rabbitRand(seed) * 5),
      heading: rabbitRand(seed) * Math.PI * 2,
    });
  }
  guard = 0;
  while (out.length < count && guard < count * 80) {
    guard++;
    const x = rabbitRand(seed) * 160 - 80;
    const z = rabbitRand(seed) * 160 - 80;
    const d = Math.hypot(x, z);
    if (d < 22 || d > 78) continue;
    if (riverDistance(x, z) < 20) continue;
    if (isMountainCore(x, z)) continue;
    if (isBlocked(x, z)) continue;
    out.push({
      x,
      z,
      coat: Math.floor(rabbitRand(seed) * 5),
      heading: rabbitRand(seed) * Math.PI * 2,
    });
  }
  return out;
}

export const EDEN_LANDMARKS: readonly EdenLandmark[] = [
  {
    id: 'waterfall-source',
    name: 'La Cascada del Nacedero',
    description: 'El agua cae al inicio del río que riega el jardín, antes de partirse en cuatro cabezas.',
    verse: 'Génesis 2:10',
    x: 600,
    z: 140,
    type: 'waterfall',
  },
  {
    id: 'river-pishon',
    name: 'Pisón (Río de Oro)',
    description: 'El primer brazo del río que rodea toda la tierra de Havila, donde hay oro.',
    verse: 'Génesis 2:11',
    x: -1300,
    z: -80,
    type: 'river',
  },
  {
    id: 'river-gihon',
    name: 'Gihón (Río de Manantiales)',
    description: 'El segundo brazo del río que fecunda la llanura de Cus.',
    verse: 'Génesis 2:13',
    x: -1280,
    z: 280,
    type: 'river',
  },
  {
    id: 'river-hiddekel',
    name: 'Hidekel (Río Impetuoso)',
    description: 'El tercer brazo del río que avanza veloz hacia el oriente de Asiria.',
    verse: 'Génesis 2:14',
    x: -1320,
    z: 170,
    type: 'river',
  },
  {
    id: 'river-perat',
    name: 'Éufrates (Río Fértil)',
    description: 'El cuarto río de bendición que nutre el gran valle sagrado.',
    verse: 'Génesis 2:14',
    x: -1340,
    z: 20,
    type: 'river',
  },
  {
    id: 'sanctuary-clay',
    name: 'El Altar del Polvo',
    description: 'El santuario primitivo donde Dios formó al hombre del polvo de la tierra y sopló en él aliento de vida.',
    verse: 'Génesis 2:7',
    x: -28,
    z: -72,
    type: 'sanctuary',
  },
  {
    id: 'sanctuary-summit',
    name: 'Mirador de la Creación',
    description: 'La cumbre más alta del Edén desde donde se contempla la inmensidad del jardín.',
    verse: 'Génesis 1:31',
    x: -560,
    z: -480,
    type: 'mountain',
  },
] as const;
