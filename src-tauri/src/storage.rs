use base64::engine::general_purpose::STANDARD;
use base64::Engine as _;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

const WORKSPACE_FILE: &str = "workspace.json";
const BACKUP_DIR: &str = "backups";
const MAX_BACKUPS: usize = 20;

#[derive(Serialize)]
pub struct BackupInfo {
    pub name: String,
    pub modified_ms: u64,
    pub size: u64,
}

fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

fn workspace_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join(WORKSPACE_FILE))
}

fn backups_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(data_dir(app)?.join(BACKUP_DIR))
}

/// Escritura atómica: escribe en un temporal y renombra, para no corromper
/// el workspace si el proceso se interrumpe a mitad de escritura.
fn atomic_write(path: &Path, contents: &str) -> Result<(), String> {
    let dir = path
        .parent()
        .ok_or_else(|| "ruta sin directorio padre".to_string())?;
    fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, contents).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())?;
    Ok(())
}

fn modified_ms(path: &Path) -> u64 {
    fs::metadata(path)
        .and_then(|m| m.modified())
        .ok()
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[tauri::command]
pub fn load_workspace(app: AppHandle) -> Result<Option<String>, String> {
    let path = workspace_path(&app)?;
    match fs::read_to_string(&path) {
        Ok(content) => Ok(Some(content)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn save_workspace(app: AppHandle, json: String) -> Result<(), String> {
    // Validar antes de escribir para no corromper el workspace.
    serde_json::from_str::<serde_json::Value>(&json).map_err(|e| format!("JSON inválido: {e}"))?;
    let path = workspace_path(&app)?;
    atomic_write(&path, &json)
}

#[tauri::command]
pub fn create_backup(app: AppHandle) -> Result<String, String> {
    let path = workspace_path(&app)?;
    let content = match fs::read_to_string(&path) {
        Ok(c) => c,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            return Err("no hay workspace que respaldar".to_string())
        }
        Err(e) => return Err(e.to_string()),
    };
    let dir = backups_dir(&app)?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let name = format!("backup-{}.json", now_millis());
    fs::write(dir.join(&name), content).map_err(|e| e.to_string())?;
    prune_backups(&dir)?;
    Ok(name)
}

#[tauri::command]
pub fn list_backups(app: AppHandle) -> Result<Vec<BackupInfo>, String> {
    let dir = backups_dir(&app)?;
    if !dir.exists() {
        return Ok(vec![]);
    }
    let mut out = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        if !path.is_file() {
            continue;
        }
        let meta = fs::metadata(&path).map_err(|e| e.to_string())?;
        out.push(BackupInfo {
            name: entry.file_name().to_string_lossy().to_string(),
            modified_ms: modified_ms(&path),
            size: meta.len(),
        });
    }
    out.sort_by(|a, b| b.modified_ms.cmp(&a.modified_ms));
    Ok(out)
}

#[tauri::command]
pub fn restore_backup(app: AppHandle, filename: String) -> Result<String, String> {
    // Usar solo el nombre base evita path traversal.
    let name = Path::new(&filename)
        .file_name()
        .ok_or_else(|| "nombre de backup inválido".to_string())?
        .to_string_lossy()
        .to_string();
    let src = backups_dir(&app)?.join(&name);
    let content = fs::read_to_string(&src).map_err(|e| e.to_string())?;
    serde_json::from_str::<serde_json::Value>(&content)
        .map_err(|e| format!("JSON inválido: {e}"))?;
    atomic_write(&workspace_path(&app)?, &content)?;
    Ok(content)
}

#[tauri::command]
pub fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(p, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file_as_data_uri(path: String) -> Result<String, String> {
    let p = Path::new(&path);
    let bytes = fs::read(p).map_err(|e| e.to_string())?;
    let b64 = STANDARD.encode(bytes);
    Ok(format!("data:{};base64,{b64}", mime_from_path(p)))
}

fn mime_from_path(path: &Path) -> &'static str {
    match path
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .as_deref()
    {
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        Some("ico") => "image/x-icon",
        _ => "application/octet-stream",
    }
}

fn prune_backups(dir: &Path) -> Result<(), String> {
    let mut entries = fs::read_dir(dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().is_file())
        .collect::<Vec<_>>();
    entries.sort_by_key(|e| modified_ms(&e.path()));
    while entries.len() > MAX_BACKUPS {
        if let Some(oldest) = entries.first() {
            fs::remove_file(oldest.path()).ok();
            entries.remove(0);
        } else {
            break;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(tag: &str) -> PathBuf {
        std::env::temp_dir().join(format!("cv-creator-{tag}-{}", now_millis()))
    }

    #[test]
    fn atomic_write_crea_y_reemplaza() {
        let dir = temp_dir("atomic");
        let file = dir.join("workspace.json");
        atomic_write(&file, "{\"v\":1}").unwrap();
        assert_eq!(fs::read_to_string(&file).unwrap(), "{\"v\":1}");
        atomic_write(&file, "{\"v\":2}").unwrap();
        assert_eq!(fs::read_to_string(&file).unwrap(), "{\"v\":2}");
        fs::remove_dir_all(&dir).ok();
    }

    #[test]
    fn prune_backups_mantiene_el_maximo() {
        let dir = temp_dir("backups");
        fs::create_dir_all(&dir).unwrap();
        for i in 0..(MAX_BACKUPS + 5) {
            fs::write(dir.join(format!("backup-{i}.json")), "{}").unwrap();
        }
        prune_backups(&dir).unwrap();
        let count = fs::read_dir(&dir).unwrap().count();
        assert_eq!(count, MAX_BACKUPS);
        fs::remove_dir_all(&dir).ok();
    }
}
