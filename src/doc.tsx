import React from 'react';
import { Divider, Typography } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;


const App: React.FC = () => (
    <Typography>
        <Divider />
        <Title level={4} style={{ margin: 0 }}>说明</Title>
        <Paragraph>
            本程序由：荼泱Tuyang 个人开发完全开源免费。
        </Paragraph>
        <Paragraph>
            获取和风天气Key
            <Link
                target='_blank'
                href='https://console.qweather.com/#/apps'
            >
                {' '} 点击此处 {' '}
            </Link>
        </Paragraph>
        <Paragraph>
            联系QQ群：<Link
                target='_blank'
                href='tencent://groupwpa/?subcmd=all&param=7b2267726f757055696e223a3730333632333734332c2274696d655374616d70223a313733373937393132332c22617574684b6579223a2257565444716655676476396f563064382b5a7a356b7253393849496c42314b75766d2b533370664d5531483646424356316232786f4735705773676769416774222c2261757468223a22227d&jump_from='
            >703623743 </Link>
        </Paragraph>
        <Divider />
        <Paragraph>
            当前程序版本：
            <Text code>1.2.2</Text>
            <Link
                target='_blank'
                href='https://github.com/tuyangJs/Windows_AutoTheme'
            >{' '}
                前往检查更新
            </Link>
        </Paragraph>


    </Typography>
);

export default App;