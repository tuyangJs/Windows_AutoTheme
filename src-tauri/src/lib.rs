use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::ptr;
use tauri::command;
use tauri::{AppHandle, Manager};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{Target, TargetKind};
use tokio::time::{sleep, Duration};
use winapi::shared::minwindef::{DWORD, HKEY};
use winapi::shared::winerror::ERROR_SUCCESS;
use winapi::um::winreg::{RegOpenKeyExW, RegSetValueExW, HKEY_CURRENT_USER};
use winapi::{
    ctypes::c_void,
    um::winuser::{SendMessageTimeoutW, HWND_BROADCAST, WM_SETTINGCHANGE},
};

fn show_window(app: &AppHandle) {
    let windows = app.webview_windows();
    if let Some(window) = windows.values().next() {
        if let Err(e) = window.show() {
            eprintln!("无法显示窗口: {}", e);
        }
        if let Err(e) = window.set_focus() {
            eprintln!("无法设置窗口焦点: {}", e);
        }
    }
}

async fn notify_system_theme_changed() {
    unsafe {
        let wparam = 0;
        let flags = 0x0002;
        let wide_str: Vec<u16> = "ImmersiveColorSet\0".encode_utf16().collect();
        let lparam_wide = wide_str.as_ptr() as *const c_void;

        SendMessageTimeoutW(
            HWND_BROADCAST,
            WM_SETTINGCHANGE,
            wparam as usize,
            lparam_wide as isize,
            flags,
            1000,
            ptr::null_mut(),
        );
    }
}

fn set_registry_value(reg_path: &str, value_name: &str, value: u32) -> Result<(), String> {
    unsafe {
        let reg_path_wide: Vec<u16> = OsStr::new(reg_path).encode_wide().chain(Some(0)).collect();
        let value_name_wide: Vec<u16> = OsStr::new(value_name)
            .encode_wide()
            .chain(Some(0))
            .collect();

        let mut hkey: HKEY = ptr::null_mut();
        let status = RegOpenKeyExW(
            HKEY_CURRENT_USER,
            reg_path_wide.as_ptr(),
            0,
            winapi::um::winnt::KEY_SET_VALUE,
            &mut hkey,
        );

        if status != ERROR_SUCCESS as i32 {
            return Err(format!(
                "Failed to open registry key. Error code: {}",
                status
            ));
        }

        let result = RegSetValueExW(
            hkey,
            value_name_wide.as_ptr(),
            0,
            winapi::um::winnt::REG_DWORD,
            &value as *const u32 as *const u8,
            std::mem::size_of::<u32>() as DWORD,
        );

        if result != ERROR_SUCCESS as i32 {
            return Err(format!(
                "Failed to set registry value. Error code: {}",
                result
            ));
        }

        Ok(())
    }
}

#[command]
async fn set_system_theme(is_light: bool) {
    let theme_value = if is_light { 1 } else { 0 };
    let reg_path = "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize";

    for reg_key in ["SystemUsesLightTheme", "AppsUseLightTheme"] {
        if let Err(e) = set_registry_value(reg_path, reg_key, theme_value) {
            eprintln!("Error setting registry value '{}': {}", reg_key, e);
        }
    }
    notify_system_theme_changed().await;
    sleep(Duration::from_millis(10)).await;
    notify_system_theme_changed().await;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        tauri::Builder::default()
            .plugin(
                tauri_plugin_log::Builder::new()
                    .targets([
                        Target::new(TargetKind::Folder {
                            path:  std::path::PathBuf::from("/logs"),
                            file_name: Some("app.log".to_string()),
                        }),
                        Target::new(TargetKind::Stdout),
                        Target::new(TargetKind::LogDir { file_name: None }),
                        Target::new(TargetKind::Webview),
                    ])
                    .build(),
            )
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                show_window(app);
            }))
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                None,
            ))
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_opener::init())
            .invoke_handler(tauri::generate_handler![set_system_theme])
            .setup(|_app| Ok(()))
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
