import { NextResponse } from "next/server";
import ww_apiData from "@/config/ww_apiData.json";

export const revalidate = 60;

export async function GET() {
  try {
    const formData = new FormData();
    formData.append("latitude", ww_apiData.metaData.latitude);
    formData.append("longitude", ww_apiData.metaData.longitude);
    formData.append("maxDistance", "50");

    const response = await fetch("https://airnowgovapi.com/reportingarea/get", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
      next: { revalidate: 60 },
    });

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
