import { Divider, Flex, Radio, Switch, Typography } from "antd";
import type { mainsType } from "./mod/Mainoption";
import React from "react";

export interface props {
    mains: mainsType[];
    Radios: string
    setRadios: React.Dispatch<React.SetStateAction<string>>
}
const { Text } = Typography;
const Content: React.FC<props> = ({ mains, Radios, setRadios }) => (
    <>
        {mains.map((item, i) => {
            // 只有当 item.hide 为 false 或者 当前选中的选项匹配时才渲染
            if (item.hide && item.key !== Radios) {
                return null;
            }
            return (
                <React.Fragment key={`s-${i}`}>
                    {i > 0 ? <Divider key={i} /> : null}
                    <Flex key={'a' + item.key || i} justify='space-between' align="center">
                        <Text>{item.label}</Text>
                        {
                            // 如果 change 是数组，渲染单选框
                            Array.isArray(item.change) ? (
                                <Radio.Group
                                    block
                                    defaultValue={item.default}
                                    options={item.change.map((key) => ({
                                        label: key.label,
                                        value: key.key, // 假设索引为值
                                    }))}
                                    optionType="button"
                                     buttonStyle="solid" 
                                    onChange={e => {
                                        const newValue = e.target.value;
                                        setRadios(newValue); // 更新选中的选项
                                        if (typeof item.setVal === 'function') {
                                            item.setVal(newValue);
                                        }
                                    }}
                                />
                            ) : (
                                // 如果 change 是函数，渲染开关
                                typeof item.change === 'function' ? (
                                    <Switch
                                        loading={item.loading}
                                        defaultValue={item.defaultvalue}
                                        value={item.value as boolean}
                                        onChange={item.change} />
                                ) : (
                                    // 如果是组件，直接渲染
                                    <div>{item.change}</div>
                                )
                            )
                        }
                    </Flex>
                </React.Fragment>
            );
        })}
    </>
)

export default Content