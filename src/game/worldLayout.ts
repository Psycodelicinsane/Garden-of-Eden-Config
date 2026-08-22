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

/** Montañas situadas como en la ilustración: laterales y esquinas del jardín. */
export const MOUNTAIN_PEAKS: readonly MountainPeak[] = [
  { x: -380, z: 30, height: 46, radius: 105 },
  { x: -350, z: -305, height: 54, radius: 120 },
  { x: 345, z: -300, height: 58, radius: 125 },
  { x: 405, z: -75, height: 38, radius: 95 },
] as const;

/** Altura compacta de las montañas; fuera de su radio no modifica el terreno. */
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

/** Reserva las cumbres para que las montañas sean visibles entre el bosque. */
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
