import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyDecorTree } from '../src/game/forestKind.ts';

test('el sureste tiende a palmera y el suroeste a pino', () => {
  assert.equal(classifyDecorTree(200, -200, 0.9, 0.1), 'palm');
  assert.equal(classifyDecorTree(-200, -200, 0.1, 0.1), 'pine');
  assert.equal(classifyDecorTree(0, 300, 0.1, 0.9), 'round');
});
