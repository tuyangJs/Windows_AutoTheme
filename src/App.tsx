import { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import "./App.css";
import { AutoCompleteProps, ConfigProvider, Flex, Layout, message, Spin } from "antd";
import { useUpdateEffect } from "ahooks";
import LanguageApp from './language/index'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { Updates } from './updates'
import { ThemeFun } from './mod/ThemeConfig'
import Mainoption from "./mod/Mainoption";
import DataSave from './mod/DataSave'
import OpContent from './Content'
import { CrontabTask, CrontabManager } from './mod/Crontab'
import { searchResult } from "./mod/searchCiti";
import { invoke } from "@tauri-apps/api/core";
import { AppDataType } from "./Type";
import { getVersion } from '@tauri-apps/api/app';
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { listen } from "@tauri-apps/api/event";
import { saveWindowState, StateFlags } from "@tauri-apps/plugin-window-state";

async function fetchAppVersion() {
  try {
    const version = await getVersion();
    return version
    // 在需要的地方使用版本号，例如显示在界面上
  } catch (error) {
    return '0.1.1'
  }
}

const version = await fetchAppVersion();
document.addEventListener('keydown', function (e) {
  if ((e.key === 'F5') || (e.ctrlKey && e.key === 'r')) {
    e.preventDefault(); // 禁止刷新
  }
});
document.addEventListener('contextmenu', function (e) {
  // @ts-ignore
  if (e?.target?.tagName?.toLowerCase() !== 'input') {
    e.preventDefault(); // 禁用右键菜单
  }
});
const appWindow = new Window('main');
const Webview = await getCurrentWebview()
listen("show-app", async () => {
  Webview.show()
});
listen("close-app", async () => {
  console.log("收到后端关闭指令，正在退出应用...");
  await appWindow.destroy();
});


const { Content } = Layout;
function App() {
  const { setData, AppData } = DataSave()
  const [Radios, setRadios] = useState<string>(AppData?.Radios || 'rcrl');
  const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [spinning, setSpinning] = useState(true)
  const [Weather, setWeather] = useState('')
  const [MainShow, setMainShow] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    appWindow.onFocusChanged(async e => {
      if (e.payload && await appWindow.isVisible()) {
        setMainShow(true)
        Webview.show()
      }
    })
    //隐藏窗口
    appWindow.onCloseRequested(e => {
      e.preventDefault()
      setMainShow(false)
      setTimeout(() => {
        appWindow.hide()
        saveWindowState(StateFlags.ALL)
        Webview.hide()
      }, 22);

    })
  }, [])
  useUpdateEffect(() => { //同步设置
    setData({ Radios })
  }, [Radios])

  const { Language, locale } = LanguageApp({ AppData, setData })
  //----EDN ---- Language


  //导入设置选项
  const { openRc, mains, CitiInit } = Mainoption({
    setData,
    messageApi,
    locale,
    options,
    getCity,
    setRadios,
    Radios,
    Language,
    AppData,
    setWeather
  })

  useUpdateEffect(() => {
    if (AppData?.open) {
      StartRady()
    }
  }, [AppData?.times, AppData?.open])
  useEffect(() => { //自动化获取日出日落数据
    if (AppData?.rcrl) {
      openRc()
    }
  }, [AppData?.city, AppData?.rcrl])


  useEffect(() => { //初始化 -主题自适应
    const handleChange = function (this: any) {
      //appWindow.setTheme('')
      setThemeDack(!this.matches);
      setSpinning(false)
    };
    matchMedia.addEventListener('change', handleChange);
    if (AppData?.open) {
      StartRady()
    }
    if (AppData?.StartShow) {
      appWindow.show()
      setMainShow(true)
    } else {
      // appWindow.hide()
    }
    const isAutostart = async () => {
      setData({ Autostart: await isEnabled() })
    }
    //检测开机启动
    isAutostart()
    // 清除事件监听器
    setTimeout(() => {
      setSpinning(false)
    }, 100);
    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, []);
  const StartRady = async () => {
    const presentTime = dayjs(); // 当前时间
    const sunriseTime = dayjs(AppData?.times?.[0], 'HH:mm'); // 日出时间
    const sunsetTime = dayjs(AppData?.times?.[1], 'HH:mm'); // 日落时间

    let isLight = false;
    let message = '';

    if (presentTime.isAfter(sunriseTime) && presentTime.isBefore(sunsetTime)) {
      isLight = true;
      message = '现在是日出后，日落前';
    } else if (presentTime.isBefore(sunriseTime)) {
      message = '现在是日出前';
    } else {
      message = '现在是日落后';
    }
    if (themeDack === isLight) {
      setSpinning(true);
      try {
        await invoke('set_system_theme', { isLight });
        console.log(message);
      } finally {
        setSpinning(false);
      }
    }
  };


  useEffect(() => { //定时任务处理
    if (AppData?.open === false) {
      CrontabManager.clearAllTasks()
      return
    }
    if (AppData?.times?.[0] && AppData?.times?.[1]) {
      try {
        // 添加定时任务
        const task1: CrontabTask = { time: AppData?.times[0], data: "TypeA" };
        const task2: CrontabTask = { time: AppData?.times[1], data: "TypeB" };
        CrontabManager.addTask(task1);
        CrontabManager.addTask(task2);
        console.log('Tasks added successfully');
      } catch (error) {
        console.error('Failed to add tasks:', error);
      }
    }
    return () => {
      CrontabManager.clearAllTasks()
    };
  }, [AppData?.times, AppData?.open])



  async function getCity(search?: string) { //搜索城市
    if (search) {
      setOptions(await searchResult(search, AppData))
    }
  }

  const { Themeconfig, antdToken } = ThemeFun(themeDack)
  return (
    <ConfigProvider
      theme={Themeconfig}
    >
      {MainShow ? (
        < Spin spinning={spinning} indicator={<LoadingOutlined spin style={{ fontSize: 48 }} />} >
          {contextHolder}
          <TitleBar
            spinning={spinning}
            locale={locale}
            setSpinning={setSpinning}
            config={antdToken}
            themeDack={themeDack}
            setThemeDack={setThemeDack}
          />
          <Layout>
            <Content className="container">
              <Flex gap={0} vertical>
                <OpContent mains={mains} Radios={Radios} setRadios={setRadios} />
                <Docs locale={locale} version={version} Weather={Weather} />
                <Updates locale={locale} version={version} setData={setData} AppData={AppData as AppDataType} />
              </Flex>
            </Content>
          </Layout>
        </Spin>
      ) : null
      }

    </ConfigProvider >
  );
}

export default App;
