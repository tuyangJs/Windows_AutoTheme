import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import { AppCiti } from './sociti'
import "./App.css";
import { AutoCompleteProps, ConfigProvider, Divider, Flex, Layout, message, Radio, Spin, Switch, Typography } from "antd";
import { useAsyncEffect, useUpdateEffect } from "ahooks";
import LanguageApp from './language/index'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import { Updates } from './updates'
import { ThemeFun } from './ThemeConfig'
import Mainoption from "./Mainoption";
import DataSave from './DataSave'
const version = '1.2.6'
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
const { Text } = Typography;
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

  const StartRady = async () => {
    const PresentTime = dayjs(); // 当前时间，dayjs 对象
    const sunriseTime = dayjs(AppData?.times?.[0], 'HH:mm'); // 日出时间
    const sunsetTime = dayjs(AppData?.times?.[1], 'HH:mm'); // 日落时间

    if (sunriseTime.isBefore(PresentTime) && sunsetTime.isAfter(PresentTime)) {
      // 现在是日出后，日落前
      await invoke('set_system_theme', { isLight: true });
    } else if (sunsetTime.isBefore(PresentTime)) {
      // 现在是日落后
      await invoke('set_system_theme', { isLight: false });
    } else if (sunriseTime.isAfter(PresentTime)) {
      // 现在是日出前
      await invoke('set_system_theme', { isLight: false });
    }

  };


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
  useAsyncEffect(async () => { //定时任务处理
    await invoke('clear_tasks'); //清除已有任务
    if (!AppData?.open) return
    if (AppData?.times?.[0] && AppData?.times?.[1]) {
      try {
        await invoke('add_task', { times: [AppData?.times[0]], taskType: 'TypeA' });  // 传递时间数组和任务类型
        await invoke('add_task', { times: [AppData?.times[1]], taskType: 'TypeB' });  // 传递时间数组和任务类型
        console.log('Tasks added successfully');
      } catch (error) {
        console.error('Failed to add tasks:', error);
      }
    }
  }, [AppData?.times, AppData?.open])


  const searchResult = async (query: string) => { //渲染搜索结果
    if (!AppData?.Hfkey) return [];
    const data = await AppCiti(AppData.Hfkey, query, AppData.language)
    if (data.code !== '200') return [];
    return data.location
      .map((e: any) => {
        return {
          value: ` ${e.adm1} - ${e.name}`,
          key: e.id,
          label: (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {e.country}
                <a
                >
                  {` ${e.adm1} - ${e.name}`}
                </a>
              </span>

            </div>
          ),
        };
      });
  }
  async function getCity(search?: string) { //搜索城市
    if (search) {
      setOptions(await searchResult(search))
    }
  }

  const { Themeconfig, antdToken } = ThemeFun(themeDack)

  return (
    <ConfigProvider
      theme={Themeconfig}
    >
      {contextHolder}

      <Spin spinning={spinning} indicator={<LoadingOutlined spin style={{ fontSize: 48 }} />} >
        <TitleBar spinning={spinning} locale={locale} setSpinning={setSpinning} config={antdToken} themeDack={themeDack} setThemeDack={setThemeDack} />
        <Layout>
          <Content className="container">
            <Flex gap={0} vertical>
              {mains.map((item, i) => {
                // 只有当 item.hide 为 false 或者 当前选中的选项匹配时才渲染
                if (item.hide && item.key !== Radios) {
                  return null;
                }
                return (
                  < >
                    {i > 0 ? <Divider key={i} /> : null}
                    <Flex key={item.key || i} justify='space-between' align="center">
                      <Text>{item.label}</Text>
                      {
                        // 如果 change 是数组，渲染单选框
                        Array.isArray(item.change) ? (
                          <Radio.Group
                            block
                            defaultValue={item.default}
                            options={item.change.map((key) => ({
                              label: key.label,
                              value: key.key, // 假设索引为值
                            }))}
                            optionType="button"
                            onChange={e => {
                              const newValue = e.target.value;
                              setRadios(newValue); // 更新选中的选项
                              if (typeof item.setVal === 'function') {
                                item.setVal(newValue);
                              }
                            }}
                          />
                        ) : (
                          // 如果 change 是函数，渲染开关
                          typeof item.change === 'function' ? (
                            <Switch
                              loading={item.loading}
                              defaultValue={item.defaultvalue}
                              value={item.value as boolean}
                              onChange={item.change} />
                          ) : (
                            // 如果是组件，直接渲染
                            <div>{item.change}</div>
                          )
                        )
                      }
                    </Flex>
                  </>
                );
              })}
              <Docs locale={locale} version={version} />
              <Updates locale={locale} version={version} />
            </Flex>
          </Content>
        </Layout>
      </Spin>
    </ConfigProvider>
  );
}

export default App;
