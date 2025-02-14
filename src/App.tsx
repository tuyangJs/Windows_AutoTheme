import { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import "./App.css";
import { AutoCompleteProps, ConfigProvider, Flex, Layout, message, Spin } from "antd";
import { useUpdateEffect } from "ahooks";
import LanguageApp from './language/index'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
import { Window, Effect } from '@tauri-apps/api/window'; // 引入 appWindow
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
import { app } from "@tauri-apps/api";

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
  const [Radios, setRadios] = useState<string>('dark');
  const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [spinning, setSpinning] = useState(true)
  const [Weather, setWeather] = useState('')
  const [MainShow, setMainShow] = useState(document.visibilityState === 'visible')
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
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
    appWindow.onFocusChanged((e) => {
      if (e.payload) {
        Webview.show()
      } else {
        //visibilitychange()
      }
    });
    //监听页面是否可视
    document.addEventListener('visibilitychange', visibilitychange);
    //隐藏窗口
    appWindow.onCloseRequested(e => {
      e.preventDefault()
      saveWindowState(StateFlags.ALL)
      setTimeout(() => {
        appWindow.hide()
        Webview.hide()
      }, 22);
    })
    return () => {
      document.removeEventListener('visibilitychange', visibilitychange);
    }
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
  //设置窗口材料
  useEffect(() => {
    if (AppData?.winBgEffect) {
      const types = AppData.winBgEffect === 'Acrylic' ? Effect.Acrylic : (themeDack ? Effect.Mica : Effect.Tabbed)
      appWindow.setEffects({ effects: [types] })
    }
  }, [AppData?.winBgEffect, themeDack])
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
      const onTaskExecute = async (time: string, data: { msg: string }) => {
        console.log(`执行任务: ${time}, 数据:`, data);
        switch (data.msg) {
          case 'TypeA':
            console.log(`执行任务: ${time}, 数据:`, data.msg);
            await invoke('set_system_theme', { isLight: true });
            break;
          case 'TypeB':
            console.log(`执行任务: ${time}, 数据:`, data.msg);
            await invoke('set_system_theme', { isLight: false });
            break;
        }
        console.log(CrontabManager.listTasks());
        CitiInit(AppData?.city?.id)
      };
      try {
        // 添加定时任务
        const task1: CrontabTask = { time: AppData?.times[0], data: { msg: 'TypeA' }, onExecute: onTaskExecute };
        const task2: CrontabTask = { time: AppData?.times[1], data: { msg: 'TypeB' }, onExecute: onTaskExecute };
        CrontabManager.addTask(task1);
        CrontabManager.addTask(task2);
        console.log('Tasks added successfully', CrontabManager.listTasks());
      } catch (error) {
        console.error('Failed to add tasks:', error);
      }
    }
    return () => {
      CrontabManager.clearAllTasks()
    };
  }, [AppData?.times, AppData?.open])



  async function getCity(search?: string) { //搜索城市
    setOptions(await searchResult(search || '', AppData))
  }

  const { Themeconfig, antdToken } = ThemeFun(themeDack, AppData?.winBgEffect)
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
            Themeconfig={Themeconfig}
            themeDack={themeDack}
            setThemeDack={setThemeDack}
          />
          <Layout>
            <Content className="container">
              <Flex gap={0} vertical >
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
