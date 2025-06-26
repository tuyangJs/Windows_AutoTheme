// src/hooks/useAppData.ts
import { useLocalStorageState } from "ahooks";
import { AppDataType, RatingPromptType } from "../Type";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { isWin11 } from "./ThemeConfig";
import { languageItems } from "../language";

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

const navigatorLanguage = navigator.language.replace('-', '_');

// 默认评分提示状态
const defaultRatingPrompt: RatingPromptType = {
  lastPromptTime: 0,
  promptCount: 0,
  neverShowAgain: false,
};

// 默认应用数据配置
const defaultAppData: AppDataType = {
  open: false,
  rcrl: false,
  city: { id: "", name: '' },
  times: ["6:00", "18:00"],
  Autostart: SystemStart,
  language:  languageItems.find(item => item?.key === navigatorLanguage)?.label || 'en_US',
  StartShow: true,
  Skipversion: '',
  winBgEffect: isWin11 ? 'Mica' : 'Default',
  deviation: 15,
  rawTime: ["6:00", "18:00"],
  ratingPrompt: defaultRatingPrompt,
};

const useAppData = () => {
  const [AppData, setAppData] = useLocalStorageState<AppDataType>('AppData', {
    defaultValue: defaultAppData,
    deserializer: (value) => {
      try {
        const storedData = JSON.parse(value);
        const merged = deepMerge(defaultAppData, storedData);
        
        // 确保ratingPrompt结构正确
        if (!merged.ratingPrompt) {
          merged.ratingPrompt = { ...defaultRatingPrompt };
        } else {
          merged.ratingPrompt = {
            ...defaultRatingPrompt,
            ...merged.ratingPrompt
          };
        }
        
        return merged;
      } catch (e) {
        return defaultAppData;
      }
    },
  });

  const setData = (update: Partial<AppDataType>) => {
    setAppData((prev) => {
      // 确保prev不是undefined
      const prevData = prev || defaultAppData;
      
      // 创建更新后的对象
      const updatedData = {
        ...prevData,
        ...update,
      };
      
      // 确保ratingPrompt字段存在且结构正确
      if (!updatedData.ratingPrompt) {
        updatedData.ratingPrompt = { ...defaultRatingPrompt };
      }
      
      return updatedData as AppDataType; // 类型断言确保类型安全
    });
  };

  const updateRatingPrompt = (update: Partial<RatingPromptType>) => {
    setAppData((prev) => {
      // 确保prev不是undefined
      const prevData = prev || defaultAppData;
      
      // 创建更新后的对象
      const updatedData = {
        ...prevData,
        ratingPrompt: {
          ...(prevData.ratingPrompt || defaultRatingPrompt),
          ...update
        }
      };
      
      return updatedData as AppDataType; // 类型断言确保类型安全
    });
  };

  return { 
    AppData, 
    setData,
    updateRatingPrompt
  };
};

export default useAppData;