import { NextResponse } from "next/server";
import { addAlert } from "@/utils/alerts/database";
import ApiData from "@/config/ww_apiData.json";

interface AddAlertProps {
  properties: {
    id: string;
    expires: string;
  };
}

export const revalidate = 60;

export async function GET() {
  try {
    const url = `https://api.weather.gov/alerts/active?point=${ApiData.metaData.latitude},${ApiData.metaData.longitude}`;

    const response = await fetch(url, {
      next: { revalidate: 60 },
    });
    const data = await response.json();

    if (data.features.length > 0) {
      const alerts = data.features;

      alerts.forEach((alert: AddAlertProps) => {
        addAlert(
          alert.properties.id,
          false,
          alert.properties.expires as unknown as number,
          alert.properties
        );
      });
    }

    return NextResponse.json({
      success: true,
      url: url,
    });
  } catch (error) {
    console.error("Error fetching NWS alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch NWS alerts" },
      { status: 500 }
    );
  }
}
