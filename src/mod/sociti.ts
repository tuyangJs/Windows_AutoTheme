import { fetch as fetchHttp } from '@tauri-apps/plugin-http';
import * as pako from 'pako';
import { positionType } from '../Type';




export const GetHttp = async (url: string, RequestInit?: RequestInit) => {
    const RequestInits = RequestInit ?? {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }
    const controller = new AbortController();
    const signal = RequestInit?.signal
        ? AbortSignal.any([RequestInit.signal, controller.signal])
        : controller.signal;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<false>(resolve => {
        timeoutId = setTimeout(() => {
            resolve(false);
            controller.abort();
        }, 15000);
    });
    const request = async () => {
        const response = await fetchHttp(url, { ...RequestInits, signal });
        if (!response.ok) return false;
        const contentType = response.headers.get('Content-Type') || '';
        const contentEncoding = response.headers.get('Content-Encoding');
        if (contentType.includes('text/html')) {
            return response.text();
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
            const bytes = new Uint8Array(await response.arrayBuffer());
            // Some HTTP clients decompress the body but retain the gzip header.
            const decompressed = bytes[0] === 0x1f && bytes[1] === 0x8b
                ? pako.ungzip(bytes, { to: 'string' })
                : new TextDecoder().decode(bytes);
            return JSON.parse(decompressed);
        } else {
            return response.json();
        }
    };
    try {
        // Abort alone may not settle a stalled native response-body stream.
        return await Promise.race([request(), timeout]);
    } finally {
        clearTimeout(timeoutId);
    }
};
type SunriseOptions = {
    maxAttempts?: number;      // 最多尝试次数（包含首次请求），默认 10
    baseDelayMs?: number;      // 基础退避时间（ms），默认 500
    throwOnFailure?: boolean;  // 全部失败时是否抛出异常，默认 false（返回 null）
};


// 定位位置
export async function getLocation() {
    const data = await GetHttp("http://demo.ip-api.com/json/?fields=66842623&lang=en")
    if (!Number.isFinite(data?.lat) || !Number.isFinite(data?.lon)
        || Math.abs(data.lat) > 90 || Math.abs(data.lon) > 180
        || typeof data.timezone !== 'string' || !data.timezone) {
        return undefined
    }
    const names = [data.regionName, data.city].filter(
        (name, index, all) => typeof name === 'string' && name.trim() && all.indexOf(name) === index
    )
    const backdata: positionType & { name: string } = {
        lat: data?.lat,
        lng: data?.lon,
        tzid: data.timezone,
        name: names.join(' - ') || `${data.lat}, ${data.lon}`
    }
    return backdata
}
function convertTo24Hour(timeStr: string): string {
    // 创建日期对象并设置时间
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    // 设置小时（处理 12 小时制）
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
    }

    // 格式化为两位数
    const formattedHour = hour24.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHour}:${formattedMinutes}:${formattedSeconds}`;
}

//查询气象数据
async function Sunrise(
    LAL?: positionType,
    options?: SunriseOptions
): Promise<any | null> {
    const { maxAttempts = 3, baseDelayMs = 6000, throwOnFailure = false } = options ?? {};
    // 简单的帮助函数：等待 ms 毫秒
    const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            // 构造 URL
            const url = `https://api.sunrise-sunset.org/json?lat=${LAL?.lat}&lng=${LAL?.lng}&tzid=${LAL?.tzid}`;
            const data = await GetHttp(url);
            if (data) {
                // 如果解析也可能失败，捕获并在必要时重试
                try {

                    return {
                        rise: convertTo24Hour(data.results.sunrise),
                        set: convertTo24Hour(data.results.sunset)
                    };
                } catch (parseErr) {
                    console.error('Sunrise: Failed to parse data:', parseErr);
                    // 解析失败：如果达到最大尝试次数则抛/返回，否则继续重试
                    if (attempt === maxAttempts) {
                        if (throwOnFailure) throw parseErr;
                        return null;
                    }
                    // 否则继续到下一次尝试（走到下面的等待逻辑）
                }
            } else {
                // data falsy (网络/请求失败)，继续重试
                if (attempt === maxAttempts) {
                    break;
                }
            }
        } catch (err) {
            // GetHttp 本身抛错也会来到这里。最后一次若仍然失败则抛/返回。
            if (attempt === maxAttempts) {
                if (throwOnFailure) throw err;
                return null;
            }
            // 否则继续重试
        }

        // 等待：指数退避 + 小随机抖动
        const expo = Math.pow(2, attempt - 1); // 1,2,4,8...
        const jitter = Math.floor(Math.random() * 200); // 0-199 ms 随机抖动
        const waitMs = baseDelayMs * expo + jitter;
        await sleep(waitMs);
    }

    // 全部尝试完仍未成功
    if (throwOnFailure) {
        throw new Error();
    }
    return null;
}

export { Sunrise };
