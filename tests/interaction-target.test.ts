import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseInteractionTarget } from '../src/game/interactionTarget.ts';

test('Lilith puede apartar a Adán aunque ambos estén junto al árbol', () => {
  assert.equal(chooseInteractionTarget({
    treeDistanceSq: 1,
    lilithDistanceSq: 2.25,
    treeFacing: 1,
    lilithFacing: -0.2,
  }), 'lilith');
});

test('mirar a Lilith selecciona su interacción y no la del árbol', () => {
  assert.equal(chooseInteractionTarget({
    treeDistanceSq: 4,
    lilithDistanceSq: 9,
    treeFacing: 0.45,
    lilithFacing: 0.95,
  }), 'lilith');
});

test('mirar al árbol mantiene su inspección aunque Lilith esté cerca', () => {
  assert.equal(chooseInteractionTarget({
    treeDistanceSq: 4,
    lilithDistanceSq: 9,
    treeFacing: 0.96,
    lilithFacing: 0.4,
  }), 'tree');
});

test('si los objetivos están alineados se elige el más cercano', () => {
  assert.equal(chooseInteractionTarget({
    treeDistanceSq: 16,
    lilithDistanceSq: 9,
    treeFacing: 0.9,
    lilithFacing: 0.88,
  }), 'lilith');
});

test('fuera de ambos radios la interacción queda libre', () => {
  assert.equal(chooseInteractionTarget({
    treeDistanceSq: 25,
    lilithDistanceSq: 64,
    treeFacing: 1,
    lilithFacing: 1,
  }), 'none');
});
