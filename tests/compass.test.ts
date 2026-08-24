import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bearingToPoint,
  headingFromPlayerRotation,
  shouldPublishCompass,
  shortestAngleDiff,
  wrapAngleDeg,
} from '../src/game/compass.ts';

test('al spawn (rot = PI) el rumbo es norte', () => {
  const yaw = headingFromPlayerRotation(Math.PI);
  assert.ok(Math.abs(wrapAngleDeg(yaw)) < 1e-6 || Math.abs(yaw - 360) < 1e-6);
});

test('un cuarto de vuelta a la derecha marca este', () => {
  const yaw = headingFromPlayerRotation(Math.PI - Math.PI / 2);
  assert.ok(Math.abs(shortestAngleDiff(90, yaw)) < 0.01);
});

test('un cuarto de vuelta a la izquierda marca oeste', () => {
  const yaw = headingFromPlayerRotation(Math.PI + Math.PI / 2);
  assert.ok(Math.abs(shortestAngleDiff(270, yaw)) < 0.01);
});

test('el rumbo al manzano coincide con la brújula', () => {
  assert.ok(Math.abs(shortestAngleDiff(0, bearingToPoint(0, -20, 0, 0))) < 0.01);
  assert.ok(Math.abs(shortestAngleDiff(90, bearingToPoint(40, 0, 0, 0))) < 0.01);
  assert.ok(Math.abs(shortestAngleDiff(270, bearingToPoint(-40, 0, 0, 0))) < 0.01);
});

test('no publica la brújula si no ha pasado el intervalo ni hay movimiento', () => {
  assert.equal(shouldPublishCompass(0.05, 0, 0.12, 10, 10, 0, 0, 0, 0), false);
  assert.equal(shouldPublishCompass(0.2, 0, 0.12, 10, 10, 0, 0, 0, 0), true);
  assert.equal(shouldPublishCompass(0.05, 0, 0.12, 14, 10, 0, 0, 0, 0), true);
  assert.equal(shouldPublishCompass(0.05, 0, 0.12, 10, 10, 1, 0, 0, 0), true);
});
