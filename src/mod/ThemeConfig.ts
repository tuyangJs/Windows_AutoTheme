import { ThemeConfig, theme } from "antd";
import { useMemo } from "react";

const ThemeFun = (themeDack: boolean) => {
    const Themeconfig: ThemeConfig = useMemo(() => ({ //主题渲染配置
        algorithm: themeDack ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
            Divider: {
                colorSplit: themeDack ? '#484848a3' : '#b3b3b3a3'
            },
            Segmented: {
                trackBg: themeDack ? '#87878745' : '#bfbfbf45',
                itemSelectedBg:themeDack ? '#00000091' : '#ffffff91',
            }
        },
        token: {
            colorPrimary: '#ff8c00',
            colorBgLayout: themeDack ? 'linear-gradient(33deg, #12131796, #323b427a)' : 'linear-gradient(33deg, #F0EFF096, #FAF8F97a)',
            colorBgBase: themeDack ? '#00000096' : '#ffffff96',
            colorBorder: themeDack ? '#87878796' : '#bfbfbf96',
            colorBgElevated: themeDack ? '#313131' : '#f1f1f1',
            colorBgSpotlight: '#313131',
        },
    }), [themeDack]);
    const antdToken = useMemo(() => theme.getDesignToken(Themeconfig), [Themeconfig]); //主题渲染
    return { Themeconfig, antdToken }
}

export { ThemeFun }
