import { enable, disable } from "@tauri-apps/plugin-autostart"
import { Tooltip, Input, AutoComplete, AutoCompleteProps, TimePicker } from "antd"
import dayjs from "dayjs"
import { Sunrise } from "./sociti"
import { AppDataType, TimesProps } from "./Type"
import type { MessageInstance } from "antd/es/message/interface"
import { useRequest } from "ahooks"
import { useState } from "react"

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
    const confirmCiti = (_e: any, err: any) => { //确认选择城市
        setData({ city: { id: err.key, name: err.value } })
    }

    const { run } = useRequest(getCity, {
        debounceWait: 800,
        manual: true,
    });
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

    const Times: React.FC<TimesProps> = ({ disabled }) => ( //渲染时间选择器
        <RangePicker disabled={disabled} defaultValue={[startTime, endTime]} format={format} onChange={handleTimeChange} />
    );
    const openRc = async () => { //渲染搜索结果
        setRcOpenLoad(true)
        if (AppData?.Hfkey && AppData?.city?.id) {
            const data = await Sunrise(AppData?.Hfkey, AppData?.city?.id)
            if (data?.code === '200') {
                const sunrise = dayjs(data.sunrise).format(format)
                const sunset = dayjs(data.sunset).format(format)
                setData({ times: [sunrise, sunset], rcrl: true })
                setRcOpenLoad(false)
            } else {
                messageApi.error(locale.main.TabsOptionAError)
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
            key: "hfkey",
            label: locale?.main?.keyTitle,
            change: (
                <Tooltip title="日出日落需要key" placement="bottom">
                    <Input.Password placeholder="key" defaultValue={AppData?.Hfkey} width={220} onChange={e => setData({ Hfkey: e.target.value })} />
                </Tooltip>)
        },
        {
            key: 'city',
            label: locale?.main?.citiTitle,
            change: (<AutoComplete
                popupMatchSelectWidth={252}
                options={options}
                defaultValue={AppData?.city?.name}
                onSelect={confirmCiti}
                onChange={run}
                disabled={(AppData?.Hfkey || '').length <= 10}
            >
                <Input.Search placeholder={locale?.main?.citiPlaceholder} />
            </AutoComplete>)
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
