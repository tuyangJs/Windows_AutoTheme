import React from 'react';
import { MoonOutlined, PoweroffOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Flex, Segmented, Tooltip, Typography } from 'antd';
import { AliasToken } from 'antd/es/theme/internal';
import Logo from "./assets/logo.png";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
//import { motion } from 'framer-motion'; // 引入 framer-motion
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
let WinS = true

if (WinS) {
    WinS = false
    restoreStateCurrent(StateFlags.ALL);
}
const HideWindow = () => {
    saveWindowState(StateFlags.ALL)
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
                    <Segmented
                        disabled={spinning}
                        size='small'
                        block
                        value={themeDack ? 'Moon' : 'Sun'}
                        options={[
                            { value: 'Moon', icon: <MoonOutlined /> },
                            { value: 'Sun', icon: <SunOutlined /> },
                        ]}
                        onChange={async () => {
                            await changeTheme();
                        }
                        }
                    />
                </Tooltip>
                <Flex
                    className='ant-segmented '
                >
                    <Button
                        size='small'
                        color="danger"
                        shape="round"
                        variant="text"
                        icon={<PoweroffOutlined />}
                        onClick={() => {
                            appWindow.hide()
                        }}
                    />
                </Flex>

            </Flex>
        </Flex>
    );
}

export default App;
