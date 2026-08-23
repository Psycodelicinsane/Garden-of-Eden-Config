import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RABBIT_COUNT,
  RABBIT_NEAR_TREE,
  isMountainCore,
  pickRabbitSpawns,
  riverCenterZ,
} from '../src/game/worldLayout.ts';

test('coloca conejos junto al árbol y por el jardín cercano', () => {
  const spots = pickRabbitSpawns(RABBIT_COUNT, () => false);
  assert.equal(spots.length, RABBIT_COUNT);
  const nearTree = spots.filter(s => Math.hypot(s.x, s.z) < 24);
  assert.ok(nearTree.length >= RABBIT_NEAR_TREE - 2);
  for (const spot of spots) {
    assert.ok(Math.hypot(spot.x, spot.z) >= 9);
    assert.ok(Math.abs(spot.z - riverCenterZ(spot.x)) >= 18);
    assert.equal(isMountainCore(spot.x, spot.z), false);
  }
});

test('los spawns de conejo son deterministas', () => {
  const a = pickRabbitSpawns(RABBIT_COUNT, () => false);
  const b = pickRabbitSpawns(RABBIT_COUNT, () => false);
  assert.deepEqual(a, b);
});
