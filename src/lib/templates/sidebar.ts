import stylesheet from "./sidebar.css?raw";
import type { Template, TemplateOptions } from "./types";

function css(options: TemplateOptions): string {
  return stylesheet
    .replaceAll("__PAGE_SIZE__", options.pageSize)
    .replaceAll("__PAGE_MARGIN__", options.margin)
    .replaceAll("__FONT_FAMILY__", options.fontFamily)
    .replaceAll("__BASE_FONT_SIZE__", options.baseFontSize)
    .replaceAll("__ACCENT__", options.accent);
}

export const sidebar: Template = {
  id: "sidebar",
  name: "Dos columnas",
  description: "Barra lateral con competencias y columna principal",
  defaultOptions: {
    accent: "#0f766e",
    fontFamily: "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
    baseFontSize: "10pt",
    pageSize: "A4",
    margin: "12mm",
  },
  css,
};
