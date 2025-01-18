use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tokio::time::{sleep, Duration};
use chrono::{NaiveDateTime, Local, NaiveTime, Timelike};
use std::sync::Arc;
use tauri::command;
use std::process::Command;
use std::fs::File;
use std::io::Write;

const REGKEY_THEME_PERSONALIZE: &str = r"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize";
const REGNAME_TASKBAR_TRAY: &str = "SystemUsesLightTheme";
const REGNAME_APP_LIGHT_THEME: &str = "AppsUseLightTheme";
#[command]
async  fn set_system_theme(is_light: bool) {
    println!("Theme light mode: {}", is_light);
    // 定义浅色模式（1）和深色模式（0）
    let theme_value = if is_light { 1 } else { 0 };
     // 打印 theme_value
     println!("Theme value: {}", theme_value);
    // 打开注册表
    let reg_path = REGKEY_THEME_PERSONALIZE;
    let reg_key = REGNAME_TASKBAR_TRAY;

    // 使用 PowerShell 来修改系统主题
    let command = format!(
        "powershell Set-ItemProperty -Path 'HKCU:\\{}' -Name '{}' -Value {}",
        reg_path, reg_key, theme_value
    );

    // 执行命令
    let _output = Command::new("powershell")
        .arg("-Command")
        .arg(command)
        .output()
        .expect("Failed to execute PowerShell command");

    // 更改另一个相关注册表键
    let app_key = REGNAME_APP_LIGHT_THEME;
    let command_app = format!(
        "powershell Set-ItemProperty -Path 'HKCU:\\{}' -Name '{}' -Value {}",
        reg_path, app_key, theme_value
    );

    // 执行命令
    let _output_app = Command::new("powershell")
        .arg("-Command")
        .arg(command_app)
        .output()
        .expect("Failed to execute PowerShell command for apps");

    println!("System theme changed to {}", if is_light { "Light" } else { "Dark" });
}
fn parse_time(time_str: &str) -> NaiveTime {
    NaiveTime::parse_from_str(time_str, "%H:%M").unwrap()
}

// 任务类型枚举
#[derive(Debug)]
enum TaskType {
    TypeA,
    TypeB,
    TypeC,
}

impl std::str::FromStr for TaskType {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "TypeA" => Ok(TaskType::TypeA),
            "TypeB" => Ok(TaskType::TypeB),
            "TypeC" => Ok(TaskType::TypeC),
            _ => Err(()),
        }
    }
}

// 任务管理结构体
struct TaskManager {
    tasks: Arc<Mutex<Vec<JoinHandle<()>>>>,  // 存储任务的句柄
}

impl TaskManager {
    fn new() -> Self {
        TaskManager {
            tasks: Arc::new(Mutex::new(Vec::new())),
        }
    }

    // 添加定时任务
    fn add_task(&self, times: Vec<&str>, task_type: String) {
        let _tasks = self.tasks.clone();  // 只是为了消除警告
        let times_owned = times.into_iter().map(|s| s.to_string()).collect::<Vec<String>>();
        let task_type: TaskType = task_type.parse().unwrap_or(TaskType::TypeA); // 默认为 TypeA

        tokio::spawn(async move {
            for time_str in times_owned {
                let target_time = parse_time(&time_str);
                let current_time = Local::now().naive_local().time();
                let delay_duration = if current_time > target_time {
                    let target_datetime = NaiveDateTime::new(
                        Local::now().naive_local().date(),
                        target_time,
                    );
                    target_datetime.signed_duration_since(Local::now().naive_local())
                } else {
                    NaiveDateTime::new(Local::now().naive_local().date(), target_time)
                        .signed_duration_since(Local::now().naive_local())
                };

                // 延迟任务执行
                let delay_ms = delay_duration.num_milliseconds();
                println!("Task will run at: {} with type {:?}", target_time, task_type);

                sleep(Duration::from_millis(delay_ms as u64)).await;
                println!("Task executed at: {} with type {:?}", target_time, task_type);

                // 根据 task_type 处理任务类型
                match task_type {
                    TaskType::TypeA => {
                        println!("Executing TypeA task at: {}", target_time);
                    }
                    TaskType::TypeB => {
                        println!("Executing TypeB task at: {}", target_time);
                    }
                    TaskType::TypeC => {
                        println!("Executing TypeC task at: {}", target_time);
                    }
                }
            }
        });
    }

    // 清除任务
    async fn clear_tasks(&self) {
        let mut tasks = self.tasks.lock().await;
        tasks.clear();  // 清除任务
        println!("All tasks cleared");
    }
}

#[command]
fn greet(name: String) -> String {
    format!("Hello, {}", name)
}

#[command]
fn add_task(times: Vec<&str>, task_type: String) {
    let task_manager = TaskManager::new();
    task_manager.add_task(times, task_type);
}

#[command]
async fn clear_tasks() {
    let task_manager = TaskManager::new();
    task_manager.clear_tasks().await;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let task_manager = TaskManager::new();

    // 显式创建 Tokio 运行时
    let rt = tokio::runtime::Runtime::new().unwrap();

    rt.block_on(async {
        tauri::Builder::default()
            .plugin(tauri_plugin_http::init())
            .plugin(tauri_plugin_opener::init())
            .invoke_handler(tauri::generate_handler![greet, add_task, clear_tasks,set_system_theme])
            .setup(move |_app| {  // 添加 move，解决生命周期问题
                // 这里是示例调用，实际中可以通过前端传递
                task_manager.add_task(vec!["12:00", "14:30", "17:45"], "TypeB".to_string());

                Ok(())
            })
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
    });
}
