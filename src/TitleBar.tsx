import React from 'react';
import { MoonOutlined, PoweroffOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Flex, Tooltip, Typography } from 'antd';
import { AliasToken } from 'antd/es/theme/internal';
import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import Logo from "./assets/logo.png";
import { Window } from '@tauri-apps/api/window'; // 引入 appWindow
import { motion } from 'framer-motion'; // 引入 framer-motion
import { invoke } from "@tauri-apps/api/core";
const { Text } = Typography;
interface Props {
    config: AliasToken
    themeDack: boolean
    setThemeDack: any
    locale: any
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
        appWindow.show()
    } catch (error) {
    }
})
appWindow.onCloseRequested(e => {
    e.preventDefault()
    appWindow.hide()
})

const App: React.FC<Props> = ({ config, themeDack, locale }) => {
    async function changeTheme() {
        try {
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
                <Text strong style={{ margin: 0 }}> {locale.Title}</Text>
            </Flex>
            <Flex align='center' gap={'small'}>
                <Tooltip title="切换系统主题">
                    <Button
                        type="text"
                        shape="circle"
                        onClick={async () => {
                            console.log('Changing theme...');
                            await changeTheme();  // Wait for the theme change to complete
                        }}
                        icon={
                            <motion.div
                                key={themeDack ? "moon" : "sun"}  // 使用 key 确保每次切换时都触发动画
                                initial={{ opacity: 0, y: 20 }}  // 初始时从下方开始
                                animate={{ opacity: 1, y: 0 }}   // 动画结束时回到正常位置
                                exit={{ opacity: 0, y: 20 }}    // 退出时从当前位置向上消失
                                transition={{
                                    duration: 0.5,
                                    ease: [0.68, -0.55, 0.27, 1.55], // 弹性缓动
                                }}
                            >
                                {themeDack ? <MoonOutlined /> : <SunOutlined />}
                            </motion.div>
                        }
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
