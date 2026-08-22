# Garden of Eden

![Versión](https://img.shields.io/badge/versión-2.3.0-d4a72c)
![React](https://img.shields.io/badge/React-19-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-0.185-black)

**Garden of Eden** es una experiencia 3D en primera persona con estética de la era PS2. Explora el jardín como Adán, recorre el bosque, recolecta frutos, encuentra a Lilith y descubre los recuerdos del Árbol del Conocimiento.

<p align="center">
  <img src="public/images/mapa-jardin-eden.png" alt="Mapa ilustrado del Jardín del Edén" width="720" />
</p>

## Estado del proyecto

- **Versión actual:** `2.3.0`
- **Plataformas:** navegador de escritorio y dispositivos táctiles
- **Persistencia:** `localStorage` del navegador
- **Build:** aplicación estática con JavaScript y CSS integrados en `dist/index.html`, más los recursos de `dist/images/`

## Características

- Mundo 3D generado con Three.js.
- Río serpenteante con cauce, orillas y corriente.
- Bosque de 240 árboles, con 60 frutales recolectables repartidos por todo el jardín.
- Árbol del Conocimiento con interacciones y cinemática propia.
- Lilith como personaje dinámico, con animación, diálogo, colisiones y anatomía articulada.
- Intro multicolor de PSYCODELICINSANE.
- Portada, mapa y menú de pausa con estilo dorado.
- Sistema de score, saciedad, recuerdos, estadísticas y descubrimientos.
- Controles adaptados a teclado, ratón y pantallas táctiles.

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
| Saltar intro y cinemática para pruebas | `P` |

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
- mejor puntuación y registros anteriores.

Para reiniciar completamente el progreso, elimina las claves `edenRegistry` y `edenHighScores` del almacenamiento local del sitio.

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
