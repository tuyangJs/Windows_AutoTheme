export function adjustTime(timeStr: string, deltaMinutes: number): string {
    // 分割小时和分钟并转换为数字
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // 计算总分钟数并应用时间差
    let totalMinutes = hours * 60 + minutes + deltaMinutes;
    
    // 处理 24 小时制循环（包含负数情况）
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; // 1440 = 24h * 60m
    
    // 计算新小时和分钟
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    
    // 格式化输出，补前导零
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}
/* console.log(adjustTime('06:29', -10));  // 输出 "06:19"
console.log(adjustTime('23:55', 10));   // 输出 "00:05"
console.log(adjustTime('00:05', -10)); // 输出 "23:55"
console.log(adjustTime('12:30', 150)); // 输出 "15:00" */