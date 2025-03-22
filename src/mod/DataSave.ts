import { useLocalStorageState } from "ahooks";
import { AppDataType } from "../Type";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { isWin11 } from "./ThemeConfig";

const SystemStart = await isEnabled();

// 深度合并函数
const deepMerge = (defaults: any, stored: any): any => {
  if (typeof stored !== 'object' || stored === null) {
    return stored !== undefined ? stored : defaults;
  }

  if (Array.isArray(stored)) {
    return stored;
  }

  const merged = { ...defaults };
  for (const key of Object.keys(stored)) {
    if (Object.prototype.hasOwnProperty.call(stored, key)) {
      if (
        typeof stored[key] === 'object' &&
        stored[key] !== null &&
        !Array.isArray(stored[key])
      ) {
        merged[key] = deepMerge(defaults[key], stored[key]);
      } else {
        merged[key] = stored[key];
      }
    }
  }
  return merged;
};

// 默认应用数据配置
const defaultAppData: AppDataType = {
  open: false,
  rcrl: false,
  city: { id: "", name: '' },
  times: ["6:00", "18:00"],
  Autostart: SystemStart,
  language: '',
  StartShow: true,
  Skipversion: '',
  winBgEffect: isWin11 ? 'Mica' : 'Default',
  deviation: 15,
  rawTime: ["6:00", "18:00"],
};

const DataSave = () => {
  const [AppData, setAppData] = useLocalStorageState<AppDataType>('Data', {
    defaultValue: defaultAppData,
    deserializer: (value) => {
      try {
        const storedData = JSON.parse(value);
        return deepMerge(defaultAppData, storedData);
      } catch (e) {
        return defaultAppData;
      }
    },
  });

  const setData = (e: Partial<AppDataType>) => {
    setAppData((prevData) => {
      // 执行安全的类型合并
      return {
        ...prevData,         // 已存储的数据
        ...e,                // 新传入的更新
      } as AppDataType;      // 类型断言确保类型安全
    });
  };

  return { AppData, setData };
};

export default DataSave;