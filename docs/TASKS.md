- [ ] T-002 - Editor del apartado de logros - [Feature][UI]
  El modelo `Achievement`, la sección `achievements` y las claves i18n ya existen,
  pero no hay editor ni pestaña en `Editor.svelte`. Fuera del alcance de T-001 por
  decisión del usuario.

  Affected systems:
  - Editor (`src/lib/components`)
  - i18n (`src/lib/i18n`)

- [ ] T-003 - Tests que importan `createElenaProfile` inexistente - [Bug]
  `src/lib/connectors/draft.test.ts`, `src/lib/domain/defaults.test.ts` y
  `src/lib/render/render.test.ts` importan `createElenaProfile`, que
  `src/lib/domain/defaults.ts` no exporta (solo `createProfile`). Rompe `pnpm test`
  y `pnpm check`. Preexistente al commit inicial.

  Affected systems:
  - Tests (`src/lib/connectors`, `src/lib/domain`, `src/lib/render`)
