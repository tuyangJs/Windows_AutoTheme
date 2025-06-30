import { Window as appwin } from '@tauri-apps/api/window'; // 引入 appWindow
import { Webview } from "@tauri-apps/api/webview";

declare global {
  interface Window {
    appWindow: appwin;
    Webview:Webview
  }
}