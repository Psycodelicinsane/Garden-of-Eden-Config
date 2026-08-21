# Garden of Eden — Informe de exportación, testeo y escaneo

Fecha del análisis: 2026-08-21 · Rama `arena/01a02568-garden-of-eden-config`

---

## 1. Exportación del juego

El juego se exporta **tal cual está**, sin modificar su comportamiento.

| Paso | Comando | Resultado |
|------|---------|-----------|
| Instalar dependencias | `npm install` | ✅ OK |
| Verificación de tipos (strict) | `npx tsc --noEmit` | ✅ 0 errores |
| Build de producción | `npm run build` | ✅ OK (3.09s) |
| Artefacto generado | `dist/index.html` | ✅ 850 KB (HTML único con JS/CSS inline) |
| Mapa | `dist/images/mapa-jardin-eden.png` | 4,7 MB (no se inlinea) |

### Dónde está el export

- **`dist/`** — carpeta con el juego compilado:
  - `dist/index.html` (un solo archivo: JS y CSS van embebidos gracias a `vite-plugin-singlefile`).
  - `dist/images/mapa-jardin-eden.png` (el mapa de la pantalla de inicio).
- **`Garden-of-Eden-export.zip`** — export empaquetado listo para descargar/compartir (5 MB).

> ⚠️ **Importante para "editar exactamente como está":** el export de un solo archivo **no es 100 % autocontenido**. La imagen del mapa se referencia con ruta absoluta (`/images/mapa-jardin-eden.png`) y NO se inlinea en el HTML. Ver **Bug #3**.

---

## 2. Chequeos ejecutados

| Chequeo | Resultado |
|---------|-----------|
| TypeScript `--noEmit` (modo strict, `noUnusedLocals`, `noUnusedParameters`) | ✅ Sin errores |
| `vite build` (producción) | ✅ Sin errores |
| Servidor de desarrollo (Vite) | ✅ Levanta en `:5173`, todos los módulos responden 200 |
| Preview del build (`vite preview`) | ✅ Levanta en `:4173`, `index.html` y mapa responden 200 |
| `console.log` / `debugger` / `TODO` en código | ✅ Ninguno |
| `npm audit` | ⚠️ 2 vulnerabilidades (solo dev-server en Windows, ver §4) |

---

## 3. Bugs encontrados

### 🔴 CRÍTICO — BUG #1: No existe condición de "game over" (el juego nunca termina)

El motor **nunca** transiciona al estado `'gameover'`. La saciedad (`food`) solo limita el sprint y el salto; al llegar a 0 **no ocurre nada** que termine la partida.

- `GameEngine.ts` solo llama a `onStateChange('playing')` (líneas **539** y **2700**). No existe ningún `onStateChange('gameover')`.
- En `App.tsx` no hay ningún `setGameState('gameover')` fuera del render condicional de la pantalla (línea **240**).

**Consecuencias en cascada:**
- La pantalla **GAME OVER** (`GameOverScreen`) es inalcanzable (código muerto).
- Los **récords nunca se guardan**: `localStorage.setItem('edenHighScores', …)` solo ocurre dentro del `useEffect` que dispara `gameState === 'gameover'` (`App.tsx:117`). Resultado: "MEJOR SCORE", "TOP SCORES" y "RANKING" estarán **siempre vacíos**.
- `HighScoreTable.tsx` no se usa en ningún sitio (código muerto).
- El flujo de reinicio `PRESS START` (`handleRestart`) también queda inalcanzable.

### 🔴 CRÍTICO — BUG #2: `restart()` no restablece el estado ni relanza la cinemática

`GameEngine.restart()` (línea **542**) resetea puntuación, comida, descubrimientos, etc., pero:
- **No** establece `this.state = 'cinematic'`.
- **No** relanza el bucle de la cinemática (sí pone `cinematicTime = 0`, pero `updateCinematic()` nunca llega a ejecutarse porque el estado del motor sigue siendo `'playing'`).

Si BUG #1 se corrigiera y se llegara a `game over` → `PRESS START`, `App` pondría `gameState='cinematic'` pero el motor seguiría en `'playing'`: la `CinematicOverlay` con `progress=0` pinta una pantalla negra (fade inicial) y **nunca avanza**, dejando el juego atascado.

### 🟠 MEDIO — BUG #3: Ruta absoluta del mapa rompe el export autocontenido

`StartScreen.tsx:318` usa `src="/images/mapa-jardin-eden.png"` (ruta absoluta).

- Funciona en el dev server y en `vite preview` (servidos desde la raíz).
- **Falla** si el `index.html` se abre con `file://` (busca `/images/…` en la raíz del disco).
- **Falla** si se aloja en un subdirectorio (p. ej. GitHub Pages `/repo/`).

La imagen (4,7 MB) supera el límite de inlineado de Vite, por lo que queda como archivo externo. Para un export 100 % autocontenido habría que embeberla en base64 o cambiar a ruta relativa `images/mapa-jardin-eden.png`.

### 🟠 MEDIO — BUG #4: El bucle del título no guarda su `requestAnimationFrame`

`showTitleScreen()` (líneas **482–500**) arranca un `loop` con `requestAnimationFrame(loop)` pero **no** asigna `this.animationId` (a diferencia del bucle principal en `animate()`, línea **2466**).

- El bucle del título **no puede cancelarse**; solo se autodestruye cuando `this.state` deja de ser `'start'`.
- Si `showTitleScreen()` se invocara dos veces, quedarían **dos bucles de render** corriendo a la vez.
- `dispose()` tampoco lo detiene.

En la práctica hoy solo se llama una vez, pero es un punto frágil.

### 🟠 MEDIO — BUG #5: `dispose()` no retira los event listeners

`dispose()` desecha geometrías y el renderer, pero **no** elimina los listeners registrados en `setupEventListeners()` (`window` keydown/keyup/mouse/touch/`resize`).

- En **desarrollo con `<StrictMode>`** (doble montaje de efectos) quedan **listeners duplicados** del primer motor desechado, que siguen mutando su estado fantasma.
- El build de producción (sin doble montaje) no se ve afectado, pero sigue siendo una fuga si el componente se desmontara.

### 🟠 MEDIO — BUG #6: Detección de cercanía al árbol con posición local

`checkInspect()` (línea **2963**) calcula la distancia al árbol usando `child.position` (posición **local** dentro del grupo) comparada con `playerPosition` (coordenada **mundial**).

Funciona **solo porque el árbol del conocimiento está en x=0, z=0** (donde local == mundial en XZ). Si algún día se mueve el árbol, la interacción "E" dejaría de detectarlo.

### 🟡 BAJO — BUG #7: `saveHighScore` con dependencias incompletas

`App.tsx:117` usa `score` y `highScores` del closure del `useEffect` que depende solo de `[gameState]` (eslint desactivado). Hoy es inocuo (por el BUG #1), pero es un patrón frágil.

### 🟡 BAJO — BUG #8: `setScore` cada frame

`updateGame()` llama a `onScoreUpdate(Math.floor(this.score))` en **cada frame** (`GameEngine.ts`), provocando un `setState` por frame. React lo descarta cuando el valor no cambia, pero es trabajo innecesario.

### 🟡 BAJO — BUG #9: Botón MENU inaccesible con pointer lock en escritorio

Al hacer clic en el canvas se activa el pointer lock (cursor oculto y fijo). Con el puntero bloqueado no se puede alcanzar el botón **MENU** del HUD en escritorio; solo `Esc` permite pausar. En táctil no aplica.

### ⚪ Observaciones de diseño (posiblemente intencionales)

- **Río sin penalización**: se puede vadear/hundirse sin ahogarse; la corriente arrastra hacia el Este.
- **Puntuación peculiar**: recolectar fruta no da puntos; los puntos se obtienen al *gastar* saciedad (sprint/salto) y al conversar con Lilith o meditar junto al árbol.
- **Texturas no deterministas**: `createBarkTexture`, `createGrassTexture`, etc. usan `Math.random()` (no la semilla `this.rand()`), por lo que las texturas cambian en cada carga aunque el jardín (posición de objetos) sí es determinista.
- **Sin `.gitignore`** en el repo (añadido en este análisis: `node_modules/`, `dist/`, `*.zip`, etc.).

---

## 4. Vulnerabilidades de dependencias (`npm audit`)

| Paquete | Severidad | Detalle | Afecta |
|---------|-----------|---------|--------|
| `esbuild` 0.27.3–0.28.0 | Baja | Lectura arbitraria de archivos en el **dev server en Windows** | Solo desarrollo |
| `vite` 7.0.0–7.3.3 | Alta | `launch-editor`: divulgación de hash NTLMv2 vía UNC en **Windows**; bypass de `server.fs.deny` en rutas alternas de **Windows** | Solo desarrollo |

Ambas son específicas de Windows y del servidor de desarrollo; **no afectan al juego compilado ni al runtime en el navegador**. `npm audit fix` resuelve la de `esbuild`; la de `vite` requiere actualizar a `vite@7.3.6` (fuera del rango declarado en `package.json`, se haría con `--force`).

---

## 5. Resumen ejecutivo

- ✅ El código **compila sin errores** (TS strict + build).
- ✅ El juego **arranca y sirve** correctamente en dev y en el build.
- 🔴 **El bucle principal de juego está incompleto**: no hay condición de fin → la pantalla de game over, los récords/ranking y el reinicio están muertos.
- 🔴 `restart()` no relanza la cinemática (bug latente conectado al anterior).
- 🟠 El export "de un solo archivo" depende de la carpeta `images/` por la ruta absoluta del mapa.

---

## 6. Propuestas de corrección (opcionales)

Puedo implementar cualquiera de estas, si lo deseas:

1. **Añadir condición de fin de partida** (p. ej. saciedad = 0 → "game over"), cableando `onStateChange('gameover')`, el guardado de récords y el `PRESS START`.
2. **Arreglar `restart()`** para que resetee `this.state='cinematic'` y relance la cinemática.
3. **Export autocontenido**: embeber el mapa en base64 o cambiar la ruta a relativa para que `index.html` funcione con doble clic o en subdirectorios.
4. **Higiene menor**: cancelar el bucle del título en `dispose()`, retirar listeners, usar posición mundial en `checkInspect()`, quitar `HighScoreTable` sin uso.
5. **Actualizar `vite`** a 7.3.6 para limpiar la alerta de seguridad.
