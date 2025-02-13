import { ThemeConfig, theme } from "antd";
import { useMemo } from "react";
import { AppDataType } from "../Type";
const ThemeFun = (themeDack: boolean, winBgEffect: AppDataType['winBgEffect'] | undefined) => {
    let BgLayout = 'transparent'
    let headerBg = themeDack ? '#22222280' : '#ffffff4d'
    switch (winBgEffect) {
        case 'Acrylic':
            BgLayout = themeDack ? 'linear-gradient(33deg, #121317c4, #323b4296)' : 'linear-gradient(33deg, #F0EFF0c4, #FAF8F996)'
            headerBg = themeDack ? '#222222bf' : '#ffffffbf'
            break;
        case 'Default':
            headerBg = 'transparent'
            BgLayout = themeDack ? 'linear-gradient(33deg, #121317, #323b42)' : 'linear-gradient(33deg, #F0EFF0, #FAF8F9)'
            break
    }
    const Themeconfig: ThemeConfig = useMemo(() => ({ //主题渲染配置
        algorithm: themeDack ? theme.darkAlgorithm : theme.defaultAlgorithm,
        components: {
            Divider: {
                colorSplit: themeDack ? '#83838329' : '#85858529'
            },
            Segmented: {
                trackBg: themeDack ? '#87878745' : '#bfbfbf45',
                itemSelectedBg: themeDack ? '#23232391' : '#ffffff91',
            },
            Layout: {
                headerBg: headerBg,
            }
        },
        token: {
            colorPrimary: '#ff8c00',
            colorBgLayout: BgLayout,
            colorBgBase: themeDack ? '#00000096' : '#ffffff96',
            colorBorder: themeDack ? '#87878796' : '#bfbfbf96',
            colorBgElevated: themeDack ? '#313131' : '#ffffff',
            colorBgSpotlight: '#313131',
        },
    }), [themeDack, BgLayout]);
    const antdToken = useMemo(() => theme.getDesignToken(Themeconfig), [Themeconfig]); //主题渲染
    return { Themeconfig, antdToken }
}

export { ThemeFun }
