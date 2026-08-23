import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RABBIT_COUNT,
  isMountainCore,
  pickRabbitSpawns,
  riverCenterZ,
} from '../src/game/worldLayout.ts';

test('reparte conejos por el jardín lejos del río y del árbol', () => {
  const spots = pickRabbitSpawns(RABBIT_COUNT, () => false);
  assert.equal(spots.length, RABBIT_COUNT);
  for (const spot of spots) {
    assert.ok(Math.hypot(spot.x, spot.z) >= 28);
    assert.ok(Math.abs(spot.z - riverCenterZ(spot.x)) >= 22);
    assert.equal(isMountainCore(spot.x, spot.z), false);
  }
});

test('los spawns de conejo son deterministas', () => {
  const a = pickRabbitSpawns(RABBIT_COUNT, () => false);
  const b = pickRabbitSpawns(RABBIT_COUNT, () => false);
  assert.deepEqual(a, b);
});
