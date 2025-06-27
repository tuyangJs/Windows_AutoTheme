import { Divider, Flex, Switch, Typography } from "antd";
import type { mainsType } from "./mod/Mainoption";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface props {
    mains: mainsType[];
    language: string
}
const { Text } = Typography;

const Content: React.FC<props> = ({ mains, language }) => (
    <AnimatePresence mode="popLayout" key="contents">
        {mains.map((item, i) => {
            // 只渲染不隐藏的选项
            if (item.hide) return null;
            return (
                <motion.div
                    key={`${item.key || i}-${language}`} // 使用item.key作为唯一稳定标识
                    layout
                    initial={{ opacity: 0, x: 0, scale: 3, filter: "blur(5px)" }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{
                        opacity: 0,
                        x: 100,
                        filter: "blur(5px)",
                        transition: {
                            duration: 0.28,
                            delay: 0.08 * i
                        } // 单独控制退出时长
                    }}
                    transition={{
                        duration: 0.28,
                        delay: 0.08 * i
                        // 移除基于索引的delay，使用稳定动画
                    }}
                >
                    {/* 分割线根据实际位置判断 */}
                    {mains.findIndex(m => m.key === item.key) > 0 && <Divider />}

                    <Flex justify='space-between' align="center" gap={8}>
                        <Text>{item.label}</Text>
                        {typeof item.change === 'function' ? (
                            <Switch
                                loading={item.loading}
                                defaultValue={item.defaultvalue}
                                value={item.value as boolean}
                                onChange={item.change} />
                        ) : (
                            <div>{item.change}</div>
                        )}
                    </Flex>
                </motion.div>
            );
        })}
    </AnimatePresence>
);

// 在父组件中使用React.memo
export default React.memo(Content)