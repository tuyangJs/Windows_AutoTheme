import React, { ReactNode } from 'react';
import { Button, Flex, Slider, Tooltip } from 'antd';
import type { SliderSingleProps } from 'antd';
import { QuestionOutlined } from '@ant-design/icons';
const marks: SliderSingleProps['marks'] = {
    0: '0',
    15: '15',
    30: '30',
    45: '45',
    59: "59"
};
interface props {
    value: number
    setVal: (e: number) => void
    prompt: ReactNode 
}
const App: React.FC<props> = ({ value, setVal, prompt }) => (
    <Flex gap={8}>
        <Tooltip title={prompt} placement="bottom">
            <Button
                size="small"
                type='text'
                icon={<QuestionOutlined />}
                variant="link" />
        </Tooltip>
        <Slider
            style={{
                width: 180,
                margin: '0 5px 14px 5px'
            }}
            marks={marks}
            included={false}
            value={value}
            onChange={setVal}
            max={60}
            min={0}
            defaultValue={20} />

    </Flex>
);

export default App;