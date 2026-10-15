import stylesheet from "./elena-pdf.css?raw";
import type { Template, TemplateOptions } from "./types";

function css(options: TemplateOptions): string {
  return stylesheet
    .replaceAll("__PAGE_SIZE__", options.pageSize)
    .replaceAll("__PAGE_MARGIN__", options.margin)
    .replaceAll("__FONT_FAMILY__", options.fontFamily)
    .replaceAll("__BASE_FONT_SIZE__", options.baseFontSize)
    .replaceAll("__ACCENT__", options.accent);
}

export const elenaPdf: Template = {
  id: "elena-pdf",
  name: "Elena · PDF",
  description: "Diseño de dos columnas inspirado en el CV de Elena Raibal",
  defaultOptions: {
    accent: "#087fa9",
    fontFamily: '"Outfit", Arial, sans-serif',
    baseFontSize: "9.5pt",
    pageSize: "A4 portrait",
    margin: "0",
  },
  css,
};
