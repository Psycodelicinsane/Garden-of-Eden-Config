/** Rumbo 0 = norte (+Z). Misma convención que la cámara YXZ con rot = PI al spawn. */
export function headingFromPlayerRotation(playerRotation: number): number {
  const lookX = -Math.sin(playerRotation);
  const lookZ = -Math.cos(playerRotation);
  return ((Math.atan2(-lookX, lookZ) * 180 / Math.PI) % 360 + 360) % 360;
}

export function wrapAngleDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Rumbo hacia un punto del mundo, misma convención que la brújula (E = −X). */
export function bearingToPoint(fromX: number, fromZ: number, toX: number, toZ: number): number {
  const wx = toX - fromX;
  const wz = toZ - fromZ;
  return wrapAngleDeg(Math.atan2(-wx, wz) * 180 / Math.PI);
}

export function shortestAngleDiff(fromDeg: number, toDeg: number): number {
  let diff = toDeg - fromDeg;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

export function shouldPublishCompass(
  elapsed: number,
  lastAt: number,
  interval: number,
  yaw: number,
  lastYaw: number,
  x: number,
  z: number,
  lastX: number,
  lastZ: number,
): boolean {
  if (elapsed - lastAt >= interval) return true;
  if (Math.abs(shortestAngleDiff(lastYaw, yaw)) >= 1.2) return true;
  const dx = x - lastX;
  const dz = z - lastZ;
  return dx * dx + dz * dz >= 0.36;
}
