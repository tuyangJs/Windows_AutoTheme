import { Button, Dropdown, MenuProps } from "antd"
import type { AppDataType } from '../Type'
import { useEffect, useState } from "react";
const items: MenuProps['items'] = [
  {
    key: 'zh_CN',
    label: "简体中文",
  },
  {
    key: 'zh_HK',
    label: "繁体中文",
  },
  {
    key: 'en_US',
    label: "English",
  },
  {
    key: 'es_ES',
    label: "Español",
  },
  {
    key: 'ja_JP',
    label: "日本語にほんご",
  }

] as MenuProps['items']
const locales: Record<string, any> = {
  'zh_CN': () => import('./zh-CN.json'),
  'zh_HK': () => import('./zh-HK.json'),
  'en_US': () => import('./en-US.json'),
  'es_ES': () => import('./es-ES.json'),
  'ja_JP': () => import('./ja-JP.json'),
};
interface Prop {
  AppData?: AppDataType
  setData: (e: any) => void
}
// 根据 key 匹配标题
function getLabelByKey(key: string): string | undefined {
  const validItems = items ?? []; // 如果 items 是 undefined，则使用空数组
  const item = validItems.find(item => item?.key === key);
  // @ts-ignore
  return item?.label
}
const navigatorlLanguage = navigator.language.replace('-','_')
const Language = ({ AppData, setData }: Prop) => {
  const Userlanguage = AppData?.language || (locales?.[navigatorlLanguage] ? navigatorlLanguage : 'en_US')//如果没有默认设置则取用户语言设置
  const [locale, setLocale] = useState<any>(locales.en_US);//Antd语言包
  useEffect(() => {
    const loadLocale = locales[Userlanguage] || locales.en_US//如果找不到语言包则默认英文
    setData({ language: Userlanguage })
    if (loadLocale) {
      loadLocale()
        .then((mod: { default: any; }) => setLocale(mod.default))
        .catch((err: any) =>
          console.error(`Failed to load locale for ${AppData?.language}:`, err)
        );
    } else {
      console.warn(`Locale ${AppData?.language} is not supported.`);
    }
  }, [AppData?.language]);
  return {
    Language: (
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => setData({ language: key })
        }} placement="bottom" arrow>
        <Button>{getLabelByKey(Userlanguage)}</Button>
      </Dropdown>
    ),
    locale
  }
}
export default Language