import * as THREE from 'three';
import { WATERFALL, RIVER_SURFACE_Y } from './worldLayout.ts';

// ═══════════════════════════════════════════════════════════════
// TEXTURAS PROCEDURALES PS2
// ═══════════════════════════════════════════════════════════════

function createPS2Canvas(size: number, paintFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    const tex = new THREE.CanvasTexture({} as HTMLCanvasElement);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  paintFn(ctx, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createWaterfallStreamTexture(): THREE.CanvasTexture {
  return createPS2Canvas(128, (ctx, w, h) => {
    // Fondo azul turquesa brillante
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#0277bd');
    grad.addColorStop(0.2, '#039be5');
    grad.addColorStop(0.5, '#4fc3f7');
    grad.addColorStop(0.8, '#039be5');
    grad.addColorStop(1, '#0277bd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Vetas gruesas de espuma blanca en caída continua
    ctx.globalAlpha = 0.98;
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const len = 20 + Math.random() * 55;
      const thick = 1.8 + Math.random() * 4.5;
      const colors = ['#ffffff', '#ffffff', '#e1f5fe', '#b3e5fc', '#ffffff'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(x, y, thick, len);
      if (y + len > h) ctx.fillRect(x, 0, thick, y + len - h);
    }

    // Burbujas y motas
    ctx.globalAlpha = 0.92;
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 5);
    }

    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = '#01579b';
      ctx.fillRect(x, y, 2 + Math.random() * 3, 10 + Math.random() * 25);
    }
    ctx.globalAlpha = 1;
  });
}

export function createBoilingFoamTexture(): THREE.CanvasTexture {
  return createPS2Canvas(128, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.45;
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillStyle = '#81d4fa';
      ctx.beginPath();
      ctx.arc(x, y, 4 + Math.random() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export function createWarmRockTexture(): THREE.CanvasTexture {
  return createPS2Canvas(64, (ctx, w, h) => {
    ctx.fillStyle = '#634b32';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const colors = ['#7c5f40', '#4e3b28', '#8f6f4c', '#3b2b1c', '#6d5438'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 6, 2 + Math.random() * 6);
    }
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = '#261b11';
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 6 + Math.random() * 14);
    }
    ctx.globalAlpha = 1;
  });
}

export function createMistPuffTexture(): THREE.CanvasTexture {
  return createPS2Canvas(64, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.35, 'rgba(235, 245, 255, 0.55)');
    grad.addColorStop(0.7, 'rgba(210, 235, 255, 0.22)');
    grad.addColorStop(1, 'rgba(190, 225, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ═══════════════════════════════════════════════════════════════
// CONSTRUCCIÓN GEOMÉTRICA DE LA CASCADA (INSPIRADA EN LA PINTURA)
// ═══════════════════════════════════════════════════════════════

export interface WaterfallSystem {
  group: THREE.Group;
  torrentSheets: THREE.Mesh[];
  foamSheets: THREE.Mesh[];
  spillwayMeshes: THREE.Mesh[];
  highlandLakeMeshes: THREE.Mesh[];
  impactDiscs: THREE.Mesh[];
  rippleMeshes: THREE.Mesh[];
  mistPuffs: Array<{
    mesh: THREE.Mesh;
    basePos: THREE.Vector3;
    phase: number;
    speed: number;
    scale: number;
    maxHeight: number;
  }>;
  splashParticles: Array<{
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    basePos: THREE.Vector3;
    life: number;
    maxLife: number;
  }>;
  audio: WaterfallAudio | null;
  collisionBodies: Array<{ x: number; z: number; radius: number }>;
}

export function createWaterfallSystem(waterTexFallback?: THREE.Texture): WaterfallSystem {
  const baseX = WATERFALL.x; // 620
  const baseZ = WATERFALL.z; // 140
  const waterY = RIVER_SURFACE_Y; // 3.4
  const dropHeight = 65;
  const topY = waterY + dropHeight; // ~68.4

  const group = new THREE.Group();
  group.position.set(baseX, 0, baseZ);

  const waterTex = createWaterfallStreamTexture();
  const boilTex = createBoilingFoamTexture();
  const warmRockTex = createWarmRockTexture();
  const mistTex = createMistPuffTexture();

  const torrentSheets: THREE.Mesh[] = [];
  const foamSheets: THREE.Mesh[] = [];
  const spillwayMeshes: THREE.Mesh[] = [];
  const highlandLakeMeshes: THREE.Mesh[] = [];
  const impactDiscs: THREE.Mesh[] = [];
  const rippleMeshes: THREE.Mesh[] = [];
  const mistPuffs: WaterfallSystem['mistPuffs'] = [];
  const splashParticles: WaterfallSystem['splashParticles'] = [];
  const collisionBodies: WaterfallSystem['collisionBodies'] = [];

  const warmRockMat = new THREE.MeshLambertMaterial({ map: warmRockTex, color: 0x9a7b58, flatShading: true });
  const darkWetRockMat = new THREE.MeshLambertMaterial({ map: warmRockTex, color: 0x423120, flatShading: true });
  const mossMat = new THREE.MeshLambertMaterial({ color: 0x3d6e22, flatShading: true });
  const fernMat = new THREE.MeshLambertMaterial({ color: 0x22772e, side: THREE.DoubleSide });

  const addRockSlab = (px: number, py: number, pz: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0, mat: THREE.Material = warmRockMat) => {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), mat);
    rock.position.set(px, py, pz);
    rock.scale.set(sx, sy, sz);
    rock.rotation.set(rx, ry, rz);
    rock.castShadow = true;
    rock.receiveShadow = true;
    group.add(rock);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. FLANCOS ROCOSOS LATERALES Y PARED TRASERA
  // ─────────────────────────────────────────────────────────────

  for (let step = 0; step < 8; step++) {
    const py = waterY + step * 8 + 4;
    const px = 16 + step * 6;
    // Flanco norte (+Z)
    addRockSlab(px, py, 28 + step * 2.2, 14, 14, 16, 0.1, 0.2, -0.2, step % 2 === 0 ? warmRockMat : darkWetRockMat);
    addRockSlab(px - 4, py + 2, 22 + step * 2, 9, 9, 11, 0, 0, 0, mossMat);
    // Flanco sur (-Z)
    addRockSlab(px, py, -28 - step * 2.2, 14, 14, 16, -0.1, -0.2, -0.2, step % 2 === 0 ? warmRockMat : darkWetRockMat);
    addRockSlab(px - 4, py + 2, -22 - step * 2, 9, 9, 11, 0, 0, 0, mossMat);
  }

  // Pared posterior del lecho rocoso
  for (let i = -2; i <= 2; i++) {
    for (let layer = 0; layer < 4; layer++) {
      const px = 55 + layer * 7;
      const py = waterY + layer * 18 + 10;
      const pz = i * 14;
      addRockSlab(px, py, pz, 16, 22, 16, 0, 0, 0, layer === 3 ? mossMat : darkWetRockMat);
    }
  }

  // Boulders en las orillas de la poza
  addRockSlab(-6, waterY + 1.5, 26, 8, 6, 9, 0.2, 0.4, 0, warmRockMat);
  addRockSlab(2, waterY + 2.0, 30, 9, 7, 10, 0, 0.2, 0, mossMat);
  addRockSlab(-6, waterY + 1.5, -26, 8, 6, 9, -0.2, -0.4, 0, warmRockMat);
  addRockSlab(2, waterY + 2.0, -30, 9, 7, 10, 0, -0.2, 0, mossMat);

  // ─────────────────────────────────────────────────────────────
  // 2. CASCADA CONTINUA FLUIDA 3D
  // ─────────────────────────────────────────────────────────────

  const segmentsU = 28;
  const segmentsV = 8;
  const frontGeo = new THREE.BufferGeometry();
  const verts: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segmentsU; i++) {
    const u = i / segmentsU;
    const y = waterY + dropHeight * (1 - u);
    const x = 50 - 54 * Math.pow(u, 0.85);
    const width = 24 + 24 * u;

    for (let j = 0; j <= segmentsV; j++) {
      const v = j / segmentsV;
      const vNorm = (v - 0.5) * 2;
      const arch = (1 - vNorm * vNorm) * 2.5 * Math.sin(u * Math.PI);
      const px = x - arch;
      const py = y + 0.35;
      const pz = vNorm * (width / 2);

      verts.push(px, py, pz);
      uvs.push(v, u * 5.0);
    }
  }

  const rowStride = segmentsV + 1;
  for (let i = 0; i < segmentsU; i++) {
    for (let j = 0; j < segmentsV; j++) {
      const a = i * rowStride + j;
      const b = (i + 1) * rowStride + j;
      const c = (i + 1) * rowStride + (j + 1);
      const d = i * rowStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  frontGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  frontGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  frontGeo.setIndex(indices);
  frontGeo.computeVertexNormals();

  const waterMat = new THREE.MeshLambertMaterial({
    map: waterTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.98,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const mainWaterMesh = new THREE.Mesh(frontGeo, waterMat);
  mainWaterMesh.renderOrder = 4;
  group.add(mainWaterMesh);
  torrentSheets.push(mainWaterMesh);

  // Flancos laterales de agua
  const makeFlankGeo = (isRight: boolean) => {
    const flankGeo = new THREE.BufferGeometry();
    const fVerts: number[] = [];
    const fUvs: number[] = [];
    const fIndices: number[] = [];
    const segs = 20;

    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const y = waterY + dropHeight * (1 - u);
      const frontX = 50 - 54 * Math.pow(u, 0.85);
      const width = 24 + 24 * u;
      const z = (isRight ? 1 : -1) * (width / 2);
      const backX = frontX + 12;

      fVerts.push(frontX, y + 0.35, z);
      fUvs.push(0, u * 5.0);

      fVerts.push(backX, y, z);
      fUvs.push(1, u * 5.0);
    }

    for (let i = 0; i < segs; i++) {
      const a = i * 2;
      const b = (i + 1) * 2;
      const c = (i + 1) * 2 + 1;
      const d = i * 2 + 1;
      fIndices.push(a, b, d);
      fIndices.push(b, c, d);
    }

    flankGeo.setAttribute('position', new THREE.Float32BufferAttribute(fVerts, 3));
    flankGeo.setAttribute('uv', new THREE.Float32BufferAttribute(fUvs, 2));
    flankGeo.setIndex(fIndices);
    flankGeo.computeVertexNormals();
    return flankGeo;
  };

  const leftFlank = new THREE.Mesh(makeFlankGeo(false), waterMat);
  leftFlank.renderOrder = 4;
  group.add(leftFlank);
  torrentSheets.push(leftFlank);

  const rightFlank = new THREE.Mesh(makeFlankGeo(true), waterMat);
  rightFlank.renderOrder = 4;
  group.add(rightFlank);
  torrentSheets.push(rightFlank);

  // Río de la meseta superior
  const streamGeo = new THREE.PlaneGeometry(36, 26, 6, 6);
  streamGeo.rotateX(-Math.PI / 2);
  const stream = new THREE.Mesh(streamGeo, waterMat);
  stream.position.set(68, topY + 0.5, 0);
  stream.renderOrder = 3;
  group.add(stream);
  spillwayMeshes.push(stream);

  // ─────────────────────────────────────────────────────────────
  // 3. POZA OSCURA Y MANTO DE ESPUMA BLANCA HIRVIENTE
  // ─────────────────────────────────────────────────────────────

  const poolDiscGeo = new THREE.CircleGeometry(38, 32);
  const darkPoolMat = new THREE.MeshLambertMaterial({
    map: waterTexFallback || waterTex,
    color: 0x0a2822,
    side: THREE.DoubleSide,
  });
  const poolMesh = new THREE.Mesh(poolDiscGeo, darkPoolMat);
  poolMesh.rotation.x = -Math.PI / 2;
  poolMesh.position.set(-10, waterY + 0.08, 0);
  poolMesh.renderOrder = 2;
  group.add(poolMesh);

  // Manto de espuma blanca hirviente
  const foamApronGeo = new THREE.CircleGeometry(24, 24);
  const boilMat = new THREE.MeshBasicMaterial({
    map: boilTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const foamApron = new THREE.Mesh(foamApronGeo, boilMat);
  foamApron.rotation.x = -Math.PI / 2;
  foamApron.scale.set(1.4, 0.9, 1);
  foamApron.position.set(2, waterY + 0.22, 0);
  foamApron.renderOrder = 4;
  group.add(foamApron);
  impactDiscs.push(foamApron);

  for (let r = 0; r < 3; r++) {
    const ripGeo = new THREE.RingGeometry(16 + r * 6, 20 + r * 6, 20);
    const ripMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45 - r * 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ripMesh = new THREE.Mesh(ripGeo, ripMat);
    ripMesh.rotation.x = -Math.PI / 2;
    ripMesh.position.set(-4, waterY + 0.12 + r * 0.02, 0);
    ripMesh.renderOrder = 3;
    group.add(ripMesh);
    rippleMeshes.push(ripMesh);
  }

  // Rápidos de salida hacia el río
  const rapidsGeo = new THREE.PlaneGeometry(36, 28, 6, 4);
  rapidsGeo.rotateX(-Math.PI / 2);
  const rapidsMat = new THREE.MeshBasicMaterial({
    map: waterTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.70,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rapidsMesh = new THREE.Mesh(rapidsGeo, rapidsMat);
  rapidsMesh.position.set(-28, waterY + 0.16, 0);
  rapidsMesh.renderOrder = 4;
  group.add(rapidsMesh);
  foamSheets.push(rapidsMesh);

  // ─────────────────────────────────────────────────────────────
  // 4. HELECHOS Y FLORA NATURAL (DISPERSOS EN LAS ORILLAS)
  // ─────────────────────────────────────────────────────────────

  const makeFernCluster = (fx: number, fy: number, fz: number, scale = 1, rotY = 0) => {
    const fernGroup = new THREE.Group();
    fernGroup.position.set(fx, fy, fz);
    fernGroup.scale.set(scale, scale, scale);
    const nFronds = 6;
    for (let f = 0; f < nFronds; f++) {
      const ang = (f / nFronds) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.0), fernMat);
      frond.rotation.order = 'YXZ';
      frond.rotation.y = ang + rotY;
      frond.rotation.x = 0.65;
      frond.position.y = 1.4;
      fernGroup.add(frond);
    }
    group.add(fernGroup);
  };

  // Helechos naturales alrededor de las orillas de la poza
  makeFernCluster(-26, waterY + 0.4, 20, 1.4, 0.4);
  makeFernCluster(-20, waterY + 0.4, 28, 1.2, 0.8);
  makeFernCluster(-28, waterY + 0.4, -18, 1.4, -0.4);
  makeFernCluster(-18, waterY + 0.4, -26, 1.3, -0.8);

  // Helechos en las laderas de roca laterales
  makeFernCluster(20, 14, 28, 1.1, 0.3);
  makeFernCluster(36, 26, 32, 1.0, 0.6);
  makeFernCluster(20, 14, -28, 1.1, -0.3);
  makeFernCluster(36, 26, -32, 1.0, -0.6);

  // ─────────────────────────────────────────────────────────────
  // 5. NIEBLA Y GOTAS DE SALPICADURA
  // ─────────────────────────────────────────────────────────────

  const mistMat = new THREE.MeshBasicMaterial({
    map: mistTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });

  const puffCount = 24;
  for (let i = 0; i < puffCount; i++) {
    const size = 12 + Math.random() * 14;
    const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mistMat.clone());
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 18;
    const bx = 4 + Math.cos(angle) * rad;
    const bz = Math.sin(angle) * rad;
    const by = waterY + 2 + Math.random() * 6;

    pMesh.position.set(bx, by, bz);
    pMesh.renderOrder = 8;
    group.add(pMesh);

    mistPuffs.push({
      mesh: pMesh,
      basePos: new THREE.Vector3(bx, waterY + 2, bz),
      phase: Math.random() * Math.PI * 2,
      speed: 4.0 + Math.random() * 5.0,
      scale: size,
      maxHeight: 20 + Math.random() * 16,
    });
  }

  const splashMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const splashCount = 24;
  for (let i = 0; i < splashCount; i++) {
    const sMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.4, 0), splashMat);
    const angle = Math.random() * Math.PI * 2;
    const rad = Math.random() * 14;
    const bx = 6 + Math.cos(angle) * rad;
    const bz = Math.sin(angle) * rad;
    sMesh.position.set(bx, waterY + 0.5, bz);
    sMesh.renderOrder = 7;
    group.add(sMesh);

    splashParticles.push({
      mesh: sMesh,
      basePos: new THREE.Vector3(bx, waterY + 0.5, bz),
      vel: new THREE.Vector3(
        (Math.random() - 0.6) * 10,
        10 + Math.random() * 14,
        (Math.random() - 0.5) * 10,
      ),
      life: Math.random() * 1.5,
      maxLife: 1.2 + Math.random() * 0.8,
    });
  }

  collisionBodies.push({ x: baseX + 35, z: baseZ, radius: 24 });
  collisionBodies.push({ x: baseX + 10, z: baseZ - 28, radius: 16 });
  collisionBodies.push({ x: baseX + 10, z: baseZ + 28, radius: 16 });

  const audio = typeof window !== 'undefined' ? new WaterfallAudio(baseX + 20, baseZ) : null;

  return {
    group,
    torrentSheets,
    foamSheets,
    spillwayMeshes,
    highlandLakeMeshes,
    impactDiscs,
    rippleMeshes,
    mistPuffs,
    splashParticles,
    audio,
    collisionBodies,
  };
}

export function updateWaterfallSystem(
  system: WaterfallSystem,
  delta: number,
  elapsedTotal: number,
  playerPos: THREE.Vector3,
  isUnderwater: boolean,
  camera: THREE.Camera,
) {
  // Flujo descendente suave hacia abajo (-offset desplaza la textura hacia u=1)
  for (let i = 0; i < system.torrentSheets.length; i++) {
    const mat = system.torrentSheets[i].material as THREE.MeshLambertMaterial;
    if (mat.map) mat.map.offset.y = -elapsedTotal * 1.8;
  }
  for (let i = 0; i < system.foamSheets.length; i++) {
    const mat = system.foamSheets[i].material as THREE.MeshBasicMaterial;
    if (mat.map) mat.map.offset.y = -elapsedTotal * 2.2;
  }
  for (let i = 0; i < system.spillwayMeshes.length; i++) {
    const mat = system.spillwayMeshes[i].material as THREE.MeshLambertMaterial;
    if (mat.map) mat.map.offset.x = -elapsedTotal * 0.8;
  }

  for (let i = 0; i < system.impactDiscs.length; i++) {
    const disc = system.impactDiscs[i];
    const pulse = 1 + Math.sin(elapsedTotal * 5 + i) * 0.05;
    disc.scale.set(1.4 * pulse, 0.9 * pulse, 1);
  }

  for (let i = 0; i < system.rippleMeshes.length; i++) {
    const rip = system.rippleMeshes[i];
    const waveT = (elapsedTotal * 0.7 + i * 0.33) % 1;
    const currentScale = 1 + waveT * 0.8;
    rip.scale.set(currentScale, currentScale, 1);
    const mat = rip.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - waveT) * 0.45;
  }

  const camPos = camera.position;
  for (let p = 0; p < system.mistPuffs.length; p++) {
    const puff = system.mistPuffs[p];
    puff.phase += delta * puff.speed;
    const cycle = (puff.phase / (Math.PI * 2)) % 1;

    const curY = puff.basePos.y + cycle * puff.maxHeight;
    const driftX = Math.sin(puff.phase * 0.7) * 3.5 - cycle * 4.0;
    const driftZ = Math.cos(puff.phase * 0.5) * 2.5;
    puff.mesh.position.set(puff.basePos.x + driftX, curY, puff.basePos.z + driftZ);

    const scaleFactor = 1 + cycle * 1.6;
    puff.mesh.scale.set(scaleFactor, scaleFactor, 1);

    const alpha = Math.sin(cycle * Math.PI) * 0.35;
    (puff.mesh.material as THREE.MeshBasicMaterial).opacity = alpha;

    puff.mesh.lookAt(camPos);
  }

  for (let s = 0; s < system.splashParticles.length; s++) {
    const splash = system.splashParticles[s];
    splash.life += delta;
    if (splash.life >= splash.maxLife) {
      splash.life = 0;
      splash.mesh.position.copy(splash.basePos);
      splash.vel.set(
        (Math.random() - 0.6) * 10,
        10 + Math.random() * 14,
        (Math.random() - 0.5) * 10,
      );
    }
    splash.vel.y -= 26 * delta;
    splash.mesh.position.x += splash.vel.x * delta;
    splash.mesh.position.y += splash.vel.y * delta;
    splash.mesh.position.z += splash.vel.z * delta;

    const lifeRatio = splash.life / splash.maxLife;
    (splash.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - lifeRatio) * 0.85;
  }

  system.audio?.update(playerPos.x, playerPos.y, playerPos.z, isUnderwater);
}

export class WaterfallAudio {
  private readonly waterfallX: number;
  private readonly waterfallZ: number;
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private bandpassFilter: BiquadFilterNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private initialized = false;

  constructor(waterfallX: number, waterfallZ: number) {
    this.waterfallX = waterfallX;
    this.waterfallZ = waterfallZ;
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.value = 850;
      this.lowpassFilter.Q.value = 1.2;

      this.bandpassFilter = this.ctx.createBiquadFilter();
      this.bandpassFilter.type = 'peaking';
      this.bandpassFilter.frequency.value = 320;
      this.bandpassFilter.gain.value = 6;
      this.bandpassFilter.Q.value = 1.5;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0;

      this.noiseSource.connect(this.bandpassFilter);
      this.bandpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      this.noiseSource.start(0);
      this.initialized = true;
    } catch {}
  }

  public update(playerX: number, _playerY: number, playerZ: number, isUnderwater: boolean) {
    if (!this.initialized && this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.initialized) {
      this.init();
      return;
    }
    if (!this.ctx || !this.gainNode || !this.lowpassFilter) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const dx = playerX - this.waterfallX;
    const dz = playerZ - this.waterfallZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const maxDist = 380;
    const minDist = 35;
    let targetVol = 0;
    if (dist < maxDist) {
      const norm = Math.max(0, Math.min(1, (dist - minDist) / (maxDist - minDist)));
      targetVol = (1 - norm) * (1 - norm) * 0.45;
    }

    let targetCutoff = 850;
    if (isUnderwater) {
      targetCutoff = 190;
      targetVol *= 0.7;
    } else {
      const nearFactor = Math.max(0, 1 - dist / 120);
      targetCutoff = 650 + nearFactor * 800;
    }

    const t = this.ctx.currentTime;
    this.gainNode.gain.setTargetAtTime(targetVol, t, 0.1);
    this.lowpassFilter.frequency.setTargetAtTime(targetCutoff, t, 0.1);
  }

  public dispose() {
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {}
      this.noiseSource = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
    }
    this.initialized = false;
  }
}
