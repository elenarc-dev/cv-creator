import type { CvDocument } from "../core/resolver";
/**
 * Opciones configurables de una plantilla. El layout vive en el componente y
 * en su hoja CSS; estos valores solo ajustan la presentación.
 */
export interface TemplateOptions {
  /** Color de acento principal. */
  accent: string;
  /** Familia tipográfica. */
  fontFamily: string;
  /** Tamaño base de fuente. */
  baseFontSize: string;
  /** Tamaño de página (A4, Letter...). */
  pageSize: string;
  /** Margen de página (para @page). */
  margin: string;
}

export interface TemplateComponentProps {
  doc: CvDocument;
  options: TemplateOptions;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  defaultOptions: TemplateOptions;
  /** CSS de la plantilla sin etiqueta <style>, resuelto con sus opciones. */
  css: (options: TemplateOptions) => string;
}
