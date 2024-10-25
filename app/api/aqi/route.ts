import { NextResponse } from "next/server";
import ApiData from "@/config/ww_apiData.json";

export const revalidate = 60;

export async function GET() {
  try {
    // First API call using fetch
    const openMeteoUrl = new URL(
      "https://air-quality-api.open-meteo.com/v1/air-quality"
    );
    openMeteoUrl.searchParams.append("latitude", ApiData.metaData.latitude);
    openMeteoUrl.searchParams.append("longitude", ApiData.metaData.longitude);
    openMeteoUrl.searchParams.append(
      "hourly",
      "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone"
    );

    const openMeteoResponse = await fetch(openMeteoUrl, {
      next: { revalidate: 60 },
    });
    const dataOpenMeteo = await openMeteoResponse.json();

    // Second API call using fetch
    const formData = new FormData();
    formData.append("latitude", ApiData.metaData.latitude);
    formData.append("longitude", ApiData.metaData.longitude);
    formData.append("maxDistance", "50");

    const govResponse = await fetch(
      "https://airnowgovapi.com/reportingarea/get",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    const govData = await govResponse.json();
    const dataGov = govData.filter(
      (item: { dataType: string }) => item.dataType === "O"
    );
    const dataGov_pm10 = dataGov.filter(
      (item: { parameter: string }) => item.parameter === "PM10"
    );
    const dataGov_pm2_5 = dataGov.filter(
      (item: { parameter: string }) => item.parameter === "PM2.5"
    );
    const dataGov_ozone = dataGov.filter(
      (item: { parameter: string }) => item.parameter === "OZONE"
    );

    dataOpenMeteo.hourly.pm10 = [dataGov_pm10[0].aqi];
    dataOpenMeteo.hourly.pm2_5 = [dataGov_pm2_5[0].aqi];
    dataOpenMeteo.hourly.ozone = [dataGov_ozone[0].aqi];

    return NextResponse.json(dataOpenMeteo);
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return NextResponse.json(
      { error: "Failed to fetch air quality data" },
      { status: 500 }
    );
  }
}
