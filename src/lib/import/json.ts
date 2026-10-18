import type { ZodError } from "zod";
import { Profile } from "../domain/schema";
import type { Profile as ProfileType } from "../domain/schema";
import { openTextFileDialog } from "../tauri/io";
import type { Importer } from "./types";

function formatIssues(error: ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
    .join("; ");
}

/**
 * Normaliza datos guardados por versiones anteriores, donde el campo de imagen
 * de una certificación se llamaba `document`. Se migra a `image` sin tocar
 * `SCHEMA_VERSION` porque el campo es opcional.
 */
function migrateLegacyFields(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;
  const draft = data as { certifications?: unknown };
  if (!Array.isArray(draft.certifications)) return data;
  for (const item of draft.certifications) {
    if (typeof item !== "object" || item === null) continue;
    const cert = item as { document?: unknown; image?: unknown };
    if (cert.image === undefined && cert.document !== undefined) {
      cert.image = cert.document;
    }
    delete cert.document;
  }
  return data;
}

/** Convierte una cadena JSON en un `Profile` validado. Lanza si no es válido. */
export function parseProfile(json: string): ProfileType {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }
  const result = Profile.safeParse(migrateLegacyFields(data));
  if (!result.success) {
    throw new Error(`Estructura de perfil no válida: ${formatIssues(result.error)}`);
  }
  return result.data;
}

export const jsonImporter: Importer = {
  id: "json",
  name: "JSON",
  parse: parseProfile,
};

/** Abre un diálogo, lee un JSON y lo convierte en `Profile`. */
export async function importProfileFromFile(): Promise<ProfileType | null> {
  const result = await openTextFileDialog({
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (!result) return null;
  return parseProfile(result.content);
}
