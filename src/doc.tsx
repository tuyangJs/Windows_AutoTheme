import React from 'react';
import { Button, Divider, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Paragraph, Link, Text } = Typography;

interface Props {
    locale: any
    version: string
    Weather: string
}
const App: React.FC<Props> = ({ locale, version, Weather }) => (
    <Typography>
        {Weather ? (
            <>
                <Divider style={{ marginBlock: 6 }}>
                    <Text type="secondary"> {locale?.doc?.[0]}</Text>
                </Divider><Paragraph
                    type="secondary"
                    ellipsis={{ rows: 2, expandable: true }}
                >
                    {Weather}
                </Paragraph>
            </>
        ) : null}

        <Divider style={{ margin: 0 }}><Text type="secondary"> v{version}</Text> </Divider>
        <Paragraph type="secondary">
            <Tooltip title={locale?.doc?.[2]}>
                <Button
                    type='text'
                    icon={<InfoCircleOutlined />}
                    variant="link" />
            </Tooltip>
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
    </Typography>
);

export default App;