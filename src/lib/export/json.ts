import type { Profile } from "../domain/schema";
import { saveTextFileDialog } from "../tauri/io";

export function profileToJson(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

/** Abre diálogo y guarda el perfil completo como JSON (backup/intercambio). */
export async function exportProfileJson(profile: Profile): Promise<string | null> {
  let json = profileToJson(profile)
  console.log(json)
  return saveTextFileDialog(json, {
    defaultName: "perfil.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
}
