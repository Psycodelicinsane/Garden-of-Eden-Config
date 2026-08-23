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
  type: 'river' | 'sanctuary' | 'mountain';
}

/**
 * Recorrido del río de oeste a este inspirado en el mapa ilustrado del jardín.
 * +Z representa el norte y queda en la parte superior del mapa.
 */
export const RIVER_PATH: readonly RiverControlPoint[] = [
  { x: -1300, z: 300 },
  { x: -520, z: 305 },
  { x: -420, z: 300 },
  { x: -340, z: 292 },
  { x: -260, z: 252 },
  { x: -180, z: 158 },
  { x: -90, z: 122 },
  { x: 0, z: 148 },
  { x: 90, z: 212 },
  { x: 170, z: 255 },
  { x: 230, z: 224 },
  { x: 280, z: 112 },
  { x: 335, z: 82 },
  { x: 385, z: 132 },
  { x: 420, z: 156 },
  { x: 540, z: 160 },
  { x: 1300, z: 150 },
] as const;

export const RIVER_HALF_WIDTH = 12;

/**
 * Interpolación cúbica de Hermite. Respeta exactamente los puntos de control y
 * mantiene una curva suave aunque las distancias entre puntos sean distintas.
 */
export function riverCenterZ(x: number): number {
  const first = RIVER_PATH[0];
  const last = RIVER_PATH[RIVER_PATH.length - 1];
  if (x <= first.x) return first.z;
  if (x >= last.x) return last.z;

  let index = 0;
  while (index < RIVER_PATH.length - 2 && x > RIVER_PATH[index + 1].x) index++;

  const p0 = RIVER_PATH[Math.max(0, index - 1)];
  const p1 = RIVER_PATH[index];
  const p2 = RIVER_PATH[index + 1];
  const p3 = RIVER_PATH[Math.min(RIVER_PATH.length - 1, index + 2)];
  const span = p2.x - p1.x;
  const t = (x - p1.x) / span;
  const t2 = t * t;
  const t3 = t2 * t;
  const slope1 = (p2.z - p0.z) / (p2.x - p0.x || 1);
  const slope2 = (p3.z - p1.z) / (p3.x - p1.x || 1);

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return h00 * p1.z + h10 * span * slope1 + h01 * p2.z + h11 * span * slope2;
}

/** Colinas y montañas suaves en los laterales que permiten contemplar el horizonte. */
export const MOUNTAIN_PEAKS: readonly MountainPeak[] = [
  { x: -380, z: 30, height: 14, radius: 140 },
  { x: -350, z: -305, height: 18, radius: 160 },
  { x: 345, z: -300, height: 19, radius: 160 },
  { x: 405, z: -75, height: 13, radius: 130 },
] as const;

/** Altura compacta de las colinas; fuera de su radio no modifica el terreno. */
export function mountainHeight(x: number, z: number): number {
  let height = 0;
  for (const peak of MOUNTAIN_PEAKS) {
    const nx = (x - peak.x) / peak.radius;
    const nz = (z - peak.z) / peak.radius;
    const distanceSq = nx * nx + nz * nz;
    if (distanceSq >= 1) continue;
    const falloff = 1 - distanceSq;
    height += peak.height * falloff * falloff;
  }
  return height;
}

/** Reserva las cumbres para que las colinas sean visibles entre el bosque. */
export function isMountainCore(x: number, z: number): boolean {
  return MOUNTAIN_PEAKS.some(peak => {
    const nx = (x - peak.x) / peak.radius;
    const nz = (z - peak.z) / peak.radius;
    return nx * nx + nz * nz < 0.32;
  });
}

export function isFruitTreeIndex(index: number): boolean {
  return index % 4 === 0;
}

export const RABBIT_COUNT = 16;

function rabbitRand(seed: { n: number }) {
  seed.n = (seed.n * 16807) % 2147483647;
  return (seed.n - 1) / 2147483646;
}

/** Posiciones fijas de los conejos: lejos del árbol, del río y de las cumbres. */
export function pickRabbitSpawns(
  count: number,
  isBlocked: (x: number, z: number) => boolean,
): Array<{ x: number; z: number; coat: number; heading: number }> {
  const seed = { n: 91 };
  const out: Array<{ x: number; z: number; coat: number; heading: number }> = [];
  let guard = 0;
  while (out.length < count && guard < count * 80) {
    guard++;
    const x = rabbitRand(seed) * 520 - 260;
    const z = rabbitRand(seed) * 520 - 260;
    const d = Math.hypot(x, z);
    if (d < 28) continue;
    if (Math.abs(z - riverCenterZ(x)) < 22) continue;
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

/** Hitos de los 4 Ríos del Edén y santuarios históricos (Génesis 2:10-14) */
export const EDEN_LANDMARKS: readonly EdenLandmark[] = [
  {
    id: 'river-pishon',
    name: 'Pisón (Río de Oro)',
    description: 'El primer brazo del río que rodea toda la tierra de Havila, donde hay oro.',
    verse: 'Génesis 2:11',
    x: -260,
    z: 236,
    type: 'river',
  },
  {
    id: 'river-gihon',
    name: 'Gihón (Río de Manantiales)',
    description: 'El segundo brazo del río que fecunda la llanura de Cus.',
    verse: 'Génesis 2:13',
    x: -90,
    z: 136,
    type: 'river',
  },
  {
    id: 'river-hiddekel',
    name: 'Hidekel (Río Impetuoso)',
    description: 'El tercer brazo del río que avanza veloz hacia el oriente de Asiria.',
    verse: 'Génesis 2:14',
    x: 170,
    z: 240,
    type: 'river',
  },
  {
    id: 'river-perat',
    name: 'Éufrates (Río Fértil)',
    description: 'El cuarto río de bendición que nutre el gran valle sagrado.',
    verse: 'Génesis 2:14',
    x: 335,
    z: 96,
    type: 'river',
  },
  {
    id: 'sanctuary-clay',
    name: 'El Altar del Polvo',
    description: 'El santuario primitivo donde Dios formó al hombre del polvo de la tierra y sopló en él aliento de vida.',
    verse: 'Génesis 2:7',
    x: -38,
    z: -35,
    type: 'sanctuary',
  },
  {
    id: 'sanctuary-summit',
    name: 'Mirador de la Creación',
    description: 'La cumbre más alta del Edén desde donde se contempla la inmensidad del jardín.',
    verse: 'Génesis 1:31',
    x: -350,
    z: -305,
    type: 'mountain',
  },
] as const;
