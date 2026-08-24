/** Una estela solo suma SCORE la primera vez. Releer no vuelve a premiar. */
export function awardSteleScore(alreadyDiscovered: boolean, points = 5): number {
  return alreadyDiscovered ? 0 : points;
}
