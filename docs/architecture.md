# Arquitectura — CV Builder

Gestor de perfil profesional reutilizable. Desktop, local-first.

## Decisiones (ADR)

### ADR-1: Modelo de datos como fuente de verdad
El contenido del CV es independiente de su presentación. El modelo (`src/lib/domain/schema.ts`)
es la única fuente de verdad; las plantillas, idiomas y versiones solo lo proyectan.

### ADR-2: Dominio y render en TypeScript; Rust para el sistema
- **TypeScript (frontend):** modelo, resolver, plantillas, render, exportadores, importadores, UI.
- **Rust (backend Tauri):** archivos, escritura atómica, backups, keyring, procesos.
Razón: las plantillas son HTML/CSS y la preview es un componente Svelte; mantener
modelo+render+UI en un mismo lenguaje evita duplicar el modelo.

### ADR-3: Pipeline único de renderizado
`Profile + CvVersion → Resolver → CvDocument → Template → HTML`.
Preview (iframe srcdoc), export HTML y PDF consumen **el mismo HTML**, garantizando
que lo que se ve es lo que se exporta.

### ADR-4: Persistencia en JSON workspace + assets
Un archivo `workspace.json` en el directorio de datos de la app, con escritura atómica
(temp + rename) y backups versionados con rotación. JSON es además el formato de
intercambio/backup principal.

### ADR-5: PDF por impresión del webview
El PDF se genera imprimiendo el mismo HTML (print CSS `@page A4`). Encapsulado en
`PdfExporter` para poder sustituirlo (p.ej. headless Chrome) sin tocar el resto.

### ADR-6: Plantillas como código, separadas de los datos
Cada plantilla es un módulo con `css()` y `body()` registrado por `id`. El layout vive
en código; los datos solo guardan el `templateId` y las opciones configurables.

### ADR-7: Conectores solo con API oficial
No se hace scraping/automatización sin una API oficial o mecanismo permitido. Un
conector sin API se marca "No disponible" y se ofrece exportación manual
(`src/lib/connectors/`).

### ADR-8: Secretos en el almacén seguro del SO
Los tokens/API keys se guardan en el keyring del sistema (Credential Manager, Keychain,
Secret Service), nunca en texto plano (`src-tauri/src/secrets.rs`).

### ADR-9: i18n separada del contenido
- Cadenas de la interfaz: `src/lib/i18n/{es,en}.json` (extensible).
- Contenido profesional: `LocalizedString`/`LocalizedList` en las entidades.

## Estructura

```
src/lib/
  domain/      modelo (Zod) + fábricas
  core/        resolver, matcher, selection, localize
  templates/   plantillas + registro + helpers
  render/      CvDocument → HTML
  export/      html / pdf / json
  import/      json / markdown
  connectors/  conectores de plataforma
  state/       store del workspace + historial
  i18n/        cadenas de interfaz
  tauri/       puente con comandos Tauri
  components/  UI (editor, preview, campos)
src-tauri/src/
  storage.rs   persistencia y backups
  secrets.rs   keyring
```

## Tests

- `pnpm test` (Vitest): resolver, matcher, importadores, render, historial.
- `cargo test` (en `src-tauri`): escritura atómica y rotación de backups.
- `pnpm check`: typecheck (svelte-check).
