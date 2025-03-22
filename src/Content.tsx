import { Divider, Flex, Switch, Typography } from "antd";
import type { mainsType } from "./mod/Mainoption";
import React from "react";

export interface props {
    mains: mainsType[];
}
const { Text } = Typography;
const Content: React.FC<props> = ({ mains }) => (
    <>
        {mains.map((item, i) => {
            // 只有当 item.hide 为 false 或者 当前选中的选项匹配时才渲染
            if (item.hide ) {
                return null;
            }
            return (
                <React.Fragment key={`s-${i}`}>
                    {i > 0 ? <Divider key={i} /> : null}
                    <Flex key={'a' + item.key || i} justify='space-between' align="center" gap={8}>
                        <Text>{item.label}</Text>
                        {
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
                        }
                    </Flex>
                </React.Fragment>
            );
        })}
    </>
)

export default Content