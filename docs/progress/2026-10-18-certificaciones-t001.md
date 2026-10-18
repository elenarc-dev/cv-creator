---
type: progress
project: cv-creator
created: 2026-10-18
updated: 2026-10-18
status: completed
tags: [progress]
---

# Certificaciones (T-001)

## Objective

Añadir el apartado de certificaciones al CV como categoría de información al mismo
nivel que experiencia, proyectos o formación, con su UI de edición, el sello de imagen
en el render y la migración del campo `document` a `image` para workspaces ya guardados.

## Work Completed

- `src/lib/domain/schema.ts`: en `Certification`, el campo `document` pasa a llamarse
  `image` (opcional, `z.string().optional()`).
- `src/lib/domain/defaults.ts`: `createCertification()` devuelve `image: undefined`
  en lugar de `document: undefined`.
- `src/lib/import/json.ts`: nueva función `migrateLegacyFields()` invocada desde
  `parseProfile()`; si una certificación guardada trae `document` y no `image`, lo
  copia a `image` y borra `document`. No se incrementa `SCHEMA_VERSION` (compatibilidad
  hacia atrás en workspaces ya guardados).
- `src/lib/import/json.test.ts`: nuevo test "migra el campo `document` de certificaciones
  a `image`".
- `src/lib/core/resolver.ts`: `ResolvedCertification` incorpora `image?: string` y
  `resolveCertification()` la mapea.
- `src/lib/templates/components/CvItem.svelte`: en la rama `certification` se pinta el
  sello `<img class="cv-cert-badge">` cuando existe la imagen; el contenido se envuelve
  en `.cv-entry-body` dentro de `article.cv-entry--cert`.
- `src/lib/templates/{modern,sidebar,elena-pdf}.css`: estilos de `.cv-entry--cert` (flex)
  y `.cv-cert-badge` (miniatura cuadrada: 44px modern, 34px sidebar, 30px elena-pdf,
  `object-fit: contain`).
- `src/lib/components/editors/CertificationsEditor.svelte`: nuevo editor. Campos:
  `name` (Título), `organization` (Empresa), `issueDate` (Fecha de expedición,
  `DateInput`), `expiryDate` (Fecha de caducidad, `DateInput`, opcional para certificados
  lifetime), `credentialId` (ID de credencial), `url` (Enlace, placeholder `https://`) e
  `image` (preview `img.photo-preview` + botones elegir/quitar vía `openImageDialog()`,
  que devuelve un data URI). Sigue el patrón de `LanguagesEditor.svelte`: botón añadir,
  botón eliminar por tarjeta y `workspace.commit()` en `onchange`/tras elegir imagen.
- `src/lib/components/Editor.svelte`: nueva pestaña `certifications`
  (`labelKey: "editor.tabs.certifications"`) entre `languages` y `version`. No se ha
  añadido la pestaña de logros.
- `src/lib/i18n/es.json` y `en.json`: nuevas claves `fields.issueDate`,
  `fields.expiryDate`, `fields.credentialId`, `fields.image`, `fields.imagePick`,
  `fields.imageRemove`.

Decisiones del usuario:

- El campo de imagen se llama `image` (antes `document`).
- `expiryDate` se conserva y es opcional (certificados sin caducidad).
- Los logros (`achievements`) NO se abordan en T-001: siguen con modelo e i18n pero sin
  editor (quedan como T-002).

## Current State & Verified Behavior

Verificado el 2026-10-18 con los siguientes comandos y resultados literales:

- `pnpm vitest run src/lib/import/json.test.ts` → 4 tests pasan.
- `pnpm test` → `Test Files 3 failed | 6 passed (9)`, `Tests 3 failed | 27 passed (30)`.
  Los 3 fallos son ajenos a T-001 y preexistentes: `TypeError: createElenaProfile is not
  a function` en `src/lib/connectors/draft.test.ts`, `src/lib/domain/defaults.test.ts` y
  `src/lib/render/render.test.ts`. Confirmado preexistente: `createElenaProfile` no existe
  ni en el commit HEAD ni en el árbol, esos ficheros de test no están modificados, y
  `defaults.ts` solo exporta `createProfile`.
- `pnpm check` → `svelte-check found 3 errors and 0 warnings in 3 files`; los 3 errores
  son los mismos `createElenaProfile`. Cero errores nuevos por T-001.

No verificado:

- No se ha hecho prueba manual en la app (crear certificación, previsualizar con las 3
  plantillas, exportar HTML/PDF): sigue pendiente.

## Problems & Blockers

- Sin bloqueos para T-001.
- Los tres fallos de `pnpm test`/`pnpm check` son preexistentes (`createElenaProfile`)
  y se han tramitado como T-003.

## Next Steps

- Prueba manual de certificaciones en la app: crear una certificación, rellenar sus
  campos, verla en preview con las 3 plantillas y exportar HTML/PDF.
- T-002: editor y pestaña del apartado de logros (`achievements`).
- T-003: corregir los tests que importan `createElenaProfile`.
