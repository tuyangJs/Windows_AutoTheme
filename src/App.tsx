import { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import "./App.css";
import { AutoCompleteProps, ConfigProvider, Flex, Layout, message, Spin } from "antd";
import { useUpdateEffect, useAsyncEffect } from "ahooks";
import LanguageApp from './language/index'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
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

import { MainWindow, WindowBg } from "./mod/WindowCode";
import { listen } from "@tauri-apps/api/event";
import { adjustTime } from "./mod/adjustTime";
import { AnimatePresence, motion } from "framer-motion";
import { GetHttp } from "./mod/sociti";
import RatingPrompt from "./mod/RatingPrompt";
import { openStoreRating } from "./mod/openStoreRating";
import { Updates } from "./updates";
GetHttp("https://dev.qweather.com/")
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

const { Content } = Layout;
function App() {
  const { setData, AppData } = DataSave()
  const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [spinning, setSpinning] = useState(true)
  const [Weather, setWeather] = useState('')
  const [MainShow, setMainShow] = useState(document.visibilityState === 'visible')
  const [isWin64App, setIsWin64App] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();


  const { Language, locale } = LanguageApp({ AppData, setData })
  //----EDN ---- Language
  useAsyncEffect(async () => {
    const inMsix = await invoke<boolean>('is_running_in_msix');
    setIsWin64App(inMsix)
  }, [])

  //导入设置选项
  const { openRc, mains, CitiInit } = Mainoption({
    setData,
    messageApi,
    locale,
    options,
    getCity,
    Language,
    AppData,
    setWeather,
    themeDack
  })
  MainWindow(setMainShow, AppData as AppDataType)
  useEffect(() => {
    let isMounted = true;
    const setupListener = async () => {
      const unlisten = await listen("switch", async () => {
        if (!isMounted) return;
        console.log("switch dark", !themeDack);
        if (spinning) return;
        const isVisible = await window.appWindow.isVisible()
        setSpinning(true);
        setTimeout(async () => {
          await invoke('set_system_theme', { isLight: themeDack });
        }, 10);
        if (!isVisible) {
          window.Webview.show()
          setTimeout(() => {
            window.appWindow.isVisible().then(async (_isVisible) => {
              console.log("isVisible", _isVisible);
              if (!_isVisible) {
                window.Webview.hide()
              }
            })
          }, 600);
        }

      });

      // 返回清理函数以移除事件监听器
      return () => {
        isMounted = false;
        unlisten();
      };
    };

    const cleanupPromise = setupListener();

    // 返回一个清理函数来处理异步操作的清理
    return () => {
      cleanupPromise.then(cleanup => cleanup());
    };
  }, [themeDack, spinning]);

  useUpdateEffect(() => {
    if (AppData?.open) {
      StartRady()
    }
  }, [AppData?.times, AppData?.open])
  useEffect(() => {
    if (AppData?.rawTime?.length === 2) {
      const rise = adjustTime(AppData?.rawTime[0], AppData?.deviation)
      const sun = adjustTime(AppData?.rawTime[1], -AppData?.deviation)
      setData({ times: [rise, sun] })
    }
  }, [AppData?.rawTime, AppData?.deviation])
  useEffect(() => { //自动化获取日出日落数据
    if (AppData?.rcrl) {
      openRc()
    }
  }, [AppData?.city, AppData?.rcrl])
  //设置窗口材料
  useEffect(() => {
    WindowBg(AppData as AppDataType, themeDack)
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
  const animationVariants = {
    initial: {
      opacity: 0,
      x: 0,
      scale: 3,
      filter: "blur(5px)"
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      x: 100,
      filter: "blur(5px)",
      transition: {
        duration: 0.36
      }
    },
    transition: {
      duration: 0.26,
      delay: mains.length * 0.08
    },
    layout: true
  };
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
          />
          <Layout>
            <Content className="container">
              <Flex gap={0} vertical >
                <AnimatePresence >
                  <OpContent mains={mains} language={AppData?.language} />
                  <AnimatePresence >
                    <motion.div
                      {...animationVariants}
                      key={`${AppData?.language}-s`}
                    >
                      <Docs locale={locale} version={version} Weather={Weather} />
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence>
                    <motion.div
                      {...animationVariants}
                      key={`${AppData?.language}-a`}
                    >
                      {isWin64App ? <a
                        onClick={() => openStoreRating()}
                        rel="noreferrer">{
                          locale?.upModal?.textB?.[2]
                        }</a> :
                        <Updates version={version} locale={locale} setData={setData} AppData={AppData} />
                      }

                    </motion.div>
                  </AnimatePresence>
                </AnimatePresence>
              </Flex>
              { /* 评分组件 */}
              {isWin64App && <RatingPrompt locale={locale} />}
            </Content>
          </Layout>
        </Spin>
      ) : null
      }

    </ConfigProvider >
  );
}

export default App;
