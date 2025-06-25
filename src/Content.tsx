import { Divider, Flex, Switch, Typography } from "antd";
import type { mainsType } from "./mod/Mainoption";
import React from "react";
import { motion } from "framer-motion";

export interface props {
    mains: mainsType[];
}
const { Text } = Typography;
const Content: React.FC<props> = ({ mains }) => (
    <>
        {mains.map((item, i) => {
            // 只有当 item.hide 为 false 或者 当前选中的选项匹配时才渲染
            if (item.hide) {
                return null;
            }
            return (
                <React.Fragment key={`s-${i}`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 3, filter: "blur(5px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1, filter: "blur(5px)" }}
                        transition={{
                            duration: 0.26,
                            delay: 0.1 * i,
                        }}
                        layout
                    >
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
                    </motion.div>

                </React.Fragment>

            );
        })}
    </>
)

export default Content