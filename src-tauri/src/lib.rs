mod secrets;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            storage::load_workspace,
            storage::save_workspace,
            storage::create_backup,
            storage::list_backups,
            storage::restore_backup,
            storage::read_text_file,
            storage::write_text_file,
            storage::read_file_as_data_uri,
            secrets::set_secret,
            secrets::get_secret,
            secrets::delete_secret,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
