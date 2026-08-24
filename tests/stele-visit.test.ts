import assert from 'node:assert/strict';
import test from 'node:test';
import { awardSteleScore } from '../src/game/steleVisit.ts';

test('la primera visita a una estela da cinco puntos', () => {
  assert.equal(awardSteleScore(false), 5);
});

test('releer una estela no vuelve a sumar', () => {
  assert.equal(awardSteleScore(true), 0);
});
