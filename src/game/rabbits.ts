import * as THREE from 'three';
import { RABBIT_COUNT, isMountainCore, pickRabbitSpawns, riverCenterZ } from './worldLayout';

export { RABBIT_COUNT };
export const RABBIT_RADIUS = 0.22;

export interface RabbitRuntime {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  earL: THREE.Object3D;
  earR: THREE.Object3D;
  frontL: THREE.Object3D;
  frontR: THREE.Object3D;
  hindL: THREE.Object3D;
  hindR: THREE.Object3D;
  state: 'idle' | 'graze' | 'hop' | 'flee';
  timer: number;
  hopPhase: number;
  heading: number;
  speed: number;
  coat: number;
}

function makeFurTexture(hex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 32, 32);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#2a2118' : i % 3 === 1 ? '#c4a57a' : '#5a4634';
    ctx.globalAlpha = 0.18;
    ctx.fillRect(Math.random() * 32, Math.random() * 32, 1 + Math.random() * 2, 1);
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  return tex;
}

const COATS = ['#8a6240', '#6d5340', '#c4a078', '#4a4038', '#a07a52'] as const;

function buildRabbitMesh(coatIndex: number): Omit<RabbitRuntime, 'state' | 'timer' | 'hopPhase' | 'heading' | 'speed'> {
  const furTex = makeFurTexture(COATS[coatIndex % COATS.length]);
  const fur = new THREE.MeshLambertMaterial({
    map: furTex,
    color: COATS[coatIndex % COATS.length],
    flatShading: true,
  });
  const belly = new THREE.MeshLambertMaterial({ color: 0xe8d8c4, flatShading: true });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a120c });
  const noseMat = new THREE.MeshLambertMaterial({ color: 0xc48a86, flatShading: true });
  const innerEar = new THREE.MeshLambertMaterial({ color: 0xd9a090, flatShading: true });

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.16, 7, 6), fur);
  torso.scale.set(1.15, 0.82, 1.55);
  torso.position.set(0, 0.16, 0);
  torso.castShadow = true;
  body.add(torso);

  const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 5), fur);
  haunch.position.set(0, 0.15, -0.12);
  haunch.scale.set(1.25, 1.05, 1.1);
  haunch.castShadow = true;
  body.add(haunch);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), belly);
  chest.position.set(0, 0.13, 0.12);
  chest.scale.set(0.95, 0.75, 0.9);
  body.add(chest);

  const head = new THREE.Group();
  head.position.set(0, 0.22, 0.20);
  body.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.09, 7, 6), fur);
  skull.scale.set(0.95, 0.88, 1.15);
  skull.castShadow = true;
  head.add(skull);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 5), fur);
  snout.position.set(0, -0.012, 0.075);
  snout.scale.set(0.85, 0.7, 1.1);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 5, 4), noseMat);
  nose.position.set(0, -0.004, 0.11);
  head.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 5), eyeMat);
    eye.position.set(0.042 * side, 0.018, 0.062);
    eye.scale.set(1, 1.1, 0.7);
    head.add(eye);
  }

  const mkEar = (side: number) => {
    const ear = new THREE.Group();
    ear.position.set(0.038 * side, 0.07, -0.01);
    ear.rotation.z = 0.18 * side;
    ear.rotation.x = -0.15;
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.16, 5), fur);
    outer.position.y = 0.08;
    outer.castShadow = true;
    ear.add(outer);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.11, 4), innerEar);
    inner.position.set(0, 0.075, 0.008);
    ear.add(inner);
    head.add(ear);
    return ear;
  };
  const earL = mkEar(-1);
  const earR = mkEar(1);

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.038, 5, 4), belly);
  tail.position.set(0, 0.18, -0.24);
  body.add(tail);

  const mkLeg = (x: number, z: number, hind: boolean) => {
    const leg = new THREE.Group();
    leg.position.set(x, 0.08, z);
    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(hind ? 0.032 : 0.02, hind ? 0.07 : 0.05, 3, 5),
      fur,
    );
    thigh.position.y = hind ? -0.02 : -0.01;
    thigh.castShadow = true;
    leg.add(thigh);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(hind ? 0.028 : 0.018, 5, 4), fur);
    foot.position.set(0, hind ? -0.07 : -0.055, hind ? 0.02 : 0.012);
    foot.scale.set(0.8, 0.55, hind ? 1.6 : 1.2);
    leg.add(foot);
    body.add(leg);
    return leg;
  };

  const frontL = mkLeg(-0.055, 0.12, false);
  const frontR = mkLeg(0.055, 0.12, false);
  const hindL = mkLeg(-0.07, -0.1, true);
  const hindR = mkLeg(0.07, -0.1, true);

  return { root, body, head, earL, earR, frontL, frontR, hindL, hindR, coat: coatIndex };
}

export class EdenRabbits {
  readonly rabbits: RabbitRuntime[] = [];
  private getHeight: (x: number, z: number) => number;

  constructor(
    scene: THREE.Scene,
    getHeight: (x: number, z: number) => number,
    blocked: (x: number, z: number) => boolean,
  ) {
    this.getHeight = getHeight;
    const spots = pickRabbitSpawns(RABBIT_COUNT, blocked);
    for (const spot of spots) {
      const mesh = buildRabbitMesh(spot.coat);
      const y = this.getHeight(spot.x, spot.z);
      mesh.root.position.set(spot.x, y, spot.z);
      mesh.root.rotation.y = spot.heading;
      scene.add(mesh.root);
      this.rabbits.push({
        ...mesh,
        state: 'idle',
        timer: 1 + spot.coat * 0.4,
        hopPhase: 0,
        heading: spot.heading,
        speed: 2.4 + spot.coat * 0.15,
      });
    }
  }

  update(delta: number, time: number, playerX: number, playerZ: number) {
    for (const r of this.rabbits) {
      r.timer -= delta;
      const pos = r.root.position;
      const pdx = pos.x - playerX;
      const pdz = pos.z - playerZ;
      const pDist = Math.hypot(pdx, pdz);

      if (pDist < 4.2 && r.state !== 'flee') {
        r.state = 'flee';
        r.timer = 1.6 + Math.random() * 0.8;
        r.heading = Math.atan2(pdx, pdz);
      }

      if (r.state === 'flee' || r.state === 'hop') {
        const burst = r.state === 'flee' ? r.speed * 1.55 : r.speed;
        r.hopPhase += delta * (r.state === 'flee' ? 14 : 11);
        const hop = Math.max(0, Math.sin(r.hopPhase));
        const step = burst * hop * hop * delta * 2.1;
        let nx = pos.x + Math.sin(r.heading) * step;
        let nz = pos.z + Math.cos(r.heading) * step;
        if (Math.abs(nz - riverCenterZ(nx)) < 16 || isMountainCore(nx, nz) || Math.hypot(nx, nz) < 20) {
          r.heading += Math.PI * 0.6;
        } else {
          pos.x = Math.max(-300, Math.min(300, nx));
          pos.z = Math.max(-300, Math.min(300, nz));
        }
        r.root.rotation.y = r.heading;
        r.body.position.y = hop * 0.11;
        r.hindL.rotation.x = -0.9 * hop;
        r.hindR.rotation.x = -0.9 * hop;
        r.frontL.rotation.x = 0.7 * hop;
        r.frontR.rotation.x = 0.7 * hop;
        if (r.timer <= 0) {
          r.state = 'idle';
          r.timer = 1.2 + Math.random() * 2.4;
          r.body.position.y = 0;
        }
      } else if (r.state === 'graze') {
        r.head.rotation.x = 0.35 + Math.sin(time * 6 + r.coat) * 0.08;
        r.earL.rotation.z = -0.18 + Math.sin(time * 3 + r.coat) * 0.05;
        r.earR.rotation.z = 0.18 + Math.cos(time * 3.2 + r.coat) * 0.05;
        if (r.timer <= 0) {
          r.state = 'hop';
          r.timer = 0.7 + Math.random() * 0.6;
          r.heading += (Math.random() - 0.5) * 1.2;
          r.hopPhase = 0;
          r.head.rotation.x = 0;
        }
      } else {
        r.head.rotation.x += (0 - r.head.rotation.x) * Math.min(1, delta * 6);
        r.earL.rotation.x = Math.sin(time * 2.2 + r.coat) * 0.08;
        r.earR.rotation.x = Math.sin(time * 2.4 + r.coat + 1) * 0.08;
        r.hindL.rotation.x *= 0.8;
        r.hindR.rotation.x *= 0.8;
        r.frontL.rotation.x *= 0.8;
        r.frontR.rotation.x *= 0.8;
        if (r.timer <= 0) {
          r.state = Math.random() > 0.45 ? 'hop' : 'graze';
          r.timer = r.state === 'graze' ? 2 + Math.random() * 2 : 0.8;
          r.heading += (Math.random() - 0.5) * 0.8;
          r.hopPhase = 0;
        }
      }

      const ground = this.getHeight(pos.x, pos.z);
      pos.y += (ground - pos.y) * Math.min(1, delta * 16);
    }
  }

  resolvePlayer(x: number, z: number, playerRadius: number) {
    for (const r of this.rabbits) {
      const dx = x - r.root.position.x;
      const dz = z - r.root.position.z;
      const rad = RABBIT_RADIUS + playerRadius;
      const dSq = dx * dx + dz * dz;
      if (dSq < rad * rad && dSq > 0.0001) {
        const d = Math.sqrt(dSq);
        x = r.root.position.x + (dx / d) * rad;
        z = r.root.position.z + (dz / d) * rad;
      }
    }
    return { x, z };
  }

  nearest(x: number, z: number) {
    let best: RabbitRuntime | null = null;
    let bestD = Infinity;
    for (const r of this.rabbits) {
      const d = Math.hypot(r.root.position.x - x, r.root.position.z - z);
      if (d < bestD) {
        bestD = d;
        best = r;
      }
    }
    return best ? { rabbit: best, dist: bestD } : null;
  }
}
