export type InteractionTarget = 'tree' | 'lilith' | 'none';

export const TREE_INTERACTION_DISTANCE_SQ = 25;
export const LILITH_TALK_DISTANCE_SQ = 64;
export const LILITH_SHOVE_DISTANCE_SQ = 2.89;

interface InteractionCandidates {
  treeDistanceSq: number;
  lilithDistanceSq: number;
  treeFacing: number;
  lilithFacing: number;
}

/**
 * Decide qué personaje u objeto recibe una pulsación de interacción cuando
 * Lilith y el Árbol del Conocimiento están próximos entre sí.
 *
 * La distancia corporal de Lilith siempre tiene prioridad para que pueda
 * apartar a Adán. En el resto de casos se respeta lo que el jugador está
 * mirando y, si ambos objetivos quedan casi alineados, el más cercano.
 */
export function chooseInteractionTarget({
  treeDistanceSq,
  lilithDistanceSq,
  treeFacing,
  lilithFacing,
}: InteractionCandidates): InteractionTarget {
  const treeInRange = treeDistanceSq < TREE_INTERACTION_DISTANCE_SQ;
  const lilithInRange = lilithDistanceSq < LILITH_TALK_DISTANCE_SQ;

  if (!treeInRange && !lilithInRange) return 'none';
  if (!treeInRange) return 'lilith';
  if (!lilithInRange) return 'tree';

  // Una interacción dentro de su espacio personal es inequívocamente Lilith.
  if (lilithDistanceSq < LILITH_SHOVE_DISTANCE_SQ) return 'lilith';

  const focusThreshold = 0.35;
  const focusMargin = 0.12;
  if (lilithFacing >= focusThreshold && lilithFacing > treeFacing + focusMargin) {
    return 'lilith';
  }
  if (treeFacing >= focusThreshold && treeFacing > lilithFacing + focusMargin) {
    return 'tree';
  }

  return lilithDistanceSq <= treeDistanceSq ? 'lilith' : 'tree';
}
