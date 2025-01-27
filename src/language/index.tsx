import { Button, Dropdown, MenuProps } from "antd"
import type { AppDataType } from '../Type'
import { useEffect, useState } from "react";
const items: MenuProps['items'] = [
  {
    key: 'zh_CN',
    label: "简体中文",
  },
  {
    key: 'en_US',
    label: "English-US",
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
const Language = ({ AppData, setData }:Prop) => {
  const [locale, setLocale] = useState<any>( locales[AppData?.language || '']);//Antd语言包
  useEffect(() => {
    const loadLocale = locales[AppData?.language || ''];
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
  console.log(locale);
  
  return {
    Language: (
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => setData({ language: key })
        }} placement="bottom" arrow>
        <Button>{getLabelByKey(AppData?.language || '')}</Button>
      </Dropdown>
    ),
    locale
  }
}
export default Language