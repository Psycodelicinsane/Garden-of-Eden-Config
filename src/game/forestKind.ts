import { isPalmGrove, isPineGrove } from './worldLayout.ts';

export type DecorKind = 'palm' | 'round' | 'pine' | 'golden';

export function classifyDecorTree(x: number, z: number, rollPalm: number, rollRound: number): DecorKind {
  if (isPalmGrove(x, z)) {
    if (rollPalm > 0.45) return 'palm';
    return 'golden';
  }
  if (isPineGrove(x, z)) return 'pine';
  if (rollRound > 0.18) return 'round';
  return 'pine';
}
