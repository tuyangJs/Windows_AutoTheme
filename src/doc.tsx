import React from 'react';
import { Divider, Typography } from 'antd';

const { Title, Paragraph, Text, Link } = Typography;

interface Props {
    locale: any
}
const App: React.FC<Props> = ({ locale }) => (
    <Typography>
        <Divider />
        <Title level={4} style={{ margin: 0 }}>{locale?.doc?.[0]}</Title>
        <Paragraph  type="secondary">
        {locale?.doc?.[1]}
        </Paragraph>
        <Paragraph  type="secondary">
        {locale?.doc?.[2]}
            <Link
                target='_blank'
                href='https://console.qweather.com/#/apps'
            >
                {' '} {locale?.doc?.[3]} {' '}
            </Link>
        </Paragraph>
        <Paragraph  type="secondary">
        {locale?.doc?.[4]}<Link
                target='_blank'
                href='tencent://groupwpa/?subcmd=all&param=7b2267726f757055696e223a3730333632333734332c2274696d655374616d70223a313733373937393132332c22617574684b6579223a2257565444716655676476396f563064382b5a7a356b7253393849496c42314b75766d2b533370664d5531483646424356316232786f4735705773676769416774222c2261757468223a22227d&jump_from='
            >703623743 </Link>
        </Paragraph>
        <Divider />
        <Paragraph  type="secondary">
        {locale?.doc?.[5]}
            <Text code>1.2.3</Text>
            <Link
                target='_blank'
                href='https://github.com/tuyangJs/Windows_AutoTheme'
            >{' '}
                {locale?.doc?.[6]}
            </Link>
        </Paragraph>


    </Typography>
);

export default App;