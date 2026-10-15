import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export interface BackupInfo {
  name: string;
  modified_ms: number;
  size: number;
}

export interface DialogFilter {
  name: string;
  extensions: string[];
}

// ---------- workspace ----------

export function loadWorkspace(): Promise<string | null> {
  return invoke<string | null>("load_workspace");
}

export function saveWorkspace(json: string): Promise<void> {
  return invoke("save_workspace", { json });
}

export function createBackup(): Promise<string> {
  return invoke<string>("create_backup");
}

export function listBackups(): Promise<BackupInfo[]> {
  return invoke<BackupInfo[]>("list_backups");
}

export function restoreBackup(name: string): Promise<string> {
  return invoke<string>("restore_backup", { filename: name });
}

// ---------- archivos ----------

export function readTextFile(path: string): Promise<string> {
  return invoke<string>("read_text_file", { path });
}

export function writeTextFile(path: string, content: string): Promise<void> {
  return invoke("write_text_file", { path, content });
}

export function readFileAsDataUri(path: string): Promise<string> {
  return invoke<string>("read_file_as_data_uri", { path });
}

// ---------- diálogos ----------

export async function saveTextFileDialog(
  content: string,
  options: { defaultName?: string; filters?: DialogFilter[] } = {},
): Promise<string | null> {
  const path = await save({
    defaultPath: options.defaultName,
    filters: options.filters,
  });
  if (!path) return null;
  await writeTextFile(path, content);
  return path;
}

export async function openTextFileDialog(
  options: { filters?: DialogFilter[] } = {},
): Promise<{ path: string; content: string } | null> {
  const selected = await open({ multiple: false, filters: options.filters });
  const path = typeof selected === "string" ? selected : null;
  if (!path) return null;
  const content = await readTextFile(path);
  return { path, content };
}

export async function openImageDialog(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      { name: "Imágenes", extensions: ["png", "jpg", "jpeg", "webp", "gif", "svg"] },
    ],
  });
  const path = typeof selected === "string" ? selected : null;
  if (!path) return null;
  return readFileAsDataUri(path);
}

export async function openDirectoryDialog(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false });
  return typeof selected === "string" ? selected : null;
}
