// 定义任务类型
export interface CrontabTask {
  time: string; // 任务时间（HH:mm）
  data: any; // 任务数据
  onExecute: (time: string, data: any) => void; // 任务执行回调
}

// 任务管理器
export class CrontabManager {
  private static tasks: Map<string, { timeout: number; interval: number }> = new Map();

  /**
   * 添加或覆盖定时任务
   * @param task {CrontabTask} - 任务对象
   */
  static addTask(task: CrontabTask): void {
    const { time, data, onExecute } = task;
    const [hours, minutes] = time.split(":").map(Number);

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    let delay = targetTime.getTime() - now.getTime();
    if (delay < 0) {
      // 目标时间已过，延迟到明天
      delay += 24 * 60 * 60 * 1000;
    }

    // 如果已存在相同时间的任务，先清除
    CrontabManager.removeTask(time);

    // 设置定时任务
    const timeout = window.setTimeout(() => {
      // 执行任务回调
      onExecute(time, data);

      // 每天相同时间运行
      const interval = window.setInterval(() => {
        onExecute(time, data);
      }, 24 * 60 * 60 * 1000);
      // 更新任务信息
      CrontabManager.tasks.set(time, { timeout, interval });
    }, delay);

    // 初始任务信息存储
    CrontabManager.tasks.set(time, { timeout, interval: 0 });
  }

  /**
   * 删除指定时间的定时任务
   * @param time {string} - 任务时间 (格式 'HH:mm')
   */
  static removeTask(time: string): void {
    if (CrontabManager.tasks.has(time)) {
      const task = CrontabManager.tasks.get(time)!;
      clearTimeout(task.timeout);
      clearInterval(task.interval);
      CrontabManager.tasks.delete(time);
      console.log(`已删除定时任务: ${time}`);
    }
  }

  /**
   * 清除所有任务
   */
  static clearAllTasks(): void {
    CrontabManager.tasks.forEach(({ timeout, interval }) => {
      clearTimeout(timeout);
      clearInterval(interval);
    });
    CrontabManager.tasks.clear();
    console.log("所有定时任务已清除");
  }

  /**
   * 获取所有任务
   * @returns {string[]} - 当前已设置的所有任务时间
   */
  static listTasks(): string[] {
    return Array.from(CrontabManager.tasks.keys());
  }
}
