import { NextResponse } from "next/server";
import getForecast, {
  setForecast,
  checkDatabase,
} from "@/utils/swd_mirror/db/forecast";
import ApiData from "@/config/ww_apiData.json";
import isOnline from "@/utils/network/is_online";

const ONE_HOUR = 1000 * 60 * 60;

export const revalidate = 3600;

function shouldFetchNewData(lastFetched: string | undefined): boolean {
  if (!lastFetched) return true;

  const currentTime = new Date();
  const lastFetchedTime = new Date(lastFetched);

  return (
    currentTime.getTime() - lastFetchedTime.getTime() > ONE_HOUR ||
    currentTime.getDate() !== lastFetchedTime.getDate()
  );
}

export async function GET() {
  try {
    let cachedResponse;
    try {
      cachedResponse = await getForecast();
    } catch (error) {
      checkDatabase();
      console.error(error);
    }
    const isOnlineStatus = await isOnline();

    if (isOnlineStatus && shouldFetchNewData(cachedResponse?.lastFetched)) {
      const url = new URL(
        `https://${ApiData.endpointData.baseUrl}/swd/rest/better_forecast`
      );
      const params = new URLSearchParams({
        station_id: ApiData.endpointData.tempestStationId,
        lat: ApiData.metaData.latitude,
        lon: ApiData.metaData.longitude,
        units_temp: "c",
        units_wind: "mps",
        units_pressure: "mb",
        units_precip: "mm",
        units_distance: "km",
        api_key: ApiData.authData.tempestApiKey,
      });
      url.search = params.toString();

      const response = await fetch(url.toString(), {
        next: { revalidate: 3600 },
      });
      const newData = await response.json();

      if (newData.current_conditions && newData.forecast) {
        const updatedData = {
          ...newData,
          lastFetched: new Date().toISOString(),
        };
        await setForecast(updatedData);
        cachedResponse = structuredClone(updatedData);
      }
    }

    const responseData = {
      ...cachedResponse,
      isOnline: isOnlineStatus,
      isDataFresh: !shouldFetchNewData(cachedResponse?.lastFetched),
    };

    return NextResponse.json(responseData, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
}
