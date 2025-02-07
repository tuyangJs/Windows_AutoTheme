import { useState, useEffect } from 'react';

/**
 * usePageTitle
 * 监听页面标题变化，并返回最新的标题
 */
export default function usePageTitle(): string {
  const [title, setTitle] = useState(document.title);

  useEffect(() => {
    // 获取 <title> 元素
    const titleElement = document.querySelector('title');
    if (!titleElement) return;

    // 使用一个变量保存上一次的标题
    let lastTitle = document.title;

    const observer = new MutationObserver(() => {
      const newTitle = document.title;
      // 只有当标题发生了真正的变化时才更新状态
      if (newTitle !== lastTitle) {
        lastTitle = newTitle;
        setTitle(newTitle);
      }
    });

    // 监听子节点变化
    observer.observe(titleElement, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return title;
}
