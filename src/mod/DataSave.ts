import { useLocalStorageState } from "ahooks";
import { AppDataType } from "../Type";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { isWin11 } from "./ThemeConfig";
const SystemStart = await isEnabled()
const DataSave = () => {
    const [AppData, setAppData] = useLocalStorageState<AppDataType>('Data', {
        defaultValue: {
            open: false,
            rcrl: false,
            city: { id: "", name: '' },
            times: [""],
            Autostart: SystemStart,
            language: '',
            StartShow: true,
            Skipversion: '',
            winBgEffect: isWin11 ? 'Mica' : 'Default',
            deviation: 15,
            rawTime:[""]
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