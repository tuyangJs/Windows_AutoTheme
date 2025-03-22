import { enable, disable } from "@tauri-apps/plugin-autostart"
import { Input, AutoComplete, AutoCompleteProps, TimePicker, Button, Flex, Segmented, Typography } from "antd"
import dayjs from "dayjs"
import { AppCiti, Sunrise } from "./sociti"
import { AppDataType, TimesProps } from "../Type"
import type { MessageInstance } from "antd/es/message/interface"
import { useRequest, useUpdateEffect } from "ahooks"
import { useEffect, useState } from "react"
import { EnvironmentOutlined, LoadingOutlined } from "@ant-design/icons"
import { invoke } from "@tauri-apps/api/core"
import { isWin11 } from "./ThemeConfig"
import Deviation from "./Deviation"
export interface mainsType {
    key: string;
    label: any;
    defaultvalue?: boolean | undefined;
    change: any;
    default?: string;
    setVal?: any;
    hide?: boolean;
    value?: string | boolean | undefined;
    loading?: boolean;

}
export type MainopType = (e: {
    AppData?: AppDataType;
    setData: (e: any) => void;
    messageApi: MessageInstance;
    locale: any;
    options: AutoCompleteProps['options']
    getCity: (search?: string) => Promise<void>
    setRadios: React.Dispatch<React.SetStateAction<string>>
    Radios: string
    Language: JSX.Element
    setWeather: React.Dispatch<React.SetStateAction<string>>
    themeDack: boolean
}) => {
    openRc: () => Promise<void>,
    mains: mainsType[],
    CitiInit: (citiids?: string) => Promise<void>
}


const { Paragraph } = Typography;
const format = 'HH:mm';
const { RangePicker } = TimePicker;
const Mainoption: MainopType = ({
    AppData,
    setData,
    messageApi,
    locale,
    options,
    getCity,
    Language,
    setWeather,
    themeDack
}) => {
    const [rcOpenLoad, setRcOpenLoad] = useState(false)
    const [startOpenLoad, setStartOpenLoad] = useState(false)
    const [CitiLoad, setCitiLoad] = useState(false)
    const [Citiname, setCitiname] = useState(AppData?.city?.name)

    const confirmCiti = (_e: any, err: any) => { //确认选择城市
        setData({ city: { id: err.key, name: err.value } })
        setCitiname(err.value)
    }

    const { run } = useRequest(getCity, {
        debounceWait: 800,
        manual: true,
    });
    const upTary = (e: string) => { //更新托盘数据
        invoke('update_tray_menu_item_title', {
            quit: locale?.quit,
            show: locale?.show,
            tooltip: e,
            switch: `${locale?.switch}${themeDack ? locale.light : locale.dark}`
        })
    }
    const openRc = async () => { //处理日出日落数据
        setRcOpenLoad(true)
        if (AppData?.city?.id) {
            const data = await Sunrise(AppData?.city?.id, AppData?.language)
            if (data?.rise && data?.set) {
                const rise = data.rise
                const sun = data.set
                setData({ rawTime: [rise, sun], rcrl: true })
                setRcOpenLoad(false)
                setWeather(data.abstract)

            } else {
                messageApi.error(locale.main?.TabsOptionAError) //获取日出日落数据失败
                    .then(() => {
                        setData({ rcrl: false })
                        setRcOpenLoad(false)
                    })
            }
        } else {
            messageApi.error(locale.main.citiError)
                .then(() => {
                    setData({ rcrl: false })
                    setRcOpenLoad(false)
                })
        }

    }
    const CitiInit = async (citiids?: string) => {
        setCitiLoad(true)
        if (AppData?.language) { //必须初始语言才会开始自动获取定位
            const citiID = citiids ? { hid: citiids } : await Sunrise('', AppData?.language)

            if (citiID?.hid) {
                const Citiop = await AppCiti(citiID?.hid, AppData?.language)

                const err = Citiop.location?.[0]
                const names = `${err.adm1} - ${err.name}`
                setCitiname(names)
                setData({ city: { id: err?.id, name: names }, rcrl: true })
                setWeather(citiID.abstract)
            }

        }
        setCitiLoad(false)
    }

    useEffect(() => {
        if (locale?.quit) {
            const tooltip = `${locale?.Title} - App \n${locale.Time}: ${AppData?.times?.[0]} - ${AppData?.times?.[1]}`
            upTary(tooltip)
        }

    }, [locale, AppData?.times, themeDack])
    useUpdateEffect(() => { //只要首次运行时才会启动
        run()
        CitiInit(AppData?.city?.id)
    }, [AppData?.language])
    const AutostartOpen = async (e: boolean) => {
        setStartOpenLoad(true)
        try {
            if (e) {
                await enable();
            } else {
                disable();
            }
            setData({ Autostart: e })
        } catch (error) {
            messageApi.error(error as string)
        }
        setStartOpenLoad(false)
    }
    const handleTimeChange = (_e: any, dateStrings: [string, string]) => {  //更改时间
        setData({ times: dateStrings })
    }
    const startTime = dayjs(AppData?.times?.[0] || '08:08', 'HH:mm')
    const endTime = dayjs(AppData?.times?.[1] || '18:08', 'HH:mm')
    const Citidiv = ( //城市选择器
        <Flex gap={4}>
            <Button type="text"
                disabled={!AppData?.rcrl || CitiLoad}
                color="default"
                //variant="filled"
                onClick={() => CitiInit()}
                icon={CitiLoad ? <LoadingOutlined /> : <EnvironmentOutlined />}
            />
            <AutoComplete
                popupMatchSelectWidth={252}
                options={options}
                value={Citiname}
                onSelect={confirmCiti}
                onChange={run}
                disabled={!AppData?.rcrl || CitiLoad}
            >
                <Input
                    disabled={CitiLoad}
                    variant="filled"
                    onChange={e => setCitiname(e.target.value)}
                    placeholder={locale?.main?.citiPlaceholder} />
            </AutoComplete>
        </Flex>
    )
    const Times: React.FC<TimesProps> = ({ disabled }) => ( //渲染时间选择器
        <RangePicker
            variant="filled"
            disabled={disabled}
            style={{ width: 200 }}
            defaultValue={[startTime, endTime]}
            format={format}
            onChange={handleTimeChange} />
    );

    const mains: mainsType[] = [ //  全部选项数据
        {
            key: 'open',
            label: locale?.main?.open,
            defaultvalue: AppData?.open,
            change: (e: boolean) => {
                setData({ open: e })
            }
        },
        {
            key: "language",
            label: locale?.main?.language,
            change: Language
        },

        {
            key: "rcrl",
            label: locale?.main?.TabsOptionA,
            value: AppData?.rcrl,
            loading: rcOpenLoad,
            change: (e: boolean) => {
                setData({ rcrl: e })
            }
        },
        {
            key: 'city',
            label: locale?.main?.citiTitle,
            hide: !AppData?.rcrl,
            change: Citidiv
        },
        {
            key: 'deviation',
            label: locale?.main?.deviationTitle,
            hide: !AppData?.rcrl,
            change: <Deviation
                value={AppData?.deviation || 20}
                setVal={(e) => {
                    setData({ deviation: e });
                }}
                prompt={
                    <Paragraph>
                        {locale?.main?.deviationPrompt}
                        <br />
                        {
                            `${locale?.main?.TabsOptionB}: 
                           ${AppData?.rawTime[0]} - ${AppData?.rawTime[1]}
                           `
                        }
                        <br />
                        {
                            ` ${locale?.main?.deviationTitle}: 
                                ${AppData?.times?.[0]} - ${AppData?.times?.[1]} `
                        }
                    </Paragraph>
                }
            />
        },
        {
            key: 'dark',
            label: locale?.main?.TabsOptionB,
            hide: AppData?.rcrl,
            change: <Times disabled={AppData?.rcrl} /> // 渲染时间选择器
        },
        {
            key: "winBgEffect",
            label: locale?.main?.winBgEffect,
            change: <Segmented
                shape="round"
                value={AppData?.winBgEffect}
                onChange={e => setData({ winBgEffect: e })
                }
                options={[
                    { value: 'Default', label: locale?.main?.Default },
                    { value: 'Mica', label: locale?.main?.Mica, disabled: !isWin11 },
                    { value: 'Acrylic', label: locale?.main?.Acrylic, disabled: !isWin11 },
                ]}
            />
        },
        {
            key: 'Autostart',
            label: locale?.main?.Autostart,
            value: AppData?.Autostart,
            loading: startOpenLoad,
            change: AutostartOpen,
        },
        {
            key: "StartShow",
            label: locale?.main?.StartShow,
            defaultvalue: AppData?.StartShow,
            change: ((e: boolean) => setData({ StartShow: e }))
        }
    ];
    return { openRc, mains, CitiInit }
}

export default Mainoption
