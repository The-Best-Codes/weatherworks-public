import { NextResponse } from "next/server";
import getObs, {
  setObs,
  checkDatabase,
} from "@/utils/swd_mirror/db/latest_obs";
import ApiData from "@/config/ww_apiData.json";
import isOnline from "@/utils/network/is_online";

const DATA_FRESHNESS_THRESHOLD = 1000 * 60 * 1; // 1 minute in milliseconds

export const revalidate = 60; // 1 minute

export async function GET() {
  try {
    let cachedResponse;
    try {
      cachedResponse = await getObs();
    } catch (error) {
      checkDatabase();
      console.error(error);
    }

    const currentTime = new Date().getTime();
    const isOnlineStatus = await isOnline();

    let shouldFetchNewData = false;

    // Check if there's no cached data or if lastFetched is missing
    if (!cachedResponse || !cachedResponse.lastFetched) {
      shouldFetchNewData = true;
    } else {
      // Determine if the cached data is fresh
      const lastObsTime = new Date(cachedResponse.lastFetched).getTime();
      const diff = currentTime - lastObsTime;
      const isDataFresh = diff <= DATA_FRESHNESS_THRESHOLD;

      if (!isDataFresh) {
        shouldFetchNewData = true;
      }
    }

    if (isOnlineStatus && shouldFetchNewData) {
      const response = await fetch(
        `https://${ApiData.endpointData.baseUrl}/swd/rest/observations/station/${ApiData.endpointData.tempestStationId}?token=${ApiData.authData.tempestApiKey}`,
        {
          next: { revalidate: 60 },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");

      const newData = await response.json();

      // Check if new data contains data.obs[0].timestamp
      if (newData.obs && newData.obs[0] && newData.obs[0].timestamp) {
        // Update the cache with the new data and the current timestamp
        const updatedData = {
          ...newData,
          lastFetched: new Date().toISOString(),
        };
        setObs(updatedData);
        cachedResponse = structuredClone(updatedData);
      }
    }

    // Add isOnline and isDataFresh to the response
    const responseData = {
      ...cachedResponse,
      isOnline: isOnlineStatus,
      isDataFresh: !shouldFetchNewData,
    };

    return NextResponse.json(responseData, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
