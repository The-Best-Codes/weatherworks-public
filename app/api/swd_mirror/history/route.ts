import { NextResponse } from "next/server";
import getHistory, {
  setHistory,
  checkDatabase,
} from "@/utils/swd_mirror/db/history";
import ApiData from "@/config/ww_apiData.json";
import isOnline from "@/utils/network/is_online";

const ONE_HOUR = 1000 * 60 * 60;

export const revalidate = 3600; // 1 hour

function shouldFetchNewData(lastFetched: string | undefined): boolean {
  if (!lastFetched) return true;

  const currentTime = new Date();
  const lastFetchedTime = new Date(lastFetched);

  return (
    currentTime.getTime() - lastFetchedTime.getTime() > ONE_HOUR ||
    currentTime.getDate() !== lastFetchedTime.getDate()
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const minify = url.searchParams.get("minify");

    let cachedResponse;
    try {
      cachedResponse = await getHistory();
    } catch (error) {
      checkDatabase();
      console.error(error);
    }

    const isOnlineStatus = await isOnline();

    if (isOnlineStatus && shouldFetchNewData(cachedResponse?.lastFetched)) {
      const response = await fetch(
        `https://${ApiData.endpointData.baseUrl}/swd/rest/stats/station/${ApiData.endpointData.tempestStationId}?api_key=${ApiData.authData.tempestApiKey}`,
        {
          next: { revalidate: 3600 },
        }
      );
      const newData = await response.json();

      if (newData && newData.station_id) {
        const updatedData = {
          ...newData,
          lastFetched: new Date().toISOString(),
        };
        await setHistory(updatedData);
        cachedResponse = structuredClone(updatedData);
      }
    }

    let responseData = {
      ...cachedResponse,
      isOnline: isOnlineStatus,
      isDataFresh: !shouldFetchNewData(cachedResponse?.lastFetched),
    };

    if (minify) {
      responseData = {
        station_id: cachedResponse.station_id,
        [minify]: cachedResponse[minify],
      };
    }

    return NextResponse.json(responseData, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching SWD history data:", error);
    return NextResponse.json(
      { error: "Failed to fetch SWD history data" },
      { status: 500 }
    );
  }
}
