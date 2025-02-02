import { useEffect, useState } from "react";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import "./App.css";
import { AutoCompleteProps, ConfigProvider, Flex, Layout, message, Spin } from "antd";
import { useAsyncEffect, useUpdateEffect } from "ahooks";
import LanguageApp from './language/index'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import { Updates } from './updates'
import { ThemeFun } from './mod/ThemeConfig'
import Mainoption from "./mod/Mainoption";
import DataSave from './mod/DataSave'
import OpContent from './Content'
import { CrontabTask, CrontabManager } from './mod/Crontab'
import { searchResult } from "./mod/searchCiti";
import { invoke } from "@tauri-apps/api/core";
import { AppDataType } from "./Type";
const version = '1.3.1'
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

const { Content } = Layout;
function App() {
  const { setData, AppData } = DataSave()

  const [Radios, setRadios] = useState<string>(AppData?.Radios || 'rcrl');
  const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);

  const [spinning, setSpinning] = useState(false)

  ///const [MainLoad, setMainLoad] = useState(true)
  const [messageApi, contextHolder] = message.useMessage();

  useUpdateEffect(() => { //同步设置
    setData({ Radios })
  }, [Radios])

  const { Language, locale } = LanguageApp({ AppData, setData })
  //----EDN ---- Language

  //导入设置选项
  const { openRc, mains } = Mainoption({
    setData,
    messageApi,
    locale,
    options,
    getCity,
    setRadios,
    Radios,
    Language,
    AppData
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
    } else {
      //appWindow.hide()
    }
    // 清除事件监听器
    return () => {
      matchMedia.removeEventListener('change', handleChange);
    };
  }, []);
  const StartRady = async () => {
    const PresentTime = dayjs(); // 当前时间，dayjs 对象
    const sunriseTime = dayjs(AppData?.times?.[0], 'HH:mm'); // 日出时间
    const sunsetTime = dayjs(AppData?.times?.[1], 'HH:mm'); // 日落时间

    if (sunriseTime.isBefore(PresentTime) && sunsetTime.isAfter(PresentTime)) {
      // 现在是日出后，日落前
      await invoke('set_system_theme', { isLight: true });
      console.log('现在是日出后，日落前');

    } else if (sunsetTime.isBefore(PresentTime)) {
      // 现在是日落后
      await invoke('set_system_theme', { isLight: false });
      console.log('现在是日落后');
    } else if (sunriseTime.isAfter(PresentTime)) {
      // 现在是日出前
      console.log('现在是日出前');
      await invoke('set_system_theme', { isLight: false });
    }

  };

  useAsyncEffect(async () => { //定时任务处理

    if (AppData?.open === false) {
      console.log("清楚所有任务列表:", CrontabManager.listTasks());
      return
    }
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
    };
    if (AppData?.times?.[0] && AppData?.times?.[1]) {
      try {
        // 添加定时任务
        const task1: CrontabTask = { time: AppData?.times[0], data: { msg: 'TypeA' }, onExecute: onTaskExecute };
        const task2: CrontabTask = { time: AppData?.times[1], data: { msg: 'TypeB' }, onExecute: onTaskExecute };
        CrontabManager.addTask(task1);
        CrontabManager.addTask(task2);
        console.log('Tasks added successfully');
      } catch (error) {
        console.error('Failed to add tasks:', error);
      }
    }
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
      {contextHolder}
      <Spin spinning={spinning} indicator={<LoadingOutlined spin style={{ fontSize: 48 }} />} >
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
              <Docs locale={locale} version={version} />
              <Updates locale={locale} version={version} setData={setData} AppData={AppData as AppDataType}/>
            </Flex>
          </Content>
        </Layout>
      </Spin>
    </ConfigProvider>
  );
}

export default App;
