import { openUrl } from '@tauri-apps/plugin-opener';
// Microsoft Store应用ID
const STORE_APP_ID = "9N7ND584TDV1";

type storePage = 'pdp' | 'review';
export const openStoreRating = async (page?: storePage) => {
  const type = page || 'pdp';
  const url = `ms-windows-store://${type}/?ProductId=${STORE_APP_ID}`;
  try {
    await openUrl(url);
  } catch {
    console.error('开启本地商店失败，回退至 WebStore', url);
    await openUrl(`https://apps.microsoft.com/store/detail/${STORE_APP_ID}`);
  }
};

