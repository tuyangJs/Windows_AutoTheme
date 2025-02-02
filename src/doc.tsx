import React from 'react';
import { Divider, Typography } from 'antd';

const { Paragraph, Link, Text } = Typography;

interface Props {
    locale: any
    version: string
}
const App: React.FC<Props> = ({ locale, version }) => (
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
        <Divider style={{margin:0}}><Text type="secondary"> v{version}</Text> </Divider>
        <Paragraph type="secondary">
            <Paragraph type="secondary">
                {locale?.doc?.[4]}
                <Link
                    target='_blank'
                    href='https://github.com/tuyangJs/Windows_AutoTheme/blob/main/README.md'
                >{' '}
                    GitHub
                </Link>
                <Divider style={{ marginInline: 6 }} type='vertical' />
                <Link
                    target='_blank'
                    href='https://gitee.com/ilinxuan/windows_-auto-theme/blob/main/README.md'
                >{' '}
                    Gitee
                </Link>
            </Paragraph>
        </Paragraph>
    </Typography>
);

export default App;