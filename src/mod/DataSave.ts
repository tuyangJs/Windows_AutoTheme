import { useLocalStorageState } from "ahooks";
import { AppDataType } from "../Type";
import { isEnabled } from "@tauri-apps/plugin-autostart";
const SystemStart = await isEnabled()

const DataSave = () => {
    const [AppData, setAppData] = useLocalStorageState<AppDataType>('AppData', {
        defaultValue: {
            Radios: "rcrl",
            Hfkey: "",
            open: false,
            rcrl: false,
            city: { id: "101010100", name: '北京' },
            times: [""],
            Autostart: SystemStart,
            language: '',
            StartShow: true
        }
    })

    const setData = (e: any) => {
        setAppData((prevData) => ({
            ...prevData,
            ...e
        }))
    }
    return { AppData, setData }
}

export default DataSave