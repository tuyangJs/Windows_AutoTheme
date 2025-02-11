import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { attachConsole } from '@tauri-apps/plugin-log';
document.addEventListener('keydown', function (e) {
  if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault(); // 禁止刷新
  }
});
document.addEventListener('contextmenu', function (e) {
  const target = e.target;
  // @ts-ignore 如果目标是 input 元素且没有被禁用，则允许右键菜单
  if (target.tagName.toLowerCase() === 'input' && !target.disabled) {
    return;
  }
  // 其它情况（非 input 或 input 处于禁用状态）都阻止右键菜单
  e.preventDefault();
});

// 启用 TargetKind::Webview 后，这个函数将把日志打印到浏览器控制台
const detach = await attachConsole();
// 将浏览器控制台与日志流分离
detach();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
