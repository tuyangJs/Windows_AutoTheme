import React from 'react';
import { Divider, Typography } from 'antd';

const { Paragraph, Text, Link } = Typography;
const version='1.2.5'
interface Props {
    locale: any
}
const App: React.FC<Props> = ({ locale }) => (
    <Typography>
        <Divider style={{ marginBlock: 6 }}>
            {locale?.doc?.[0]}
        </Divider>
        <Paragraph type="secondary">
            {locale?.doc?.[1]}
        </Paragraph>
        <Paragraph type="secondary">
            {locale?.doc?.[2]}
            <Link
                target='_blank'
                href='https://console.qweather.com/#/apps'
            >
                {' '} {locale?.doc?.[3]} {' '}
            </Link>
        </Paragraph>
        <Divider />
        <Paragraph type="secondary">
            {locale?.doc?.[4]}
            <Text code>{version}</Text>
            <br />
            {locale?.doc?.[5]}
            <Paragraph type="secondary">
                <Link
                    target='_blank'
                    href='https://github.com/tuyangJs/Windows_AutoTheme'
                >{' '}
                    GitHub
                </Link>
                <Divider style={{ marginInline: 6 }} type='vertical' />
                <Link
                    target='_blank'
                    href='https://gitee.com/ilinxuan/windows_-auto-theme'
                >{' '}
                    Gitee
                </Link>
            </Paragraph>

        </Paragraph>


    </Typography>
);

export default App;