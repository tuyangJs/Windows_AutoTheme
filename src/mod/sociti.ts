import { fetch } from '@tauri-apps/plugin-http';
import * as pako from 'pako';
type Props = (key: string, lang?: string) => any;

//寻找html中的指定变量
const extractSunMoonData = (text: string) => {
    const getMatch = (regex: RegExp) => text.match(regex)?.[1]?.trim() || "";

    const hid = getMatch(/var\s+hid\s*=\s*"([^"]+)"/);
    const abstract = getMatch(/<div\s+class="current-abstract"\s*>(.*?)<\/div>/s);
    const sunMoonJson = getMatch(/window\.sunMoon\s*=\s*(\{.*?\});/s);

    try {
        const { sun: { rise, set } = { rise: "", set: "" } } = JSON.parse(sunMoonJson || "{}");
        return { rise, set, hid, abstract };
    } catch (error) {
        console.error("JSON 解析错误:", error);
    }

    return { hid, abstract }; // 解析失败时仍返回基本数据
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
const Languages: Record<string, string> = {
    'zh_HK': 'zh-hant'
}
const AppCiti: Props = async (name, lang) => {
    lang = lang || 'en_US' as string
    const langs = Languages[lang] || lang.split('_')[0]
    let getUrl = ''
    if (name) {
        getUrl = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURI(name)}&lang=${langs}`
    } else {
        const range = (lang === 'zh_HK' ? 'CN' : lang.split('_')[1]).toUpperCase().toLowerCase();
        getUrl = `https://geoapi.qweather.com/v2/city/top?number=10&lang=${langs}&range=${range}`
    }
    const url = `${getUrl}&key=${Apikey}`;
    const data = await GetHttp(url) 
    return data
}
const Sunrise: Props = async (id, lang) => {
    const langs = (lang || '').split('_')[0]
    lang = (langs === "zh") ? '' : '/en'
    const is = id ? `${id}.html` : ''
    const url = `https://www.qweather.com${lang}/weather/${is}`
    const data = await GetHttp(url)
    const json = await extractSunMoonData(data)
    return json
}
export { AppCiti, Sunrise };