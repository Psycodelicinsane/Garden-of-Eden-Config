# LEE ESTO ANTES DE TOCAR EL JUEGO

**Obligatorio para cualquier modelo, agente o colaborador.** No empieces a editar, versionar ni reescribir historia hasta haber leído este archivo entero.

English: **Read this file before changing the game.** Versions before 2.1.0 were built locally and were never archived. Do not invent, restore, or claim pre-2.1 sources. Always cut a GitHub Release + `release/vX.Y.Z` branch when you ship a version.

---

## 1. Hecho que no se discute

Todo lo **anterior a la 2.1.0 se hizo en local** y **no se estaba recopilando**.

- Ese trabajo **no está** en este repositorio.
- **No existe** tag, release ni rama `release/` anterior a `v2.1.0`.
- El primer commit jugable de GitHub es `2c02bda` (`add game v2.1`).
- **No inventes** una v1, v2.0 ni “fuentes antiguas”.
- **No pidas** al usuario que “suba la v1”: no forma parte de la colección.
- **No reescribas** git para fabricar un pasado que no se archivó.

Si hace falta mencionar esa etapa, dilo así: *prototipos locales previos a 2.1; no recopilados*.

## 2. Colección oficial (solo esto cuenta)

| Orden | Versión | Dónde está |
|---|---|---|
| 1 | **2.1.0** | tag `v2.1.0`, rama `release/v2.1.0` |
| 2 | **2.3.0** | tag `v2.3.0`, rama `release/v2.3.0` |
| 3 | **3.0.0** | tag `v3.0.0`, rama `release/v3.0.0` (actual) |
| — | **3.1.0** | siguiente; aún no publicada |

Catálogo: [VERSIONS.md](VERSIONS.md) · notas: [CHANGELOG.md](CHANGELOG.md) · releases: https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases

## 3. A partir de ahora, toda versión se recopila

Al **cerrar** una versión (no en cada commit de trabajo):

1. Sube `package.json` y el badge del README a `X.Y.Z`.
2. Actualiza `CHANGELOG.md` y `VERSIONS.md`.
3. Commit en la rama de sesión / PR hacia `main`.
4. Crea `release/vX.Y.Z` apuntando a ese commit.
5. Crea el tag anotado `vX.Y.Z`.
6. Publica el **GitHub Release** con ese tag (la Latest es siempre la más nueva).
7. No borres tags ni ramas `release/*` de versiones ya publicadas.

Sin release en GitHub, **esa versión no existe** para la colección.

## 4. Ramas

| Rama | Significado |
|---|---|
| `main` | última versión publicada (o a punto de publicarse) |
| `release/vX.Y.Z` | instantánea permanente de esa versión |
| `arena/…` | sesión de trabajo; **no** es una versión |

No uses ramas de sesión como archivo histórico. No reescribas `release/*`.

## 5. Cómo trabajar

- Lee también [README.md](README.md).
- Parte de la versión actual (`3.0.0`), no de prototipos locales.
- Cambios pequeños y verificables. Antes de un PR: `npm ci && npm run check`.
- Preview: `npm run dev -- --host 0.0.0.0` (Vite ya permite cualquier host).
- No subas `dist/`, `node_modules/` ni secretos.
- El atajo `P` salta cinemáticas: es de administración, no lo presentes como control de jugador.
- Conserva la estética PS2, el tono del jardín y el crédito **PSYCODELICINSANE**.

## 6. Qué no hacer

- No “reconstruyas” lo anterior a 2.1 como si fuera una release perdida.
- No etiquetes un WIP a medias como `v3.1.0`.
- No dejes `package.json` en una versión vieja cuando el juego ya es otra.
- No borres la colección para “limpiar” el repo.

Si hay duda: **pregunta**. No asumas un pasado que GitHub no tiene.
