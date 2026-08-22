import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MOUNTAIN_PEAKS,
  RIVER_PATH,
  isFruitTreeIndex,
  isMountainCore,
  mountainHeight,
  riverCenterZ,
} from '../src/game/worldLayout.ts';

test('el río atraviesa todos sus puntos de control', () => {
  for (const point of RIVER_PATH) {
    assert.ok(Math.abs(riverCenterZ(point.x) - point.z) < 1e-9);
  }
});

test('el río queda al norte del claro y forma meandros amplios', () => {
  assert.ok(riverCenterZ(0) > 100);
  const samples = Array.from({ length: 169 }, (_, index) => riverCenterZ(-420 + index * 5));
  assert.ok(Math.max(...samples) - Math.min(...samples) > 190);
});

test('las montañas ocupan las zonas laterales sin invadir el claro', () => {
  assert.equal(mountainHeight(0, 0), 0);
  assert.equal(isMountainCore(0, 0), false);
  for (const peak of MOUNTAIN_PEAKS) {
    assert.ok(mountainHeight(peak.x, peak.z) >= peak.height);
    assert.equal(isMountainCore(peak.x, peak.z), true);
  }
});

test('uno de cada cuatro árboles es frutal', () => {
  const fruitTrees = Array.from({ length: 240 }, (_, index) => index)
    .filter(isFruitTreeIndex);
  assert.equal(fruitTrees.length, 60);
});
