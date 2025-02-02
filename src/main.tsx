import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {  attachConsole } from '@tauri-apps/plugin-log';

// 启用 TargetKind::Webview 后，这个函数将把日志打印到浏览器控制台
const detach = await attachConsole();
// 将浏览器控制台与日志流分离
detach();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
