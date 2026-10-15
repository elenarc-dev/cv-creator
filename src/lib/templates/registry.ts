import { elenaPdf } from "./elena-pdf";
import { modern } from "./modern";
import { sidebar } from "./sidebar";
import type { Template } from "./types";

const templates: Template[] = [modern, sidebar, elenaPdf];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function listTemplates(): Template[] {
  return templates;
}

/** Registra una plantilla nueva si su id no existe. */
export function registerTemplate(template: Template): void {
  if (!templates.some((t) => t.id === template.id)) {
    templates.push(template);
  }
}
