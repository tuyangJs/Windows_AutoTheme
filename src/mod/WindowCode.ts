import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect } from "react";
import { Window, Effect } from '@tauri-apps/api/window'; // 引入 appWindow
import { AppDataType } from "../Type";
import { listen } from "@tauri-apps/api/event";
import { saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";
const appWindow = new Window('main');
//隐藏窗口
appWindow.onCloseRequested(e => {
  e.preventDefault()
  setTimeout(() => {
    appWindow.hide()
    Webview.hide()
    saveWindowState(StateFlags.ALL)
  }, 22);
})

const Webview = await getCurrentWebview()
listen("show-app", async () => {
  console.log("显示程序");
  Webview.show()
});

listen("close-app", async () => {
  console.log("收到后端关闭指令，正在退出应用...");
  appWindow.hide()
  Webview.hide()
  saveWindowState(StateFlags.ALL)
  await appWindow.destroy();
});
export const WindowBg = (AppData: AppDataType, themeDack: boolean) => {
  if (AppData?.winBgEffect) {
    const types = AppData.winBgEffect === 'Acrylic' ? Effect.Acrylic : (themeDack ? Effect.Mica : Effect.Tabbed)
    appWindow.setEffects({ effects: [types] })
  }
}
export const MainWindow = (setMainShow: (e: boolean) => void, AppData: AppDataType) => {
  useEffect(() => {
    (async  () => {
      if (AppData?.StartShow) {
        appWindow.show()
        setMainShow(true)
      } else {
        if (await appWindow.isVisible()) {
          Webview.show()
        }else{
          Webview.hide()
        }
      }
    })()

    const visibilitychange = () => {
      if (document.visibilityState === 'visible') {
        console.log('页面变得可见');
        setMainShow(true)
        // 页面变得可见时执行的代码
      } else {
        console.log('页面变得不可见');
        setMainShow(false)
      }
    }
    //监听窗口是否
    appWindow.onFocusChanged(async () => {
      if (await appWindow.isVisible()) {
        Webview.show()
      }
    });
    //监听页面是否可视
    document.addEventListener('visibilitychange', visibilitychange);

    return () => {
      document.removeEventListener('visibilitychange', visibilitychange);
    }
  }, [])
}
