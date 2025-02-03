import { enable, disable } from "@tauri-apps/plugin-autostart"
import { Input, AutoComplete, AutoCompleteProps, TimePicker, Button, Flex } from "antd"
import dayjs from "dayjs"
import { AppCiti, Sunrise } from "./sociti"
import { AppDataType, TimesProps } from "../Type"
import type { MessageInstance } from "antd/es/message/interface"
import { useRequest, useUpdateEffect } from "ahooks"
import { useState } from "react"
import { EnvironmentOutlined, LoadingOutlined } from "@ant-design/icons"

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
}) => {
    openRc: () => Promise<void>,
    mains: mainsType[]
}


const format = 'HH:mm';
const { RangePicker } = TimePicker;
const Mainoption: MainopType = ({
    AppData,
    setData,
    messageApi,
    locale,
    options,
    getCity,
    Radios,
    setRadios,
    Language
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
    const CitiInit = async () => {
        setCitiLoad(true)
        if (AppData?.language) { //必须初始语言才会开始自动获取定位
            const citiID = await Sunrise('')
            if (citiID?.hid) {
                const Citiop = await AppCiti(citiID?.hid, AppData?.language)
                const err = Citiop.location?.[0]
                const names = `${err.adm1} - ${err.name}`
                setCitiname(names)
                setData({ city: { id: err?.id, name: names }, rcrl: true })
            }
        }
        setCitiLoad(false)
    }
    useUpdateEffect(() => { //只要首次运行时才会启动
        CitiInit()
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
                disabled={CitiLoad}
                onClick={CitiInit}
                icon={CitiLoad ? <LoadingOutlined /> : <EnvironmentOutlined />}
            />
            <AutoComplete
                popupMatchSelectWidth={252}
                options={options}
                value={Citiname}
                onSelect={confirmCiti}
                onChange={run}
                disabled={CitiLoad}
            >
                <Input
                    disabled={CitiLoad}
                    onChange={e => setCitiname(e.target.value)}
                    placeholder={locale?.main?.citiPlaceholder} />
            </AutoComplete>
        </Flex>
    )
    const Times: React.FC<TimesProps> = ({ disabled }) => ( //渲染时间选择器
        <RangePicker disabled={disabled} defaultValue={[startTime, endTime]} format={format} onChange={handleTimeChange} />
    );
    const openRc = async () => { //处理日出日落数据
        setRcOpenLoad(true)
        if (AppData?.city?.id) {
            const data = await Sunrise(AppData?.city?.id)
            if (data?.rise && data?.set) {
                setData({ times: [data.rise, data.set], rcrl: true })
                setRcOpenLoad(false)
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
            key: 'city',
            label: locale?.main?.citiTitle,
            change: Citidiv
        },
        {
            key: 'radios',
            label: locale?.main?.TabsTitle,
            default: Radios,
            setVal: setRadios,
            change: [{ key: 'rcrl', label: locale?.main?.Tabs?.[0] },
            { key: 'dark', label: locale?.main?.Tabs?.[1] }] // 如果是数组，渲染单选项
        },

        {
            key: "rcrl",
            label: locale?.main?.TabsOptionA,
            hide: true,
            value: AppData?.rcrl,
            loading: rcOpenLoad,
            change: (e: boolean) => setData({ rcrl: e })
        },
        {
            key: 'dark',
            label: locale?.main?.TabsOptionB,
            hide: true,
            change: <Times disabled={AppData?.rcrl} /> // 渲染时间选择器
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
    return { openRc, mains }
}

export default Mainoption
