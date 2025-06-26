import { Button, Dropdown } from "antd";
import type { AppDataType } from '../Type';
import { useEffect, useState } from "react";
interface LanguageItem {
  key: string;
  label: string;
}
// 语言菜单项
export const languageItems: LanguageItem[] = [
  { key: 'zh_CN', label: "简体中文" },
  { key: 'zh_HK', label: "繁体中文" },
  { key: 'en_US', label: "English" },
  { key: 'es_ES', label: "Español" },
  { key: 'ja_JP', label: "日本語" }
];

// 语言包加载器
const localeLoaders: Record<string, () => Promise<{ default: any }>> = {
  'zh_CN': () => import('./zh-CN.json'),
  'zh_HK': () => import('./zh-HK.json'),
  'en_US': () => import('./en-US.json'),
  'es_ES': () => import('./es-ES.json'),
  'ja_JP': () => import('./ja-JP.json'),
};

interface Props {
  AppData?: AppDataType;
  setData: (update: Partial<AppDataType>) => void;
}

const Language = ({ AppData, setData }: Props) => {
  const defaultLang = 'en_US';
  const currentLang = AppData?.language || defaultLang;
  const [locale, setLocale] = useState<any>(null);

  // 异步加载语言包
  useEffect(() => {
    const loader = localeLoaders[currentLang] || localeLoaders[defaultLang];

    loader()
      .then(mod => setLocale(mod.default))
      .catch(() =>
        localeLoaders[defaultLang]()
          .then(mod => setLocale(mod.default))
      );
  }, [currentLang]);

  // 获取当前语言标签
  const currentLabel = languageItems.find(item => item?.key === currentLang)?.label || 'English';

  return {
    Language: (
      <Dropdown
        menu={{
          items: languageItems,
          onClick: ({ key }) => setData({ language: key })
        }}
        placement="bottom"
        arrow
      >
        <Button color="default" variant="filled">
          {currentLabel}
        </Button>
      </Dropdown>
    ),
    locale
  };
};

export default Language;