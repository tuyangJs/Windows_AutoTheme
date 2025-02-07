import { invoke } from "@tauri-apps/api/core";

// 定义任务类型
export interface CrontabTask {
  time: string; // 任务时间（HH:mm）
  data: 'TypeA' | 'TypeB'; // 任务数据
}

// 任务管理器
export class CrontabManager {
  /**
   * 添加或覆盖定时任务
   */
  static addTask(task: CrontabTask): void {
    const { time, data } = task;
    console.log("添加或覆盖定时任务：", task);
    invoke('add_task', { time:time, taskType: data});  // 传递时间数组和任务类型
  }    /**
     * 清除所有任务
     */
  static clearAllTasks(): void {
    invoke('clear_tasks') 
  }

}
