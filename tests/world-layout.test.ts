import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BERRY_BUSH_COUNT,
  FOREST_TREE_COUNT,
  MOUNTAIN_PEAKS,
  RIVER_FORK,
  RIVER_GIHON,
  RIVER_HIDDEKEL,
  RIVER_PATH,
  RIVER_PERAT,
  RIVER_PISHON,
  WATERFALL,
  isFruitTreeIndex,
  isMountainCore,
  mountainHeight,
  eastwardFlow,
  nearestRiver,
  riverCenterZ,
  riverDistance,
} from '../src/game/worldLayout.ts';

test('el cauce que riega el jardín atraviesa sus puntos de control', () => {
  for (const point of RIVER_PATH) {
    assert.ok(Math.abs(riverCenterZ(point.x) - point.z) < 1e-9);
  }
});

test('el río único queda al norte del claro y luego se parte en cuatro', () => {
  assert.ok(riverCenterZ(0) > 100);
  assert.ok(riverDistance(0, 0) > 30);
  assert.ok(nearestRiver(RIVER_FORK.x, RIVER_FORK.z).dist < 2);
  assert.ok(RIVER_PISHON.length > 2 && RIVER_GIHON.length > 2);
  assert.ok(RIVER_HIDDEKEL.length > 2 && RIVER_PERAT.length > 2);
  assert.ok(RIVER_FORK.x < -500);
  for (const arm of [RIVER_PISHON, RIVER_GIHON, RIVER_HIDDEKEL, RIVER_PERAT]) {
    assert.ok(arm[arm.length - 1].x < RIVER_FORK.x - 400);
    for (const pt of arm) assert.ok(pt.x <= RIVER_FORK.x);
  }
});

test('la cascada nace al noroeste y alimenta el cauce', () => {
  assert.ok(WATERFALL.z > 100);
  assert.ok(WATERFALL.x > 200);
  assert.ok(riverDistance(WATERFALL.x, WATERFALL.z) < 30);
  assert.equal(RIVER_PATH[0].x, WATERFALL.x);
  assert.equal(RIVER_PATH[0].z, WATERFALL.z);
});

test('el risco del nacedero no invade el cauce hacia el jardín', () => {
  assert.ok(mountainHeight(-400, 168) < 1);
  assert.ok(mountainHeight(0, 108) < 1);
  assert.ok(mountainHeight(WATERFALL.x - 40, WATERFALL.z) < 4);
});

test('la corriente del río siempre avanza al este', () => {
  assert.ok(eastwardFlow(1, 0).x < -0.9);
  assert.ok(eastwardFlow(-1, 0.2).x < -0.9);
  assert.ok(nearestRiver(0, 110).tx < -0.4);
});

test('las montañas ocupan las zonas laterales sin invadir el claro', () => {
  assert.equal(mountainHeight(0, 0), 0);
  assert.equal(isMountainCore(0, 0), false);
  for (const peak of MOUNTAIN_PEAKS) {
    assert.ok(mountainHeight(peak.x, peak.z) >= peak.height);
    assert.equal(isMountainCore(peak.x, peak.z), true);
  }
});

test('uno de cada tres árboles es frutal', () => {
  const fruitTrees = Array.from({ length: FOREST_TREE_COUNT }, (_, index) => index)
    .filter(isFruitTreeIndex);
  assert.equal(FOREST_TREE_COUNT, 540);
  assert.equal(fruitTrees.length, 180);
  assert.equal(BERRY_BUSH_COUNT, 150);
});
