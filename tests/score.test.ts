import assert from 'node:assert/strict';
import test from 'node:test';
import { emitScoreIfChanged } from '../src/game/score.ts';

test('emite el score inicial una sola vez', () => {
  const updates: number[] = [];
  let lastSent = -1;

  lastSent = emitScoreIfChanged(0, lastSent, score => updates.push(score));
  lastSent = emitScoreIfChanged(0, lastSent, score => updates.push(score));

  assert.equal(lastSent, 0);
  assert.deepEqual(updates, [0]);
});

test('ignora cambios fraccionarios que no alteran el score visible', () => {
  const updates: number[] = [];
  let lastSent = 0;

  for (const score of [0.01, 0.25, 0.999, 1, 1.75, 1.999, 2]) {
    lastSent = emitScoreIfChanged(score, lastSent, value => updates.push(value));
  }

  assert.equal(lastSent, 2);
  assert.deepEqual(updates, [1, 2]);
});

test('permite reiniciar el seguimiento y volver a publicar cero', () => {
  const updates: number[] = [];
  const resetLastSent = -1;

  const lastSent = emitScoreIfChanged(0, resetLastSent, score => updates.push(score));

  assert.equal(lastSent, 0);
  assert.deepEqual(updates, [0]);
});
