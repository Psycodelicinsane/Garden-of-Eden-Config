# Colección de versiones

**Antes de tocar el juego:** [AGENTS.md](AGENTS.md).

Lo **anterior a 2.1.0 se hizo en local y no se estaba recopilando**. No hay v1 ni v2.0 en GitHub. La colección **empieza en 2.1.0**. A partir de esa entrega, cada versión debe tener tag, rama `release/vX.Y.Z` y GitHub Release.

Entregas publicadas: [Releases](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases).

| # | Versión | Fecha | Release | Rama | Commit | Cómo abrirla |
|---|---|---|---|---|---|---|
| 3 | **3.0.0** (actual) | 2026-08-23 | [v3.0.0](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v3.0.0) | `release/v3.0.0` | `649f751` | `git checkout v3.0.0` |
| 2 | **2.3.0** | 2026-08-22 | [v2.3.0](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v2.3.0) | `release/v2.3.0` | `6b451cc` | `git checkout v2.3.0` |
| 1 | **2.1.0** | 2026-08-21 | [v2.1.0](https://github.com/Psycodelicinsane/Garden-of-Eden-Config/releases/tag/v2.1.0) | `release/v2.1.0` | `2c02bda` | `git checkout v2.1.0` |

No hay entregas anteriores a 2.1.0 en este repositorio.

```bash
# Recopilar todas las etiquetas
git fetch --tags
git tag -l 'v*'

# Jugar una versión concreta
git checkout v2.1.0   # o v2.3.0 / v3.0.0
npm ci
npm run dev
```
