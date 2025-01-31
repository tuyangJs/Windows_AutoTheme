import React from 'react';
import { MoonOutlined, PoweroffOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Flex, Switch, Tooltip, Typography } from 'antd';
import { AliasToken } from 'antd/es/theme/internal';
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import Logo from "./assets/logo.png";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import { motion } from 'framer-motion'; // 引入 framer-motion
import { invoke } from "@tauri-apps/api/core";
import { restoreStateCurrent, saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state';
const { Text } = Typography;
interface Props {
    config: AliasToken
    themeDack: boolean
    setThemeDack: any
    locale: any
    setSpinning: React.Dispatch<React.SetStateAction<boolean>>
    spinning: boolean
}
const appWindow = new Window('main');

const menu = await Menu.new({
    items: [
        {
            id: 'info',
            text: '显示窗口',
            action: () => {
                appWindow.show()
            }
        },
        {
            id: 'quit',
            text: '退出',
            action: () => {
                saveWindowState(StateFlags.ALL);
                appWindow.destroy()
            }
        },
    ],
});
let tray: any
const TrayOn = (e: any) => {
    switch (e.type) {
        case 'DoubleClick':
            appWindow.show()
            break;

    }
}
TrayIcon.getById("main").then(async e => {
    if (e?.id !== "main") {
        restoreStateCurrent(StateFlags.ALL)//恢复窗口状态
        tray = await TrayIcon.new({
            id: "main",
            menu,
            menuOnLeftClick: false,
            icon: "icons/logo.png",
            action: TrayOn
        });
    }
    try {
        tray?.setTooltip('系统主题自适应');
        tray.setMenu(menu)
    } catch (error) {
    }
})
const HideWindow = () => {
    saveWindowState(StateFlags.ALL)
    appWindow.hide()
}
appWindow.onCloseRequested(e => {
    e.preventDefault()
    HideWindow()
})

const App: React.FC<Props> = ({ config, themeDack, locale, setSpinning, spinning }) => {
    async function changeTheme() {
        try {
            setSpinning(true)
            await invoke('set_system_theme', { isLight: themeDack });
            //setThemeDack(!themeDack)
            console.log('主题切换到:', themeDack);
        } catch (error) {
            console.error('Error changing theme:', error);
        }
    }

    return (
        <Flex
            style={{
                backgroundColor: config.colorBgBase,
                borderColor: config.colorBorder
            }}
            className="drag-region"
            gap="small"
            justify='space-between'
            align='center'
            data-tauri-drag-region>
            <Flex align='center' gap={'small'}>
                <img className='logo' alt='logo' src={Logo} />
                <Text strong style={{ margin: 0 }}> {locale?.Title}</Text>
            </Flex>
            <Flex align='center' gap={'small'}>
                <Tooltip title={locale.Switch}>
                    <Switch
                        loading={spinning}
                        defaultValue={themeDack}
                        value={themeDack}
                        onChange={() => {
                            setTimeout(async () => {
                                await changeTheme();
                            }, 1);
                            // Wait for the theme change to complete
                        }}
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<SunOutlined />}
                    />
                </Tooltip>

                <Button
                    color="danger"
                    variant="text"
                    icon={<PoweroffOutlined />}
                    onClick={() => {
                        appWindow.hide()
                    }}
                />
            </Flex>

        </Flex>
    );
}

export default App;
