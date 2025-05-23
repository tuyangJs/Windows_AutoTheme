import { AppCiti } from "./sociti";
import { AppDataType } from "../Type";
 //渲染搜索结果
const searchResult = async (query: string, AppData: AppDataType | undefined) => {
  if (!AppData?.language) return [];
  const data = await AppCiti(query, AppData.language)
  if (data.code !== '200') return [];
  const CityList = data?.location || data?.topCityList
  return CityList
    .map((e: any) => {
      return {
        value: `${e.adm1} - ${e.name}`,
        key: e.id,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              {e.country}
              <a
              >
                {` ${e.adm1} - ${e.name}`}
              </a>
            </span>

          </div>
        ),
      };
    });
}

export { searchResult }