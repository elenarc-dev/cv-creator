import en from "./en.json";
import es from "./es.json";

const dicts: Record<string, Record<string, string>> = { es, en };

let lang = $state("es");

/** Traduce una clave de la interfaz. Si falta, devuelve la clave. */
export function t(key: string): string {
  return dicts[lang]?.[key] ?? dicts.es[key] ?? key;
}

export function setLang(value: string): void {
  if (dicts[value]) lang = value;
}

export function getLang(): string {
  return lang;
}

export function langs(): string[] {
  return Object.keys(dicts);
}
