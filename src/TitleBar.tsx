import React from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, ButtonProps, Divider, Flex, Segmented, ThemeConfig, Typography } from 'antd';
import { AliasToken } from 'antd/es/theme/internal';
import Logo from "./assets/logo.svg?react";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
//import { motion } from 'framer-motion'; // 引入 framer-motion
import { invoke } from "@tauri-apps/api/core";
import { restoreStateCurrent, StateFlags } from '@tauri-apps/plugin-window-state';
import Close from "./assets/closed.svg?react";
import Mins from './assets/min.svg?react';
import usePageTitle from './mod/PageTitle'
import { useAsyncEffect, useRequest } from 'ahooks';
const { Text } = Typography;
interface Props {
    config: AliasToken
    themeDack: boolean
    locale: any
    setSpinning: React.Dispatch<React.SetStateAction<boolean>>
    spinning: boolean
    Themeconfig: ThemeConfig
}
const appWindow = new Window('main');
let WinS = true

if (WinS) {
    WinS = false
    restoreStateCurrent(StateFlags.ALL);
}



const TitleButton: ButtonProps[] = [
    {
        icon: <Mins />,
        shape: "round",
        type: "text",
        onClick: e => {
            // @ts-ignore
            e.target?.blur()
            appWindow.minimize()
        }
    },
    {
        color: "danger",
        shape: "round",
        icon: <Close />,
        onClick: e => {
            // @ts-ignore
            e.target?.blur()
            appWindow.close()
        }
    }
]
const upWindowTitle = async (PageTitle: string) => {
    if (typeof PageTitle === "string") {
        await appWindow.setTitle(PageTitle)
    }
}
const App: React.FC<Props> = ({ config, Themeconfig, themeDack, locale, setSpinning, spinning }) => {
    const PageTitle = usePageTitle()
    const { run } = useRequest(upWindowTitle, {
        debounceWait: 1000,
        manual: true,
    });
    useAsyncEffect(async () => {
        run(PageTitle)
    }, [PageTitle])
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
    //更新窗口标题
    document.title = locale?.Title

    return (
        <Flex
            style={{
                backgroundColor: Themeconfig.components?.Layout?.headerBg,
                borderColor: config.colorBorder
            }}
            className="drag-region"
            gap="small"
            justify='space-between'
            align='center'
            data-tauri-drag-region>
            <Flex align='center' gap={'small'}>
                <Logo className='logo' />
                <Text
                    strong
                    style={{
                        margin: 0,
                        maxWidth: 'calc(100vw - 222px)'
                    }}
                    ellipsis={true}
                >
                    {locale?.Title}
                </Text>
            </Flex>
            <Flex align='center' gap={'small'}>
                <Segmented
                    disabled={spinning}
                    shape="round"
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
                <Flex
                    className='ant-segmented ant-segmented-shape-round ant-segmented-sm'
                    align='center'
                    style={{
                        display: 'flex',
                    }}
                >
                    {TitleButton.map((item, index) => (
                        <React.Fragment key={`fragment-${index}`}>
                            {index > 0 ?
                                <Divider
                                    style={{ marginInline: 2, marginBlock: 0 }}
                                    type='vertical' />
                                : null}
                            <Button
                                size='small'
                                className='titlebar ant-segmented-item-label'
                                variant="text"
                                {...item}
                            />
                        </React.Fragment>

                    ))}
                </Flex>

            </Flex>
        </Flex>
    );
}

export default App;
