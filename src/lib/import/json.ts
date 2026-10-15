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

/** Convierte una cadena JSON en un `Profile` validado. Lanza si no es válido. */
export function parseProfile(json: string): ProfileType {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("El archivo no contiene JSON válido.");
  }
  const result = Profile.safeParse(data);
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
