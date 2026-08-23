# Garden of Eden

> **Modelos y agentes: leed [AGENTS.md](AGENTS.md) antes de tocar el juego.**  
> Lo anterior a la **2.1.0** se hizo en local y **no se recopiló**. La colección empieza en `v2.1.0`.

![Versión](https://img.shields.io/badge/versión-3.0.0-d4a72c)
![React](https://img.shields.io/badge/React-19-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.185-black)

**Garden of Eden** es una experiencia 3D en primera persona con estética de la era PS2. Explora el jardín como Adán, recorre el bosque, recolecta frutos, encuentra a Lilith y descubre los recuerdos del Árbol del Conocimiento.

<p align="center">
  <img src="public/images/mapa-jardin-eden.png" alt="Mapa ilustrado del Jardín del Edén" width="720" />
</p>

## Estado del proyecto

- **Versión actual:** `3.0.0` (rama `main`)
- **Siguiente:** `3.1.0` (en preparación)
- **Plataformas:** navegador de escritorio y dispositivos táctiles
- **Persistencia:** `localStorage` del navegador
- **Build:** aplicación estática con JavaScript y CSS integrados en `dist/index.html`, más los recursos de `dist/images/`

## Versiones y ramas

Colección completa en [Releases](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases) y en [VERSIONS.md](VERSIONS.md).

| Versión | Rama estable | Tag / release | Notas |
|---|---|---|---|
| **3.0.0** | `main`, `release/v3.0.0` | [`v3.0.0`](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v3.0.0) | Portada iluminada, códice/mapa, HUD, ríos sagrados, Lilith |
| **2.3.0** | `release/v2.3.0` | [`v2.3.0`](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v2.3.0) | Mundo 3D, mapa ilustrado, frutos, cinemáticas, controles táctiles |
| **2.1.0** | `release/v2.1.0` | [`v2.1.0`](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v2.1.0) | Primera entrega jugable del jardín |

Convención:

- `main` — versión publicada más reciente.
- `release/vX.Y.Z` — instantánea de esa versión.
- `arena/…` — ramas de trabajo de sesión; no son versiones.

## Características (v3.0.0)

- Mundo 3D generado con Three.js.
- Río al norte del claro, con meandros, cauce, orillas y corriente.
- Bosque de 300 árboles en el cinturón exterior, 100 frutales y 90 arbustos de bayas.
- Montañas transitables al oeste, suroeste y sureste.
- Árbol del Conocimiento con interacciones y cinemática.
- Lilith con animación, diálogo, colisiones y espacio personal.
- Intro multicolor de PSYCODELICINSANE.
- Portada con letras iluminadas, marco dorado y navegación `INICIO / RECUERDOS / DATOS / MAPA`.
- Códice cartográfico con hitos y citas del Génesis.
- HUD: mira, brújula, saciedad (`SAC`) y Score.
- Sistema de score, recuerdos, estadísticas y descubrimientos.
- Conejos low-poly estilo PS2 repartidos por el jardín: pastorean, saltan y huyen.
- Controles de teclado, ratón y pantallas táctiles.

## Requisitos

- [Node.js](https://nodejs.org/) 22 o superior recomendado.
- npm 10 o superior.

## Instalación y desarrollo

```bash
git clone https://github.com/Psycodelicinsane/Garden-of-Eden-Config.git
cd Garden-of-Eden-Config
npm ci
npm run dev
```

Vite mostrará la dirección local del juego, normalmente `http://localhost:5173`.

Para permitir conexiones desde otros dispositivos o desde un entorno de preview:

```bash
npm run dev -- --host 0.0.0.0
```

## Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo con recarga automática. |
| `npm test` | Ejecuta las pruebas automatizadas con el test runner de Node.js. |
| `npm run typecheck` | Comprueba los tipos de TypeScript sin generar archivos. |
| `npm run build` | Genera el build de producción en `dist/`. |
| `npm run check` | Ejecuta typecheck, tests y build en una sola orden. |
| `npm run preview` | Sirve localmente el build de producción. |

## Controles

### Escritorio

| Acción | Control |
|---|---|
| Caminar | `WASD` o flechas |
| Mirar | Ratón |
| Correr | `Shift` — requiere saciedad |
| Saltar | `Espacio` — requiere saciedad |
| Inspeccionar / interactuar | `E` |
| Pausar / continuar | `Esc` |
| Saltar la intro o cualquier cinemática (atajo temporal de administración) | `P` |

### Móvil y tablet

- **Zona izquierda:** joystick táctil para caminar.
- **Zona derecha:** arrastrar para mirar.
- **LOOK:** inspeccionar o interactuar.
- **JUMP:** saltar.
- **RUN:** correr mientras se mantiene pulsado.
- **MENU:** pausar la partida.

## Progreso guardado

El juego guarda automáticamente en el navegador:

- estadísticas de movimiento y tiempo;
- recuerdos desbloqueados;
- descubrimientos;
- mejor puntuación alcanzada.

Para reiniciar completamente el progreso, elimina la clave `edenRegistry` del almacenamiento local del sitio.

## Estructura principal

```text
.
├── public/images/              # Mapa e imágenes públicas
├── src/
│   ├── components/             # Intro, HUD, menús y overlays
│   ├── game/GameEngine.ts      # Mundo 3D, gameplay, input y cinemáticas
│   ├── App.tsx                 # Estado principal y conexión React/motor
│   ├── index.css               # Estilos globales
│   └── main.tsx                # Entrada de React
├── AGENTS.md                   # Lectura obligatoria para modelos/agentes
├── CHANGELOG.md                # Historial de versiones
├── VERSIONS.md                 # Colección de entregas publicadas
├── tests/                      # Pruebas automatizadas de regresión
├── vite.config.ts              # Configuración de Vite e integración de JS/CSS
└── package.json
```

## Calidad y verificación

Antes de abrir un pull request:

```bash
npm ci
npm run check
npm audit --audit-level=high
```

## Flujo de contribución

1. Crea una rama desde `main`.
2. Realiza cambios pequeños y verificables.
3. Ejecuta `npm run check`.
4. Abre un pull request hacia `main` explicando los cambios y cómo probarlos.

## Autor

Proyecto de [Psycodelicinsane](https://github.com/Psycodelicinsane).
