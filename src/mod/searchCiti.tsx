import { GetHttp } from "./sociti";
import { AppDataType } from "../Type";
//渲染搜索结果
const searchResult = async (query: string, AppData: AppDataType | undefined) => {
  if (!AppData?.language || query.trim().length < 2) return [];
  const language = AppData.language.split(/[_-]/)[0].toLowerCase();
  let data;
  try {
    data = await GetHttp(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=${language}&format=json`);
  } catch {
    return [];
  }
  if (!Array.isArray(data?.results)) return [];
  const CityList = data.results.filter((e: any) =>
    typeof e?.name === 'string' && e.name.trim()
    && Number.isFinite(e.latitude) && Math.abs(e.latitude) <= 90
    && Number.isFinite(e.longitude) && Math.abs(e.longitude) <= 180
    && typeof e.timezone === 'string' && e.timezone
  );

  return CityList
    .map((e: any) => {
      return {
        value: formatCityDisplayByHierarchy(e),
        key: e.id,
        position: { lat: e.latitude, lng: e.longitude, tzid: e.timezone },
        label: (
          <div
            key={e.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {typeof e.country === 'string' ? e.country : ''}
              <a
              >
                {formatCityDisplayByHierarchy(e)}
              </a>
            </span>

          </div>
        ),
      };
    });
}

export { searchResult }
export const formatCityDisplayByHierarchy = (cityData: any): string => {
  return [cityData.admin1, cityData.admin2, cityData.name]
    .filter((part, index, all) => typeof part === 'string' && part.trim() && all.indexOf(part) === index)
    .join(' - ');
};
