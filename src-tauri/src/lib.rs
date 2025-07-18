use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::ptr;
use std::sync::Mutex;
use tauri::command;
use tauri::window::{Effect, EffectState, EffectsBuilder};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, TrayIcon, TrayIconBuilder, TrayIconEvent},
};
use tauri::{AppHandle, Emitter, Manager, State};
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
struct AppState {
    tray: Mutex<Option<TrayIcon>>,
}
fn show_window(app: &AppHandle) {
    let windows = app.webview_windows();
    if let Some(window) = windows.values().next() {
        if let Err(e) = window.show() {
            eprintln!("无法显示窗口: {}", e);
        }
        if let Err(e) = window.unminimize() {
            eprintln!("无法解除窗口最小化: {}", e);
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
    tokio::spawn(async move {
        sleep(Duration::from_millis(155)).await;
        notify_system_theme_changed().await;
    });
} //
fn send_event(app_handle: &AppHandle) {
    app_handle.emit("close-app", "quit").unwrap();
    let app_handle_clone = app_handle.clone();
    // 等待 3 秒
    tokio::spawn(async move {
        sleep(Duration::from_millis(3000)).await;
        app_handle_clone.exit(0);
        // 如果到达 3 秒后，程序还未结束，强制退出
    });
}
fn create_system_tray(app: &AppHandle) -> tauri::Result<()> {
    let quit_i = MenuItem::with_id(app, "quit", "quit", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "show", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &quit_i])?;
    let trays = TrayIconBuilder::new()
        .menu(&menu)
        .icon(app.default_window_icon().unwrap().clone())
        .show_menu_on_left_click(false)
        .tooltip("Auto Theme Switching App")
        .on_menu_event(|tray, event| match event.id.as_ref() {
            "quit" => {
                println!("通知前端关闭应用...");
                send_event(tray.app_handle());
            }
            "show" => {
                show_window(&tray.app_handle());
            }
            "switch" => {
                println!("切换系统主题...");
                tray.app_handle().emit("switch", "switch").unwrap();
            }
            _ => {
                println!("menu item {:?} not handled", event.id);
            }
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::DoubleClick {
                button: MouseButton::Left,
                ..
            } => {
                println!("托盘图标被左键双击");
                show_window(&tray.app_handle());
            }
            _ => {}
        })
        .build(app)?;
    let state: State<AppState> = app.state();
    let mut tray_lock = state.tray.lock().unwrap();
    *tray_lock = Some(trays);
    Ok(())
}
#[tauri::command]
fn update_tray_menu_item_title(
    app: tauri::AppHandle,
    quit: String,
    show: String,
    tooltip: String,
    switch: String,
) {
    let app_handle = app.app_handle();
    let state: State<AppState> = app.state();
    // 获取托盘
    let mut tray_lock = state.tray.lock().unwrap();
    let tray = match tray_lock.as_mut() {
        Some(tray) => tray,
        None => {
            eprintln!("Tray icon not found");
            return;
        }
    };

    // 创建菜单项
    let quit_i = match MenuItem::with_id(app_handle, "quit", quit, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单项
    let show_i = match MenuItem::with_id(app_handle, "show", show, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单项
    let switch = match MenuItem::with_id(app_handle, "switch", switch, true, None::<&str>) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    let separator = match PredefinedMenuItem::separator(app_handle) {
        Ok(item) => item,
        Err(e) => {
            eprintln!("Failed to create menu item: {}", e);
            return;
        }
    };
    // 创建菜单
    let menu = match Menu::with_items(app_handle, &[&show_i, &switch, &separator, &quit_i]) {
        Ok(menu) => menu,
        Err(e) => {
            eprintln!("Failed to create menu: {}", e);
            return;
        }
    };
    // 设置菜单
    if let Err(e) = tray.set_menu(Some(menu)) {
        eprintln!("Failed to set tray menu: {}", e);
    } else {
        println!("菜单项标题已更新");
    }
    if let Err(e) = tray.set_tooltip(Some(tooltip)) {
        eprintln!("Failed to set tray menu: {}", e);
    } else {
        println!("托盘标题已更新");
    }
}
#[tauri::command]
fn is_running_in_msix() -> bool {
  if let Ok(exe_path) = std::env::current_exe() {
    if let Some(dir) = exe_path.parent() {
      let dir_str = dir.to_string_lossy().to_lowercase();
      return dir_str.starts_with(r"c:\program files\windowsapps");
    }
  }
  false
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let rt = tokio::runtime::Runtime::new().unwrap();
    rt.block_on(async {
        tauri::Builder::default()
            .plugin(tauri_plugin_os::init())
            .plugin(
                tauri_plugin_log::Builder::new()
                    .targets([
                        Target::new(TargetKind::Folder {
                            path: std::path::PathBuf::from("/logs"),
                            file_name: Some("app.log".to_string()),
                        }),
                        Target::new(TargetKind::Stdout),
                        Target::new(TargetKind::LogDir { file_name: None }),
                        Target::new(TargetKind::Webview),
                    ])
                    .build(),
            )
            .setup(|app| -> Result<(), Box<dyn std::error::Error>> {
                let app_handle = app.handle();
                let main_window = app_handle
                    .get_webview_window("main")
                    .expect("Failed to get the main window");
                main_window.hide().expect("Failed to hide the window");
                main_window
                    .set_always_on_top(false)
                    .expect("Failed to set always on top");
                main_window
                    .set_effects(
                        EffectsBuilder::new()
                            .effect(Effect::Mica)
                            .state(EffectState::FollowsWindowActiveState)
                            .build(),
                    )
                    .expect("Failed to set window effect");
                main_window.set_shadow(true).expect("Failed to set shadow");
                create_system_tray(&app_handle)?;
                Ok(())
            })
            .plugin(tauri_plugin_persisted_scope::init())
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
            .manage(AppState {
                tray: Mutex::new(None),
            })
            .invoke_handler(tauri::generate_handler![
                set_system_theme,
                update_tray_menu_item_title,
                is_running_in_msix
            ])
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
