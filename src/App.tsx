import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import TitleBar from "./TitleBar";
import dayjs from 'dayjs';
import { AppCiti, Sunrise } from './sociti'
import "./App.css";
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart'
import { AutoComplete, AutoCompleteProps, ConfigProvider, Divider, Flex, Input, Layout, message, Radio, Spin, Switch, theme, ThemeConfig, TimePicker, Tooltip, Typography } from "antd";
import { useAsyncEffect, useLocalStorageState, useRequest, useUpdateEffect } from "ahooks";
import LanguageApp from './language/index'
import type { AppDataType, TimesProps } from './Type'
import Docs from './doc'
import { LoadingOutlined } from "@ant-design/icons";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import {Updates} from './updates'
const version='1.2.6'
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

const format = 'HH:mm';

const { Content } = Layout;
const { RangePicker } = TimePicker;

const SystemStart = await isEnabled()
function App() {
  const [AppData, setAppData] = useLocalStorageState<AppDataType>('AppData', {
    defaultValue: {
      Radios: "rcrl",
      Hfkey: "",
      open: false,
      rcrl: false,
      city: { id: "101010100", name: '北京' },
      times: [""],
      Autostart: SystemStart,
      language: 'zh_CN',
      StartShow: true
    }
  })
  const [Radios, setRadios] = useState<string>(AppData?.Radios || 'rcrl');
  const matchMedia = window.matchMedia('(prefers-color-scheme: light)');
  const [themeDack, setThemeDack] = useState(!matchMedia.matches);
  const [options, setOptions] = useState<AutoCompleteProps['options']>([]);
  const [rcOpenLoad, setRcOpenLoad] = useState(false)
  const [spinning, setSpinning] = useState(false)

  ///const [MainLoad, setMainLoad] = useState(true)
  const [messageApi, contextHolder] = message.useMessage();

  useUpdateEffect(() => { //同步设置
    setData({ Radios })
  }, [Radios])
  const setData = (e: any) => {
    setAppData((prevData) => ({
      ...prevData,
      ...e
    }))
  }
  const { Language, locale } = LanguageApp({ AppData, setData })
  //----EDN ---- Language
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
      appWindow.hide()
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

  const handleTimeChange = (_e: any, dateStrings: [string, string]) => {  //更改时间
    setData({ times: dateStrings })
  }
  const startTime = dayjs(AppData?.times?.[0] || '08:08', 'HH:mm')
  const endTime = dayjs(AppData?.times?.[1] || '18:08', 'HH:mm')

  const Times: React.FC<TimesProps> = ({ disabled }) => ( //渲染时间选择器
    <RangePicker disabled={disabled} defaultValue={[startTime, endTime]} format={format} onChange={handleTimeChange} />
  );
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

  const confirmCiti = (_e: any, err: any) => { //确认选择城市
    setData({ city: { id: err.key, name: err.value } })
  }
  const { run } = useRequest(getCity, {
    debounceWait: 800,
    manual: true,
  });
  const openRc = async () => { //获取日出日落数据
    setRcOpenLoad(true)
    if (AppData?.Hfkey && AppData?.city?.id) {
      const data = await Sunrise(AppData?.Hfkey, AppData?.city?.id)
      if (data?.code === '200') {
        const sunrise = dayjs(data.sunrise).format(format)
        const sunset = dayjs(data.sunset).format(format)
        setData({ times: [sunrise, sunset], rcrl: true })
        setRcOpenLoad(false)
      } else {
        messageApi.error('获取日出日落信息失败！')
          .then(() => {
            setData({ rcrl: false })
            setRcOpenLoad(false)
          })
      }
    } else {
      messageApi.error('你还没有选择城市！')
        .then(() => {
          setData({ rcrl: false })
          setRcOpenLoad(false)
        })
    }
  }
  const mains = [ //  全部选项数据
    {
      key: 'open',
      label: locale.main?.open || "开启",
      defaultvalue: AppData?.open,
      change: (e: boolean) => {
        setData({ open: e })
      }
    },
    {
      key: "language",
      label: locale?.main?.language || "多语言",
      change: Language
    },
    {
      key: "hfkey",
      label: locale.main?.keyTitle || '和风天气key',
      change: (
        <Tooltip title="日出日落需要key" placement="bottom">
          <Input.Password placeholder="key" defaultValue={AppData?.Hfkey} width={220} onChange={e => setData({ Hfkey: e.target.value })} />
        </Tooltip>)
    },
    {
      key: 'city',
      label: locale.main?.citiTitle || '城市',
      change: (<AutoComplete
        popupMatchSelectWidth={252}
        options={options}
        defaultValue={AppData?.city?.name}
        onSelect={confirmCiti}
        onChange={run}
        disabled={(AppData?.Hfkey || '').length <= 10}
      >
        <Input.Search placeholder={locale.main?.citiPlaceholder || "输入城市名"} />
      </AutoComplete>)
    },
    {
      key: 'radios',
      label: locale.main?.TabsTitle || '选项',
      default: Radios,
      setVal: setRadios,
      change: [{ key: 'rcrl', label: locale.main?.Tabs?.[0] || '日出到日落' },
      { key: 'dark', label: locale.main?.Tabs?.[1] || '自定义时段' }] // 如果是数组，渲染单选项
    },

    {
      key: "rcrl",
      label: locale.main?.TabsOptionA || '日出到日落',
      hide: true,
      value: AppData?.rcrl,
      loading: rcOpenLoad,
      change: (e: boolean) => setData({ rcrl: e })
    },
    {
      key: 'dark',
      label: locale.main?.TabsOptionB || '浅色时间',
      hide: true,
      change: <Times disabled={AppData?.rcrl} /> // 渲染时间选择器
    },
    {
      key: 'Autostart',
      label: locale.main?.Autostart || '跟随系统启动',
      defaultvalue: AppData?.Autostart,
      change: async (e: boolean) => {
        if (e) {
          await enable();
        } else {
          disable();
        }
        setData({ Autostart: e })
      },
    },
    {
      key: "StartShow",
      label: locale.main?.StartShow || '启动时显示窗口',
      defaultvalue: AppData?.StartShow,
      change: ((e: boolean) => setData({ StartShow: e }))
    }
  ];
  const config: ThemeConfig = useMemo(() => ({ //主题渲染配置
    algorithm: themeDack ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: {
      Divider: {
        colorSplit: themeDack ? '#484848a3' : '#b3b3b3a3'
      }
    },
    token: {
      colorPrimary: '#fda800',
      colorBgLayout: themeDack ? 'linear-gradient(33deg, #12131796, #323b427a)' : 'linear-gradient(33deg, #F0EFF096, #FAF8F97a)',
      colorBgBase: themeDack ? '#00000096' : '#ffffff96',
      colorBorder: themeDack ? '#87878796' : '#bfbfbf96',
      colorBgElevated: themeDack ? '#313131' : '#f1f1f1',

    },
  }), [themeDack]);
  const antdToken = useMemo(() => theme.getDesignToken(config), [config]); //主题渲染

  return (
    <ConfigProvider
      theme={config}
    >
      {contextHolder}
      
      <Spin spinning={spinning} indicator={<LoadingOutlined spin style={{ fontSize: 48 }} />} >
        <TitleBar locale={locale} setSpinning={setSpinning} config={antdToken} themeDack={themeDack} setThemeDack={setThemeDack} />
        <Layout>
          <Content className="container">
            <Flex gap={0} vertical>
              {mains.map((item, i) => {
                // 只有当 item.hide 为 false 或者 当前选中的选项匹配时才渲染
                if (item.hide && item.key !== Radios) {
                  return null;
                }
                return (
                  <>
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
                              value={item.value}
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
              <Docs locale={locale}  version={version}/>
              <Updates locale={locale}  version={version}/>
            </Flex>
          </Content>
        </Layout>
      </Spin>
    </ConfigProvider>
  );
}

export default App;
