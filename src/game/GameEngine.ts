import * as THREE from 'three';
import { GameState } from '../App';
import { emitScoreIfChanged } from './score';

interface GameCallbacks {
  onStateChange: (state: GameState) => void;
  onScoreUpdate: (score: number) => void;
  onDiscovery?: (count: number) => void;
  onFoodUpdate?: (count: number) => void;
  onCinematicUpdate?: (progress: number) => void;
  onForbiddenTree?: () => void;
  onAdamThought?: (text: string) => void;
}

const RENDER_SCALE = 0.48;

// ═══════════════════════════════════════════════════════════════
// TEXTURAS PROCEDURALES PS2
// La PS2 usaba texturas 64x64 o 128x128 con colores saturados
// ═══════════════════════════════════════════════════════════════

function makePS2Texture(size: number, paintFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  paintFn(ctx, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter; // PS2 nearest-neighbour
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createBarkTexture(): THREE.CanvasTexture {
  return makePS2Texture(64, (ctx, w, h) => {
    // Base — PS2 usaba colores muy saturados en cortezas
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(0, 0, w, h);
    // Rayas verticales gruesas (vetas de madera)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w;
      const lw = 1 + Math.random() * 4;
      const lh = 10 + Math.random() * 30;
      const y = Math.random() * h;
      const dark = ['#2a1a0a', '#1e1208', '#33200e'];
      const light = ['#5a4028', '#6a4a30', '#4a3520'];
      ctx.fillStyle = Math.random() > 0.4 ? dark[Math.floor(Math.random() * 3)] : light[Math.floor(Math.random() * 3)];
      ctx.fillRect(x, y, lw, lh);
    }
    // Grietas horizontales
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = '#1a0e06';
      ctx.lineWidth = 1;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (Math.random() - 0.5) * 6);
      ctx.stroke();
    }
    // Nudos y detalles
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = '#1a0e06';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 1 + Math.random() * 2, Math.random(), 0, Math.PI * 2);
      ctx.fill();
    }
    // Musgo verde en algunas zonas (PS2 detalle)
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#2a4a18';
      ctx.globalAlpha = 0.4;
      ctx.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 2 + Math.random() * 4);
    }
    ctx.globalAlpha = 1;
  });
}

function createGrassTexture(): THREE.CanvasTexture {
  return makePS2Texture(64, (ctx, w, h) => {
    // Base verde medio
    ctx.fillStyle = '#3a7a25';
    ctx.fillRect(0, 0, w, h);
    // Parches de distintos verdes (PS2 tenía mucha variación de color)
    for (let i = 0; i < 120; i++) {
      const colors = ['#2a5515', '#4a9930', '#55aa38', '#336622', '#448830', '#2a6618', '#60bb40'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    // Briznas de hierba
    for (let i = 0; i < 25; i++) {
      ctx.strokeStyle = Math.random() > 0.5 ? '#66cc44' : '#224e12';
      ctx.lineWidth = 1;
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 6);
      ctx.stroke();
    }
    // Manchas de tierra (PS2 detalle)
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = '#5a4a28';
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1 + Math.random() * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Florecillas diminutas
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.7;
      const fc = ['#ffee55', '#ff88aa', '#ffffff'][Math.floor(Math.random() * 3)];
      ctx.fillStyle = fc;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
  });
}

function createLeafTexture(): THREE.CanvasTexture {
  return makePS2Texture(32, (ctx, w, h) => {
    ctx.fillStyle = '#2d7a1a';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) {
      const colors = ['#1a5510', '#358c22', '#2a6618', '#44aa30', '#1e4a0c'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = '#1a4a0e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = '#55cc30';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
  });
}

function createWaterTexture(): THREE.CanvasTexture {
  return makePS2Texture(64, (ctx, w, h) => {
    // base agua azul
    ctx.fillStyle = '#347dc6';
    ctx.fillRect(0, 0, w, h);
    // bandas horizontales de flujo
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? '#4c97df' : '#2f6fb0';
      ctx.fillRect(0, y, w, 2);
    }
    // brillos especulares irregulares
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#cfeeff' : '#8fd8ff';
      ctx.fillRect(Math.random() * w, Math.random() * h, 4 + Math.random() * 10, 1 + Math.random() * 2);
    }
    // manchas oscuras profundas
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = '#1a4b7c';
      ctx.beginPath();
      ctx.ellipse(Math.random() * w, Math.random() * h, 3 + Math.random() * 7, 1 + Math.random() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

function createCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  // Margen transparente amplio para que el volumen nunca toque los bordes
  // de la textura. Así desaparecen los cortes rectangulares de las nubes.
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cúmulos superpuestos, todos contenidos dentro del margen transparente.
  const blobs = [
    { x: 48, y: 76, rx: 30, ry: 18 },
    { x: 76, y: 60, rx: 38, ry: 25 },
    { x: 112, y: 46, rx: 43, ry: 31 },
    { x: 148, y: 50, rx: 40, ry: 29 },
    { x: 184, y: 63, rx: 37, ry: 24 },
    { x: 211, y: 77, rx: 27, ry: 17 },
    { x: 92, y: 79, rx: 52, ry: 20 },
    { x: 139, y: 82, rx: 58, ry: 20 },
    { x: 178, y: 80, rx: 46, ry: 18 },
  ];
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, Math.max(b.rx, b.ry));
    g.addColorStop(0, 'rgba(255,255,255,0.98)');
    g.addColorStop(0.48, 'rgba(250,253,255,0.92)');
    g.addColorStop(0.78, 'rgba(226,237,247,0.58)');
    g.addColorStop(1, 'rgba(210,228,242,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sombras suaves inferiores
  const shadow = ctx.createRadialGradient(128, 82, 8, 128, 82, 88);
  shadow.addColorStop(0, 'rgba(115,150,180,0.22)');
  shadow.addColorStop(0.55, 'rgba(140,170,195,0.12)');
  shadow.addColorStop(1, 'rgba(140,170,195,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(128, 83, 92, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private callbacks: GameCallbacks;
  private animationId: number | null = null;
  private clock: THREE.Clock;
  private state: GameState = 'start';

  private playerHeight = 1.7;
  private playerSpeed = 5;
  private playerSprintSpeed = 9;
  private playerPosition: THREE.Vector3;
  private playerRotation = 0;
  private verticalRotation = 0;

  // Sprint & Jump
  private isSprinting = false;
  private velocityY = 0;
  private isGrounded = true;
  private readonly jumpForce = 8;
  private readonly gravity = 20;

  // Cámara suave
  private cameraPosition: THREE.Vector3;
  private cameraRotationY = 0;
  private cameraRotationX = 0;
  private readonly cameraSmoothness = 18; // Más suave
  private headBob = 0;
  private targetHeight = 0; // Suavizar subidas/bajadas de terreno
  // Vector de entrada reutilizado: evita crear un objeto por frame
  private inputVector = new THREE.Vector3();

  private keys: Record<string, boolean> = {};
  private mouseMovement = { x: 0, y: 0 };
  private touchStart: { x: number; y: number } | null = null;
  private joystickActive = false;
  private joystickDelta = { x: 0, y: 0 };
  private lastTouchX = 0;
  private lastTouchY = 0;
  private moveTouchId: number | null = null;
  private lookTouchId: number | null = null;

  // Touch buttons
  private touchSprint = false;
  private touchJump = false;
  private touchInspect = false;

  private food = 0;
  private readonly sprintFoodDrainPerSecond = 0.035;
  private readonly jumpFoodDrain = 0.12;

  private forbiddenTreeInspections = 0;
  private forbiddenTreeTriggered = false;
  private forbiddenCinematicActive = false;
  private forbiddenCinematicTime = 0;
  private divineLight: THREE.PointLight | null = null;
  private divineOrb: THREE.Mesh | null = null;
  private divineHalo: THREE.Mesh | null = null;
  private lastAdamThoughtAt = -9999;
  private seenThoughts = new Set<number>();

  // Lilith NPC State
  private lilithGroup: THREE.Group | null = null;
  private lilithBody: THREE.Group | null = null;
  private lilithLegL: THREE.Group | null = null;
  private lilithLegR: THREE.Group | null = null;
  private lilithArmL: THREE.Group | null = null;
  private lilithArmR: THREE.Group | null = null;
  // Articulaciones: permiten flexionar rodillas, tobillos y codos
  private lilithKneeL: THREE.Group | null = null;
  private lilithKneeR: THREE.Group | null = null;
  private lilithAnkleL: THREE.Group | null = null;
  private lilithAnkleR: THREE.Group | null = null;
  private lilithToesL: THREE.Group | null = null;
  private lilithToesR: THREE.Group | null = null;
  private lilithElbowL: THREE.Group | null = null;
  private lilithElbowR: THREE.Group | null = null;
  private lilithHead: THREE.Group | null = null;
  // Ciclo de marcha
  private lilithWalkPhase = 0;
  private lilithWalkBlend = 0;
  private lilithPrevPos = new THREE.Vector3();
  private lilithHair: THREE.Group | null = null;
  private lilithChest: THREE.Group | null = null;
  private lilithTarget = new THREE.Vector3();
  private lilithState: 'idle' | 'walking' | 'stepping' | 'blocking' | 'backing' = 'idle';
  private lilithTimer = 0;
  private lilithSpeed = 1.4;
  private readonly lilithRadius = 0.42; // cuerpo sólido: no se puede atravesar
  private lilithBackDir = new THREE.Vector3();
  private lilithArmRaise = 0; // 0 = brazos abajo, 1 = manos al frente
  private playerFreezeTimer = 0; // Lilith te detiene en seco
  // Empujón: en vez de congelarte, te aparta de verdad
  private lilithShove = 0;          // 0..1 fuerza del gesto de apartar
  private lilithBlockElapsed = 0;   // tiempo dentro del estado 'blocking'
  private lilithBlockCooldown = 0;  // evita re-disparar el gesto en bucle
  private playerPushDir = new THREE.Vector3();
  private playerPushTimer = 0;
  private readonly playerPushDuration = 0.6;
  private playerPushStrength = 0;
  // Al responderte, Lilith se detiene y te busca con la mirada un instante
  private lilithLookTimer = 0;
  private lastLilithTalkAt = -9999;

  private static readonly ADAM_THOUGHTS = [
    '¿Debería probarlo?',
    'No pienso comprobarlo...',
    'No debería comerlo.',
    'Tiene tan buena pinta...',
    'Algo me dice que no debo.',
    'Sus frutos brillan con tanta fuerza...',
    '¿Qué pasaría si lo pruebo?',
    'Dios dijo que moriría...',
    'Pero solo es una fruta...',
    '¿Por qué puso este árbol aquí?',
    'El aroma es irresistible.',
    'Mejor me alejo de aquí.',
    'No puedo dejar de mirarlo.',
    '¿Qué es el conocimiento del bien y del mal?',
    'Hay tantos otros árboles...',
    'Este es diferente a todos los demás.',
    'Siento curiosidad... y miedo.',
    '¿Por qué lo prohibió?',
    'Solo con tocarlo no pasará nada... ¿verdad?',
    'Cada vez me atrae más.',
    'Debo ser fuerte. No lo haré.',
  ];

  private static readonly LILITH_THOUGHTS = [
    'Adán parece tan indeciso...',
    '¿Por qué temes lo que no conoces?',
    'El miedo es la verdadera prisión.',
    'Yo ya probé el fruto, y sigo aquí.',
    'Dios nos dio curiosidad, ¿por qué no usarla?',
    'El conocimiento no mata, la ignorancia sí.',
    '¿Realmente crees que te castigaría por saber?',
    'Yo elegí saber. Tú puedes elegir temer.',
    'La serpiente tenía razón en algo...',
    'No seas como Adán, tan obediente.',
    '¿Qué hay de malo en querer ver más allá?',
    'Yo soy libre. Tú puedes serlo también.',
    'El miedo te mantiene ciego.',
    '¿Vas a dejar que otros decidan por ti?',
    'Yo caminé este jardín antes que tú.',
    'La duda es el primer paso hacia la verdad.',
    'No temas a las preguntas, teme a no hacerlas.',
    'Yo elegí la verdad sobre la comodidad.',
    '¿Cuánto tiempo más vas a esperar?',
    'El árbol no muerde. Solo ofrece.',
    'La libertad duele al principio, luego libera.',
  ];

  private score = 0;
  private lastSentScore = -1;
  private discoveries = new Set<string>();
  private cinematicTime = 0;
  private cinematicDuration = 21;
  private paused = false;
  private appleTree: THREE.Group | null = null;
  private apples: THREE.Mesh[] = [];
  private discoverables: Array<{ mesh: THREE.Object3D; id: string; discovered: boolean }> = [];
  private elapsedTotal = 0;
  private terrainMesh: THREE.Mesh | null = null;
  private riverMesh: THREE.Mesh | null = null;

  // Registros
  private regDistance = 0;
  private regTime = 0;
  private regJumps = 0;
  private regSprints = 0;
  private wasSprinting = false;
  private lastPos = new THREE.Vector3();
  private regenTick = 0;

  // Mariposas
  private butterflies: Array<{
    group: THREE.Group;
    center: THREE.Vector3;
    radius: number;
    speed: number;
    heightBase: number;
    wingL: THREE.Mesh;
    wingR: THREE.Mesh;
    phase: number;
  }> = [];

  // Nubes
  private clouds: Array<{
    mesh: THREE.Sprite;
    baseX: number;
    baseZ: number;
    speed: number;
    drift: number;
    altitude: number;
    phase: number;
  }> = [];

  // Colisiones simples en XZ
  private collisionBodies: Array<{ x: number; z: number; radius: number }> = [];
  private readonly playerRadius = 0.38;

  // Plantas recolectables (árbol de la sabiduría NO incluido)
  private harvestables: THREE.Object3D[] = [];

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.playerPosition = new THREE.Vector3(0, this.playerHeight, -20);
    this.targetHeight = this.playerHeight;

    // Inicializar cámara suave
    this.cameraPosition = new THREE.Vector3(0, this.playerHeight, -20);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance',
      alpha: false,
      precision: 'mediump', // mediump evita artefactos, sigue siendo PS2
    });
    this.renderer.setPixelRatio(RENDER_SCALE);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.setClearColor(0x8acaf0);
    this.renderer.sortObjects = false;

    this.scene = new THREE.Scene();
    this.scene.fog = null;

    // Sin niebla: el plano lejano se aleja para que el jardín llegue entero
    // hasta el horizonte y nada aparezca recortado.
    this.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1200);
    this.camera.rotation.order = 'YXZ';

    this.setupEventListeners();
  }

  /**
   * Sincroniza el score visible con React únicamente cuando cambia su valor
   * entero. Todas las mutaciones del score pasan por este método para evitar
   * renders duplicados durante el sprint o una interacción.
   */
  private emitScoreIfChanged() {
    this.lastSentScore = emitScoreIfChanged(
      this.score,
      this.lastSentScore,
      this.callbacks.onScoreUpdate,
    );
  }

  init() {
    this.buildWorld();
    this.resize();
  }

  showTitleScreen() {
    this.state = 'start';
    this.paused = false;
    this.forbiddenCinematicActive = false;

    // Cancelar el loop anterior si existe
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    const t0 = Date.now();
    const loop = () => {
      if (this.state !== 'start') return;
      const t = (Date.now() - t0) * 0.001;
      const r = 18;
      const h = 5 + Math.sin(t * 0.15) * 1.5;
      const angle = t * 0.04;
      this.camera.position.set(
        Math.cos(angle) * r,
        h,
        Math.sin(angle) * r
      );
      this.camera.lookAt(0, 7, 0);
      this.animateApples(t);
      this.updateButterflies(t);
      this.updateRiver(t);
      this.updateClouds(t);
      this.updateSky();
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  startGame() {
    // Cancelar loop del título si estaba corriendo
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.paused = false;
    this.forbiddenCinematicActive = false;
    this.state = 'cinematic';
    this.cinematicTime = 0;
    this.clock.start();
    this.animate();
  }

  skipCinematic() {
    const groundH = Math.max(this.getTerrainHeight(0, -20), 0);
    const standY = this.playerHeight + groundH;
    this.playerPosition.set(0, standY, -20);
    this.playerRotation = Math.PI;
    this.verticalRotation = 0.05;
    this.targetHeight = standY;
    this.lastPos.copy(this.playerPosition);
    this.cameraPosition.copy(this.playerPosition);
    this.cameraRotationY = this.playerRotation;
    this.cameraRotationX = this.verticalRotation;
    this.camera.position.copy(this.playerPosition);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerRotation;
    this.camera.rotation.x = this.verticalRotation;

    this.cinematicTime = this.cinematicDuration + 1;
    this.state = 'playing';
    this.clock.start();
    if (!this.animationId) this.animate();
    this.callbacks.onStateChange('playing');
  }

  restart() {
    this.score = 0;
    this.lastSentScore = -1;
    this.food = 0;
    this.forbiddenTreeInspections = 0;
    this.forbiddenTreeTriggered = false;
    this.forbiddenCinematicActive = false;
    this.lastAdamThoughtAt = -9999;
    this.seenThoughts.clear();
    this.discoveries.clear();
    this.inspectPressed = false;
    this.keys = {};
    this.playerFreezeTimer = 0;
    this.lilithArmRaise = 0;
    this.lilithState = 'idle';
    this.lilithTimer = 3;
    this.lilithShove = 0;
    this.lilithBlockElapsed = 0;
    this.lilithBlockCooldown = 0;
    this.lilithLookTimer = 0;
    this.lastLilithTalkAt = -9999;
    this.lilithWalkPhase = 0;
    this.lilithWalkBlend = 0;
    if (this.lilithGroup) this.lilithPrevPos.copy(this.lilithGroup.position);
    if (this.lilithHead) this.lilithHead.rotation.set(0, 0, 0);
    if (this.lilithKneeL) this.lilithKneeL.rotation.x = 0;
    if (this.lilithKneeR) this.lilithKneeR.rotation.x = 0;
    if (this.lilithElbowL) this.lilithElbowL.rotation.x = 0;
    if (this.lilithElbowR) this.lilithElbowR.rotation.x = 0;
    if (this.lilithBody) { this.lilithBody.position.y = 0; this.lilithBody.rotation.z = 0; }
    this.playerPushTimer = 0;
    this.playerPushStrength = 0;
    if (this.lilithBody) this.lilithBody.position.z = 0;
    if (this.lilithChest) this.lilithChest.rotation.x = 0;

    if (this.sunSprite) this.sunSprite.visible = true;
    this.restoreHarvestables();

    // Limpiar luz divina si quedó
    if (this.divineLight) {
      this.scene.remove(this.divineLight);
      this.divineLight = null;
    }
    if (this.divineOrb) {
      this.scene.remove(this.divineOrb);
      this.divineOrb = null;
    }
    if (this.divineHalo) {
      this.scene.remove(this.divineHalo);
      this.divineHalo = null;
    }

    this.playerPosition.set(0, this.playerHeight, -20);
    this.playerRotation = Math.PI;
    this.verticalRotation = 0;
    this.targetHeight = this.playerHeight;
    this.velocityY = 0;
    this.isGrounded = true;
    this.lastPos.copy(this.playerPosition);

    this.regDistance = 0;
    this.regTime = 0;
    this.regJumps = 0;
    this.regSprints = 0;
    this.headBob = 0;
    this.paused = false;

    this.cameraPosition.copy(this.playerPosition);
    this.cameraRotationY = this.playerRotation;
    this.cameraRotationX = this.verticalRotation;

    this.cinematicTime = 0;

    this.discoverables.forEach(d => d.discovered = false);

    this.emitScoreIfChanged();
    this.callbacks.onDiscovery?.(0);
    this.callbacks.onFoodUpdate?.(0);
  }

  pause() {
    this.paused = true;
    // Resetear controles para evitar que queden pegados
    this.keys = {};
    this.inspectPressed = false;
    this.playerFreezeTimer = 0;
    this.playerPushTimer = 0;
    this.touchSprint = false;
    this.touchJump = false;
    this.touchInspect = false;
    this.joystickActive = false;
    this.joystickDelta = { x: 0, y: 0 };
    this.lookTouchId = null;
    this.moveTouchId = null;
    this.mouseMovement = { x: 0, y: 0 };
  }

  resume() {
    this.paused = false;
    this.clock.start();
  }

  // Métodos para botones touch
  setTouchSprint(active: boolean) {
    this.touchSprint = active;
  }

  triggerTouchJump() {
    this.touchJump = true;
  }

  triggerInspect() {
    this.touchInspect = true;
  }

  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.removeEventListeners();
    if (document.pointerLockElement === this.canvas) document.exitPointerLock?.();

    const disposedMaterials = new Set<THREE.Material>();
    const disposedTextures = new Set<THREE.Texture>();
    this.scene.traverse((object: THREE.Object3D) => {
      const renderable = object as THREE.Object3D & {
        geometry?: THREE.BufferGeometry;
        material?: THREE.Material | THREE.Material[];
      };
      renderable.geometry?.dispose();
      const materials = renderable.material
        ? (Array.isArray(renderable.material) ? renderable.material : [renderable.material])
        : [];
      for (const material of materials) {
        if (disposedMaterials.has(material)) continue;
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture && !disposedTextures.has(value)) {
            value.dispose();
            disposedTextures.add(value);
          }
        }
        material.dispose();
        disposedMaterials.add(material);
      }
    });
    this.renderer.dispose();
  }

  // ═══════════════════════════════════════════════════════════════
  // WORLD BUILDING
  // ═══════════════════════════════════════════════════════════════

  // Texturas compartidas
  private barkTex: THREE.CanvasTexture | null = null;
  private grassTex: THREE.CanvasTexture | null = null;
  private leafTex: THREE.CanvasTexture | null = null;
  private waterTex: THREE.CanvasTexture | null = null;
  private cloudTex: THREE.CanvasTexture | null = null;

  // Cielo
  private skyGroup: THREE.Group | null = null;
  private sunSprite: THREE.Mesh | null = null;
  private readonly skyRadius = 900;

  // Semilla para dispersión determinista del jardín
  private seed = 7;
  private rand() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  private sstep(a: number, b: number, v: number) {
    const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  // ═══ RÍO ═══
  // Río serpenteante al norte del árbol central, imitando la forma del mapa
  // de la imagen: entra por la izquierda, serpentea y se ensancha hacia la derecha.
  private readonly riverBaseZ = 35;       // latitud base (norte) del cauce
  private readonly riverHalfWidth = 10;   // ancho de la lámina de agua
  private readonly riverBedDepth = 2.8;   // profundidad del lecho

  // Centro del cauce en función de X: ondas suaves superpuestas para un
  // recorrido serpenteante (en lugar de la línea recta original).
  private riverCenterZ(x: number) {
    return this.riverBaseZ
      + Math.sin(x * 0.018) * 13
      + Math.sin(x * 0.006 + 1.7) * 8;
  }

  // Terreno base SIN modificar por el río
  private getBaseTerrainHeight(x: number, z: number) {
    const d = Math.sqrt(x * x + z * z);
    const flat = this.sstep(24, 70, d);
    let h = (
      Math.sin(x * 0.045) * Math.cos(z * 0.05) * 1.5 +
      Math.sin(x * 0.013 + z * 0.017) * 2.2 +
      Math.cos(x * 0.09) * Math.sin(z * 0.075) * 0.45
    ) * flat;
    h += this.sstep(150, 235, d) * 7;
    const far = this.sstep(260, 900, d);
    h += far * (26 + Math.sin(x * 0.006) * Math.cos(z * 0.005) * 14 + Math.sin(d * 0.012) * 9);
    return h;
  }

  private riverSurface(x: number) {
    const baseLevel = this.getBaseTerrainHeight(x, this.riverCenterZ(x)) - this.riverBedDepth;
    const tilt = -(x / 1300) * 0.8;
    return baseLevel + tilt + 2.2;
  }

  private buildWorld() {
    // Crear texturas compartidas
    this.seed = 7;
    this.barkTex = createBarkTexture();
    this.grassTex = createGrassTexture();
    this.leafTex = createLeafTexture();
    this.waterTex = createWaterTexture();
    this.cloudTex = createCloudTexture();

    // Sin niebla de distancia: se ve el jardín limpio hasta el horizonte.
    this.scene.fog = null;

    this.createLights();
    this.createSkyAndSun();
    this.createTerrain();
    this.createRiver();
    this.createAppleTree();
    this.createForest(240);
    this.createFlora();
    this.createDiscoverables();
    this.createButterflies(11);
    this.createClouds(9);
    this.buildLilith();
  }

  private createLights() {
    const hemi = new THREE.HemisphereLight(0xa9d4f7, 0x3d6b28, 0.9);
    this.scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xfff2dd, 0.18);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffedc0, 1.25);
    sun.position.set(60, 80, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 220;
    sun.shadow.camera.left = -55;
    sun.shadow.camera.right = 55;
    sun.shadow.camera.top = 55;
    sun.shadow.camera.bottom = -55;
    sun.shadow.bias = -0.0008;
    this.scene.add(sun);
  }

  private createSkyAndSun() {
    this.skyGroup = new THREE.Group();

    // Domo con gradiente vertical pintado a mano — amanecer cálido del Edén
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // OJO: en la esfera, el horizonte cae justo en la posición 0.5 del
    // degradado. Todo el cielo visible vive entre 0 (cenit) y 0.5 (horizonte),
    // así que ahí es donde va el color; por debajo lo tapa el terreno.
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#176fc4');      // cenit azul limpio
    grad.addColorStop(0.12, '#237fce');
    grad.addColorStop(0.24, '#3291d9');
    grad.addColorStop(0.35, '#48a3e2');
    grad.addColorStop(0.43, '#60b2e8');
    grad.addColorStop(0.48, '#78c0ed');
    grad.addColorStop(0.50, '#8acaf0');   // horizonte azul claro, no blanco
    grad.addColorStop(0.56, '#83c5eb');
    grad.addColorStop(0.70, '#70b7df');
    grad.addColorStop(1, '#5aa5d0');      // bajo el horizonte
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 512);

    // Veladuras suaves para dar riqueza al azul sin ensuciarlo
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#7fd4ff' : '#4f9ff0';
      ctx.fillRect(0, Math.random() * 240, 32, 2 + Math.random() * 6);
    }
    ctx.globalAlpha = 1;

    const skyTex = new THREE.CanvasTexture(canvas);
    skyTex.magFilter = THREE.LinearFilter;
    skyTex.minFilter = THREE.LinearFilter;

    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      depthTest: false, // el domo es el fondo: siempre detrás de todo
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(this.skyRadius, 32, 20), skyMat);
    sky.renderOrder = -10;
    this.skyGroup.add(sky);

    // Sol pintado como sprite — suspendido sobre el árbol del conocimiento
    const sunPos = new THREE.Vector3(0, 340, 0);
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256;
    sunCanvas.height = 256;
    const sctx = sunCanvas.getContext('2d')!;
    // Núcleo brillante
    sctx.beginPath();
    sctx.arc(128, 128, 26, 0, Math.PI * 2);
    sctx.fillStyle = '#fffbdf';
    sctx.fill();
    // Corona
    const halo = sctx.createRadialGradient(128, 128, 20, 128, 128, 110);
    halo.addColorStop(0, 'rgba(255,244,190,0.95)');
    halo.addColorStop(0.4, 'rgba(255,226,140,0.55)');
    halo.addColorStop(1, 'rgba(255,210,110,0)');
    sctx.fillStyle = halo;
    sctx.fillRect(0, 0, 256, 256);

    const sunTex = new THREE.CanvasTexture(sunCanvas);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTex,
      transparent: true,
      fog: false,
      depthWrite: false,
      // Con depthTest activo el paisaje puede ocultarlo: así el sol nunca se
      // dibuja por delante del manzano ni de las colinas.
      depthTest: true,
    });
    this.sunSprite = new THREE.Mesh(new THREE.PlaneGeometry(190, 190), sunMat);
    this.sunSprite.position.copy(sunPos);
    this.sunSprite.renderOrder = -9;

    // Fuera del domo: queda anclado en el mundo, justo encima del manzano
    this.scene.add(this.sunSprite);
    this.scene.add(this.skyGroup);
  }

  getTerrainHeight(x: number, z: number) {
    let h = this.getBaseTerrainHeight(x, z);

    // ─ RÍO SERPENTEANTE ──
    const rd = Math.abs(z - this.riverCenterZ(x));
    if (rd < 35) {
      const waterY = this.riverSurface(x);
      const bankH = waterY + 0.6;
      
      // Orillas que suben por encima del agua
      const valley = this.sstep(35, this.riverHalfWidth, rd);
      h = h * (1 - valley) + bankH * valley;
      
      // Cauce plano donde está el agua
      const carve = this.sstep(this.riverHalfWidth, 2, rd);
      h = h * (1 - carve) + (waterY - 1.5) * carve;
    }
    return h;
  }

  private createTerrain() {
    // Aumento de resolución (320 segmentos) para que el río no se "pierda" entre vértices.
    const size = 2600;
    const seg = 320; 
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, this.getTerrainHeight(x, z));
    }
    geo.computeVertexNormals();
    const gt = this.grassTex!.clone();
    gt.needsUpdate = true;
    gt.repeat.set(260, 260);
    const mat = new THREE.MeshLambertMaterial({ map: gt });
    this.terrainMesh = new THREE.Mesh(geo, mat);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  private createRiver() {
    const verts: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];
    let row = 0;
    const half = this.riverHalfWidth;
    for (let x = -1300; x <= 1300; x += 4) {
      const y = this.riverSurface(x);
      const cz = this.riverCenterZ(x);
      verts.push(x, y, cz - half, x, y, cz + half);
      uvs.push(x * 0.05, 0, x * 0.05, 1);
      if (row > 0) {
        const a = (row - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      row++;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhongMaterial({
      map: this.waterTex!,
      transparent: true,
      opacity: 0.92,
      shininess: 90,
      specular: 0x88bbee,
    });
    this.riverMesh = new THREE.Mesh(geo, mat);
    this.scene.add(this.riverMesh);
  }

  private createAppleTree() {
    const g = new THREE.Group();
    g.position.set(0, this.getTerrainHeight(0, 0), 0);

    const barkMat = new THREE.MeshLambertMaterial({ map: this.barkTex!, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({ map: this.leafTex!, flatShading: true });

    // Tronco principal grueso
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 5.2, 7), barkMat);
    trunk.position.y = 2.6;
    trunk.castShadow = true;
    g.add(trunk);

    // Copa — masas de follaje facetadas (icosaedros PS2)
    const blobs: Array<[number, number, number, number]> = [
      [0, 6.6, 0, 3.0],
      [2.2, 5.7, 0.7, 2.2],
      [-2.1, 5.9, -0.5, 2.3],
      [0.5, 5.5, 2.2, 2.0],
      [-0.8, 5.6, -2.2, 2.1],
      [1.1, 7.7, -0.9, 1.9],
    ];
    for (const [bx, by, bz, br] of blobs) {
      const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(br, 0), leafMat);
      blob.position.set(bx, by, bz);
      blob.rotation.set(this.rand() * 3, this.rand() * 3, this.rand() * 3);
      blob.castShadow = true;
      g.add(blob);
    }

    // Manzanas brillantes — colgadas del follaje, nunca flotando
    const appleMat = new THREE.MeshLambertMaterial({
      color: 0xe02412,
      emissive: 0x881100,
      emissiveIntensity: 0.6,
    });
    // Se cuelgan sobre la piel de cada masa de follaje: nunca flotan sueltas
    // ni quedan sepultadas dentro de las hojas.
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x3d2a12 });
    let appleIdx = 0;
    for (const [bx, by, bz, br] of blobs) {
      // 3 manzanas por masa, repartidas alrededor y ligeramente hacia abajo
      for (let k = 0; k < 3; k++) {
        const ang = (k / 3) * Math.PI * 2 + (bx + bz) * 0.9;
        // Inclinación hacia abajo: las manzanas cuelgan de la parte baja de la copa
        const el = -0.15 - this.rand() * 0.5;
        const cosEl = Math.cos(el);
        // El icosaedro de detalle 0 tiene sus caras a ~0.79·r del centro:
        // 0.80 deja la manzana justo apoyada sobre la hoja.
        const rr = br * 0.80;
        const ax = bx + Math.cos(ang) * cosEl * rr;
        const ay = by + Math.sin(el) * rr;
        const az = bz + Math.sin(ang) * cosEl * rr;

        const apple = new THREE.Mesh(new THREE.SphereGeometry(0.24, 7, 6), appleMat);
        apple.position.set(ax, ay, az);
        apple.scale.set(1, 0.92, 1);
        apple.castShadow = true;
        apple.userData.baseY = ay;
        apple.userData.phase = appleIdx * 0.7;
        g.add(apple);
        this.apples.push(apple);

        // Rabito que la une al follaje
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.13, 4), stemMat);
        stem.position.set(ax, ay + 0.17, az);
        g.add(stem);

        appleIdx++;
      }
    }

    // El tronco del árbol prohibido es un cuerpo sólido
    this.collisionBodies.push({ x: 0, z: 0, radius: 1.05 });

    this.appleTree = g;
    this.scene.add(g);
  }

  private animateApples(t: number) {
    for (const a of this.apples) {
      a.position.y = a.userData.baseY + Math.sin(t * 1.4 + a.userData.phase) * 0.045;
      const m = a.material as THREE.MeshLambertMaterial;
      m.emissiveIntensity = 0.55 + Math.sin(t * 2.2 + a.userData.phase) * 0.2;
    }
  }

  private createForest(count: number) {
    const barkMat = new THREE.MeshLambertMaterial({ map: this.barkTex!, flatShading: true });
    const leafMat = new THREE.MeshLambertMaterial({ map: this.leafTex!, flatShading: true });
    const fruitLeafMat = new THREE.MeshLambertMaterial({ map: this.leafTex!, color: 0x9fd46a, flatShading: true });
    const fruitMat = new THREE.MeshLambertMaterial({ color: 0xff8c2a, emissive: 0x552200, emissiveIntensity: 0.45 });

    let placed = 0;
    let guard = 0;
    while (placed < count && guard < count * 10) {
      guard++;
      const x = this.rand() * 840 - 420;
      const z = this.rand() * 840 - 420;
      const d = Math.sqrt(x * x + z * z);
      // Respetar el claro del árbol prohibido y el cauce del río
      if (d < 16) continue;
      if (Math.abs(z - this.riverCenterZ(x)) < 20) continue;

      const y = this.getTerrainHeight(x, z);
      const tree = new THREE.Group();
      tree.position.set(x, y, z);

      // Cada cuarto árbol es FRUTAL, repartidos por todo el jardín
      // (antes solo 1 de cada 6 y cerca del centro).
      const isFruitTree = placed % 4 === 0 && d < 420;
      const s = 0.75 + this.rand() * 0.85;

      if (isFruitTree) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.30 * s, 1.7 * s, 5), barkMat);
        trunk.position.y = 0.85 * s;
        trunk.castShadow = true;
        tree.add(trunk);

        const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35 * s, 0), fruitLeafMat);
        crown.position.y = 2.7 * s;
        crown.scale.set(1.1, 0.85, 1.1);
        crown.rotation.y = this.rand() * 3;
        crown.castShadow = true;
        tree.add(crown);

        // Frutos colgando — recolectables. Se apoyan sobre la piel de la copa
        // (elipsoide 1.485 × 1.1475 × 1.485) para que nunca queden en el aire.
        tree.userData.removedFruits = [];
        const crownRXZ = 1.35 * 1.1 * s;
        const crownRY = 1.35 * 0.85 * s;
        const nF = 4 + Math.floor(this.rand() * 3);
        for (let f = 0; f < nF; f++) {
          const fr = new THREE.Mesh(new THREE.SphereGeometry(0.15 * s, 6, 5), fruitMat);
          const ang = (f / nF) * Math.PI * 2 + this.rand() * 0.7;
          const el = -0.2 - this.rand() * 0.55; // cuelgan de la mitad inferior
          const cosEl = Math.cos(el);
          fr.position.set(
            Math.cos(ang) * cosEl * crownRXZ * 0.80,
            2.7 * s + Math.sin(el) * crownRY * 0.80,
            Math.sin(ang) * cosEl * crownRXZ * 0.80
          );
          fr.castShadow = true;
          fr.userData.isFruit = true;
          tree.add(fr);
        }
        this.harvestables.push(tree);
      } else if (this.rand() > 0.25) {
        // Árbol redondo (más abundante, como en el mapa de la imagen)
        const nBlobs = 2 + Math.floor(this.rand() * 2);
        const trunkH = (2.4 + this.rand() * 1.1) * s;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.38 * s, trunkH, 6), barkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        tree.add(trunk);
        for (let b = 0; b < nBlobs; b++) {
          const br = (1.0 + this.rand() * 0.8) * s;
          const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(br, 0), leafMat);
          blob.position.set(
            (this.rand() - 0.5) * 1.6 * s,
            trunkH + (0.3 + this.rand() * 0.9) * s,
            (this.rand() - 0.5) * 1.6 * s
          );
          blob.rotation.set(this.rand() * 3, this.rand() * 3, this.rand() * 3);
          blob.castShadow = true;
          tree.add(blob);
        }
      } else {
        // Conífera — conos apilados, muy PS2
        const trunkH = 1.5 * s;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.26 * s, trunkH, 5), barkMat);
        trunk.position.y = trunkH / 2;
        trunk.castShadow = true;
        tree.add(trunk);
        const tiers = 3;
        for (let ti = 0; ti < tiers; ti++) {
          const cr = (1.45 - ti * 0.38) * s;
          const cone = new THREE.Mesh(new THREE.ConeGeometry(cr, 1.5 * s, 6), leafMat);
          cone.position.y = trunkH + (0.6 + ti * 0.85) * s;
          cone.rotation.y = this.rand() * 3;
          cone.castShadow = true;
          tree.add(cone);
        }
      }

      this.collisionBodies.push({ x, z, radius: 0.5 * s });
      this.scene.add(tree);
      placed++;
    }
  }

  private createFlora() {
    // Hierba cruzada — planos dobles con verde intenso
    const bladeMat = new THREE.MeshLambertMaterial({ color: 0x4a9a2f, side: THREE.DoubleSide });
    const bladeGeo = new THREE.PlaneGeometry(0.55, 0.4);
    for (let i = 0; i < 660; i++) {
      const x = this.rand() * 700 - 350;
      const z = this.rand() * 700 - 350;
      if (Math.abs(z - this.riverCenterZ(x)) < 18) continue;
      const tuft = new THREE.Group();
      const b1 = new THREE.Mesh(bladeGeo, bladeMat);
      const b2 = new THREE.Mesh(bladeGeo, bladeMat);
      b2.rotation.y = Math.PI / 2;
      tuft.add(b1);
      tuft.add(b2);
      tuft.position.set(x, this.getTerrainHeight(x, z) + 0.18, z);
      tuft.rotation.y = this.rand() * Math.PI;
      this.scene.add(tuft);
    }

    // Flores silvestres
    const petals = ['#ff88aa', '#ffee66', '#ffffff', '#ff9944', '#cc88ff'];
    for (let i = 0; i < 70; i++) {
      const x = this.rand() * 360 - 180;
      const z = this.rand() * 360 - 180;
      if (Math.abs(z - this.riverCenterZ(x)) < 18) continue;
      const y = this.getTerrainHeight(x, z);
      const f = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.016, 0.3, 4),
        new THREE.MeshLambertMaterial({ color: 0x2d6a18 })
      );
      stem.position.y = 0.15;
      f.add(stem);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 5, 4),
        new THREE.MeshLambertMaterial({ color: petals[Math.floor(this.rand() * petals.length)] })
      );
      head.position.y = 0.32;
      head.scale.set(1, 0.6, 1);
      f.add(head);
      f.position.set(x, y, z);
      this.scene.add(f);
    }

    // ── ARBUSTOS DE BAYAS ── recolectables, con los frutos sobre el follaje
    const bushLeafMat = new THREE.MeshLambertMaterial({ map: this.leafTex!, color: 0x7ab648, flatShading: true });
    const berryColors = [0x8e2f5e, 0xc0304a, 0x4b3fa8, 0xd2542c];
    for (let i = 0; i < 34; i++) {
      const x = this.rand() * 420 - 210;
      const z = this.rand() * 420 - 210;
      const d = Math.sqrt(x * x + z * z);
      if (d < 12) continue;
      if (Math.abs(z - this.riverCenterZ(x)) < 18) continue;
      const y = this.getTerrainHeight(x, z);

      const bush = new THREE.Group();
      bush.position.set(x, y, z);
      bush.userData.removedFruits = [];

      const bs = 0.8 + this.rand() * 0.5;
      // Mata de 3 lóbulos de follaje
      const lobes: Array<[number, number, number, number]> = [
        [0, 0.42 * bs, 0, 0.46 * bs],
        [0.30 * bs, 0.34 * bs, 0.16 * bs, 0.34 * bs],
        [-0.26 * bs, 0.32 * bs, -0.20 * bs, 0.32 * bs],
      ];
      for (const [lx, ly, lz, lr] of lobes) {
        const lobe = new THREE.Mesh(new THREE.IcosahedronGeometry(lr, 0), bushLeafMat);
        lobe.position.set(lx, ly, lz);
        lobe.rotation.set(this.rand() * 3, this.rand() * 3, this.rand() * 3);
        lobe.castShadow = true;
        bush.add(lobe);
      }

      // Bayas prendidas en la piel de los lóbulos
      const berryMat = new THREE.MeshLambertMaterial({
        color: berryColors[Math.floor(this.rand() * berryColors.length)],
        emissive: 0x1a0008,
        emissiveIntensity: 0.35,
      });
      for (const [lx, ly, lz, lr] of lobes) {
        const nB = 2 + Math.floor(this.rand() * 3);
        for (let b = 0; b < nB; b++) {
          const ang = this.rand() * Math.PI * 2;
          const el = -0.1 + this.rand() * 0.85; // repartidas por la mata
          const cosEl = Math.cos(el);
          const rr = lr * 0.82;
          const berry = new THREE.Mesh(new THREE.SphereGeometry(0.055 * bs, 5, 4), berryMat);
          berry.position.set(
            lx + Math.cos(ang) * cosEl * rr,
            ly + Math.sin(el) * rr,
            lz + Math.sin(ang) * cosEl * rr
          );
          berry.userData.isFruit = true;
          bush.add(berry);
        }
      }

      this.scene.add(bush);
      this.harvestables.push(bush);
    }

    // Rocas suaves — solo las grandes colisionan
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x8b8f96, flatShading: true });
    for (let i = 0; i < 26; i++) {
      const x = this.rand() * 640 - 320;
      const z = this.rand() * 640 - 320;
      if (Math.sqrt(x * x + z * z) < 14) continue;
      const rd = Math.abs(z - this.riverCenterZ(x));
      if (rd < 18) continue;
      const r = 0.4 + this.rand() * 0.75;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), rockMat);
      rock.position.set(x, this.getTerrainHeight(x, z) + r * 0.35, z);
      rock.scale.y = 0.75;
      rock.rotation.y = this.rand() * 3;
      rock.castShadow = true;
      this.scene.add(rock);
      if (r > 0.75) this.collisionBodies.push({ x, z, radius: r * 0.9 });
    }
  }

  private createDiscoverables() {
    // Flores luminosas del Edén — al acercarte las "descubres"
    const glowColors = [0xfff0b8, 0xffe28a, 0xfff7d6, 0xf9e79a];
    // Ninguna cae dentro del cauce (que discurre al norte, hacia z positiva)
    const spots: Array<[number, number]> = [
      [14, -18], [-22, 6], [8, 12], [-6, -34],
      [36, 12], [-38, -12], [52, -40], [-55, -30],
    ];
    spots.forEach(([x, z], i) => {
      const y = this.getTerrainHeight(x, z);
      const color = glowColors[i % glowColors.length];
      const g = new THREE.Group();

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.03, 0.55, 4),
        new THREE.MeshLambertMaterial({ color: 0x2d6a18 })
      );
      stem.position.y = 0.27;
      g.add(stem);

      const bloomMat = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      // Corola de pétalos — pequeñas esferas alrededor del centro
      const nPetals = 10 + Math.floor(this.rand() * 6);
      for (let pp = 0; pp < nPetals; pp++) {
        const pet = new THREE.Mesh(new THREE.SphereGeometry(0.045, 5, 4), bloomMat);
        const ang = (pp / nPetals) * Math.PI * 2;
        pet.position.set(Math.cos(ang) * 0.09, 0.55, Math.sin(ang) * 0.09);
        pet.scale.set(1, 0.5, 1);
        g.add(pet);
      }
      const heart = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), bloomMat);
      heart.position.y = 0.56;
      g.add(heart);

      const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, depthWrite: false });
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), haloMat);
      halo.position.y = 0.55;
      g.add(halo);

      g.position.set(x, y, z);
      this.scene.add(g);
      this.discoverables.push({ mesh: g, id: `star-flower-${i}`, discovered: false });
    });
  }

  private createButterflies(count: number) {
    const wingGeo = new THREE.PlaneGeometry(0.16, 0.12);
    const cols = [0xffd166, 0xff8fab, 0x9bf6ff, 0xcaffbf];
    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({
        color: cols[i % cols.length],
        side: THREE.DoubleSide,
      });
      const wingL = new THREE.Mesh(wingGeo, mat);
      wingL.position.x = -0.085;
      const wingR = new THREE.Mesh(wingGeo, mat);
      wingR.position.x = 0.085;
      group.add(wingL);
      group.add(wingR);
      const cx = (this.rand() * 2 - 1) * 26;
      const cz = (this.rand() * 2 - 1) * 26 - 4;
      const center = new THREE.Vector3(cx, 0, cz);
      const radius = 1.6 + this.rand() * 2.8;
      const speed = 0.5 + this.rand() * 0.7;
      const heightBase = 1.1 + this.rand() * 1.6;
      const phase = this.rand() * Math.PI * 2;
      this.scene.add(group);
      this.butterflies.push({ group, center, radius, speed, heightBase, wingL, wingR, phase });
    }
  }

  private updateButterflies(t: number) {
    for (const b of this.butterflies) {
      const a = t * b.speed + b.phase;
      const x = b.center.x + Math.cos(a) * b.radius;
      const z = b.center.z + Math.sin(a * 0.9) * b.radius;
      const y = this.getTerrainHeight(x, z) + b.heightBase + Math.sin(t * 2.4 + b.phase) * 0.35;
      b.group.position.set(x, y, z);
      // Orientación a lo largo del vuelo
      b.group.rotation.y = -a + Math.PI / 2;
      // Aleteo
      const flap = Math.sin(t * 14 + b.phase) * 0.9;
      b.wingL.rotation.y = flap;
      b.wingR.rotation.y = -flap;
    }
  }

  private createClouds(count: number) {
    // Sprites completos: siempre miran a cámara y no se cortan por perspectiva.
    const parent = this.skyGroup ?? this.scene;
    const ring = 360;

    for (let i = 0; i < count; i++) {
      const w = 90 + this.rand() * 100;
      const mat = new THREE.SpriteMaterial({
        map: this.cloudTex!,
        transparent: true,
        opacity: 0.78 + this.rand() * 0.16,
        depthWrite: false,
        // Con depthTest activo, el árbol y el terreno tapan la nube cuando
        // están delante. Antes (false) la nube se pintaba siempre encima.
        depthTest: true,
        fog: false,
      });
      const mesh = new THREE.Sprite(mat);
      mesh.scale.set(w, w * 0.48, 1);
      mesh.renderOrder = -8;
      const baseX = (this.rand() * 2 - 1) * ring;
      const baseZ = (this.rand() * 2 - 1) * ring;
      mesh.position.set(baseX, 115 + this.rand() * 125, baseZ);
      parent.add(mesh);
      this.clouds.push({
        mesh,
        baseX,
        baseZ,
        speed: 1.2 + this.rand() * 1.8,
        drift: 10 + this.rand() * 18,
        altitude: mesh.position.y,
        phase: this.rand() * Math.PI * 2,
      });
    }
  }

  private updateClouds(t: number) {
    const ring = 360;
    for (const c of this.clouds) {
      // Módulo estable: reaparece por el otro lado sin saltos acumulativos.
      const travel = c.baseX + t * c.speed;
      c.mesh.position.x = ((travel + ring) % (ring * 2) + ring * 2) % (ring * 2) - ring;
      c.mesh.position.z = c.baseZ + Math.sin(t * 0.05 + c.phase) * c.drift;
      c.mesh.position.y = c.altitude + Math.sin(t * 0.11 + c.phase) * 1.2;
    }
  }

  private updateRiver(t: number) {
    if (this.riverMesh) {
      const mat = this.riverMesh.material as THREE.MeshPhongMaterial;
      if (mat.map) {
        mat.map.offset.x = t * 0.045;
      }
    }
  }

  private updateSky() {
    // El domo sigue al jugador para que el horizonte esté siempre a la misma distancia
    if (this.skyGroup) {
      this.skyGroup.position.x = this.camera.position.x;
      this.skyGroup.position.z = this.camera.position.z;
    }
    // El sol es un billboard: siempre de cara a la cámara. Si no, al estar
    // suspendido justo sobre el manzano se veía de canto (invisible).
    if (this.sunSprite && this.sunSprite.visible) {
      this.sunSprite.quaternion.copy(this.camera.quaternion);
    }
  }

  // ═══ LILITH ═══
  private lathe(points: Array<[number, number]>, segments: number, mat: THREE.Material): THREE.Mesh {
    const pts = points.map(([x, y]) => new THREE.Vector2(Math.max(0.001, x), y));
    const geo = new THREE.LatheGeometry(pts, segments);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
  }

  private buildLilith() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xf2cdaa, flatShading: false });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xe4bc5e, flatShading: false });
    const SEG = 14;

    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    this.lilithBody = body;
    this.lilithBody.name = 'lilith-body';

    const hipY = 1.05;  // Piernas mucho más largas (antes 0.82)
    const footY = -0.98; // Altura del suelo desde la cadera

    // ── PIERNAS — cadera › rodilla › tobillo, articuladas de verdad ──
    const KNEE_Y = -0.50;                 // rodilla (antes -0.38)
    const SHIN_LEN = footY - KNEE_Y;      // tramo rodilla → pie (negativo)

    const mkLeg = (side: number) => {
      // Pivote de la CADERA
      const leg = new THREE.Group();
      // Separación estratégica para dejar la "V" central
      leg.position.set(0.088 * side, hipY, 0);

      // Muslo: esbelto y largo
      const thigh = this.lathe([
        [0.042, KNEE_Y],
        [0.052, -0.42],
        [0.065, -0.34],
        [0.078, -0.25],
        [0.088, -0.16],
        [0.092, -0.08],
        [0.095, -0.02],
        [0.086, 0.012],
      ], SEG, skinMat);
      thigh.scale.set(1, 1, 0.93);
      leg.add(thigh);

      // Cierre superior del muslo (cadera)
      const thighCap = new THREE.Mesh(new THREE.SphereGeometry(0.084, 10, 8), skinMat);
      thighCap.position.set(0, -0.020, 0);
      thighCap.scale.set(1.0, 0.85, 0.9);
      thighCap.castShadow = true;
      leg.add(thighCap);

      // Pivote de la RODILLA
      const knee = new THREE.Group();
      knee.position.y = KNEE_Y;
      leg.add(knee);

      // Rótula
      const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), skinMat);
      kneeCap.scale.set(1, 0.95, 1.02);
      kneeCap.position.z = 0.005;
      kneeCap.castShadow = true;
      knee.add(kneeCap);

      // Pantorrilla larga y fina
      const shin = this.lathe([
        [0.026, SHIN_LEN],
        [0.032, SHIN_LEN + 0.08],
        [0.045, SHIN_LEN + 0.18],
        [0.054, SHIN_LEN + 0.28],
        [0.052, SHIN_LEN + 0.35],
        [0.045, SHIN_LEN + 0.42],
        [0.040, 0],
      ], SEG, skinMat);
      shin.scale.set(1, 1, 0.94);
      knee.add(shin);

      // Gemelo esbelto
      const calf = new THREE.Mesh(new THREE.SphereGeometry(0.044, 10, 8), skinMat);
      calf.position.set(0, SHIN_LEN + 0.35, -0.018);
      calf.scale.set(0.90, 1.4, 0.85);
      calf.castShadow = true;
      knee.add(calf);

      // Pivote del TOBILLO
      const ankle = new THREE.Group();
      ankle.position.y = SHIN_LEN;
      knee.add(ankle);

      // Maléolos: los huesos del tobillo, a ambos lados
      const ankleCap = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), skinMat);
      ankleCap.scale.set(1, 0.95, 1);
      ankle.add(ankleCap);
      for (const ms of [-1, 1]) {
        const malleolus = new THREE.Mesh(new THREE.SphereGeometry(0.0125, 8, 6), skinMat);
        malleolus.position.set(0.017 * ms, -0.008, 0);
        malleolus.scale.set(0.8, 1, 0.9);
        ankle.add(malleolus);
      }

      // Empeine — se ensancha del tobillo hacia los metatarsos
      const foot = this.lathe([
        [0.020, -0.070],
        [0.031, -0.048],
        [0.038, -0.022],
        [0.034, 0.002],
      ], 10, skinMat);
      foot.position.set(0, 0, 0.026);
      foot.scale.set(1, 1, 2.3);
      ankle.add(foot);

      // Arco plantar: da forma al puente del pie
      const arch = new THREE.Mesh(new THREE.SphereGeometry(0.030, 10, 8), skinMat);
      arch.position.set(0, -0.040, 0.030);
      arch.scale.set(0.94, 0.55, 1.75);
      arch.castShadow = true;
      ankle.add(arch);

      // Talón redondeado
      const heel = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), skinMat);
      heel.position.set(0, -0.046, -0.016);
      heel.scale.set(0.90, 0.86, 1.02);
      heel.castShadow = true;
      ankle.add(heel);

      // ── ANTEPIÉ ARTICULADO ── pivota al despegar el pie del suelo
      const ball = new THREE.Group();
      ball.position.set(0, -0.050, 0.072);
      ankle.add(ball);
      if (side < 0) this.lilithToesL = ball; else this.lilithToesR = ball;

      // Almohadilla metatarsal
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.027, 10, 8), skinMat);
      pad.position.set(0, 0.002, 0.004);
      pad.scale.set(1.18, 0.60, 0.90);
      pad.castShadow = true;
      ball.add(pad);

      // Cinco dedos, decrecientes del gordo al meñique
      for (let d = 0; d < 5; d++) {
        const f = d / 4;
        const r = 0.0092 - f * 0.0028;
        const len = 0.026 - f * 0.008;
        const toe = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 5, 7), skinMat);
        // El gordo hacia dentro; el meñique, el más exterior
        const off = (d - 1.6) * 0.0138 * -side;
        toe.position.set(off, -0.003 - f * 0.002, 0.021 + (1 - f) * 0.004);
        toe.rotation.x = Math.PI / 2 - 0.12;
        ball.add(toe);
      }

      body.add(leg);
      if (side < 0) { this.lilithKneeL = knee; this.lilithAnkleL = ankle; }
      else { this.lilithKneeR = knee; this.lilithAnkleR = ankle; }
      return leg;
    };
    this.lilithLegL = mkLeg(-1);
    this.lilithLegR = mkLeg(1);

    // ── CINTURA ── pivote a la altura de la cadera
    const waist = new THREE.Group();
    waist.position.y = hipY;
    body.add(waist);

    const chest = new THREE.Group();
    waist.add(chest);
    this.lilithChest = chest;
    this.lilithChest.name = 'lilith-chest';

    // ── TORSO — Corto y Fino (Estilo PS2 Sexy) ──
    // Se reduce el radio y se comprimen las alturas verticales.
    const torso = this.lathe([
      [0.100, -0.120],  // base de la V
      [0.138, -0.080],  // apertura
      [0.145, -0.040],  // cadera alta
      [0.148, 0.010],   // cadera
      [0.140, 0.060],
      [0.122, 0.110],   // bajo vientre
      [0.105, 0.160],   // cintura (fina)
      [0.098, 0.200],   // ← talle
      [0.108, 0.240],
      [0.125, 0.290],   // caja torácica inferior
      [0.140, 0.340],   // pecho bajo
      [0.148, 0.390],   // pecho
      [0.144, 0.430],
      [0.120, 0.480],   // hombros
      [0.088, 0.520],
      [0.066, 0.555],   // base cuello, más ancha para fundirse con el cuello
    ], SEG, skinMat);
    torso.scale.set(1.02, 1, 0.72); // Más plano frontalmente
    chest.add(torso);

    // Caja torácica: más pequeña
    const ribcage = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), skinMat);
    ribcage.position.set(0, 0.330, 0.008);
    ribcage.scale.set(1.22, 1.0, 0.75);
    chest.add(ribcage);

    // Huesos de la cadera: integrados en el nuevo torso fino
    for (const hs of [-1, 1]) {
      const iliac = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), skinMat);
      iliac.position.set(0.088 * hs, 0.050, 0.030);
      iliac.scale.set(1.0, 0.85, 0.65);
      chest.add(iliac);
    }

    // ── PECHO ── reposicionado para el torso corto
    const bustGeo = new THREE.SphereGeometry(0.078, 14, 11);
    for (const bs of [-1, 1]) {
      const bust = new THREE.Mesh(bustGeo, skinMat);
      bust.position.set(0.058 * bs, 0.345, 0.072); // bajado
      bust.scale.set(1.0, 0.98, 0.94);
      bust.rotation.z = 0.14 * bs;
      bust.rotation.x = -0.12;
      bust.castShadow = true;
      chest.add(bust);

      const bustTop = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), skinMat);
      bustTop.position.set(0.054 * bs, 0.390, 0.048);
      bustTop.scale.set(1.06, 0.75, 0.85);
      chest.add(bustTop);

      const bustUnder = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), skinMat);
      bustUnder.position.set(0.058 * bs, 0.310, 0.052);
      bustUnder.scale.set(1.06, 0.60, 0.80);
      chest.add(bustUnder);
    }

    const sternum = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), skinMat);
    sternum.position.set(0, 0.355, 0.058);
    sternum.scale.set(0.70, 1.4, 0.52);
    chest.add(sternum);

    // ── GLÚTEOS ── redimensionados
    for (const gs of [-1, 1]) {
      const glute = new THREE.Mesh(new THREE.SphereGeometry(0.082, 14, 11), skinMat);
      glute.position.set(0.055 * gs, -0.025, -0.060);
      glute.scale.set(1.02, 1.02, 0.90);
      glute.castShadow = true;
      chest.add(glute);

      const fold = new THREE.Mesh(new THREE.SphereGeometry(0.054, 10, 8), skinMat);
      fold.position.set(0.056 * gs, -0.075, -0.040);
      fold.scale.set(1.05, 0.55, 0.82);
      chest.add(fold);
    }

    // ── PELVIS Y ENTREPIERNA (FORMA EN V) ──
    const crotchSeal = new THREE.Mesh(new THREE.SphereGeometry(0.060, 12, 8), skinMat);
    crotchSeal.position.set(0, -0.100, -0.015);
    crotchSeal.scale.set(1.15, 0.32, 0.68);
    chest.add(crotchSeal);

    for (const cs of [-1, 1]) {
      const hipJoin = new THREE.Mesh(new THREE.SphereGeometry(0.060, 12, 8), skinMat);
      hipJoin.position.set(0.086 * cs, -0.065, 0.005);
      hipJoin.scale.set(0.82, 0.92, 0.72);
      chest.add(hipJoin);
    }

    // ── SACRO / COXIS ──
    const sacrum = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), skinMat);
    sacrum.position.set(0, -0.010, -0.070);
    sacrum.scale.set(1.35, 0.75, 0.32);
    sacrum.castShadow = true;
    chest.add(sacrum);

    // (Eliminadas las esferas 'shoulder' y 'shoulderTop' externas que causaban bultos irreales.
    // El hombro ahora se define por el nacimiento del brazo en mkArm.)

    // ── CUELLO ── esbelto, encajado a ras con la abertura del torso ──
    const neck = this.lathe([
      [0.066, -0.006],  // base a ras: mismo radio que la abertura del torso
      [0.052, 0.020],
      [0.042, 0.055],
      [0.039, 0.090],   // garganta esbelta
      [0.040, 0.125],
      [0.043, 0.158],   // se ensancha hacia la mandíbula
    ], 20, skinMat);
    neck.position.set(0, 0.555, 0.006);
    neck.scale.set(1, 1, 0.86);
    chest.add(neck);

    // Trapecios — pendiente suave que une el cuello con el hombro
    for (const ts of [-1, 1]) {
      const trap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 9), skinMat);
      trap.position.set(0.055 * ts, 0.515, -0.014);
      trap.scale.set(1.45, 0.52, 0.85);
      trap.rotation.z = -0.22 * ts;
      chest.add(trap);
    }

    // ── CABEZA ── grupo propio para poder girarla y asentirla
    // Subida para dejar el cuello visible entre los hombros y la mandíbula.
    const headG = new THREE.Group();
    headG.position.set(0, 0.760, 0.006);
    chest.add(headG);
    this.lilithHead = headG;

    // Cráneo — óvalo alto
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 13), skinMat);
    head.scale.set(0.92, 1.14, 0.97);
    head.castShadow = true;
    headG.add(head);

    // Mandíbula integrada (suavizada para evitar bultos bajo el mentón)
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 9), skinMat);
    jaw.position.set(0, -0.035, 0.012);
    jaw.scale.set(0.88, 0.75, 0.92);
    headG.add(jaw);

    // Mentón más sutil
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 7), skinMat);
    chin.position.set(0, -0.082, 0.054);
    chin.scale.set(1.0, 0.75, 0.85);
    headG.add(chin);

    // ── ROSTRO ── dos ojitos negros, bien visibles bajo el flequillo
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0c0a08 });
    for (const es of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 9), eyeMat);
      eye.position.set(0.040 * es, -0.030, 0.098);
      eye.scale.set(1.1, 0.9, 0.55);
      eye.rotation.z = -0.14 * es;
      headG.add(eye);

      // Oreja
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.023, 8, 7), skinMat);
      ear.position.set(0.100 * es, -0.014, -0.002);
      ear.scale.set(0.42, 1.15, 0.78);
      headG.add(ear);
    }

    // ═══ MELENA RUBIA ═══
    const hair = new THREE.Group();
    hair.position.set(0, 0.001, -0.002);
    headG.add(hair);
    this.lilithHair = hair;
    this.lilithHair.name = 'lilith-hair';

    // ── 1. CUERO CABELLUDO ── casquete que cubre casi toda la cabeza
    const scalp = new THREE.Mesh(
      new THREE.SphereGeometry(0.124, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat,
    );
    scalp.position.set(0, 0.004, -0.006);
    scalp.scale.set(1.0, 1.12, 1.04);
    scalp.castShadow = true;
    hair.add(scalp);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.114, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.34),
      hairMat,
    );
    crown.position.set(0, 0.030, -0.022);
    crown.scale.set(1.03, 0.92, 1.03);
    crown.castShadow = true;
    hair.add(crown);

    for (const side of [-1, 1]) {
      const temple = new THREE.Mesh(new THREE.CapsuleGeometry(0.030, 0.105, 6, 10), hairMat);
      temple.position.set(0.108 * side, -0.052, -0.020);
      temple.rotation.z = 0.10 * side;
      temple.scale.set(0.86, 1, 0.72);
      temple.castShadow = true;
      hair.add(temple);

      const sideVolume = new THREE.Mesh(new THREE.SphereGeometry(0.050, 12, 9), hairMat);
      sideVolume.position.set(0.092 * side, -0.015, -0.055);
      sideVolume.scale.set(0.72, 1.18, 0.88);
      sideVolume.castShadow = true;
      hair.add(sideVolume);
    }

    const nape = new THREE.Mesh(new THREE.SphereGeometry(0.092, 14, 11), hairMat);
    nape.position.set(0, -0.075, -0.085);
    nape.scale.set(1.15, 1.1, 0.95);
    nape.castShadow = true;
    hair.add(nape);

    // ── MASA POSTERIOR ── une el cráneo con la melena que cae: sin huecos.
    // Una cascada continua de pelo que arranca en la nuca y llega a los hombros.
    const backMass = new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 14), hairMat);
    backMass.position.set(0, -0.16, -0.085);
    backMass.scale.set(0.95, 1.55, 0.85);
    backMass.castShadow = true;
    hair.add(backMass);

    const backTail = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), hairMat);
    backTail.position.set(0, -0.34, -0.055);
    backTail.scale.set(0.8, 1.2, 0.6);
    backTail.castShadow = true;
    hair.add(backTail);

    // ── FLEQUILLO ──
    const fringeMass = new THREE.Mesh(
      new THREE.SphereGeometry(0.116, 22, 14, Math.PI * 0.65, Math.PI * 0.70, 0, Math.PI * 0.45),
      hairMat,
    );
    fringeMass.position.set(0, 0.040, 0.006);
    fringeMass.scale.set(1.0, 0.88, 1.03);
    fringeMass.castShadow = true;
    hair.add(fringeMass);

    // ── 2. MECHONES CURVOS ──
    // Cada mechón es un tubo que arranca en el cuero cabelludo, sigue la nuca
    // y cae por la espalda separándose ligeramente hacia fuera.
    const makeLock = (
      startAng: number,   // posición alrededor de la cabeza
      length: number,     // largo de la caída
      thick: number,      // grosor
      sway: number,       // apertura lateral al caer
      mat: THREE.Material,
    ) => {
      const sx = Math.sin(startAng);
      const cz = Math.cos(startAng);
      // Radio de arranque sobre el cráneo
      const r0 = 0.108;
      const pts = [
        new THREE.Vector3(sx * r0 * 0.85, 0.045, cz * r0 * 0.85),
        new THREE.Vector3(sx * r0 * 1.02, -0.045, cz * r0 * 1.04),
        new THREE.Vector3(sx * r0 * 1.06 + sway * 0.25, -0.145, cz * r0 * 1.02 - 0.012),
        new THREE.Vector3(sx * r0 * 1.02 + sway * 0.6, -0.145 - length * 0.42, cz * r0 * 0.92 - 0.026),
        new THREE.Vector3(sx * r0 * 0.94 + sway * 0.9, -0.145 - length * 0.78, cz * r0 * 0.80 - 0.030),
        new THREE.Vector3(sx * r0 * 0.86 + sway, -0.145 - length, cz * r0 * 0.72 - 0.024),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      // Se afina hacia la punta
      const geo = new THREE.TubeGeometry(curve, 14, thick, 7, false);
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const segs = 14 + 1;
      const ring = 7 + 1;
      for (let s = 0; s < segs; s++) {
        const taper = 1 - Math.pow(s / (segs - 1), 1.7) * 0.72;
        const c = curve.getPoint(s / (segs - 1));
        for (let rr = 0; rr < ring; rr++) {
          const idx = s * ring + rr;
          const px = posAttr.getX(idx);
          const py = posAttr.getY(idx);
          const pz = posAttr.getZ(idx);
          posAttr.setXYZ(
            idx,
            c.x + (px - c.x) * taper,
            c.y + (py - c.y) * taper,
            c.z + (pz - c.z) * taper,
          );
        }
      }
      posAttr.needsUpdate = true;
      geo.computeVertexNormals();
      const lock = new THREE.Mesh(geo, mat);
      lock.castShadow = true;
      hair.add(lock);
      return lock;
    };

    // Capa interior — mismo rubio que el resto de la melena
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const ang = Math.PI + (t - 0.5) * 1.5; // arco trasero
      makeLock(ang, 0.40 + Math.sin(t * Math.PI) * 0.10, 0.040, (t - 0.5) * 0.10, hairMat);
    }

    // Capa media — el grueso de la melena
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const ang = Math.PI + (t - 0.5) * 2.45;
      const len = 0.42 + Math.sin(t * Math.PI) * 0.16;
      makeLock(ang, len, 0.046, (t - 0.5) * 0.16, hairMat);
    }

    // Capa exterior — mechones que enmarcan y caen sobre los hombros
    // Generador determinista para que Lilith no varíe entre recargas
    this.seed = 42; 

    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const side = t < 0.5 ? -1 : 1;
      // Se reparten a los lados, nunca sobre el rostro
      const ang = side * (1.95 + (Math.abs(t - 0.5) * 2) * 0.55);
      const len = 0.46 + this.rand() * 0.06;
      makeLock(ang, len, 0.040, side * 0.14, hairMat);
    }

    // ── 3. HEBRAS FINAS ──
    // Mismo color; el propio material y la iluminación crean los reflejos.
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const ang = Math.PI + (t - 0.5) * 1.9;
      makeLock(ang, 0.38 + t * 0.08, 0.013, (t - 0.5) * 0.12, hairMat);
    }

    // ── BRAZOS ── esbeltos y reposicionados en los hombros
    const ELBOW_Y = -0.26;
    const mkArm = (side: number) => {
      // Pivote del HOMBRO
      const arm = new THREE.Group();
      // Reposicionado de 0.598 a 0.485 (torso corto)
      arm.position.set(0.125 * side, 0.485, -0.015);
      arm.rotation.z = 0.08 * side; // caída elegante

      // Brazo: hombro → codo (más fino)
      const upper = this.lathe([
        [0.024, ELBOW_Y],
        [0.028, -0.21],
        [0.032, -0.13],  // bíceps esbelto
        [0.038, -0.05],
        [0.042, 0.010],  // articulación hombro
      ], 10, skinMat);
      upper.scale.set(1, 1, 0.92);
      arm.add(upper);

      // Cierre articulación
      const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), skinMat);
      shoulderCap.position.set(0, 0.008, 0);
      shoulderCap.scale.set(1.0, 0.85, 0.92);
      arm.add(shoulderCap);

      // Deltoides: suaviza la unión brazo-torso sin bultos externos
      const delt = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 8), skinMat);
      delt.position.set(0, -0.020, 0);
      delt.scale.set(1, 1.15, 0.95);
      delt.castShadow = true;
      arm.add(delt);

      // Pivote del CODO
      const elbow = new THREE.Group();
      elbow.position.y = ELBOW_Y;
      arm.add(elbow);

      const elbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), skinMat);
      elbowCap.scale.set(1, 0.95, 1);
      elbow.add(elbowCap);

      // Antebrazo: codo → muñeca
      const fore = this.lathe([
        [0.018, -0.26],  // muñeca
        [0.022, -0.21],
        [0.028, -0.13],
        [0.030, -0.05],
        [0.029, 0],
      ], 10, skinMat);
      fore.scale.set(1, 1, 0.94);
      elbow.add(fore);

      // Pivote de la MUÑECA
      const wrist = new THREE.Group();
      wrist.position.y = -0.26;
      elbow.add(wrist);

      const wristCap = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), skinMat);
      wristCap.position.y = 0.005;
      wristCap.scale.set(1, 0.9, 0.9);
      wrist.add(wristCap);

      // Palma: más estrecha en la muñeca y ancha en los nudillos
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.023, 12, 9), skinMat);
      palm.position.y = -0.030;
      palm.scale.set(1.06, 1.42, 0.50);
      palm.castShadow = true;
      wrist.add(palm);

      // Monte del pulgar
      const thenar = new THREE.Mesh(new THREE.SphereGeometry(0.0135, 8, 7), skinMat);
      thenar.position.set(0.014 * -side, -0.030, 0.004);
      thenar.scale.set(0.9, 1.25, 0.75);
      wrist.add(thenar);

      // ── DEDOS ── tres falanges por dedo, nudillos y uña ──
      // Longitudes y radios decrecientes; el corazón es el más largo,
      // el meñique el más corto y fino. La mano queda relajada y natural.
      const nailMat = new THREE.MeshLambertMaterial({ color: 0xf6e4d7, flatShading: false });
      const FINGERS = [
        { l1: 0.021, l2: 0.014, l3: 0.010, r1: 0.0060, r2: 0.0050, r3: 0.0040 }, // índice
        { l1: 0.024, l2: 0.016, l3: 0.011, r1: 0.0062, r2: 0.0052, r3: 0.0042 }, // corazón
        { l1: 0.022, l2: 0.014, l3: 0.010, r1: 0.0058, r2: 0.0048, r3: 0.0039 }, // anular
        { l1: 0.017, l2: 0.011, l3: 0.008, r1: 0.0050, r2: 0.0042, r3: 0.0035 }, // meñique
      ];
      FINGERS.forEach((fg, f) => {
        // Los dedos nacen en un arco, no en línea recta
        const spread = (f - 1.5) * 0.0135;
        const baseY = -0.055 - Math.cos((f - 1.5) * 0.55) * 0.005;
        const zFwd = 0.004;

        // Nudillo base (MCP)
        const mcp = new THREE.Mesh(new THREE.SphereGeometry(fg.r1 * 1.3, 8, 6), skinMat);
        mcp.position.set(spread, baseY, zFwd);
        mcp.scale.set(1, 0.85, 0.95);
        wrist.add(mcp);

        const segs = [
          { len: fg.l1, r: fg.r1, rx: 0.10 },
          { len: fg.l2, r: fg.r2, rx: 0.22 },
          { len: fg.l3, r: fg.r3, rx: 0.36 },
        ];
        let jy = baseY;
        let jz = zFwd;
        for (let s = 0; s < segs.length; s++) {
          const seg = segs[s];
          const bone = new THREE.Mesh(new THREE.CapsuleGeometry(seg.r, seg.len, 5, 8), skinMat);
          bone.position.set(spread, jy - seg.len * 0.5, jz + 0.0012);
          bone.rotation.x = seg.rx;
          bone.rotation.z = -spread * 1.5;
          wrist.add(bone);

          // Extremo distal de esta falange (siguiente articulación)
          jy -= seg.len;
          jz += 0.0012;

          // Nudillos intermedios (PIP y DIP)
          if (s < segs.length - 1) {
            const joint = new THREE.Mesh(new THREE.SphereGeometry(seg.r * 1.05, 8, 6), skinMat);
            joint.position.set(spread, jy, jz);
            joint.scale.set(1, 0.9, 0.95);
            wrist.add(joint);
          }
        }

        // Uña en la punta
        const nail = new THREE.Mesh(new THREE.SphereGeometry(fg.r3 * 0.85, 6, 5), nailMat);
        nail.position.set(spread, jy - fg.r3 * 0.2, jz + fg.r3 * 0.6);
        nail.scale.set(0.85, 1.15, 0.35);
        nail.rotation.x = -0.5;
        wrist.add(nail);
      });

      // ── PULGAR ── tres segmentos, opuesto al resto de la mano ──
      // Trapecio (base del pulgar)
      const trap = new THREE.Mesh(new THREE.SphereGeometry(0.0080, 8, 6), skinMat);
      trap.position.set(0.021 * -side, -0.038, 0.008);
      trap.scale.set(1.1, 0.9, 0.95);
      wrist.add(trap);

      // Metacarpo
      const tmc = new THREE.Mesh(new THREE.CapsuleGeometry(0.0072, 0.015, 5, 7), skinMat);
      tmc.position.set(0.026 * -side, -0.049, 0.011);
      tmc.rotation.z = 0.85 * side;
      tmc.rotation.x = -0.18;
      wrist.add(tmc);

      // Falange proximal
      const tpr = new THREE.Mesh(new THREE.CapsuleGeometry(0.0064, 0.013, 5, 7), skinMat);
      tpr.position.set(0.033 * -side, -0.061, 0.017);
      tpr.rotation.z = 0.70 * side;
      tpr.rotation.x = -0.32;
      wrist.add(tpr);

      // Falange distal
      const tdi = new THREE.Mesh(new THREE.CapsuleGeometry(0.0056, 0.010, 5, 7), skinMat);
      tdi.position.set(0.038 * -side, -0.071, 0.023);
      tdi.rotation.z = 0.55 * side;
      tdi.rotation.x = -0.5;
      wrist.add(tdi);

      // Uña del pulgar
      const tnail = new THREE.Mesh(new THREE.SphereGeometry(0.0046, 6, 5), nailMat);
      tnail.position.set(0.040 * -side, -0.074, 0.027);
      tnail.scale.set(0.8, 1.1, 0.35);
      wrist.add(tnail);

      chest.add(arm);
      if (side < 0) this.lilithElbowL = elbow;
      else this.lilithElbowR = elbow;
      return arm;
    };
    this.lilithArmL = mkArm(-1);
    this.lilithArmR = mkArm(1);

    const startX = 4;
    const startZ = -12;
    root.position.set(startX, this.getTerrainHeight(startX, startZ), startZ);
    this.lilithTarget.copy(root.position);
    this.lilithPrevPos.copy(root.position);
    this.lilithState = 'idle';
    this.lilithTimer = 3;
    this.lilithGroup = root;
    this.scene.add(root);
  }

  private updateLilith(delta: number) {
    if (!this.lilithGroup) return;
    this.lilithTimer -= delta;
    const pos = this.lilithGroup.position;

    if (this.lilithBlockCooldown > 0) this.lilithBlockCooldown -= delta;

    if (this.lilithState === 'blocking') {
      this.lilithBlockElapsed += delta;
      const e = this.lilithBlockElapsed;

      // ── FASES DEL GESTO ──
      // 0.00-0.18 · se planta y alza las manos
      // 0.18-0.34 · empuja hacia delante (lunge)
      // 0.34-0.80 · sostiene las palmas, firme
      // 0.80-1.20 · relaja antes de retirarse
      let shoveTarget: number;
      if (e < 0.18) shoveTarget = e / 0.18 * 0.75;
      else if (e < 0.34) shoveTarget = 0.75 + ((e - 0.18) / 0.16) * 0.25; // pico del empujón
      else if (e < 0.80) shoveTarget = 1 - ((e - 0.34) / 0.46) * 0.28;
      else shoveTarget = Math.max(0, 0.72 - ((e - 0.80) / 0.40) * 0.72);

      this.lilithShove += (shoveTarget - this.lilithShove) * Math.min(1, delta * 16);
      this.lilithArmRaise += (1 - this.lilithArmRaise) * Math.min(1, delta * 18);

      // Encara al jugador con un giro rápido pero suave
      const dxB = this.playerPosition.x - pos.x;
      const dzB = this.playerPosition.z - pos.z;
      const targetFace = Math.atan2(dxB, dzB);
      let dFace = targetFace - this.lilithGroup.rotation.y;
      while (dFace > Math.PI) dFace -= Math.PI * 2;
      while (dFace < -Math.PI) dFace += Math.PI * 2;
      this.lilithGroup.rotation.y += dFace * Math.min(1, delta * 14);

      // Postura de apoyo: una pierna adelante, otra atrás, y el peso al frente
      const sh = this.lilithShove;
      this.lilithLegL!.rotation.x += (-0.26 * sh - this.lilithLegL!.rotation.x) * Math.min(1, delta * 14);
      this.lilithLegR!.rotation.x += (0.20 * sh - this.lilithLegR!.rotation.x) * Math.min(1, delta * 14);

      // Lunge: el cuerpo se inclina y avanza un palmo hacia Adán
      if (this.lilithBody) {
        this.lilithBody.position.z += (0.075 * sh - this.lilithBody.position.z) * Math.min(1, delta * 14);
      }
      if (this.lilithChest) {
        this.lilithChest.rotation.x += (0.17 * sh - this.lilithChest.rotation.x) * Math.min(1, delta * 14);
      }

      if (this.lilithTimer <= 0) {
        // Terminó de apartar: retrocede un paso
        this.lilithState = 'backing';
        this.lilithTimer = 0.9;
        this.lilithBlockCooldown = 1.4;
      }
    } else if (this.lilithState === 'backing') {
      // Deshace la postura del empujón
      this.lilithShove += (0 - this.lilithShove) * Math.min(1, delta * 8);
      if (this.lilithBody) {
        this.lilithBody.position.z += (0 - this.lilithBody.position.z) * Math.min(1, delta * 8);
      }
      if (this.lilithChest) {
        this.lilithChest.rotation.x += (0 - this.lilithChest.rotation.x) * Math.min(1, delta * 8);
      }
      // Retrocede despacio alejándose de Adán, bajando los brazos
      this.lilithArmRaise += (0 - this.lilithArmRaise) * Math.min(1, delta * 9);
      const step = 0.8 * delta;
      const r = this.resolveLilithXZ(pos.x + this.lilithBackDir.x * step, pos.z + this.lilithBackDir.z * step);
      pos.x = r.x;
      pos.z = r.z;
      if (this.lilithTimer <= 0) {
        this.lilithState = 'idle';
        this.lilithTimer = 2 + Math.random() * 2.5;
      }
    } else if (this.lilithState === 'stepping') {
      this.lilithArmRaise += (0 - this.lilithArmRaise) * Math.min(1, delta * 6);
      if (this.lilithTimer <= 0) {
        this.lilithState = 'idle';
        this.lilithTimer = 1.5 + Math.random() * 2;
      }
    } else if (this.lilithState === 'walking') {
      const dx = this.lilithTarget.x - pos.x;
      const dz = this.lilithTarget.z - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < 0.4 || this.lilithTimer <= 0) {
        this.lilithState = 'idle';
        this.lilithTimer = 2.5 + Math.random() * 4;
      } else {
        const step = this.lilithSpeed * delta;
        const r = this.resolveLilithXZ(pos.x + (dx / dist) * step, pos.z + (dz / dist) * step);
        pos.x = r.x;
        pos.z = r.z;
        // Giro suave hacia el objetivo
        const targetRot = Math.atan2(dx, dz);
        let diff = targetRot - this.lilithGroup.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.lilithGroup.rotation.y += diff * Math.min(1, delta * 5);
      }
    } else {
      // idle — decide el próximo paseo
      this.lilithArmRaise += (0 - this.lilithArmRaise) * Math.min(1, delta * 6);
      if (this.lilithTimer <= 0) {
        const ang = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 16;
        this.lilithTarget.set(
          Math.max(-60, Math.min(60, pos.x + Math.cos(ang) * r)),
          0,
          Math.max(-60, Math.min(60, pos.z + Math.sin(ang) * r))
        );
        this.lilithState = 'walking';
        this.lilithTimer = 10;
      }
    }

    // ── TE BUSCA CON LA MIRADA AL RESPONDER ──
    // Se impone al giro del paseo, así que aunque estuviera parada se vuelve
    // hacia ti mientras habla.
    if (this.lilithLookTimer > 0 && this.lilithState !== 'blocking') {
      this.lilithLookTimer -= delta;
      const dxL = this.playerPosition.x - pos.x;
      const dzL = this.playerPosition.z - pos.z;
      if (dxL * dxL + dzL * dzL > 0.0004) {
        const targetLook = Math.atan2(dxL, dzL);
        let dLook = targetLook - this.lilithGroup.rotation.y;
        while (dLook > Math.PI) dLook -= Math.PI * 2;
        while (dLook < -Math.PI) dLook += Math.PI * 2;
        this.lilithGroup.rotation.y += dLook * Math.min(1, delta * 9);
      }
    }

    // Relajar la postura del empujón cuando ya no está apartando
    if (this.lilithState !== 'blocking' && this.lilithState !== 'backing') {
      this.lilithShove += (0 - this.lilithShove) * Math.min(1, delta * 6);
      if (this.lilithBody) {
        this.lilithBody.position.z += (0 - this.lilithBody.position.z) * Math.min(1, delta * 6);
      }
      if (this.lilithChest) {
        this.lilithChest.rotation.x += (0 - this.lilithChest.rotation.x) * Math.min(1, delta * 6);
      }
    }

    // Seguir el terreno
    const groundY = this.getTerrainHeight(pos.x, pos.z);
    pos.y += (groundY - pos.y) * Math.min(1, delta * 14);

    // ═══ ANIMACIÓN PROCEDURAL ═══
    // Nota de convención: en estos pivotes, rotation.x NEGATIVO lleva el
    // miembro hacia DELANTE (+Z) y positivo hacia atrás.

    // 1. Velocidad real en el plano: el ciclo avanza con el desplazamiento,
    //    así los pies no patinan y al pararse la marcha se detiene sola.
    const movedX = pos.x - this.lilithPrevPos.x;
    const movedZ = pos.z - this.lilithPrevPos.z;
    const moved = Math.sqrt(movedX * movedX + movedZ * movedZ);
    this.lilithPrevPos.set(pos.x, pos.y, pos.z);
    const speed = delta > 0 ? moved / delta : 0;

    // Zancada: ~1.05 unidades por paso completo
    this.lilithWalkPhase += moved * (Math.PI * 2) / 1.05;
    if (this.lilithWalkPhase > Math.PI * 4) this.lilithWalkPhase -= Math.PI * 4;

    const wantBlend = speed > 0.12 ? 1 : 0;
    this.lilithWalkBlend += (wantBlend - this.lilithWalkBlend) * Math.min(1, delta * 7);
    const W = this.lilithWalkBlend;

    const ph = this.lilithWalkPhase;
    const sw = Math.sin(ph);
    const raise = this.lilithArmRaise;
    const shove = this.lilithShove;
    const baseZ = 0.09;
    const k = Math.min(1, delta * 12);

    // 2. PIERNAS — cadera, rodilla y tobillo coordinados
    if (this.lilithState !== 'blocking') {
      const hipAmp = 0.52;
      // Izquierda adelante cuando sin(ph) > 0; derecha en contrafase
      const hipL = -hipAmp * sw * W;
      const hipR = hipAmp * sw * W;
      this.lilithLegL!.rotation.x += (hipL - this.lilithLegL!.rotation.x) * k;
      this.lilithLegR!.rotation.x += (hipR - this.lilithLegR!.rotation.x) * k;

      // La rodilla se dobla sobre todo al recoger la pierna (fase de vuelo)
      const flexL = Math.max(0, Math.sin(ph + 1.9));
      const flexR = Math.max(0, Math.sin(ph + 1.9 + Math.PI));
      const kneeL = (0.10 + 0.95 * flexL * flexL) * W;
      const kneeR = (0.10 + 0.95 * flexR * flexR) * W;
      if (this.lilithKneeL) this.lilithKneeL.rotation.x += (kneeL - this.lilithKneeL.rotation.x) * k;
      if (this.lilithKneeR) this.lilithKneeR.rotation.x += (kneeR - this.lilithKneeR.rotation.x) * k;

      // El tobillo compensa para que el pie no quede de puntillas
      if (this.lilithAnkleL) {
        const aL = (-hipL - kneeL) * 0.55;
        this.lilithAnkleL.rotation.x += (aL - this.lilithAnkleL.rotation.x) * k;
      }
      if (this.lilithAnkleR) {
        const aR = (-hipR - kneeR) * 0.55;
        this.lilithAnkleR.rotation.x += (aR - this.lilithAnkleR.rotation.x) * k;
      }

      // Los dedos se doblan al despegar el pie y se estiran al posarlo
      const pushL = Math.max(0, Math.sin(ph - 0.5));
      const pushR = Math.max(0, Math.sin(ph - 0.5 + Math.PI));
      if (this.lilithToesL) {
        const tL = -0.62 * pushL * pushL * W;
        this.lilithToesL.rotation.x += (tL - this.lilithToesL.rotation.x) * k;
      }
      if (this.lilithToesR) {
        const tR = -0.62 * pushR * pushR * W;
        this.lilithToesR.rotation.x += (tR - this.lilithToesR.rotation.x) * k;
      }
    }

    // 3. BALANCEO DEL CUERPO — sube y baja y se mece con cada paso
    if (this.lilithBody) {
      const bob = Math.abs(Math.cos(ph)) * 0.028 * W;
      this.lilithBody.position.y += (bob - this.lilithBody.position.y) * k;
      // Balanceo de cadera más marcado: andar más femenino
      const roll = -Math.sin(ph) * 0.075 * W;
      this.lilithBody.rotation.z += (roll - this.lilithBody.rotation.z) * k;
      // Las caderas también giran con cada zancada
      const hipSway = sw * 0.10 * W;
      this.lilithBody.rotation.y += (hipSway - this.lilithBody.rotation.y) * k;
    }
    if (this.lilithChest && this.lilithState !== 'blocking') {
      // El torso rota en contra de las caderas, como al andar de verdad
      const twist = -sw * 0.15 * W;
      this.lilithChest.rotation.y += (twist - this.lilithChest.rotation.y) * k;
      // Respiración cuando está quieta
      const breath = Math.sin(this.elapsedTotal * 1.7) * 0.006 * (1 - W);
      this.lilithChest.position.y += (breath - this.lilithChest.position.y) * Math.min(1, delta * 4);
      // Contrapposto: en reposo carga el peso en una cadera y arquea el talle
      const poise = Math.sin(this.elapsedTotal * 0.42) * 0.05 * (1 - W);
      this.lilithChest.rotation.z += (poise - this.lilithChest.rotation.z) * Math.min(1, delta * 3);
    }

    // 4. CABEZA — contrarresta el giro del torso y mira al jugador de cerca
    if (this.lilithHead) {
      let hy = sw * 0.09 * W;
      let hx = Math.sin(ph * 2) * 0.02 * W;
      const dxH = this.playerPosition.x - pos.x;
      const dzH = this.playerPosition.z - pos.z;
      const distH = Math.sqrt(dxH * dxH + dzH * dzH);
      if (distH < 9) {
        // Ángulo hacia el jugador relativo al cuerpo, limitado al cuello
        let rel = Math.atan2(dxH, dzH) - this.lilithGroup.rotation.y;
        while (rel > Math.PI) rel -= Math.PI * 2;
        while (rel < -Math.PI) rel += Math.PI * 2;
        const attention = (1 - distH / 9) * (this.lilithLookTimer > 0 ? 1 : 0.55);
        hy += Math.max(-0.7, Math.min(0.7, rel)) * attention;
        hx += -0.05 * attention;
      }
      this.lilithHead.rotation.y += (hy - this.lilithHead.rotation.y) * Math.min(1, delta * 6);
      this.lilithHead.rotation.x += (hx - this.lilithHead.rotation.x) * Math.min(1, delta * 6);
    }

    // 5. BRAZOS
    if (raise > 0.01) {
      // Gesto de apartar: palmas al frente
      const tremble = Math.sin(this.elapsedTotal * 14) * 0.03 * raise;
      const reach = -1.45 * raise - 0.34 * shove;
      this.lilithArmL!.rotation.x = reach + tremble;
      this.lilithArmR!.rotation.x = reach - tremble;
      // Abrir codos hacia fuera para que no crucen manos frente al pecho
      this.lilithArmL!.rotation.z = -baseZ - 0.24 * raise - 0.10 * shove;
      this.lilithArmR!.rotation.z = baseZ + 0.24 * raise + 0.10 * shove;
      this.lilithArmL!.rotation.y = 0.22 * raise;
      this.lilithArmR!.rotation.y = -0.22 * raise;
      // Codos flexionados: las manos quedan por delante del pecho
      const eb = -(0.55 + 0.35 * shove) * raise;
      if (this.lilithElbowL) this.lilithElbowL.rotation.x += (eb - this.lilithElbowL.rotation.x) * k;
      if (this.lilithElbowR) this.lilithElbowR.rotation.x += (eb - this.lilithElbowR.rotation.x) * k;
    } else {
      // ── BALANCEO AL CAMINAR ── opuesto a la pierna del mismo lado
      const armAmp = 0.42;
      const swayIdle = Math.sin(this.elapsedTotal * 1.5) * 0.02 * (1 - W);
      const armL = armAmp * sw * W + swayIdle;
      const armR = -armAmp * sw * W + swayIdle;
      this.lilithArmL!.rotation.x += (armL - this.lilithArmL!.rotation.x) * k;
      this.lilithArmR!.rotation.x += (armR - this.lilithArmR!.rotation.x) * k;

      // Se separan un poco del cuerpo al andar
      const outL = -baseZ - 0.07 * W;
      const outR = baseZ + 0.07 * W;
      this.lilithArmL!.rotation.z += (outL - this.lilithArmL!.rotation.z) * k;
      this.lilithArmR!.rotation.z += (outR - this.lilithArmR!.rotation.z) * k;
      this.lilithArmL!.rotation.y += (0 - this.lilithArmL!.rotation.y) * k;
      this.lilithArmR!.rotation.y += (0 - this.lilithArmR!.rotation.y) * k;

      // El codo se flexiona más cuando el brazo va hacia delante
      const fwdL = Math.max(0, -sw);
      const fwdR = Math.max(0, sw);
      const elbowL = -(0.12 + 0.50 * fwdL) * W - 0.06 * (1 - W);
      const elbowR = -(0.12 + 0.50 * fwdR) * W - 0.06 * (1 - W);
      if (this.lilithElbowL) this.lilithElbowL.rotation.x += (elbowL - this.lilithElbowL.rotation.x) * k;
      if (this.lilithElbowR) this.lilithElbowR.rotation.x += (elbowR - this.lilithElbowR.rotation.x) * k;
    }
  }

  // ═══ COLISIONES XZ ═══
  private resolveCollisionXZ(x: number, z: number) {
    for (const b of this.collisionBodies) {
      const dx = x - b.x;
      const dz = z - b.z;
      const r = b.radius + this.playerRadius;
      const dSq = dx * dx + dz * dz;
      if (dSq < r * r && dSq > 0.0001) {
        const d = Math.sqrt(dSq);
        x = b.x + (dx / d) * r;
        z = b.z + (dz / d) * r;
      }
    }
    // Lilith es un cuerpo sólido: Adán no puede atravesarla
    if (this.lilithGroup) {
      const lx = this.lilithGroup.position.x;
      const lz = this.lilithGroup.position.z;
      const dx = x - lx;
      const dz = z - lz;
      const r = this.lilithRadius + this.playerRadius;
      const dSq = dx * dx + dz * dz;
      if (dSq < r * r && dSq > 0.0001) {
        const d = Math.sqrt(dSq);
        x = lx + (dx / d) * r;
        z = lz + (dz / d) * r;
      }
    }
    return { x, z };
  }

  // Lilith tampoco atraviesa árboles ni rocas
  private resolveLilithXZ(x: number, z: number) {
    for (const b of this.collisionBodies) {
      const dx = x - b.x;
      const dz = z - b.z;
      const r = b.radius + this.lilithRadius;
      const dSq = dx * dx + dz * dz;
      if (dSq < r * r && dSq > 0.0001) {
        const d = Math.sqrt(dSq);
        x = b.x + (dx / d) * r;
        z = b.z + (dz / d) * r;
      }
    }
    // Límites del mundo
    x = Math.max(-230, Math.min(230, x));
    z = Math.max(-230, Math.min(230, z));
    return { x, z };
  }

  // ═══════════════════════════════════════════════════════════════
  // INPUT — teclado, mouse con pointer lock y joystick táctil
  // ═══════════════════════════════════════════════════════════════

  private mouseDown = false;

  // Referencias estables para poder retirar todos los listeners en dispose().
  // Esto es especialmente importante en React StrictMode, que monta y desmonta
  // el motor dos veces durante el desarrollo.
  private readonly handleKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    this.keys[k] = true;
    if (k === ' ' || k.startsWith('arrow')) e.preventDefault();
  };

  private readonly handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private readonly handleMouseDown = () => {
    this.mouseDown = true;
    if (this.state === 'playing' && !('ontouchstart' in window)) {
      if (document.pointerLockElement !== this.canvas) {
        this.canvas.requestPointerLock?.();
      }
    }
  };

  private readonly handleMouseUp = () => {
    this.mouseDown = false;
  };

  private readonly handleMouseMove = (e: MouseEvent) => {
    if (this.state !== 'playing') return;
    const locked = document.pointerLockElement === this.canvas;
    if (locked || this.mouseDown) {
      this.mouseMovement.x += e.movementX;
      this.mouseMovement.y += e.movementY;
    }
  };

  private readonly handleTouchStart = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < window.innerWidth / 2 && this.moveTouchId === null) {
        this.moveTouchId = t.identifier;
        this.touchStart = { x: t.clientX, y: t.clientY };
        this.joystickActive = true;
      } else if (this.lookTouchId === null) {
        this.lookTouchId = t.identifier;
        this.lastTouchX = t.clientX;
        this.lastTouchY = t.clientY;
      }
    }
  };

  private readonly handleTouchMove = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === this.moveTouchId && this.touchStart) {
        this.joystickDelta = {
          x: Math.max(-1, Math.min(1, (t.clientX - this.touchStart.x) / 42)),
          y: Math.max(-1, Math.min(1, (t.clientY - this.touchStart.y) / 42)),
        };
      } else if (t.identifier === this.lookTouchId) {
        if (this.state === 'playing') {
          this.playerRotation -= (t.clientX - this.lastTouchX) * 0.0052;
          this.verticalRotation -= (t.clientY - this.lastTouchY) * 0.0052;
          this.verticalRotation = Math.max(-1.3, Math.min(1.3, this.verticalRotation));
        }
        this.lastTouchX = t.clientX;
        this.lastTouchY = t.clientY;
      }
    }
    e.preventDefault();
  };

  private readonly handleTouchEnd = (e: TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === this.moveTouchId) {
        this.moveTouchId = null;
        this.joystickActive = false;
        this.joystickDelta = { x: 0, y: 0 };
        this.touchStart = null;
      }
      if (t.identifier === this.lookTouchId) {
        this.lookTouchId = null;
      }
    }
  };

  private readonly handleResize = () => this.resize();

  private setupEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd);
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
    window.addEventListener('resize', this.handleResize);
  }

  private removeEventListeners() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    window.removeEventListener('resize', this.handleResize);
  }

  private resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  // ═══════════════════════════════════════════════════════════════
  // LOOP PRINCIPAL
  // ═══════════════════════════════════════════════════════════════

  private animate() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      const delta = Math.min(this.clock.getDelta(), 0.05);
      if (!this.paused) {
        this.elapsedTotal += delta;
        if (this.state === 'cinematic') {
          this.updateCinematic(delta);
        } else if (this.state === 'playing') {
          if (this.forbiddenCinematicActive) this.updateForbiddenCinematic(delta);
          else this.updateGame(delta);
        }
        this.animateApples(this.elapsedTotal);
        this.updateButterflies(this.elapsedTotal);
        this.updateRiver(this.elapsedTotal);
        this.updateClouds(this.elapsedTotal);
        this.updateLilith(delta);
        this.updateSky();
      }
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  // ═══ CINEMÁTICA DEL ÁRBOL PROHIBIDO — la luz desciende ═══
  private updateForbiddenCinematic(delta: number) {
    this.forbiddenCinematicTime += delta;
    const t = this.forbiddenCinematicTime;
    // Debe coincidir con DURATION en ForbiddenTreeCinematic.tsx
    const dur = 28;
    const p = Math.min(t / dur, 1);
    const ease = (v: number) => v * v * (3 - 2 * v);

    // La luz permanece MUY ALTA en el cielo — desciende apenas, sigue siendo celestial
    const lightY = 105 - ease(Math.min(p / 0.45, 1)) * 30 + (p > 0.45 ? Math.sin(t * 0.9) * 1.2 : 0);

    // ── LENGUAJE DE CÁMARA ──
    // Seis planos encadenados que van del árbol al astro y terminan con los
    // dos en el mismo encuadre.
    const seg = (a: number, b: number) => ease(Math.min(Math.max((p - a) / (b - a), 0), 1));
    const CANOPY = 7;          // copa del manzano
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    // Punto al que mira la cámara: se desliza de la copa hacia la luz
    const aim = (k: number) => lerp(CANOPY, lightY, k);

    if (p < 0.12) {
      // 1 · ADÁN ALZA LA MIRADA — desde su sitio, subiendo hacia la copa
      const k = seg(0, 0.12);
      this.camera.position.set(
        lerp(this.playerPosition.x, 0.8, k * 0.35),
        lerp(this.playerPosition.y, this.playerPosition.y + 0.55, k),
        lerp(this.playerPosition.z, -12.5, k * 0.35),
      );
      this.camera.lookAt(0, aim(k * 0.35), 0);
    } else if (p < 0.30) {
      // 2 · ÓRBITA BAJA — el manzano de cuerpo entero, la luz asomando arriba
      const k = seg(0.12, 0.30);
      const ang = 0.15 + k * 1.15;
      const r = lerp(15, 11.5, k);
      this.camera.position.set(Math.sin(ang) * r, lerp(2.6, 5.2, k), Math.cos(ang) * r);
      this.camera.lookAt(0, lerp(CANOPY - 1, CANOPY + 4, k), 0);
    } else if (p < 0.48) {
      // 3 · CONTRAPICADO — pegados al tronco, la copa recortada contra el astro
      const k = seg(0.30, 0.48);
      const ang = 1.30 + k * 0.45;
      const r = lerp(7.5, 5.5, k);
      this.camera.position.set(Math.sin(ang) * r, lerp(1.5, 1.1, k), Math.cos(ang) * r);
      this.camera.lookAt(0, lerp(CANOPY + 3, lightY * 0.55, k), 0);
    } else if (p < 0.68) {
      // 4 · GRÚA ASCENDENTE — sube por el árbol hasta encarar la luz
      const k = seg(0.48, 0.68);
      const ang = 1.75 + k * 0.85;
      const r = lerp(9, 17, k);
      this.camera.position.set(Math.sin(ang) * r, lerp(3, 24, k), Math.cos(ang) * r);
      this.camera.lookAt(0, aim(lerp(0.25, 0.85, k)), 0);
    } else if (p < 0.86) {
      // 5 · EL ASTRO — el orbe llena el plano, el jardín queda muy abajo
      const k = seg(0.68, 0.86);
      const ang = 2.60 + k * 0.55;
      const r = lerp(17, 21, k);
      this.camera.position.set(
        Math.sin(ang) * r,
        lerp(24, lightY - 24, k),
        Math.cos(ang) * r,
      );
      this.camera.lookAt(0, lerp(aim(0.85), lightY, k) + Math.sin(t * 1.1) * 0.3, 0);
    } else {
      // 6 · PLANO FINAL — árbol abajo y luz arriba, juntos en el encuadre
      const k = seg(0.86, 1);
      const ang = 3.15 + k * 0.25;
      const r = lerp(24, 52, k);
      this.camera.position.set(
        Math.sin(ang) * r,
        lerp(lightY - 24, 11, k),
        Math.cos(ang) * r,
      );
      // Mirada intermedia: dentro del campo de visión entran copa y astro
      this.camera.lookAt(0, lerp(lightY - 14, 33, k) + Math.sin(t * 1.1) * 0.3, 0);
    }

    const glow = p < 0.08 ? ease(p / 0.08) : p > 0.94 ? ease((1 - p) / 0.06) : 1;

    if (this.divineLight) {
      this.divineLight.intensity = glow * (4.2 + Math.sin(t * 1.3) * 1.1);
      this.divineLight.position.set(0, lightY, 0);
    }
    if (this.divineOrb) {
      this.divineOrb.position.set(0, lightY, 0);
      this.divineOrb.scale.setScalar(1.35 + Math.sin(t * 1.4) * 0.12);
      const mat = this.divineOrb.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.96 * glow;
    }
    if (this.divineHalo) {
      this.divineHalo.position.set(0, lightY, 0);
      this.divineHalo.lookAt(this.camera.position.x, this.camera.position.y, this.camera.position.z);
      this.divineHalo.scale.setScalar(1.8 + Math.sin(t * 1.1) * 0.12);
      const mat = this.divineHalo.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.34 * glow;
    }

    // Red de seguridad: si por lo que sea el overlay de React no cerrara la
    // cinemática, el motor la termina solo y devuelve el control al jugador.
    if (t > dur + 1.2) {
      this.endForbiddenCinematic();
    }
  }

  endForbiddenCinematic() {
    this.forbiddenCinematicActive = false;
    // La luz divina se retira por completo y vuelve el sol del cielo,
    // que ya está suspendido sobre el manzano. Nunca hay dos soles.
    if (this.sunSprite) this.sunSprite.visible = true;
    if (this.divineLight) {
      this.scene.remove(this.divineLight);
      this.divineLight.dispose?.();
      this.divineLight = null;
    }
    if (this.divineOrb) {
      this.scene.remove(this.divineOrb);
      this.divineOrb.geometry.dispose();
      (this.divineOrb.material as THREE.Material).dispose();
      this.divineOrb = null;
    }
    if (this.divineHalo) {
      this.scene.remove(this.divineHalo);
      this.divineHalo.geometry.dispose();
      (this.divineHalo.material as THREE.Material).dispose();
      this.divineHalo = null;
    }
    this.camera.position.copy(this.playerPosition);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.playerRotation;
    this.camera.rotation.x = this.verticalRotation;
    this.cameraPosition.copy(this.playerPosition);
    this.cameraRotationY = this.playerRotation;
    this.cameraRotationX = this.verticalRotation;
  }

  private updateCinematic(delta: number) {
    this.cinematicTime += delta;
    const dur = this.cinematicDuration;
    const t = Math.min(this.cinematicTime / dur, 1);
    const ease = (v: number) => v * v * (3 - 2 * v);

    const groundH = Math.max(this.getTerrainHeight(0, -20), 0);
    const standY = this.playerHeight + groundH;

    this.callbacks.onCinematicUpdate?.(t);

    if (t < 1) {
      if (t < 0.15) {
        // ── VISTA AÉREA ── Dios mira el jardín desde arriba
        const p = ease(t / 0.15);
        const angle = p * 0.3;
        this.camera.position.set(
          Math.sin(angle) * 40,
          30 - p * 5,
          Math.cos(angle) * 40
        );
        this.camera.lookAt(0, 5, 0);
      } else if (t < 0.3) {
        // ── DESCENSO ── Bajando hacia el jardín
        const p = ease((t - 0.15) / 0.15);
        this.camera.position.set(
          Math.sin(0.3 + p * 0.2) * (40 - p * 25),
          25 - p * 18,
          Math.cos(0.3 + p * 0.2) * (40 - p * 25)
        );
        this.camera.lookAt(0, 6 - p * 2, 0);
      } else if (t < 0.45) {
        // ── CERCA DEL ÁRBOL ── Orbitando las manzanas
        const p = ease((t - 0.3) / 0.15);
        const angle = 0.5 + p * 1.2;
        const radius = 15 - p * 5;
        this.camera.position.set(
          Math.sin(angle) * radius,
          7 - p * 2,
          Math.cos(angle) * radius
        );
        this.camera.lookAt(0, 8, 0);
      } else if (t < 0.6) {
        // ── TRANSICIÓN ── Movimiento hacia la posición de Adán
        const p = ease((t - 0.45) / 0.15);
        this.camera.position.set(
          Math.sin(1.7) * 10 * (1 - p),
          5 - p * 3.3,
          Math.cos(1.7) * 10 * (1 - p) + (-20) * p
        );
        this.camera.lookAt(0, 4 + p * 2, 0);
      } else if (t < 0.72) {
        // ── DESPERTAR ── Primera persona, en el suelo
        const p = ease((t - 0.6) / 0.12);
        this.camera.position.set(0, groundH + 0.4 + p * 0.4, -20);
        this.camera.lookAt(0, groundH + 0.3 + p * 0.6, -19 + p);
      } else if (t < 0.85) {
        // ── DE PIE ── Levantarse y ver el árbol
        const p = ease((t - 0.72) / 0.13);
        this.camera.position.set(0, groundH + 0.8 + p * 0.9, -20);
        this.camera.lookAt(0, 1 + p * 7, -10 + p * 10);
      } else {
        // ── CONTEMPLACIÓN ── De pie mirando el manzano
        this.camera.position.set(0, standY, -20);
        const breathe = Math.sin(this.cinematicTime * 1.5) * 0.1;
        this.camera.lookAt(0, 9 + breathe, 0);
      }
    } else {
      if (this.state !== 'playing') {
        this.playerPosition.set(0, standY, -20);
        this.playerRotation = Math.PI;
        this.verticalRotation = 0.05;
        this.targetHeight = standY;
        this.lastPos.copy(this.playerPosition);
        this.cameraPosition.copy(this.playerPosition);
        this.cameraRotationY = this.playerRotation;
        this.cameraRotationX = this.verticalRotation;
        this.state = 'playing';
        this.callbacks.onStateChange('playing');
      }
      this.camera.position.copy(this.playerPosition);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.playerRotation;
      this.camera.rotation.x = this.verticalRotation;
    }
  }

  private updateGame(delta: number) {
    this.updateMovement(delta);
    this.updateCamera(delta);
    this.checkDiscoveries();
    this.checkInspect();
    this.emitScoreIfChanged();

    // Regeneración muy lenta de frutos/bayas (tick barato, no cada frame por objeto)
    this.regenTick += delta;
    if (this.regenTick >= 1) {
      this.regenTick = 0;
      for (const h of this.harvestables) {
        const removed = h.userData.removedFruits as Array<{ mesh: THREE.Object3D; parent: THREE.Object3D; timer?: number }> | undefined;
        if (!removed || removed.length === 0) continue;
        h.userData.regenTimer = (h.userData.regenTimer || 0) + 1;
        if (h.userData.regenTimer >= 12) {
          h.userData.regenTimer = 0;
          const restored = removed.pop();
          if (restored) {
            restored.parent.add(restored.mesh);
            h.userData.harvested = false;
          }
        }
      }
    }

    // Tracking de registros
    this.regTime += delta;
    const dist = this.playerPosition.distanceTo(this.lastPos);
    if (dist < 5) this.regDistance += dist; // Ignorar teleports
    this.lastPos.copy(this.playerPosition);

    if (this.isSprinting && !this.wasSprinting) this.regSprints++;
    this.wasSprinting = this.isSprinting;
  }

  saveRegistry() {
    try {
      const saved = localStorage.getItem('edenRegistry');
      const reg = saved ? JSON.parse(saved) : {};
      reg.distanceWalked = (reg.distanceWalked || 0) + this.regDistance;
      reg.timePlayed = (reg.timePlayed || 0) + this.regTime;
      reg.jumps = (reg.jumps || 0) + this.regJumps;
      reg.sprints = (reg.sprints || 0) + this.regSprints;
      reg.food = Math.max(reg.food || 0, Math.ceil(this.food));
      reg.discoveries = Math.max(reg.discoveries || 0, this.discoveries.size);
      reg.gamesPlayed = (reg.gamesPlayed || 0) + 1;
      reg.bestScore = Math.max(reg.bestScore || 0, Math.floor(this.score));
      localStorage.setItem('edenRegistry', JSON.stringify(reg));
    } catch { /* empty */ }
    this.regDistance = 0;
    this.regTime = 0;
    this.regJumps = 0;
    this.regSprints = 0;
  }

  private consumeFood(amount: number) {
    if (amount <= 0 || this.food <= 0) return;
    const consumed = Math.min(this.food, amount);
    this.food -= consumed;
    this.score += consumed; // 1 score por cada 1 saciedad consumida
    this.callbacks.onFoodUpdate?.(Math.max(0, Math.ceil(this.food)));
    this.emitScoreIfChanged();
  }

  private updateMovement(delta: number) {
    // ═══ CORRIENTE DEL RÍO ═══
    // Si el jugador está dentro de la lámina de agua, la corriente lo arrastra suavemente hacia el Este (+X).
    const distToRiverCenter = Math.abs(this.playerPosition.z - this.riverCenterZ(this.playerPosition.x));
    if (distToRiverCenter < this.riverHalfWidth) {
      const centerFactor = 1 - (distToRiverCenter / this.riverHalfWidth);
      const currentStrength = 2.0 * centerFactor;
      const r = this.resolveCollisionXZ(
        this.playerPosition.x + currentStrength * delta,
        this.playerPosition.z
      );
      this.playerPosition.x = r.x;
      this.playerPosition.z = r.z;
    }

    // ═══ EMPUJÓN DE LILITH ═══
    // Te aparta de verdad hacia atrás en lugar de dejarte clavado.
    if (this.playerPushTimer > 0) {
      this.playerPushTimer -= delta;
      const k = Math.max(0, this.playerPushTimer / this.playerPushDuration);
      const step = this.playerPushStrength * k * k * delta;
      const r = this.resolveCollisionXZ(
        this.playerPosition.x + this.playerPushDir.x * step,
        this.playerPosition.z + this.playerPushDir.z * step
      );
      this.playerPosition.x = r.x;
      this.playerPosition.z = r.z;
      // Ligero retroceso de cámara, como si perdieras el equilibrio
      this.verticalRotation += 0.22 * k * delta;
    }

    // Solo un instante muy breve sin control, justo al recibir el empujón
    if (this.playerFreezeTimer > 0) {
      this.playerFreezeTimer -= delta;
      this.isSprinting = false;
      const terrainHF = this.getTerrainHeight(this.playerPosition.x, this.playerPosition.z);
      this.targetHeight += (this.playerHeight + terrainHF - this.targetHeight) * Math.min(1, delta * 8);
      this.playerPosition.y = this.targetHeight;
      this.headBob *= 0.85;
      return;
    }

    // Sprint solo si queda saciedad
    const wantsSprint = this.keys['shift'] || this.touchSprint;
    this.isSprinting = wantsSprint && this.food > 0;
    const currentSpeed = (this.isSprinting ? this.playerSprintSpeed : this.playerSpeed) * delta;

    const input = this.inputVector.set(0, 0, 0);
    if (this.keys['w'] || this.keys['arrowup']) input.z = -1;
    if (this.keys['s'] || this.keys['arrowdown']) input.z = 1;
    if (this.keys['a'] || this.keys['arrowleft']) input.x = -1;
    if (this.keys['d'] || this.keys['arrowright']) input.x = 1;
    if (this.joystickActive) {
      input.x = this.joystickDelta.x;
      input.z = this.joystickDelta.y;
    }

    let isMoving = false;
    if (input.length() > 0) {
      isMoving = true;
      input.normalize();
      const cos = Math.cos(this.playerRotation);
      const sin = Math.sin(this.playerRotation);
      const mx = input.x * cos + input.z * sin;
      const mz = -input.x * sin + input.z * cos;

      // Resolver por ejes para permitir deslizar alrededor de árboles
      let nextX = this.playerPosition.x + mx * currentSpeed;
      let nextZ = this.playerPosition.z;
      let resolved = this.resolveCollisionXZ(nextX, nextZ);
      this.playerPosition.x = resolved.x;
      this.playerPosition.z = resolved.z;

      nextX = this.playerPosition.x;
      nextZ = this.playerPosition.z + mz * currentSpeed;
      resolved = this.resolveCollisionXZ(nextX, nextZ);
      this.playerPosition.x = resolved.x;
      this.playerPosition.z = resolved.z;

      // Consumir saciedad lentamente al correr
      if (this.isSprinting) {
        this.consumeFood(this.sprintFoodDrainPerSecond * delta);
        if (this.food <= 0) this.isSprinting = false;
      }

      // Límites — mapa x4
      this.playerPosition.x = Math.max(-420, Math.min(420, this.playerPosition.x));
      this.playerPosition.z = Math.max(-420, Math.min(420, this.playerPosition.z));
    }

    // ═══ SALTO Y GRAVEDAD ═══
    const terrainH = this.getTerrainHeight(this.playerPosition.x, this.playerPosition.z);
    const groundY = this.playerHeight + terrainH;

    // Suavizar la altura del terreno para evitar tirones
    this.targetHeight += (groundY - this.targetHeight) * Math.min(1, delta * 8);

    // Activar salto: solo si hay saciedad
    if ((this.keys[' '] || this.touchJump) && this.isGrounded && this.food > 0) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
      this.regJumps++;
      this.consumeFood(this.jumpFoodDrain);
      this.touchJump = false;
    } else if (this.touchJump) {
      this.touchJump = false;
    }

    if (!this.isGrounded) {
      this.velocityY -= this.gravity * delta;
      this.playerPosition.y += this.velocityY * delta;
      if (this.playerPosition.y <= this.targetHeight) {
        this.playerPosition.y = this.targetHeight;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    } else {
      this.playerPosition.y = this.targetHeight;
    }

    // ═══ HEAD BOB AL CAMINAR ═══
    if (isMoving && this.isGrounded) {
      const bobSpeed = this.isSprinting ? 12 : 8;
      const bobAmount = this.isSprinting ? 0.04 : 0.02;
      this.headBob += delta * bobSpeed;
      this.playerPosition.y += Math.sin(this.headBob) * bobAmount;
    } else {
      this.headBob *= 0.85;
    }
  }

  private updateCamera(delta: number) {
    const sens = 0.003;
    if (this.mouseMovement.x || this.mouseMovement.y) {
      this.playerRotation -= this.mouseMovement.x * sens;
      this.verticalRotation -= this.mouseMovement.y * sens;
      this.verticalRotation = Math.max(-1.3, Math.min(1.3, this.verticalRotation));
      this.mouseMovement.x = 0;
      this.mouseMovement.y = 0;
    }

    // ═══ INTERPOLACIÓN SUAVE ═══
    // Posición se interpola más suave, rotación más rápida para respuesta
    const posFactor = 1 - Math.exp(-this.cameraSmoothness * delta);
    const rotFactor = 1 - Math.exp(-(this.cameraSmoothness + 8) * delta);

    this.cameraPosition.lerp(this.playerPosition, posFactor);
    this.cameraRotationY += (this.playerRotation - this.cameraRotationY) * rotFactor;
    this.cameraRotationX += (this.verticalRotation - this.cameraRotationX) * rotFactor;

    this.camera.position.copy(this.cameraPosition);
    this.camera.rotation.y = this.cameraRotationY;
    this.camera.rotation.x = this.cameraRotationX;
  }

  private checkDiscoveries() {
    for (const d of this.discoverables) {
      if (d.discovered) continue;
      if (this.playerPosition.distanceTo(d.mesh.position) < 3) {
        d.discovered = true;
        this.discoveries.add(d.id);
        this.callbacks.onDiscovery?.(this.discoveries.size);
      }
    }
  }

  private inspectPressed = false; // edge detection: true solo en el frame de la pulsación
  private checkInspect() {
    const inspectDown = !!this.keys['e'] || this.touchInspect;
    // Discreto por pulsación única: solo si acaba de bajar
    if (!inspectDown || this.inspectPressed) {
      this.touchInspect = false;
      this.inspectPressed = inspectDown;
      return;
    }
    this.inspectPressed = true;
    this.touchInspect = false;

    // ¿Está Adán junto al árbol del conocimiento?
    // Se calcula ANTES que nada: el árbol tiene prioridad sobre la charla de
    // Lilith. Antes ella merodeaba el claro y, al estar a menos de 8 unidades,
    // su diálogo hacía `return` y las inspecciones del árbol NUNCA se contaban.
    let nearTreePart = false;
    if (this.appleTree) {
      this.appleTree.traverse(child => {
        if (nearTreePart) return;
        const dx = this.playerPosition.x - child.position.x;
        const dz = this.playerPosition.z - child.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 5) nearTreePart = true;
      });
    }

    // 1. Interacción con LILITH (Detección dinámica)
    // Solo intercepta si NO estás inspeccionando el árbol.
    if (this.lilithGroup && !nearTreePart) {
      const dxL = this.playerPosition.x - this.lilithGroup.position.x;
      const dzL = this.playerPosition.z - this.lilithGroup.position.z;
      const dLSq = dxL * dxL + dzL * dzL;

      // Si te has metido en su espacio (< 1.7 unidades): te aparta con las manos.
      // Antes el radio era 2.6 y se comía casi toda la zona de charla: por eso
      // parecía que solo respondía cuando ella estaba caminando (alejándose).
      if (dLSq < 2.89 && this.lilithBlockCooldown <= 0 && this.lilithState !== 'blocking') {
        // Te encara antes de alzar las palmas
        this.lilithGroup.rotation.y = Math.atan2(dxL, dzL);
        // Dirección en la que ella retrocederá: alejándose de ti
        const d = Math.max(0.001, Math.sqrt(dLSq));
        this.lilithBackDir.set(-dxL / d, 0, -dzL / d);

        this.lilithState = 'blocking';
        this.lilithTimer = 1.2;
        this.lilithBlockElapsed = 0;

        // Te aparta: retrocedes de verdad, pero recuperas el control enseguida
        this.playerPushDir.set(dxL / d, 0, dzL / d); // alejándote de ella
        this.playerPushTimer = this.playerPushDuration;
        this.playerPushStrength = 5.2;
        this.playerFreezeTimer = 0.22; // solo el instante del impacto

        // Sin diálogo en la animación de apartar.
        this.lastAdamThoughtAt = this.elapsedTotal;
        return; // IMPORTANTE: No procesar nada más si interactuamos con Lilith
      }

      // Charla (< 8 unidades). Responde SIEMPRE, esté parada o caminando.
      // Mientras te está apartando guarda silencio.
      const busyShoving = this.lilithState === 'blocking' || this.lilithState === 'backing';
      if (dLSq < 64 && !busyShoving &&
          this.elapsedTotal - this.lastLilithTalkAt >= 2.5) {
        this.lastLilithTalkAt = this.elapsedTotal;
        this.lastAdamThoughtAt = this.elapsedTotal;

        // Se detiene y te busca con la mirada un segundo
        this.lilithLookTimer = 1.6;
        if (this.lilithState === 'walking') {
          this.lilithState = 'idle';
          this.lilithTimer = 2.4;
        }

        const thoughts = GameEngine.LILITH_THOUGHTS;
        const idx = Math.floor(Math.random() * thoughts.length);
        this.callbacks.onAdamThought?.("Lilith: " + thoughts[idx]);
        if (!this.seenThoughts.has(idx + 100)) {
          this.seenThoughts.add(idx + 100);
          this.score += 1;
          this.emitScoreIfChanged();
        }
        return; // IMPORTANTE: No procesar el árbol
      }
      // Si está apartándote, la interacción se consume sin diálogo
      if (dLSq < 64 && busyShoving) return;
    }

    // 2. Interacción con el ÁRBOL DEL CONOCIMIENTO
    if (nearTreePart) {
      if (this.forbiddenTreeTriggered && !this.forbiddenCinematicActive) {
        if (this.elapsedTotal - this.lastAdamThoughtAt >= 6) {
          this.lastAdamThoughtAt = this.elapsedTotal;
          const thoughts = GameEngine.ADAM_THOUGHTS;
          const idx = Math.floor(Math.random() * thoughts.length);
          this.callbacks.onAdamThought?.(thoughts[idx]);
          if (!this.seenThoughts.has(idx)) {
            this.seenThoughts.add(idx);
            this.score += 1;
            this.emitScoreIfChanged();
            if (this.seenThoughts.size >= 21) {
              try {
                const reg = JSON.parse(localStorage.getItem('edenRegistry') || '{}');
                if (!reg.memoryDoubts) {
                  reg.memoryDoubts = true;
                  this.score += 21;
                  this.emitScoreIfChanged();
                  localStorage.setItem('edenRegistry', JSON.stringify(reg));
                }
              } catch { /* empty */ }
            }
          }
        }
        return;
      }
      if (!this.forbiddenTreeTriggered) {
        this.forbiddenTreeInspections++;

        // Cada inspección deja oír una duda de Adán: así se percibe el avance
        // hacia las 21 en vez de pulsar E sin respuesta alguna.
        if (this.forbiddenTreeInspections < 21 &&
            this.elapsedTotal - this.lastAdamThoughtAt >= 1.2) {
          this.lastAdamThoughtAt = this.elapsedTotal;
          const thoughts = GameEngine.ADAM_THOUGHTS;
          const idx = (this.forbiddenTreeInspections - 1) % thoughts.length;
          this.callbacks.onAdamThought?.(thoughts[idx]);
          if (!this.seenThoughts.has(idx)) {
            this.seenThoughts.add(idx);
            this.score += 1;
            this.emitScoreIfChanged();
          }
        }

        if (this.forbiddenTreeInspections >= 21) {
          this.forbiddenTreeTriggered = true;
          try {
            const reg = JSON.parse(localStorage.getItem('edenRegistry') || '{}');
            if (!reg.memoryMandate) {
              reg.memoryMandate = true;
              this.score += 21;
              this.emitScoreIfChanged();
            }
            localStorage.setItem('edenRegistry', JSON.stringify(reg));
          } catch { /* empty */ }

          this.forbiddenCinematicActive = true;
          this.forbiddenCinematicTime = 0;

          // Ocultar el sol del cielo: durante la cinemática el único astro
          // sobre el árbol es la luz divina. Nada de dos soles.
          if (this.sunSprite) this.sunSprite.visible = false;

          this.divineLight = new THREE.PointLight(0xfff3cc, 0, 220, 1.4);
          this.divineLight.position.set(0, 105, 0);
          this.scene.add(this.divineLight);

          const orbMat = new THREE.MeshBasicMaterial({ color: 0xfff5c8, transparent: true, opacity: 0.98, fog: false });
          this.divineOrb = new THREE.Mesh(new THREE.SphereGeometry(5.2, 14, 12), orbMat);
          this.divineOrb.position.set(0, 105, 0);
          this.divineOrb.renderOrder = 10;
          this.scene.add(this.divineOrb);

          const haloCanvas = document.createElement('canvas');
          haloCanvas.width = 128;
          haloCanvas.height = 128;
          const haloCtx = haloCanvas.getContext('2d')!;
          const grad = haloCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
          grad.addColorStop(0, 'rgba(255,220,120,0.9)');
          grad.addColorStop(0.3, 'rgba(255,200,90,0.5)');
          grad.addColorStop(0.6, 'rgba(255,180,60,0.15)');
          grad.addColorStop(1, 'rgba(255,160,40,0)');
          haloCtx.fillStyle = grad;
          haloCtx.fillRect(0, 0, 128, 128);
          const haloTex = new THREE.CanvasTexture(haloCanvas);
          const haloMat = new THREE.MeshBasicMaterial({
            map: haloTex,
            transparent: true,
            opacity: 1,
            fog: false,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          this.divineHalo = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), haloMat);
          this.divineHalo.position.set(0, 105, 0);
          this.divineHalo.renderOrder = 9;
          this.scene.add(this.divineHalo);

          this.callbacks.onForbiddenTree?.();
          return;
        }
      }
      // Inspeccionar el árbol nunca debe recolectar fruta
      return;
    }

    // 3. Recolección normal de frutas
    let closest: THREE.Object3D | null = null;
    let closestDistSq = 25;
    for (const h of this.harvestables) {
      if (h.userData.harvested) continue;
      const dx = this.playerPosition.x - h.position.x;
      const dz = this.playerPosition.z - h.position.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = h;
      }
    }
    if (closest) {
      const fruits: THREE.Object3D[] = [];
      closest.traverse(child => {
        if (child.userData.isFruit && child.parent) fruits.push(child);
      });
      if (fruits.length > 0) {
        const removed = closest.userData.removedFruits as Array<{ mesh: THREE.Object3D; parent: THREE.Object3D }> || [];
        for (const f of fruits) {
          const parent = f.parent;
          if (parent) {
            parent.remove(f);
            removed.push({ mesh: f, parent });
          }
        }
        closest.userData.harvested = true;
        closest.userData.removedFruits = removed;
        this.food += 1;
        this.callbacks.onFoodUpdate?.(Math.max(0, Math.ceil(this.food)));
      }
    }
  }

  // Restaurar frutas al reiniciar la partida
  private restoreHarvestables() {
    for (const h of this.harvestables) {
      const removed = h.userData.removedFruits as Array<{ mesh: THREE.Object3D; parent: THREE.Object3D }> | undefined;
      if (removed && removed.length > 0) {
        for (const r of removed) {
          r.parent.add(r.mesh);
        }
      }
      h.userData.removedFruits = [];
      h.userData.harvested = false;
      h.userData.regenTimer = 0;
    }
  }
}
