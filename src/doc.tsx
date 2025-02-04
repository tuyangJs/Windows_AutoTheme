import React from 'react';
import { Divider, Skeleton, Typography } from 'antd';

const { Paragraph, Link, Text } = Typography;

interface Props {
    locale: any
    version: string
    Weather: string
}
const App: React.FC<Props> = ({ locale, version, Weather }) => (
    <Typography>
        <Divider style={{ marginBlock: 6 }}>
            <Text type="secondary"> {locale?.doc?.[0]}</Text>
        </Divider>
        <Paragraph
            type="secondary"
            ellipsis={{ rows: 2,expandable: true }}
        >
            {Weather || <Skeleton paragraph={{ rows: 1 }} title={false} />}
        </Paragraph>
        <Divider style={{ marginBlock: 6 }}>
            {locale?.doc?.[1]}
        </Divider>
        <Paragraph type="secondary">
            {locale?.doc?.[2]}
        </Paragraph>
        <Divider style={{ margin: 0 }}><Text type="secondary"> v{version}</Text> </Divider>
        <Paragraph type="secondary">
            <Paragraph type="secondary">
                {locale?.doc?.[3]}
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