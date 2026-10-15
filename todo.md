# CV Builder — Plan de desarrollo

Gestor de perfil profesional reutilizable. Desktop, local-first.

## Stack y decisiones de arquitectura

- **Stack:** Tauri 2 (Rust) + SvelteKit/Svelte 5 (TypeScript), SPA estática.
- **Dominio + render en TypeScript.** Rust = capa de sistema (archivos, keyring, procesos).
- **Persistencia:** JSON workspace, escritura atómica, backups versionados.
- **PDF:** impresión desde webview (print CSS `@page A4`), encapsulado en `PdfExporter`.
- **Plantillas:** HTML/CSS standalone; `TemplateRegistry` por `id`.
- **Pipeline único:** `Profile + CvVersion → Resolver → CvDocument → Template → HTML → (Preview | HTML | PDF)`.
- **Modelo validado con Zod.**
- **i18n:** cadenas de la app separadas (`es`, `en`). Contenido vía `LocalizedString`.
- **Privacidad:** nada sale del equipo sin consentimiento; secretos en keyring; sin logs de datos personales.

Ver `docs/architecture.md` para los ADRs.

---

## Fase 0 — Preparación

- [x] Entender estructura del repo.
- [x] Limpiar scaffold de ejemplo (`greet`).
- [x] Añadir Vitest y Zod.
- [x] Añadir `tauri-plugin-dialog` (Rust + npm).
- [x] Estructura de carpetas `src/lib/`.

## Fase 1 — MVP

- [x] Dominio: esquemas Zod + fábricas/defaults.
- [x] Rust: workspace atómico, backups, archivos, data URI.
- [x] Resolver (función pura) + tests.
- [x] `TemplateRegistry` + plantilla "modern" + render + tests.
- [x] Preview: `iframe srcdoc` en vivo.
- [x] `HtmlExporter` (autocontenido + paquete).
- [x] `PdfExporter` (impresión).
- [x] `JsonExporter`/`JsonImporter` (round-trip + tests).
- [x] Importador Markdown (best-effort).
- [x] UI editor: formularios + panel preview.
- [x] Autosave + undo/redo.
- [x] i18n de la app (es/en).

## Fase 2 — Plantillas, versiones, idiomas

- [x] Segunda plantilla (dos columnas) + selector.
- [x] Gestión de versiones (crear/renombrar/duplicar/eliminar).
- [x] Selección de secciones: activas, orden, visibilidad.
- [x] Selección de elementos por versión.
- [x] Destacados (skills / experiencias / proyectos).
- [ ] Overrides por versión en la UI (el modelo/resolver ya lo soportan).
- [x] Contenido multilingüe en el editor.
- [x] Conmutador de idioma de la app.

## Fase 3 — CV orientado a ofertas

- [x] Modelo `JobOffer`.
- [x] Matcher: tecnologías coincidentes/faltantes, relevancia, score.
- [x] Comparación CV ↔ oferta en la UI.
- [x] Aplicar coincidencias a una versión.

## Fase 4 — Extras

- [x] Interfaz `PlatformConnector` + regla de no-scraping.
- [x] Almacenamiento seguro de credenciales (keyring del SO).
- [ ] Módulo IA opcional (interfaz desacoplada).
- [ ] Publicación de CV online (solo si hay API oficial).
- [ ] Cartas de presentación.
- [ ] Estadísticas de candidaturas.
- [ ] Importación desde LinkedIn (solo si existe mecanismo permitido).

## Deuda técnica / mejoras pendientes

- [ ] Overrides por versión en la UI.
- [ ] Importadores HTML y PDF (PDF solo si es viable).
- [ ] Más tests de integración y de componentes.
- [ ] Documentar el flujo de "primer arranque" (workspace vacío).
