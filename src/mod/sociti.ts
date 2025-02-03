import { fetch } from '@tauri-apps/plugin-http';
import * as pako from 'pako';
type Props = (key: string, lang?: string) => any;

//寻找html中的指定变量
const extractSunMoonData = async (text: string) => {
    let hid = ''
    // 使用正则表达式匹配 window.sunMoon 变量
    const hidMatch = text.match(/var\s+hid\s*=\s*"([^"]+)"/);
    if (hidMatch && hidMatch[1]) {
        hid = hidMatch[1];
    }
    const match = text.match(/window\.sunMoon\s*=\s*(\{.*?\});/s);
    if (match && match[1]) {
        try {
            const json = JSON.parse(match[1]); // 解析 JSON 数据
            return {
                rise: json.sun.rise,
                set: json.sun.set,
                hid
            }
        } catch (error) {
            console.error("JSON 解析错误:", error);
        }
    } else {
        return {
            hid
        }
    }

    return false; // 没有找到变量时返回 null
};

const GetHttp = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/html', // 允许 JSON 和 HTML
            'Accept-Encoding': 'identity',
        }
    });

    if (response.ok) {
        const contentType = response.headers.get('Content-Type') || '';
        const contentEncoding = response.headers.get('Content-Encoding');

        let data;
        if (contentType.includes('text/html')) {
            // 如果是 HTML，则直接返回文本内容
            data = await response.text();
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
            // 响应体是 Gzip 压缩的，需要解压
            const arrayBuffer = await response.arrayBuffer();
            const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
            data = JSON.parse(decompressed); // 解压后解析 JSON
        } else {
            // 默认情况下解析 JSON
            data = await response.json();
        }
        return data;
    }
    return false;
};
const Apikey = 'bdd98ec1d87747f3a2e8b1741a5af796'
const AppCiti: Props = async (name, lang) => {
    const langs = (lang || '').split('_')[0]
    const url = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURI(name)}&key=${Apikey}&lang=${langs}`;
    const data = await GetHttp(url)
    return data
}
const Sunrise: Props = async (id) => {
    const is = id ? `${id}.html` : ''
    const url = `https://www.qweather.com/weather/${is}`
    const data = await GetHttp(url)
    const json = await extractSunMoonData(data)
    return json
}
export { AppCiti, Sunrise };