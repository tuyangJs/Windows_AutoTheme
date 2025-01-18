import { fetch } from '@tauri-apps/plugin-http';
import dayjs from 'dayjs';
import * as pako from 'pako';
type Props = (key: string, name: string) => any;

const GetHttp = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json', // 指定接受 JSON 格式
            'Accept-Encoding': 'identity',
        }
    });
    if (response.ok) {
        const contentEncoding = response.headers.get('Content-Encoding');
        let data;
        if (contentEncoding && contentEncoding.includes('gzip')) {
            // 响应体是 Gzip 压缩的，需要解压
            const arrayBuffer = await response.arrayBuffer();
            const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: 'string' });
            data = JSON.parse(decompressed); // 解压后解析 JSON
        } else {
            // 响应体是正常的 JSON 数据
            data = await response.json();
        }
        return data
    }
    return false
}

const AppCiti: Props = async (key, name) => {
    const url = `https://geoapi.qweather.com/v2/city/lookup?location=${encodeURI(name)}&key=${key}`;
    const data = await GetHttp(url)
    return data
}
const Sunrise = async (key: string, id: string) => {
    const date = dayjs().format('YYYYMMDD')
    const url = `https://devapi.qweather.com/v7/astronomy/sun?key=${key}&location=${id}&date=${date}`
    const data = await GetHttp(url)
    return data
}
export { AppCiti, Sunrise };