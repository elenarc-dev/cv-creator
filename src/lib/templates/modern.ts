import stylesheet from "./modern.css?raw";
import type { Template, TemplateOptions } from "./types";

function css(options: TemplateOptions): string {
  return stylesheet
    .replaceAll("__PAGE_SIZE__", options.pageSize)
    .replaceAll("__PAGE_MARGIN__", options.margin)
    .replaceAll("__FONT_FAMILY__", options.fontFamily)
    .replaceAll("__BASE_FONT_SIZE__", options.baseFontSize)
    .replaceAll("__ACCENT__", options.accent);
}

export const modern: Template = {
  id: "modern",
  name: "Moderno",
  description: "Diseño limpio de una columna",
  defaultOptions: {
    accent: "#2563eb",
    fontFamily: "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif",
    baseFontSize: "10.5pt",
    pageSize: "A4",
    margin: "15mm",
  },
  css,
};
