import type { CvDocument } from "../core/resolver";
import type { Template, TemplateOptions } from "../templates/types";
import { escapeHtml } from "./escape";

export interface RenderResult {
  /** HTML autocontenido con el body producido por la vista Svelte. */
  standalone: string;
  /** HTML que referencia css/style.css, para export como paquete. */
  indexHtml: string;
  /** CSS externo para el modo paquete. */
  styleCss: string;
}

/**
 * Envuelve el DOM serializado por el componente Svelte de la plantilla con la
 * estructura HTML necesaria para exportar e imprimir. Las secciones ya no se
 * construyen aquí.
 */
export function renderDocument(
  bodyHtml: string,
  doc: CvDocument,
  template: Template,
  options?: Partial<TemplateOptions>,
): RenderResult {
  const opts: TemplateOptions = { ...template.defaultOptions, ...options };
  const css = `html, body { margin: 0; padding: 0; }\n${template.css(opts)}`;
  const lang = escapeHtml(doc.lang);
  const title = escapeHtml(doc.title);

  const standalone = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${css}</style>
</head>
<body>${bodyHtml}</body>
</html>`;

  const indexHtml = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>${bodyHtml}</body>
</html>`;

  return { standalone, indexHtml, styleCss: css };
}
