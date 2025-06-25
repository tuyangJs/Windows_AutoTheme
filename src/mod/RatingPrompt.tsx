// src/components/RatingPrompt.tsx
import { FC, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import useAppData from "./DataSave";
import { openStoreRating } from "./openStoreRating";
interface RatingPromptProps {
  locale: any;
}
const RatingPrompt: FC<RatingPromptProps> = ({ locale }) => {
  const { AppData, updateRatingPrompt } = useAppData();
  const [visible, setVisible] = useState(false);

  // 确保ratingPrompt对象存在且完整
  const ratingPrompt = AppData?.ratingPrompt || {
    lastPromptTime: 0,
    promptCount: 0,
    neverShowAgain: false,
  };

  useEffect(() => {
    const checkShouldShow = () => {
      // 如果用户选择不再显示，则不提示
      if (ratingPrompt.neverShowAgain) return false;

      const currentTime = Date.now();
      const lastPromptTime = ratingPrompt.lastPromptTime || 0;
      const promptCount = ratingPrompt.promptCount || 0;

      // 计算上次提示到现在的时间（毫秒）
      const timeSinceLastPrompt = currentTime - lastPromptTime;

      // 首次使用：24小时后提示
      if (promptCount === 0) {
        return timeSinceLastPrompt > 24 * 3600 * 1000;
      }

      // 后续提示：至少间隔7天
      return timeSinceLastPrompt > 7 * 24 * 3600 * 1000;
    };

    // 最多提示3次
    if (checkShouldShow() && ratingPrompt.promptCount < 3) {
      // 延迟显示，避免干扰用户
      const timer = setTimeout(() => {
        setVisible(true);
        // 更新提示状态
        updateRatingPrompt({
          lastPromptTime: Date.now(),
          promptCount: ratingPrompt.promptCount + 1,
        });
      }, 5000); // 应用启动后5秒显示

      return () => clearTimeout(timer);
    }
  }, [ratingPrompt, updateRatingPrompt]);

  const handleChoice = (choice: 'now' | 'later' | 'never') => {
    if (choice === 'now') {
      // 打开Microsoft Store评分
      openStoreRating("review")
    }

    if (choice === 'never') {
      // 标记不再提示
      updateRatingPrompt({ neverShowAgain: true });
    }

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Modal
      title={locale?.reviewModal?.title}
      open={visible}
      onCancel={() => handleChoice('later')}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      className="rating-prompt-modal"
    >
      <div className="p-4">
        <p className="mb-4 text-gray-700 text-center">
        {locale?.reviewModal?.text}
        </p>
        <div className="flex justify-between">
          <Button
            onClick={() => handleChoice('later')}
          >
               {locale?.reviewModal?.laterText}
          </Button>
          <Button

            onClick={() => handleChoice('never')}
          >
            {locale?.reviewModal?.cancelText}
          </Button>
          <Button
            type="primary"
            onClick={() => handleChoice('now')}
          >
             {locale?.reviewModal?.okText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RatingPrompt;