import { ThemeConfig, theme } from "antd";
import { useMemo } from "react";
import { AppDataType } from "../Type";
import { platform, version } from '@tauri-apps/plugin-os';
async function isWindows11() {

    // 判断平台是否为 Windows
    if ((await platform()).toLowerCase() !== 'windows') {
        return false;
    }

    // 获取操作系统版本号，例如 "10.0.22000.1"
    const osVersion = await version();
    const parts = osVersion.split('.');
    console.log(parts, osVersion);
    // 检查版本号前三位是否符合条件，并判断构建号是否大于等于 22000
    if (parts.length >= 3 && parts[0] === '10' && parts[1] === '0') {
        const build = parseInt(parts[2], 10);
        return build >= 22000;
    }

    return false;
}


const isWin11 = await isWindows11()


const ThemeFun = (themeDack: boolean, winBgEffect: AppDataType['winBgEffect'] | undefined) => {
    //背景渲染
    let BgLayout = 'transparent'
    let headerBg = themeDack ? '#22222280' : '#ffffff4d'
    winBgEffect = isWin11 ? winBgEffect : 'Default'
    switch (winBgEffect) {
        case 'Acrylic':
            BgLayout = themeDack ? 'linear-gradient(33deg, #121317c4, #323b4296)' : 'linear-gradient(33deg, #F0EFF0c4, #FAF8F996)'
            headerBg = themeDack ? '#222222bf' : '#ffffffbf'
            break;
        case 'Default':
            headerBg = isWin11 ? 'transparent' : (themeDack ? '#180d00' : '#fdf0e6')
            BgLayout = themeDack ? 'linear-gradient(33deg, #121317, #323b42)' : 'linear-gradient(33deg, #fff7e9, #e8e8e8)'
            break
    }
    //主题渲染配置
    const Themeconfig: ThemeConfig = useMemo(() => ({
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
            borderRadius:14,
            borderRadiusOuter:16,
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

export { ThemeFun, isWin11 }
