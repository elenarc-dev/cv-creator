import type { Profile } from "../domain/schema";

/**
 * Convierte una entrada externa (JSON, Markdown, HTML...) en un `Profile`.
 * Implementaciones futuras: HTML, PDF (solo si es viable), estructurado.
 */
export interface Importer {
  id: string;
  name: string;
  parse(input: string): Profile;
}
