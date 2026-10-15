import type { Lang, LocalizedList, LocalizedString } from "../domain/schema";

/**
 * Resuelve un texto localizado al idioma objetivo con fallback:
 * 1. idioma objetivo (si no está vacío)
 * 2. idiomas de fallback indicados
 * 3. cualquier idioma disponible no vacío
 * 4. cadena vacía
 */
export function localize(
  value: LocalizedString | undefined,
  lang: Lang,
  fallback: Lang[] = [],
): string {
  if (!value) return "";
  for (const l of [lang, ...fallback]) {
    const v = value[l];
    if (v && v.trim()) return v;
  }
  for (const l of Object.keys(value)) {
    const v = value[l];
    if (v && v.trim()) return v;
  }
  return "";
}

/** Ídem para listas localizadas. */
export function localizeList(
  value: LocalizedList | undefined,
  lang: Lang,
  fallback: Lang[] = [],
): string[] {
  if (!value) return [];
  for (const l of [lang, ...fallback]) {
    const v = value[l];
    if (v && v.length) return v;
  }
  for (const l of Object.keys(value)) {
    const v = value[l];
    if (v && v.length) return v;
  }
  return [];
}
