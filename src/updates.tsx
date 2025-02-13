import { Button, Flex, Modal, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from 'react-markdown'
import { AppDataType } from "./Type";
async function checkForUpdates(currentVersion: string) {
  const repo = "tuyangJs/Windows_AutoTheme"; // 你的 GitHub 仓库
  const apiUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`GitHub API 请求失败: ${response.status}`);
    }

    const releaseData = await response.json();

    // 获取 GitHub 最新版本
    const latestVersion = releaseData.tag_name.replace(/^v/, ""); // 去掉 v 前缀
    const releaseNotes = releaseData.body; // 更新日志
    const releaseUrl = releaseData.html_url; // Release 页面

    // 版本对比
    if (isNewerVersion(currentVersion, latestVersion)) {
      console.log(`检测到新版本: v${latestVersion}`);
      return {
        latestVersion,
        releaseUrl,
        releaseNotes,
      };
    } else {
      console.log("当前已是最新版本");
      return null;
    }
  } catch (error) {
    console.error("检测更新失败:", error);
    return null;
  }
}

// 版本比较函数（1.2.3 < 1.3.0 返回 true）
function isNewerVersion(current: string, latest: string): boolean {
  const currentParts = current.split(".").map(Number);
  const latestParts = latest.split(".").map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const cur = currentParts[i] || 0;
    const lat = latestParts[i] || 0;
    if (lat > cur) return true;
    if (lat < cur) return false;
  }
  return false;
}
interface Props {
  version: string
  locale: any
  setData: any
  AppData: AppDataType
}
interface updateType {
  releaseNotes: string
  latestVersion: string
  releaseUrl: string
}
const { Text } = Typography;
const Updates: React.FC<Props> = ({ version, locale, setData, AppData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [update, setUpdate] = useState<updateType | undefined>();
  const nomitCancel = () => {
    setData({ Skipversion: update?.latestVersion })
    setIsModalOpen(false);
  }
  const updates = () => {
    setBtnLoad(true)
    checkForUpdates(version).then((update) => {
      if (update) {
        setUpdate(update)
        if (update.latestVersion != AppData.Skipversion) {
          showModal()
        }
      } else {
        setUpdate(undefined)
      }
      setBtnLoad(false)
    });
  }
  useEffect(updates, [])
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const onClickbtn = () => {
    if (update) {
      showModal()
    } else {
      updates()
    }
  }
  const { upModal } = locale || { upModal: null }
  return (
    <>
      <Flex justify="center" align="center" gap={8}>
  
        {
          btnLoad ? <Text >{upModal?.textA[0]}</Text> :
            update ? (
              <Text >{upModal?.textA[1]}</Text>
            ) : (
              <Text type="secondary">{upModal?.textA[2]}</Text>
            )
        }
        <Button
          onClick={onClickbtn}
          color={update ? "yellow" : "primary"}
          variant="link"
          loading={btnLoad}>
          {btnLoad ? upModal?.textB[0] : update ? upModal?.textB[1] : upModal?.textB[2]}
        </Button>
      </Flex>

      <Modal
        title={`${upModal?.title}${update?.latestVersion}`}
        open={isModalOpen}
        style={{ userSelect: 'text' }}
        centered
        footer={[
          <Button
            key="nomit"
            type="default"
            onClick={nomitCancel}>
            {upModal?.noText}
          </Button>,
          <Button
            key="submit"
            type="primary"
            href="https://gitee.com/ilinxuan/windows_-auto-theme/releases/latest"
            target="_blank"
            onClick={handleCancel}>
            {upModal?.okText} (Gitee)
          </Button>,
          <Button
            key="link"
            href={update?.releaseUrl}
            target="_blank"
            type="primary"
            onClick={handleCancel}
          >
            {upModal?.okText} (GitHub)
          </Button>,
        ]}
        maskClosable={false}
        onCancel={handleCancel}
      >
        <Markdown>{`#### ${upModal?.upData} :\n ${update?.releaseNotes}`}</Markdown>
      </Modal></>
  )
}
export { Updates }

