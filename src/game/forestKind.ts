import { isPalmGrove, isPineGrove } from './worldLayout.ts';

export type DecorKind = 'palm' | 'round' | 'pine';

export function classifyDecorTree(x: number, z: number, rollPalm: number, rollRound: number): DecorKind {
  if (isPalmGrove(x, z) && rollPalm > 0.22) return 'palm';
  if (!isPineGrove(x, z) && rollRound > 0.22) return 'round';
  return 'pine';
}
