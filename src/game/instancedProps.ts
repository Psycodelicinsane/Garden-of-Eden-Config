import * as THREE from 'three';

const dummy = new THREE.Object3D();

export function setInstance(
  mesh: THREE.InstancedMesh,
  index: number,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  rx = 0,
  ry = 0,
  rz = 0,
) {
  dummy.position.set(x, y, z);
  dummy.rotation.set(rx, ry, rz);
  dummy.scale.set(sx, sy, sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(index, dummy.matrix);
}

export function finishInstances(mesh: THREE.InstancedMesh, used: number) {
  mesh.count = used;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.frustumCulled = true;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
}

export function makeInstanced(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  capacity: number,
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, capacity));
  mesh.count = 0;
  return mesh;
}
