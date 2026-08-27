import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createWaterfallSystem,
  WaterfallAudio,
} from '../src/game/waterfall.ts';
import { WATERFALL } from '../src/game/worldLayout.ts';

test('crea el sistema de cascada de roca escalonada inspirada en la pintura', () => {
  const system = createWaterfallSystem();
  assert.ok(system.group);
  assert.ok(system.torrentSheets.length >= 3);
  assert.ok(system.foamSheets.length >= 1);
  assert.ok(system.spillwayMeshes.length >= 1);
  assert.ok(system.impactDiscs.length >= 1);
  assert.ok(system.rippleMeshes.length >= 3);
  assert.ok(system.mistPuffs.length >= 20);
  assert.ok(system.splashParticles.length >= 20);
  assert.ok(system.collisionBodies.length >= 2);
});

test('el sistema de audio se inicializa con la posición de la cascada', () => {
  const audio = new WaterfallAudio(WATERFALL.x, WATERFALL.z);
  assert.ok(audio);
});
