# CV Builder

Gestor de **perfil profesional reutilizable** de escritorio. Permite crear, editar,
gestionar y exportar currículums, manteniendo el contenido independiente de la
presentación: el mismo perfil genera distintas versiones (por puesto o idioma) con
distintas plantillas.

## Stack

- **Tauri 2** (Rust) — capa de sistema: archivos, backups, keyring.
- **SvelteKit + Svelte 5** (TypeScript, SPA estática) — dominio, render y UI.
- **Zod** — modelo de datos y validación.
- **Vitest** — tests de la lógica.

## Funcionalidades

- Perfil base reutilizable: personal, experiencia, proyectos, formación,
  tecnologías, idiomas, certificaciones y logros.
- Contenido multilingüe (`LocalizedString`) con interfaz en español/inglés.
- **Versiones de CV** por puesto/idioma, con selección de secciones, elementos y
  destacados (sin duplicar datos).
- **Plantillas** separadas de los datos (una columna y dos columnas).
- **Vista previa en vivo** (iframe) fiel al export final.
- **Exportación:** HTML autocontenido, HTML como paquete, PDF (impresión) y JSON (backup).
- **Importación:** JSON y Markdown.
- **CV orientado a ofertas:** matching de tecnologías y sugerencia de selección.
- Autosave con escritura atómica, backups versionados, undo/redo.

## Desarrollo

```bash
pnpm install        # dependencias
pnpm tauri dev      # arrancar la app
pnpm test           # tests (Vitest)
pnpm check          # typecheck (svelte-check)
cargo test          # tests de Rust (en src-tauri/)
```

## Arquitectura

Ver [`docs/architecture.md`](docs/architecture.md) para las decisiones de diseño (ADR).
