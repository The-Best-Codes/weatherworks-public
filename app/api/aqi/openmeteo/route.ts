import { NextResponse } from "next/server";
import ApiData from "@/config/ww_apiData.json";

export const revalidate = 60;

export async function GET() {
  try {
    const url = new URL(
      "https://air-quality-api.open-meteo.com/v1/air-quality"
    );
    url.searchParams.append("latitude", ApiData.metaData.latitude.toString());
    url.searchParams.append("longitude", ApiData.metaData.longitude.toString());
    url.searchParams.append(
      "hourly",
      "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
    );

    const response = await fetch(url, { next: { revalidate: 60 } });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return NextResponse.json(
      { error: "Failed to fetch air quality data" },
      { status: 500 }
    );
  }
}
